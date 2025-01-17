// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Runware } from 'npm:@runware/sdk-js';
import { OpenAI } from 'npm:openai';

import { contentTypeHeaders, corsHeaders } from '../_shared/headers.ts';
import {
  getSupabaseClient,
  getSupabaseServiceClient,
  getSupabaseUser,
  getUserRole,
  StoryEntity,
  SupabaseClient,
} from '../_shared/supabase.ts';
import { NARRATION_CONFIG } from './prompts/constants.ts';
import { getImagePrompts, getLangSpecificSystemPrompts, type Locale } from './prompts/index.ts';

console.log('generate-story function is running');

const DESIRED_IMAGE_TIMEOUT_MS = 30_000;

type RequestPayload = {
  locale: Locale;
  userInput: string;
  narrationEnabled?: boolean;
  randomEndingEnabled?: boolean;
};

type ResponsePayload = {
  storyId: string;
};

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openAiApiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
if (!runwareApiKey) {
  throw new Error('RUNWARE_API_KEY is not set');
}

const openAi = new OpenAI({
  apiKey: openAiApiKey,
});

const runware = new Runware({
  apiKey: runwareApiKey,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const supabaseAdmin = getSupabaseServiceClient();

    const user = await getSupabaseUser(supabase, req);
    if (!user) {
      return new Response(JSON.stringify({ result: 'Unauthenticated' }), {
        headers: { ...corsHeaders },
        status: 401,
      });
    }

    const userRole = await getUserRole(supabaseAdmin, user);
    if (userRole === 'none') {
      console.log(`access denied for '${user.email}'`);
      return new Response(JSON.stringify({ result: 'Access denied' }), {
        headers: { ...corsHeaders },
        status: 403,
      });
    }

    const {
      locale = 'pl-PL',
      userInput,
      narrationEnabled = true,
      randomEndingEnabled = true,
    } = (await req.json()) as RequestPayload;

    console.log('creating a story...', { userInput });

    const { storyText, storySystemPrompt } = await generateStoryText(userInput, {
      randomEndingEnabled,
      locale,
    });

    const createImage = (text: string) =>
      generateImagePrompt(text).then(async (imagePrompt) => ({
        imagePrompt,
        imageRef: await generateImage(imagePrompt)
          .then((url) => uploadImageToStorage(supabase, user.id, url))
          .catch((error) => {
            console.error('Failed to create cover image', error.message);
            return null;
          }),
      }));

    const createNarration = (title: string, text: string): Promise<string | null> => {
      if (!narrationEnabled) {
        console.log('narration generation is disabled');
        return Promise.resolve(null);
      }

      return generateNarration(title, text)
        .then((file) => uploadNarrationToStorage(supabase, user.id, file))
        .catch((error) => {
          console.error('Failed to create narration', error.message);
          return null;
        });
    };

    // run whatever is possible in parallel
    const [{ imagePrompt, imageRef }, { storyTitle, refinedStoryText, narrationRef }] =
      await Promise.all([
        createImage(storyText),

        Promise.all([
          generateTitle(storyText, locale),
          refineStoryText(storyText, userInput, storySystemPrompt, locale),
        ]).then(async ([storyTitle, refinedStoryText]) => ({
          storyTitle,
          refinedStoryText,
          narrationRef: await createNarration(storyTitle, refinedStoryText),
        })),
      ]);

    const storyId = await insertStoryIntoDb(supabase, {
      locale,
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

    return new Response(JSON.stringify(response), {
      headers: { ...contentTypeHeaders.json, ...corsHeaders },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('An error occurred while generating the story.', {
      headers: { ...corsHeaders },
      status: 500,
    });
  }
});

async function refineStoryText(
  storyText: string,
  userInput: string,
  storySystemPrompt: string,
  locale: Locale
): Promise<string> {
  console.log('refining story text...');
  const storyCompletion2 = await openAi.chat.completions.create({
    model: 'gpt-4o',
    store: false,
    stream: false,
    temperature: 0.4,
    messages: [
      { role: 'developer', content: storySystemPrompt },
      { role: 'user', content: userInput },
      { role: 'assistant', content: storyText },
      {
        role: 'developer',
        content: getLangSpecificSystemPrompts(locale).SYSTEM_STORY_REFINMENT_PROMPT,
      },
    ],
  });

  const refinedStoryText = storyCompletion2.choices[0].message.content?.trim();

  if (!refinedStoryText) {
    throw new Error('Failed to generate the refined story');
  }

  console.log('Story text refined successfully', {
    before: storyText,
    after: refinedStoryText,
  });
  return refinedStoryText;
}

async function generateStoryText(
  userInput: string,
  {
    randomEndingEnabled,
    locale,
  }: {
    randomEndingEnabled: boolean;
    locale: Locale;
  }
): Promise<{ storyText: string; storySystemPrompt: string }> {
  const prompts = getLangSpecificSystemPrompts(locale);

  const endingPrompt = randomEndingEnabled
    ? getRandomArrayElement(prompts.SYSTEM_ENDING_PROMPTS)
    : prompts.DEFAULT_ENDING_PROMPT;

  const storySystemPrompt = [prompts.SYSTEM_PROMPT_BASE, endingPrompt].join('\n');

  console.log('generating story text...', { endingPrompt });
  const storyCompletion = await openAi.chat.completions.create({
    model: 'gpt-4o',
    store: false,
    stream: false,
    temperature: 0.9,
    messages: [
      { role: 'developer', content: storySystemPrompt },
      { role: 'user', content: userInput },
    ],
  });

  const storyText = storyCompletion.choices[0].message.content?.trim();

  if (!storyText) {
    throw new Error('Failed to generate the story');
  }

  console.log('Story text generated successfully');
  return { storyText, storySystemPrompt };
}

async function generateImagePrompt(storyText: string): Promise<string> {
  console.log('generating image prompt...');
  const imagePromptCompletion = await openAi.chat.completions.create({
    model: 'gpt-4o',
    store: false,
    stream: false,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: getImagePrompts().IMAGE_PROMPT_GEN_PROMPT,
      },
      { role: 'user', content: storyText },
    ],
  });

  const imagePrompt = imagePromptCompletion.choices[0].message.content?.trim();

  if (!imagePrompt) {
    throw new Error('Failed to generate the image prompt');
  }

  console.log('Image prompt generated successfully', { imagePrompt });
  return imagePrompt;
}

async function generateImage(imagePrompt: string): Promise<string> {
  const chooseImageModel = async (): Promise<'jugg' | 'flux'> => {
    console.log('choosing image model...');
    const model = await openAi.chat.completions.create({
      model: 'gpt-4o',
      store: false,
      stream: false,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: getImagePrompts().IMAGE_GEN_MODEL_DECISION_PROMPT,
        },
        { role: 'user', content: imagePrompt },
      ],
    });

    const result = model.choices[0].message.content?.trim();

    if (result?.startsWith('jugg') || result?.startsWith('flux')) {
      return result.startsWith('jugg') ? 'jugg' : 'flux';
    }

    throw new Error(`Failed to choose the image model. Output: ${result}`);
  };

  /**
   * Juggernaut XL from RunDiffusion model
   * Can create very preety iamges, but struggles with multiple characters
   */
  const generateJuggImage = async () => {
    console.log('generating image using Juggernaut XL from RunDiffusion...');
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      negativePrompt: getImagePrompts().NEGATIVE_PROMPTS.JUGG,
      model: 'civitai:133005@357609',
      width: 1024,
      height: 1024,
      numberResults: 1,
      outputFormat: 'WEBP',
      steps: 34,
      CFGScale: 5,
      scheduler: 'Default',
      strength: 0.8,
      lora: [],
    });

    const imageUrl = result?.[0]?.imageURL;
    if (!imageUrl) throw new Error('Failed to generate jugg image');
    return imageUrl;
  };

  /**
   * FLUX.1 (Dev) model
   * Can handle complex prompts better, more cartoonish style
   */
  const generateFluxImage = async () => {
    console.log('generating image using FLUX.1 (Dev)...');
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      negativePrompt: getImagePrompts().NEGATIVE_PROMPTS.FLUX,
      model: 'runware:101@1',
      width: 1024,
      height: 1024,
      numberResults: 1,
      outputFormat: 'WEBP',
      steps: 36,
      CFGScale: 3.5,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8,
      lora: [],
    });

    const imageUrl = result?.[0]?.imageURL;
    if (!imageUrl) throw new Error('Failed to generate flux image');
    return imageUrl;
  };

  /**
   * FLUX.1 (Schnell) model
   * Fallback model for fast generation
   */
  const generateFallbackImage = async () => {
    const result = await runware.requestImages({
      positivePrompt: imagePrompt,
      model: 'runware:100@1',
      width: 512,
      height: 512,
      numberResults: 1,
      outputFormat: 'WEBP',
      steps: 4,
      CFGScale: 1,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8,
    });

    const imageUrl = result?.[0]?.imageURL;
    if (!imageUrl) throw new Error('Failed to generate fallback image');
    return imageUrl;
  };

  const fallbackImagePromise = generateFallbackImage();

  try {
    const model = await chooseImageModel();

    const desiredImagePromise = model === 'jugg' ? generateJuggImage() : generateFluxImage();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Desired image timeout')), DESIRED_IMAGE_TIMEOUT_MS)
    );

    const imageUrl = await Promise.race([desiredImagePromise, timeoutPromise]);
    console.log('desired image generated successfully');

    return imageUrl;
  } catch (error) {
    console.warn((error as Error)?.message);

    const imageUrl = await fallbackImagePromise;

    console.log('fallback image generated successfully');
    return imageUrl;
  }
}

async function generateTitle(storyText: string, locale: Locale): Promise<string> {
  console.log('generating title...');

  const titleCompletion = await openAi.chat.completions.create({
    model: 'gpt-4o',
    store: false,
    stream: false,
    temperature: 0.8,
    messages: [
      { role: 'system', content: getLangSpecificSystemPrompts(locale).TITLE_GEN_PROMPT },
      { role: 'user', content: storyText },
    ],
  });

  const title = titleCompletion.choices[0].message.content?.trim();

  if (!title) {
    throw new Error('Failed to generate the title');
  }

  console.log('Title generated successfully');
  return title;
}

const generateNarration = async (storyTitle: string, storyText: string): Promise<Blob> => {
  console.log('generating narration...');

  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const elevenLabsVoiceId = Deno.env.get('ELEVENLABS_VOICE_ID');
  if (!elevenLabsVoiceId) {
    throw new Error('ELEVENLABS_VOICE_ID is not set');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`;

  const narrationScript = [storyTitle, NARRATION_CONFIG.SHORT_BREAK_TOKEN, storyText].join(' ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Xi-Api-Key': elevenLabsApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: narrationScript,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.6,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorMessage = await response
      .text()
      .then((txt) => `${response.statusText}: ${txt}`)
      .catch(() => response.statusText);

    throw new Error(`Failed to generate narration: ${errorMessage}`);
  }

  console.log('Narration generated successfully');
  return response.blob();
};

const uploadNarrationToStorage = async (
  supabase: SupabaseClient,
  userId: string,
  narrationFile: Blob
): Promise<string> => {
  console.log('uploading narration to storage bucket...');

  try {
    const narrationId = crypto.randomUUID();

    const { data, error } = await supabase.storage
      .from('narrations')
      .upload(`${userId}/${narrationId}.mp3`, narrationFile, {
        cacheControl: '3600',
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    console.log('Narration uploaded to storage successfully', data.path);
    return data.path;
  } catch (error) {
    console.error('Failed to upload narration to storage');
    throw error;
  }
};

const uploadImageToStorage = async (
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string
): Promise<string> => {
  console.log('uploading image to storage bucket...');

  try {
    const imageId = crypto.randomUUID();
    const imageFile = await fetch(imageUrl).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch the image');
      return res.blob();
    });

    const { data, error } = await supabase.storage
      .from('images')
      .upload(`${userId}/${imageId}.webp`, imageFile, {
        cacheControl: '3600',
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    console.log('Image uploaded to storage successfully', data.path);
    return data.path;
  } catch (error) {
    console.error('Failed to upload image to storage');
    throw error;
  }
};

type CreateStoryPayload = Omit<Partial<StoryEntity>, 'id' | 'created_at' | 'user_id'>;

const insertStoryIntoDb = async (supabase: SupabaseClient, story: CreateStoryPayload) => {
  console.log('inserting story into database...');
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([story as StoryEntity])
      .select();

    if (error) {
      throw error;
    }

    const storyId = data[0]?.id;

    if (!storyId) {
      throw new Error('StoryId not created');
    }

    return storyId;
  } catch (error) {
    console.error('Failed to insert story into database');
    throw error;
  }
};

const getRandomArrayElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
