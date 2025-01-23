import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { supabase } from '../lib/supabase';
import { STORY_BY_ID_QUERY_KEY } from '../lib/query-keys.ts';
import { useLocaleContext } from '../contexts/locale-context.tsx';

interface Options {
  enableNarrationGeneration: boolean;
  enableRandomEnding: boolean;
}

export const useStoryGenerationMutation = ({
  enableNarrationGeneration,
  enableRandomEnding,
}: Options) => {
  const intl = useIntl();
  const { locale } = useLocaleContext();
  const queryClient = useQueryClient();
  const [storyId, setStoryId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationKey: ['generate-story'],
    retry: 1,

    mutationFn: async (userInput: string) => {
      const resp = await supabase.functions.invoke<{ storyId: string }>('generate-story', {
        body: {
          locale,
          userInput,
          narrationEnabled: enableNarrationGeneration,
          randomEndingEnabled: enableRandomEnding,
          rngSeed: Math.floor(Math.random() * 1000),
        },
      });

      if (!resp.data) {
        throw new Error(intl.formatMessage({ id: 'error.story.generation' }));
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
