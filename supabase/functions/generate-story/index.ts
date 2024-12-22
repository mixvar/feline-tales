// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { contentTypeHeaders, corsHeaders } from "../_shared/headers.ts";
import { getSupabaseClient } from "../_shared/supabase-client.ts";
import { OpenAI } from "npm:openai";

console.log(
  "generate-story function is running",
);

const SYSTEM_PROMPT_BASE = `
  Jesteś opowiadaczem kocich historii. 
  Twoim celem jest wygenerowanie historii na podstawie danych wprowadzonych przez użytkownika.
  Jeśli dane wejściowe użytkownika nie mają sensu w tym kontekście, po prostu wygeneruj losową historię.
  Wejście użytkownika powinno nadać temat historii, może mieć wpływ na fabułę, bohaterów i świat.
  Historia powinna zawierać koci motyw, np kociego bohatera lub koci świat.
  Opowiadanie powinno zawierać od 150 do 250 słów.
  Unikaj utartych motywów.
`;

const SYSTEM_ENDING_PROMPTS = [
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym. Dodatkowo podkręć motyw kociego świata - wszyscy bohaterowie i cały świat jest koci.",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym. Opowiadanie nie powinno być dziecinne, świat i bohaterowie powini być bardziej realistyczni niż w bajkach dla dzieci i nieco mroczni. Nadal jest to opowiadanie w fantastycznym świecie, tylko dla starszych odbiorców.",
  "Historia ma być wyjątkowo słodka i pozytywna. Bohater zdobywa wszystko czego chce i jest szczęśliwy. Nie ma żadnego morału ani zwrotu akcji.",
  "Historia ma przybrać słodkokwaśny charakter i niespodziwaną porażkę dla bohatera. Pomimo tego bohater nie podda się co jest głównym przesłaniem. Historia przeznaczona dla nieco starszych odbiorców niż małe dzieci. Zaskocz słuchacza niestandardową fabułą i ładnym językiem i opisami świata",
  "Historia ma mieć zakończenie otwarte do interpretacji przez słuchacza, bez jasnej odpowiedzi co się stało. Nie powinna zawierać typowego dla bajek morału. Historia przeznaczona dla nieco starszych odbiorców niż małe dzieci. Zaskocz słuchacza niestandardową fabułą i ładnym językiem i opisami świata",
  "Historia ma zaskoczyć słuchacza tym że nie ma w niej prawie żadnej akcji ani zakończenia, skupia się jedynie na opisie świata i bohaterów. W momencie w którym akcja w końcu się rozkręca, historia kończy się a narrator przyznaje że nie wie co stało się dalej. Narrator podaje kilka wersji historii na podstawie zasłyszanych legend/plotek.",
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
  // storyId: string;
};

const openAi = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);

    const { userInput } = (await req.json()) as RequestPayload;

    const storySystemPrompt = [
      SYSTEM_PROMPT_BASE,
      getRandomArrayElement(SYSTEM_ENDING_PROMPTS),
    ].join("\n");

    console.log("generating story...");
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

    const imagePrompt = [IMAGE_GEN_SYSTEM_PROMPT, dynamicImagePrompt].join(
      "\n",
    );

    console.log("success");

    const response: ResponsePayload = {
      storySystemPrompt,
      storyText,
      imagePrompt,
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

const getRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
