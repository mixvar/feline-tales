import { useMutation, useQueryClient } from "@tanstack/react-query";
import { STORY_BY_ID_QUERY_KEY } from "../lib/query-keys";
import { supabase } from "../lib/supabase";
import { StoryObject } from "../utils/stories";

interface RateStoryPayload {
  storyId: string;
  rating: number;
}

export const useStoryRatingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, rating }: RateStoryPayload) => {
      const response = await supabase.functions.invoke<void>("rate-story", {
        body: { storyId, rating },
      });

      if (response.error) {
        throw response.error;
      }
    },

    onMutate: async ({ storyId, rating }: RateStoryPayload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: STORY_BY_ID_QUERY_KEY(storyId),
      });

      // Snapshot the previous value
      const previousStory = queryClient.getQueryData<StoryObject>(
        STORY_BY_ID_QUERY_KEY(storyId),
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        STORY_BY_ID_QUERY_KEY(storyId),
        (old: StoryObject) => ({
          ...old,
          rating,
        }),
      );

      // Return a context object with the snapshotted value
      return { previousStory };
    },

    onError: (_err, { storyId }, context) => {
      const previousStory = context?.previousStory;

      if (previousStory) {
        // Rollback to the previous value
        queryClient.setQueryData(
          STORY_BY_ID_QUERY_KEY(storyId),
          previousStory,
        );
      }
    },

    onSettled: (_data, _error, { storyId }) => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({
        queryKey: STORY_BY_ID_QUERY_KEY(storyId),
      });
    },
  });
};
