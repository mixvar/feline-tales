import { useQuery } from "@tanstack/react-query";
import { useIntl } from "react-intl";
import { STORIES_QUERY_KEY } from "../lib/query-keys.ts";
import { supabase } from "../lib/supabase.ts";
import { createStoryObject, StoryObject } from "../utils/stories.ts";

export const useStoryHistory = () => {
  const intl = useIntl();

  const query = useQuery({
    queryKey: STORIES_QUERY_KEY,
    queryFn: () =>
      fetchStoryHistory(intl.formatMessage({ id: "error.story.history" })),
  });

  return query;
};

const fetchStoryHistory = async (
  errorMessage: string,
): Promise<StoryObject[]> => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error(errorMessage);
  }

  const lightweightStories = await Promise.all(
    data.map((story) => createStoryObject(story, { excludeNarration: true })),
  );

  return lightweightStories;
};
