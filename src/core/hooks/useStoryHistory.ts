import { useQuery } from "@tanstack/react-query";
import { STORIES_QUERY_KEY } from "../lib/query-keys.ts";
import { supabase } from "../lib/supabase.ts";
import { createStoryObject, StoryObject } from "../utils/stories.ts";

export const useStoryHistory = () => {
  const query = useQuery({
    queryKey: STORIES_QUERY_KEY,
    queryFn: fetchStoryHistory,
  });

  return query;
};

const fetchStoryHistory = async (): Promise<StoryObject[]> => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error("Nie udało się pobrać historii");
  }

  const storiesWithImages = await Promise.all(
    data.map(createStoryObject),
  );

  return storiesWithImages;
};
