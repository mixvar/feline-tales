import { useStoryQueryById } from '../hooks/useStoryQueryById.ts';
import { PrimaryButton } from './base/PrimaryButton.tsx';
import { StoryDisplay } from './StoryDisplay.tsx';
import { StoryDisplaySkeleton } from './StoryDisplaySkeleton.tsx';

interface StoryDisplayWrapperProps {
  storyId: string;
  onReset: () => void;
}

export const StoryDisplayWrapper = ({ storyId, onReset }: StoryDisplayWrapperProps) => {
  const storyQuery = useStoryQueryById(storyId);

  if (storyQuery.isLoading) {
    return <StoryDisplaySkeleton />;
  }

  if (storyQuery.error) {
    return <div className="text-red-500 text-center">{storyQuery.error.message}</div>;
  }

  if (!storyQuery.data) {
    return null;
  }

  return (
    <StoryDisplay
      story={storyQuery.data}
      renderButton={() => (
        <PrimaryButton onClick={onReset}>Opowiedz nową historię 📖</PrimaryButton>
      )}
    />
  );
};
