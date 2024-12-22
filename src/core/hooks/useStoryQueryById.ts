import { useQuery } from "@tanstack/react-query";
import { StoryEntity, supabase } from "../lib/supabase.ts";
import { getStorageFileUrl } from "../lib/storage.ts";

export const STORIES_QUERY_KEY = "stories";
export const STORY_BY_ID_QUERY_KEY = (
  storyId: string,
) => [...STORIES_QUERY_KEY, "id", storyId];

export interface StoryObject {
  title: string;
  text: string;
  imageUrl?: string;
}

export const useStoryQueryById = (storyId: string) => {
  const query = useQuery({
    queryKey: STORY_BY_ID_QUERY_KEY(storyId),
    queryFn: () => fetchStoryWithImage(storyId),
    staleTime: 1000 * 60 * 10,
  });

  return query;
};

const fetchStoryWithImage = async (storyId: string): Promise<StoryObject> => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .single<StoryEntity>();

  if (error || !data) {
    throw new Error("Nie udało się pobrać historii");
  }

  const imageUrl = await getStorageFileUrl("images", data.cover_image_file_ref);

  return {
    title: data.title,
    text: data.content,
    imageUrl,
  };
};
