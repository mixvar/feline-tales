import { useEffect, useState } from 'react';
import { StoryDisplaySkeleton } from './StoryDisplaySkeleton';

const CHANGE_MESSAGE_INTERVAL = 3_000;

const PROGRESS_MESSAGES = [
  'Delikatnie szturcham śpiącego pisarza łapką...',
  'Mruczeniem przywołuję wenę twórczą...',
  'Łapka za łapką, historia nabiera kształtu...',
  'Z pędzlem w zębach, kreuje się artystyczne dzieło...',
  'Ostatnie przeciągnięcie i gotowe... Mrrr...',
];

export const StoryGenerationProgress = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) =>
        current < PROGRESS_MESSAGES.length - 1 ? current + 1 : current
      );
    }, CHANGE_MESSAGE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <StoryDisplaySkeleton />
      <p className="text-lg text-felineGreen-dark font-medium text-center">
        {PROGRESS_MESSAGES[messageIndex]}
      </p>
    </div>
  );
};
