import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);

  const generate = async (userInput: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

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

      const newStoryId = resp.data.storyId;
      setStoryId(newStoryId);

      // Invalidate the query for the newly generated story - also refreshing the list
      void queryClient.invalidateQueries({
        queryKey: STORY_BY_ID_QUERY_KEY(newStoryId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coś poszło nie tak");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStoryId(null);
    setError(null);
  };

  return { isLoading, error, storyId, generate, reset };
};
