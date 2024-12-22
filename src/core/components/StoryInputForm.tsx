import { useState } from 'react';
import { PrimaryButton } from './base/PrimaryButton';
import { SecondaryButton } from './base/SecondaryButton';

interface StoryInputFormProps {
  onSubmit: (input: string) => void;
  onHistoryClick: () => void;
  error: string | null;
}

export const StoryInputForm = ({ onSubmit, onHistoryClick, error }: StoryInputFormProps) => {
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
        className="w-full p-4 rounded-lg border border-felineGreen-dark min-h-[100px] resize-none bg-white bg-opacity-50 placeholder:text-felineGreen-dark focus:outline-felineGreen-dark"
      />
      <div className="flex flex-col gap-2">
        <PrimaryButton disabled={!userInput.trim()} buttonProps={{ type: 'submit' }}>
          Opowiedz ✨
        </PrimaryButton>
        <SecondaryButton onClick={onHistoryClick} buttonProps={{ type: 'button' }}>
          Zobacz archiwum 📚
        </SecondaryButton>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
};
