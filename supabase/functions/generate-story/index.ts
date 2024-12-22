// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { contentTypeHeaders, corsHeaders } from "../_shared/headers.ts";
import { getSupabaseClient } from "../_shared/supabase-client.ts";
import { OpenAI } from "npm:openai";
import { Runware } from "npm:@runware/sdk-js";

console.log(
  "generate-story function is running",
);

const DESIRED_IMAGE_TIMEOUT_MS = 10000;

const SYSTEM_PROMPT_BASE = `
  Jesteś opowiadaczem kocich historii. 
  Twoim celem jest wygenerowanie historii na podstawie danych wprowadzonych przez użytkownika.
  Jeśli dane wejściowe użytkownika nie mają sensu w tym kontekście, po prostu wygeneruj losową historię.
  Wejście użytkownika powinno nadać temat historii, może mieć wpływ na fabułę, bohaterów i świat.
  Historia musi zawierać koci motyw, np kociego bohatera lub koci świat.
  Opowiadanie powinno zawierać od 150 do 250 słów.
  Unikaj utartych motywów.
`;

const SYSTEM_ENDING_PROMPTS = [
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym. Dodatkowo podkręć motyw kociego świata - wszyscy bohaterowie i cały świat jest koci.",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym. Opowiadanie nie powinno być dziecinne, świat i bohaterowie powini być bardziej realistyczni niż w bajkach dla dzieci i nieco mroczni. Nadal jest to opowiadanie w fantastycznym świecie, tylko dla starszych odbiorców.",
  "Historia ma być wyjątkowo słodka i pozytywna. Bohater zdobywa wszystko czego chce i jest szczęśliwy. Nie ma żadnego morału ani zwrotu akcji.",
  "Historia ma przybrać słodkokwaśny charakter i niespodziwaną porażkę dla bohatera. Historia przeznaczona dla nieco starszych odbiorców niż małe dzieci. Zaskocz słuchacza niestandardową fabułą i ładnym językiem i opisami świata",
  "Historia ma mieć zakończenie otwarte do interpretacji przez słuchacza, bez jasnej odpowiedzi co się stało. Nie powinna zawierać typowego dla bajek morału. Historia przeznaczona dla nieco starszych odbiorców niż małe dzieci. Zaskocz słuchacza niestandardową fabułą i ładnym językiem i opisami świata",
  "Historia ma zaskoczyć słuchacza tym, że zamiast typowej bajki w fantastycznym świecie, próbuje być realistyczna i opowiadać o życiu zwykłego kota w zwykłym świecie. Ma mieć charakter zbliżony do filmu dokumentalnego. Historia przeznaczona dla starszych odbiorców niż małe dzieci. Używaj suchego, rzeczowego języka. Nie dodawaj bogatych opisów świata.",
];

const IMAGE_PROMPT_GEN_PROMPT = `
  Jesteś generatorem opisów obrazów do przedstawionych historii.
  Wygeneruj krótki i bardzo uproszczony opis sceny przedstawiającej głównego bohatera na początku historii.
  Użyj prostego języka i opisz jak wygląda scena, tak aby można było wygenerować obraz z tego opisu. 
  Skup się tylko na głównym bohaterze, jego wyglądzie, pozie i podstawowych cechach jego otoczenia. Nie zdradzaj dalszych elementów historii. Scena ma być bardzo prosta.
  Wygeneruj opis po angielsku, max 50 słów.
`;

const IMAGE_GEN_SYSTEM_PROMPT =
  "Generate a cover image for a fantasy story in style of a book illustration.";

type RequestPayload = {
  userInput: string;
};

type ResponsePayload = {
  storyText: string;
  imagePrompt: string;
  storySystemPrompt: string;
  imageUrl: string;
  // storyId: string;
};

const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
if (!runwareApiKey) {
  throw new Error("RUNWARE_API_KEY is not set");
}

const openAi = new OpenAI({
  apiKey: openAiApiKey,
});

const runware = new Runware({
  apiKey: runwareApiKey,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);

    const { userInput } = (await req.json()) as RequestPayload;

    const { storyText, storySystemPrompt } = await generateStoryText(userInput);
    const imagePrompt = await generateImagePrompt(storyText);
    const imageUrl = await generateImage(imagePrompt);

    console.log("success");

    const response: ResponsePayload = {
      storySystemPrompt,
      storyText,
      imagePrompt,
      imageUrl,
      // storyId: "<<TODO>>",
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...contentTypeHeaders.json, ...corsHeaders } },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        result: "An error occurred while generating the story.",
      }),
      { headers: { ...contentTypeHeaders.json, ...corsHeaders }, status: 500 },
    );
  }
});

async function generateStoryText(
  userInput: string,
): Promise<{ storyText: string; storySystemPrompt: string }> {
  const storySystemPrompt = [
    SYSTEM_PROMPT_BASE,
    getRandomArrayElement(SYSTEM_ENDING_PROMPTS),
  ].join("\n");

  console.log("generating story text...");
  const storyCompletion = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 1,
    messages: [
      { role: "developer", content: storySystemPrompt },
      { role: "user", content: userInput },
    ],
  });

  const storyText = storyCompletion.choices[0].message.content?.trim();

  if (!storyText) {
    throw new Error("Failed to generate the story");
  }

  return { storyText, storySystemPrompt };
}

async function generateImagePrompt(storyText: string): Promise<string> {
  console.log("generating image prompt...");
  const imagePromptCompletion = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 0.7,
    messages: [
      { role: "system", content: IMAGE_PROMPT_GEN_PROMPT },
      { role: "user", content: storyText },
    ],
  });

  const dynamicImagePrompt = imagePromptCompletion.choices[0].message.content
    ?.trim();

  if (!dynamicImagePrompt) {
    throw new Error("Failed to generate the image prompt");
  }

  return [IMAGE_GEN_SYSTEM_PROMPT, dynamicImagePrompt].join("\n");
}

async function generateImage(imagePrompt: string): Promise<string> {
  console.log("generating images...");

  const generateDesiredImage = async () => {
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      model: "runware:5@1",
      width: 640,
      height: 640,
      numberResults: 1,
      outputFormat: "WEBP",
      steps: 28,
      CFGScale: 4,
      scheduler: "Default",
      strength: 0.8,
    });

    const imageUrl = result?.[0]?.imageURL;
    if (!imageUrl) throw new Error("Failed to generate the desired image");
    return imageUrl;
  };

  const generateFallbackImage = async () => {
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      model: "runware:100@1",
      width: 512,
      height: 512,
      numberResults: 1,
      outputFormat: "WEBP",
      steps: 4,
      CFGScale: 1,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.8,
    });

    const imageUrl = result?.[0]?.imageURL;
    if (!imageUrl) throw new Error("Failed to generate the fallback image");
    return imageUrl;
  };

  // Start both requests immediately
  const desiredImagePromise = generateDesiredImage().catch((error) => {
    console.log("desired image generation failed:", error.message);
    throw error;
  });
  const fallbackImagePromise = generateFallbackImage();

  try {
    // First, try to get the desired image within 10 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Desired image timeout")),
        DESIRED_IMAGE_TIMEOUT_MS,
      )
    );

    // Wait for either the desired image or timeout
    const imageUrl = await Promise.race([desiredImagePromise, timeoutPromise]);
    console.log("desired image generated successfully");

    return imageUrl as string;
  } catch (error) {
    console.log((error as Error)?.message);

    const imageUrl = await fallbackImagePromise;

    console.log("fallback image generated successfully");
    return imageUrl;
  }
}

const getRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};