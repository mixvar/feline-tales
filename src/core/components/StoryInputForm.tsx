import { useState } from 'react';

interface StoryInputFormProps {
  onSubmit: (input: string) => void;
  error: string | null;
}

export const StoryInputForm = ({ onSubmit, error }: StoryInputFormProps) => {
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
        className="w-full p-4 rounded-lg border border-felineGreen-dark min-h-[100px] resize-none bg-white bg-opacity-80"
      />
      <button
        type="submit"
        disabled={!userInput.trim()}
        className="bg-felineGreen-dark text-white  px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Opowiedz ✨
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
};
