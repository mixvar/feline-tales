import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { STORY_BY_ID_QUERY_KEY } from "../lib/query-keys.ts";

interface Options {
  enableNarrationGeneration: boolean;
  enableRandomEnding: boolean;
}

export const useStoryGeneration = (
  { enableNarrationGeneration, enableRandomEnding }: Options,
) => {
  const queryClient = useQueryClient();
  const [storyId, setStoryId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationKey: ["generate-story"],
    retry: 1,

    mutationFn: async (userInput: string) => {
      const resp = await supabase.functions.invoke<{ storyId: string }>(
        "generate-story",
        {
          body: {
            userInput,
            narrationEnabled: enableNarrationGeneration,
            randomEndingEnabled: enableRandomEnding,
          },
        },
      );

      if (!resp.data) {
        throw new Error("Nie udało się wygenerować historii");
      }

      return resp.data.storyId;
    },

    onSuccess: (newStoryId) => {
      setStoryId(newStoryId);

      void queryClient.invalidateQueries({
        queryKey: STORY_BY_ID_QUERY_KEY(newStoryId),
      });
    },
  });

  const reset = () => {
    setStoryId(null);
    mutation.reset();
  };

  return {
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    generate: mutation.mutate,
    storyId,
    reset,
  };
};
