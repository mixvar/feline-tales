import { getStorageFileUrl } from "../lib/storage";
import { StoryEntity } from "../lib/supabase";

export interface StoryObject {
  id: string;
  title: string;
  subTitle?: string;
  text: string;
  rating?: number;
  createdAt: string;
  imageUrl?: string;
  narrationAudioUrl?: string;
}

export const createStoryObject = async (
  story: StoryEntity,
  options: { excludeNarration?: boolean } = {},
): Promise<StoryObject> => {
  const imageUrl = await getStorageFileUrl(
    "images",
    story.cover_image_file_ref,
  );

  const narrationAudioUrl = await getStorageFileUrl(
    "narrations",
    options.excludeNarration ? null : story.content_audio_file_ref,
  );

  // that is an awful hack caused by lack of actual story translation
  // we could display user prompt in other way than fake subtitle
  // to make it go away
  const subTitle = story.user_input_transcript?.replace(
    "Opowiedz mi historię o",
    "Opowieść o",
  ).replace("Tell me a story about", "Story about");

  return {
    id: story.id,
    title: story.title,
    text: story.content,
    createdAt: story.created_at,
    rating: story.user_rating ?? undefined,
    subTitle,
    imageUrl,
    narrationAudioUrl,
  };
};
