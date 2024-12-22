import felineStoriesLogo from '../../assets/feline-stories.webp';
import { UserWidget } from '../components/UserWidget';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const HomePage = ({ user }: { user: User }) => {
  const storyGen = useStoryGeneration();
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    void storyGen.generate('Opowiedz mi historię o ' + userInput);
  };

  return (
    <>
      <UserWidget user={user} />
      <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-start gap-4">
        <img
          className={`transition-all duration-300 ${
            storyGen.story ? 'h-[150px] md:h-[200px]' : 'h-[300px] md:h-[400px]'
          }`}
          src={felineStoriesLogo}
          alt="logo"
        />
        <h1
          className={`text-felineGreen-dark font-cursive text-gradient-animation transition-all duration-300 ${
            storyGen.story ? 'text-5xl md:text-6xl' : 'text-5xl md:text-[6rem]'
          }`}
        >
          Kocie Opowieści
        </h1>

        {!storyGen.story ? (
          <StoryInputForm
            userInput={userInput}
            setUserInput={setUserInput}
            onSubmit={handleSubmit}
            isLoading={storyGen.isLoading}
            error={storyGen.error}
          />
        ) : (
          <StoryDisplay story={storyGen.story} onReset={storyGen.reset} />
        )}
      </div>
    </>
  );
};

interface StoryInputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

const StoryInputForm = ({
  userInput,
  setUserInput,
  onSubmit,
  isLoading,
  error,
}: StoryInputFormProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl flex flex-col gap-4">
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
  );
};

interface StoryDisplayProps {
  story: GenerateStoryResponsePayload;
  onReset: () => void;
}

const StoryDisplay = ({ story, onReset }: StoryDisplayProps) => {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 md:flex-shrink-0 overflow-hidden">
            <img
              src={story.imageUrl}
              alt="Ilustracja do historii"
              className="w-full h-[300px] md:h-[500px] object-cover scale-105 transition-transform duration-500 hover:scale-100"
            />
          </div>
          <div className="p-6 md:w-1/2 md:overflow-y-auto md:max-h-[500px]">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{story.storyText}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="bg-felineGreen-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker self-center"
      >
        Opowiedz nową historię
      </button>
    </div>
  );
};

interface GenerateStoryResponsePayload {
  storyText: string;
  imageUrl: string;
  imagePrompt: string;
  storySystemPrompt: string;
}

const useStoryGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<GenerateStoryResponsePayload | null>(null);

  const generate = async (userInput: string) => {
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

  return { isLoading, error, story, generate, reset };
};
