# Feline Tales

App for generating unpredictable cat-themed stories with illustration and narration using AI.

Note: this is a fun project mostly hacked together before Christmas as a gift for my wife and as an AI playground for me. A lot of the code was generated and is not representative of my usual coding standards.


## Demo

https://github.com/user-attachments/assets/9b14e221-2648-4f80-bc7e-4c691a7c98af

## How it works

- user inputs short instruction what the story should be about
- for each story a random system prompt variation is chosen out of predefiend set, for example making the story a clasic children talek, a romance, horror or something else
- [OpenAI](https://openai.com/) GPT4o is used to:
  - geenrate the story text
  - refine the story text (second iteration for better results)
  - generate a title for the story
  - generate a prompt for creating an illustration
  - determining which image gen model to use
- [RUNWARE.AI](https://runware.ai/) is used for generating the image
- [Elevenlabs](https://elevenlabs.io/) is used for generating the narration voiceover
- [Supabase](https://supabase.com/) is used to:
  - execute all code requiring API calls to AI services via a deno edge function
  - save generated story into DB
  - save generated story assets into file storage
