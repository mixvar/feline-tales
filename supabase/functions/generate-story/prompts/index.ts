import type { ImagePrompts, Locale, SystemPrompts } from './types.ts';
import * as plPrompts from './pl.ts';
import * as enPrompts from './en.ts';
import * as dePrompts from './de.ts';

export type { Locale, SystemPrompts };

// it seems that for best results we should use the same language for the system prompts and the story
export const getLangSpecificSystemPrompts = (locale: Locale): SystemPrompts => {
  switch (locale) {
    case 'pl-PL':
      return plPrompts;
    case 'en-US':
      return enPrompts;
    case 'de-DE':
      return dePrompts;
  }
};

export const getImagePrompts = (): ImagePrompts => {
  return enPrompts.IMAGE_PROMPTS;
};
