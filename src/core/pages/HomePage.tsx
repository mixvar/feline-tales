import felineStoriesLogo from '../../assets/feline-stories.webp';
import { UserWidget } from '../components/UserWidget';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const HomePage = ({ user }: { user: User }) => {
  const { isLoading, error, story, generateStoryHandler, reset } = useStoryGeneration();
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    void generateStoryHandler(userInput);
  };

  return (
    <>
      <UserWidget user={user} />
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <img className="h-[400px]" src={felineStoriesLogo} alt="logo" />
        <h1 className="text-felineGreen-dark text-[6rem] font-cursive text-gradient-animation">
          Kocie Opowieści
        </h1>

        {!story ? (
          <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Opowiedz mi historię o..."
              className="w-full p-4 rounded-lg border border-felineGreen-dark min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-felineGreen-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generuję historię...' : 'Opowiedz'}
            </button>
            {error && <p className="text-red-500 text-center">{error}</p>}
          </form>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{story.storyText}</p>
            <button
              onClick={reset}
              className="bg-felineGreen-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker self-center"
            >
              Opowiedz nową historie
            </button>
          </div>
        )}
      </div>
    </>
  );
};

interface GenerateStoryResponsePayload {
  storyText: string;
  imagePrompt: string;
  storySystemPrompt: string;
}

const useStoryGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<GenerateStoryResponsePayload | null>(null);

  const generateStoryHandler = async (userInput: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const resp = await supabase.functions.invoke<GenerateStoryResponsePayload>('generate-story', {
        body: { userInput },
      });

      if (!resp.data) {
        throw new Error('Nie udało się wygenerować historii');
      }

      setStory(resp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coś poszło nie tak');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStory(null);
    setError(null);
  };

  return { isLoading, error, story, generateStoryHandler, reset };
};
