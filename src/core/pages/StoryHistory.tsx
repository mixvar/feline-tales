import { useState } from 'react';
import { useStoryHistory } from '../hooks/useStoryHistory.ts';
import { StoryObject } from '../utils/stories.ts';
import { StoryDisplay } from '../components/StoryDisplay.tsx';
import { StoryPreviewTile } from '../components/StoryPreviewTile.tsx';
import { StoryPreviewTileSkeleton } from '../components/StoryPreviewTileSkeleton.tsx';
import { SecondaryButton } from '../components/base/SecondaryButton.tsx';

interface StoryHistoryProps {
  onClose: () => void;
}

export const StoryHistory = ({ onClose }: StoryHistoryProps) => {
  const storyHistory = useStoryHistory();
  const [selectedStory, setSelectedStory] = useState<StoryObject | null>(null);

  if (selectedStory) {
    return (
      <StoryDisplay
        story={selectedStory}
        renderButton={() => (
          <SecondaryButton onClick={() => setSelectedStory(null)}>
            Wróć do archiwum 📚
          </SecondaryButton>
        )}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <h2 className="text-3xl text-felineGreen-dark text-center font-cursive">Archiwum</h2>

      {storyHistory.error && (
        <p className="text-red-500">
          {storyHistory.error instanceof Error ? storyHistory.error.message : 'Wystąpił błąd'}
        </p>
      )}

      {storyHistory.isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <StoryPreviewTileSkeleton key={index} />
          ))}
        </div>
      )}

      {storyHistory.data && (
        <div className="flex flex-col gap-4">
          {storyHistory.data.map((story) => (
            <StoryPreviewTile
              key={story.id}
              story={story}
              onClick={() => setSelectedStory(story)}
            />
          ))}
        </div>
      )}

      {!!storyHistory.data && storyHistory.data.length === 0 && (
        <p className="text-center text-xl">Brak archwalnych opowiadań</p>
      )}

      <button
        onClick={onClose}
        className="text-felineGreen-dark hover:text-felineGreen-darker self-center"
      >
        wróć
      </button>
    </div>
  );
};
