import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { StoryPreviewTile } from '../components/StoryPreviewTile.tsx';
import { StoryPreviewTileSkeleton } from '../components/StoryPreviewTileSkeleton.tsx';
import { useStoryHistory } from '../hooks/useStoryHistory.ts';

export const StoryHistory = () => {
  const navigate = useNavigate();
  const storyHistory = useStoryHistory();
  const intl = useIntl();

  const handleNavigateHome = () => {
    void navigate('/');
  };
  const handleNavigateToStory = (storyId: string) => {
    void navigate(`/story/${storyId}`);
  };

  return (
    <div className="w-full sm:px-3 flex flex-col gap-4">
      <h2 className="text-4xl text-felineGreen-dark text-center font-cursive">
        <FormattedMessage id="storyHistory.title" />
      </h2>

      {storyHistory.error && (
        <p className="text-red-500">
          {storyHistory.error instanceof Error
            ? storyHistory.error.message
            : intl.formatMessage({ id: 'storyHistory.error.generic' })}
        </p>
      )}

      {storyHistory.isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <StoryPreviewTileSkeleton key={index} />
          ))}
        </div>
      )}

      {storyHistory.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyHistory.data.map((story) => (
            <StoryPreviewTile
              key={story.id}
              story={story}
              onClick={() => handleNavigateToStory(story.id)}
            />
          ))}
        </div>
      )}

      {!!storyHistory.data && storyHistory.data.length === 0 && (
        <p className="text-center text-xl">
          <FormattedMessage id="storyHistory.empty" />
        </p>
      )}

      <button
        onClick={() => handleNavigateHome()}
        className="text-felineGreen-dark hover:text-felineGreen-darker self-center"
      >
        <FormattedMessage id="storyHistory.back" />
      </button>
    </div>
  );
};
