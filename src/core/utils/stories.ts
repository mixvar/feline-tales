import { getStorageFileUrl } from "../lib/storage";
import { StoryEntity } from "../lib/supabase";

export interface StoryObject {
  id: string;
  title: string;
  text: string;
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

  return {
    id: story.id,
    title: story.title,
    text: story.content,
    createdAt: story.created_at,
    imageUrl,
    narrationAudioUrl,
  };
};
