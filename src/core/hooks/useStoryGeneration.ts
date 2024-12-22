import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { STORY_BY_ID_QUERY_KEY } from "../lib/query-keys.ts";

export const useStoryGeneration = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);

  const generate = async (userInput: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const resp = await supabase.functions.invoke<{ storyId: string }>(
        "generate-story",
        { body: { userInput } },
      );

      if (!resp.data) {
        throw new Error("Nie udało się wygenerować historii");
      }

      setStoryId(resp.data.storyId);

      // Invalidate the query for the newly generated story - also refreshing the list
      void queryClient.invalidateQueries({
        queryKey: STORY_BY_ID_QUERY_KEY(resp.data.storyId),
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
