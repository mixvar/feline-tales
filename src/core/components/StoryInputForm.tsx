import { useState } from 'react';

interface StoryInputFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const StoryInputForm = ({ onSubmit, isLoading, error }: StoryInputFormProps) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    onSubmit('Opowiedz mi historię o ' + userInput);
  };

  return (
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
  );
};
