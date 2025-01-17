export type Locale = 'pl-PL' | 'en-US' | 'de-DE';

export type ImagePrompts = {
  IMAGE_GEN_MODEL_DECISION_PROMPT: string;
  IMAGE_PROMPT_GEN_PROMPT: string;
  NEGATIVE_PROMPTS: {
    JUGG: string;
    FLUX: string;
  };
};

export type SystemPrompts = {
  SYSTEM_PROMPT_BASE: string;
  SYSTEM_STORY_REFINMENT_PROMPT: string;
  TITLE_GEN_PROMPT: string;
  SYSTEM_ENDING_PROMPTS: string[];
  DEFAULT_ENDING_PROMPT: string;
};
