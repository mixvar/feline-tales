import { getStorageFileUrl } from "../lib/storage";
import { StoryEntity } from "../lib/supabase";

export interface StoryObject {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export const createStoryObject = async (
  story: StoryEntity,
): Promise<StoryObject> => {
  const imageUrl = await getStorageFileUrl(
    "images",
    story.cover_image_file_ref,
  );

  return {
    id: story.id,
    title: story.title,
    text: story.content,
    imageUrl,
    createdAt: story.created_at,
  };
};
