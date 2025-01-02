import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useStoryQueryById } from '../hooks/useStoryQueryById.ts';
import { PrimaryButton } from './base/PrimaryButton.tsx';
import { StoryDisplay } from './StoryDisplay.tsx';
import { StoryDisplaySkeleton } from './StoryDisplaySkeleton.tsx';
import { SecondaryButton } from './base/SecondaryButton.tsx';

interface StoryDisplayWrapperProps {
  storyId: string;
  isNew?: boolean;
}

export const StoryDisplayWrapper = ({ storyId, isNew }: StoryDisplayWrapperProps) => {
  const storyQuery = useStoryQueryById(storyId);
  const navigate = useNavigate();

  const goToHome = () => {
    void navigate('/');
  };
  const goToHistory = () => {
    void navigate('/history');
  };

  if (storyQuery.isPending) {
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
      renderButton={() =>
        isNew ? (
          <PrimaryButton onClick={goToHome}>
            <FormattedMessage id="storyDisplay.button.newStory" />
          </PrimaryButton>
        ) : (
          <SecondaryButton onClick={goToHistory}>
            <FormattedMessage id="storyDisplay.button.backToArchive" />
          </SecondaryButton>
        )
      }
    />
  );
};
