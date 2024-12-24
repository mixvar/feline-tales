// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { contentTypeHeaders, corsHeaders } from "../_shared/headers.ts";
import {
  getSupabaseClient,
  getSupabaseUser,
  StoryEntity,
  SupabaseClient,
} from "../_shared/supabase.ts";
import { OpenAI } from "npm:openai";
import { Runware } from "npm:@runware/sdk-js";

console.log(
  "generate-story function is running",
);

const DESIRED_IMAGE_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT_BASE = `
  Jesteś opowiadaczem kocich historii. 
  Twoim celem jest wygenerowanie historii na podstawie danych wprowadzonych przez użytkownika.
  Jeśli dane wejściowe użytkownika nie mają sensu w tym kontekście, po prostu wygeneruj losową historię.
  Wejście użytkownika powinno nadać temat historii, może mieć wpływ na fabułę, bohaterów i świat.
  Historia musi zawierać koci motyw, np kociego bohatera lub koci świat.
  Opowiadanie powinno zawierać od 100 do 200 słów.
  Unikaj utartych motywów.
`;

const SYSTEM_ENDING_PROMPTS = [
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera i elementem humorystycznym. Dodatkowo podkręć motyw kociego świata - wszyscy bohaterowie i cały świat jest koci.",
  "Historia ma zakończyć się standardowo - lekki zwrot akcji z lekcją lub morałem dla bohatera. Opowiadanie nie powinno być dziecinne, świat i bohaterowie powini być bardziej realistyczni niż w bajkach dla dzieci i nieco mroczni. Nadal jest to opowiadanie w fantastycznym świecie, tylko dla starszych odbiorców.",
  "Historia ma być wyjątkowo słodka i pozytywna. Bohater zdobywa wszystko czego chce i jest szczęśliwy. Nie ma żadnego morału ani zwrotu akcji.",
  "Historia ma mieć smutne lub słodko-kwaśne zakończenie dla głównego bohatera. Historia pisana dla starszych odbiorców.",
  "Historia ma mieć zakończenie otwarte do interpretacji przez słuchacza, bez jasnej odpowiedzi co się stało. Nie powinna zawierać typowego dla bajek morału. Historia przeznaczona dla nieco starszych odbiorców niż małe dzieci. Zaskocz słuchacza niestandardową fabułą i ładnym językiem i opisami świata",
  "Zamiast typowej bajki w fantastycznym świecie, opowiedz realistyczną historię o życiu zwykłego kota w zwykłym świecie. Ma mieć charakter zbliżony do filmu dokumentalnego. Historia przeznaczona dla starszych odbiorców niż małe dzieci. Używaj suchego, rzeczowego języka. Nie dodawaj bogatych opisów świata.",
  "Zawrzyj motyw walki dobra ze złem. Stwórz czarny charatker z którym zmaga się bohater. Historia dla starszych odbiorców. Zły bohater na końcu zostaje pokonany ale istnieje groźba że powróci. Możesz przekroczyć limit słów o 50 żeby lepiej opisać konflikt.",
  "Zawrzyj motyw miłosny. Bohater musi przezwyciężyć jakieś trudności aby być z ukochaną/ukochanym. Opowieść kończy się tragicznie dla jednego z kochanków.",
];

const SYSTEM_STORY_REFINMENT_PROMPT = `
  Popraw lekko historię aby była bardziej interesująca a zakończenie sensowne. 
  Pamiętaj o wcześniejszych wytycznych. Zmieść się w zakresie od 150 do 250 słów. Nie zmieniaj nazw bohaterów.
  Jeżeli tekst zawiera błędy gramatyczne albo nieistniejące słowa, popraw je.
`;

const IMAGE_PROMPT_GEN_PROMPT = `
  Jesteś generatorem opisów obrazów do przedstawionych historii.
  Wygeneruj opis po angielsku, max 30 słów.
  Generator obrazów nie rozumie złożonych zdań, ważne jest przekazanie opisu używając jak najmniejszej ilości słów.
  Chcemy przedstawić scenę z głównym bohaterem (bez dodatkowych postaci) z początku opowiadania, bez zdradzania zakończenia.
  Unikaj nazw i imion - istotny jest tylko wygląd potrzebny do wygenerowania obrazu.
  Zacznij od "Generate a cover image for a fantasy story in style of a book illustration."
  Opis ma skłdać się z 4 krótkich zdań.
  - opis tonu i kolorów obrazu
  - poziom realizmu
  - opis otoczenia
  - opis wyglądu i pozycji bohatera (dodaj słowo 'solo' aby AI nie wygenerowała kilku kopii bohatera)
`;

const TITLE_GEN_PROMPT = `
  Jesteś generatorem tytułów do opowiadań.
  Wygeneruj krótki, chwytliwy tytuł do przedstawionej historii.
  Tytuł powinien być po polsku, max 6 słów.
  Tytuł powinien być intrygujący i nawiązywać do głównego wątku lub bohatera historii.
  Unikaj słów "kot" i "kotek" w tytule.
  Nie dodawaj kropki na końcu tytułu.
  Ważna jest poprawność gramatyczna.
`;

type RequestPayload = {
  userInput: string;
  narrationEnabled: boolean;
};

type ResponsePayload = {
  storyId: string;
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

    const user = await getSupabaseUser(supabase, req);
    if (!user) throw new Error("User not found");

    const { userInput, narrationEnabled } =
      (await req.json()) as RequestPayload;

    console.log("creating a story...", { userInput });

    const { storyText, storySystemPrompt } = await generateStoryText(userInput);

    const createImage = (text: string) =>
      generateImagePrompt(text)
        .then(async (imagePrompt) => ({
          imagePrompt,
          imageRef: await generateImage(imagePrompt)
            .then((url) => uploadImageToStorage(supabase, user.id, url))
            .catch((error) => {
              console.error("Failed to create cover image", error.message);
              return null;
            }),
        }));

    const createNarration = (
      title: string,
      text: string,
    ): Promise<string | null> => {
      if (!narrationEnabled) {
        console.log("narration generation is disabled");
        return Promise.resolve(null);
      }

      return generateNarration(title, text)
        .then((file) => uploadNarrationToStorage(supabase, user.id, file))
        .catch((error) => {
          console.error("Failed to create narration", error.message);
          return null;
        });
    };

    // run whatever is possible in parallel
    const [
      { imagePrompt, imageRef },
      { storyTitle, refinedStoryText, narrationRef },
    ] = await Promise.all([
      createImage(storyText),

      Promise.all([
        generateTitle(storyText),
        refineStoryText(storyText, userInput, storySystemPrompt),
      ]).then(async ([storyTitle, refinedStoryText]) => ({
        storyTitle,
        refinedStoryText,
        narrationRef: await createNarration(storyTitle, refinedStoryText),
      })),
    ]);

    const storyId = await insertStoryIntoDb(supabase, {
      title: storyTitle,
      content: refinedStoryText,
      cover_image_source_prompt: imagePrompt,
      cover_image_file_ref: imageRef,
      content_source_prompt: storySystemPrompt,
      user_input_transcript: userInput,
      content_audio_file_ref: narrationRef,
    });

    console.log(`story "${storyTitle}" (${storyId}) created successfully!`);

    const response: ResponsePayload = { storyId };

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

async function refineStoryText(
  storyText: string,
  userInput: string,
  storySystemPrompt: string,
): Promise<string> {
  console.log("refining story text...");
  const storyCompletion2 = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 0.4,
    messages: [
      { role: "developer", content: storySystemPrompt },
      { role: "user", content: userInput },
      { role: "assistant", content: storyText },
      { role: "developer", content: SYSTEM_STORY_REFINMENT_PROMPT },
    ],
  });

  const refinedStoryText = storyCompletion2.choices[0].message.content?.trim();

  if (!refinedStoryText) {
    throw new Error("Failed to generate the refined story");
  }

  console.log("Story text refined successfully", {
    before: storyText,
    after: refinedStoryText,
  });
  return refinedStoryText;
}

async function generateStoryText(
  userInput: string,
): Promise<{ storyText: string; storySystemPrompt: string }> {
  const endingPrompt = getRandomArrayElement(SYSTEM_ENDING_PROMPTS);
  const storySystemPrompt = [SYSTEM_PROMPT_BASE, endingPrompt].join("\n");

  console.log("generating story text...", { endingPrompt });
  const storyCompletion = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 0.9,
    messages: [
      { role: "developer", content: storySystemPrompt },
      { role: "user", content: userInput },
    ],
  });

  const storyText = storyCompletion.choices[0].message.content?.trim();

  if (!storyText) {
    throw new Error("Failed to generate the story");
  }

  console.log("Story text generated successfully");
  return { storyText, storySystemPrompt };
}

async function generateImagePrompt(storyText: string): Promise<string> {
  console.log("generating image prompt...");
  const imagePromptCompletion = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 0.6,
    messages: [
      { role: "system", content: IMAGE_PROMPT_GEN_PROMPT },
      { role: "user", content: storyText },
    ],
  });

  const imagePrompt = imagePromptCompletion.choices[0].message.content
    ?.trim();

  if (!imagePrompt) {
    throw new Error("Failed to generate the image prompt");
  }

  console.log("Image prompt generated successfully", { imagePrompt });
  return imagePrompt;
}

async function generateImage(imagePrompt: string): Promise<string> {
  console.log("generating images...");

  const generateDesiredImage = async () => {
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      negativePrompt: "multiple characters, text",
      model: "civitai:133005@357609",
      width: 1024,
      height: 1024,
      numberResults: 1,
      outputFormat: "WEBP",
      steps: 35,
      CFGScale: 7.5,
      scheduler: "Default",
      strength: 0.8,
      lora: [],
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

async function generateTitle(storyText: string): Promise<string> {
  console.log("generating title...");
  const titleCompletion = await openAi.chat.completions.create({
    model: "gpt-4o",
    store: false,
    stream: false,
    temperature: 0.75,
    messages: [
      { role: "system", content: TITLE_GEN_PROMPT },
      { role: "user", content: storyText },
    ],
  });

  const title = titleCompletion.choices[0].message.content?.trim();

  if (!title) {
    throw new Error("Failed to generate the title");
  }

  console.log("Title generated successfully");
  return title;
}

const generateNarration = async (
  storyTitle: string,
  storyText: string,
): Promise<Blob> => {
  console.log("generating narration...");

  const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (!elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const elevenLabsVoiceId = Deno.env.get("ELEVENLABS_VOICE_ID");
  if (!elevenLabsVoiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is not set");
  }

  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`;

  const narrationScript = [
    `Oto opowiadanie: ${storyTitle}`,
    '<break time="0.5s" />',
    storyText,
  ].join(" ");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Xi-Api-Key": elevenLabsApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: narrationScript,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.6,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text().then((txt) =>
      `${response.statusText}: ${txt}`
    ).catch(() => response.statusText);

    throw new Error(`Failed to generate narration: ${errorMessage}`);
  }

  console.log("Narration generated successfully");
  return response.blob();
};

const uploadNarrationToStorage = async (
  supabase: SupabaseClient,
  userId: string,
  narrationFile: Blob,
): Promise<string> => {
  console.log("uploading narration to storage bucket...");

  try {
    const narrationId = crypto.randomUUID();

    const { data, error } = await supabase.storage.from("narrations").upload(
      `${userId}/${narrationId}.mp3`,
      narrationFile,
      {
        cacheControl: "3600",
        contentType: "audio/mpeg",
        upsert: false,
      },
    );

    if (error) {
      throw error;
    }

    console.log("Narration uploaded to storage successfully", data.path);
    return data.path;
  } catch (error) {
    console.error("Failed to upload narration to storage");
    throw error;
  }
};

const uploadImageToStorage = async (
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string,
): Promise<string> => {
  console.log("uploading image to storage bucket...");

  try {
    const imageId = crypto.randomUUID();
    const imageFile = await fetch(imageUrl).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch the image");
      return res.blob();
    });

    const { data, error } = await supabase.storage.from("images").upload(
      `${userId}/${imageId}.webp`,
      imageFile,
      {
        cacheControl: "3600",
        contentType: "image/webp",
        upsert: false,
      },
    );

    if (error) {
      throw error;
    }

    console.log("Image uploaded to storage successfully", data.path);
    return data.path;
  } catch (error) {
    console.error("Failed to upload image to storage");
    throw error;
  }
};

type CreateStoryPayload = Omit<
  Partial<StoryEntity>,
  "id" | "created_at" | "user_id"
>;

const insertStoryIntoDb = async (
  supabase: SupabaseClient,
  story: CreateStoryPayload,
) => {
  console.log("inserting story into database...");
  try {
    const { data, error } = await supabase
      .from("stories")
      .insert([story as StoryEntity])
      .select();

    if (error) {
      throw error;
    }

    const storyId = data[0]?.id;

    if (!storyId) {
      throw new Error("StoryId not created");
    }

    return storyId;
  } catch (error) {
    console.error("Failed to insert story into database");
    throw error;
  }
};

const getRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
