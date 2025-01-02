import { useQuery } from "@tanstack/react-query";
import { useIntl } from "react-intl";
import { STORY_BY_ID_QUERY_KEY } from "../lib/query-keys.ts";
import { StoryEntity, supabase } from "../lib/supabase.ts";
import { createStoryObject, StoryObject } from "../utils/stories.ts";

export const useStoryQueryById = (storyId: string) => {
  const intl = useIntl();

  const query = useQuery({
    queryKey: STORY_BY_ID_QUERY_KEY(storyId),
    queryFn: () =>
      fetchStoryWithImage(
        storyId,
        intl.formatMessage({ id: "error.story.fetch" }),
      ),
    staleTime: 1000 * 60 * 10,
  });

  return query;
};

const fetchStoryWithImage = async (
  storyId: string,
  errorMessage: string,
): Promise<StoryObject> => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .single<StoryEntity>();

  if (error || !data) {
    throw new Error(errorMessage);
  }

  return await createStoryObject(data);
};
