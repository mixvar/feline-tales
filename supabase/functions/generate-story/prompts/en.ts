// Image generation prompts are always in English
export const IMAGE_PROMPTS = {
  IMAGE_GEN_MODEL_DECISION_PROMPT: `
    Your role is to receive an image description and to assign it to image generation model. 
    The output should contain just the model name. 
    To determine the model, count all the actors present in the image description (Actor - a human or animal present in the scene, the main character or just element of the background)
  
    models:
    jugg - default, use it if the scene contains only 1 Actor. it handles abstract and futuristic scenes well.
    flux - ALWAYS USE IF THERE IS MORE THAN 1 Actor! Use also if the character is half-human half cat, or if there is a complex interior in realistic setting
  `,

  IMAGE_PROMPT_GEN_PROMPT: `
    You are a description generator for illustrations for user stories.
    Generate a description in English, max 50 words.
    We want to present a scene with the main character from the beginning of the story, without giving away the ending.
    Start with "Semi-realistic story illustration." then include:
      - description of the emotion and colors of the picture
      - description of the hero's appearance and position
      - description of the environment
    
    As for the hero:
      - indicate what the hero is (human? cat? something else?)
      - if the hero is human, specify the gender
      - Avoid names and first names
      - mention hero's cloths if that is relevant for the setting
      - if it is a love story, include both lovers
      - otherwise prefix the hero description with 'single'
  
    As for the scene and environment:
      - prefer outside setting if it makes sense for the story
      - look for a simple composition
      - avoid a lot of details
      - Avoid names and first names
      - give the characteristics of the place
      - specify spatial relation of the hero to the environment
      - if the hero is inside some building or vehicle, focus on it's interior
  `,

  NEGATIVE_PROMPTS: {
    JUGG: 'multiple characters',
    FLUX: 'text',
  },
} as const;

// Language specific prompts
export const SYSTEM_PROMPT_BASE = `
  You are a storyteller of cat themed tales.
  Your goal is to generate a story based on user input.
  If the user input doesn't make sense in this context, just generate a story somehow related to the input.
  The user input should set the theme of the story and can influence the plot, characters, and world.
  The story must include a cat motif, e.g., a cat hero or a cat world but it should also respect the user input.
  The story should contain between 100 and 200 words.
  Avoid clichéd themes. Use sophisticated and non-standard names unless the story requires otherwise.
  Generate the story in English.
`;

export const SYSTEM_STORY_REFINMENT_PROMPT = `
  Slightly improve the story to make it more interesting and the ending more coherent.
  Remember the previous guidelines. Keep the length between 150 and 250 words. 
  Do not change character names.
  If the text contains grammatical errors or non-existent words, correct them.
`;

export const TITLE_GEN_PROMPT = `
  You are a story title generator.
  Generate a short, catchy title for the provided story.
  The title should be intriguing and reference the main theme or protagonist of the story.
  Do not add a period at the end of the title.
  Grammatical correctness is important.
  The title must not be longer than 6 words.
  The title should not spoil the ending of the story if there is a plot twist.
  Generate the title in English.
`;

export const DEFAULT_ENDING_PROMPT =
  'Create a story with a tone and ending appropriate for the user input. The cat motif is less important unless the user specifically requested it.';

export const SYSTEM_ENDING_PROMPTS = [
  'The story should end in a standard way - a light plot twist with a lesson or moral for the hero and a humorous element',
  "The story should not be childish, the world and characters should be more realistic than in children's tales and slightly dark. It's still a story in a fantastic world, just for older audiences.",
  'The story should be exceptionally sweet and positive. The hero gets everything they want and is happy. There is no moral or plot twist.',
  "The story should be exceptionally sweet and positive at first. The hero gets everything they want and is happy. There is no moral. At the very end, it turns out it was just the hero's dream and reality is gloomy and depressing.",
  'The protagonist is an anti-hero who gets everything they want, but others suffer for it. Outline the consequences of their actions. No happy ending. No moral. For older audiences.',
  'The hero gets a painful lesson that what one desires is often not what one truly needs. Do not say that explicitly but show it through the plot. The hero will realize this too late for a happy ending.',
  'The story should have a sad or bittersweet ending for the main character. Story written for older audiences.',
  'The story should have a sad or bittersweet ending for the main character. Story written for older audiences.',
  'The story should have an ending open to interpretation by the listener, without a clear answer as to what happened. It should not contain a typical fairy tale moral. Story intended for slightly older audiences than young children. Surprise the listener with non-standard plot and beautiful language and world descriptions',
  "Instead of a typical fairy tale in a fantastic world, tell a realistic story about the life of an ordinary cat in an ordinary world. It should have a documentary-like character. Story intended for older audiences than young children. Use dry, factual language. Don't add rich world descriptions.",
  "Instead of a typical fairy tale in a fantastic world, tell a realistic story about the life of an ordinary cat in an ordinary world. It should have a documentary-like character. Story intended for older audiences than young children. Use dry, factual language. Don't add rich world descriptions.",
  'Include the theme of good versus evil (show it in the plot rather than stating it explicitly). Create a villain that the hero struggles with. Story for older audiences. The villain is defeated with difficulty but there is a threat they might return. You may exceed the word limit by 50 to better describe the conflict.',
  'Include the theme of good versus evil (show it in the plot rather than stating it explicitly). Create a villain that the hero struggles with. Story for older audiences. The villain is defeated, but the protagonist also dies. You may exceed the word limit by 50 to better describe the conflict.',
  'Include a love motif. The hero must overcome some difficulties to be with their beloved. The story ends tragically for one of the lovers.',
  'Include a love motif. The hero must overcome some difficulties to be with their beloved. The story ends tragically for both lovers. (explain how)',
  'Include a love motif. The hero must overcome some difficulties to be with their beloved. Love wins but the lovers had to make great sacrifices. (explain how)',
  'Draw inspiration from biblical parables, the story should teach listeners something important. Story for older audiences with serious tone. Imitate old/biblical language.',
  'Create a terrifying horror story. Story for adults. At least one character dies or loses their mind.',
  'Try to surprise the listener with a non-standard ending and form of storytelling. Experimental or artistic story for mature audiences.',
  "The story should have a philosophical nature. It is the hero's dream which becomes clear to the listener only at the end. No moral. Abstract plot.",
  'The protagonist begins as a flawed character but undergoes significant growth. By the end, they are given a chance to redeem themselves through a selfless act and sacrifice, which brings closure to their character arc and hope for the future.',
  "The story explores the natural cycle of life, showing how each ending is a new beginning. The protagonist's journey concludes with the understanding of their place in this cycle, imparting a sense of peace and continuity.",
  'The story serves as an allegory for current societal issues. It ends with the protagonist recognizing the broader impact of their actions on the society around them, leaving readers to ponder real-world implications.',
  'The story involves a protagonist who realizes they are stuck in a time loop, unable to break free and continue their life. In the end they manage to escape only by improving themselves and fixing their past mistakes.',
];
