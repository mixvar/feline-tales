import { useState } from "react";
import { supabase } from "../lib/supabase";

export const useStoryGeneration = () => {
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
