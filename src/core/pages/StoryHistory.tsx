import { useNavigate } from 'react-router-dom';
import { StoryPreviewTile } from '../components/StoryPreviewTile.tsx';
import { StoryPreviewTileSkeleton } from '../components/StoryPreviewTileSkeleton.tsx';
import { useStoryHistory } from '../hooks/useStoryHistory.ts';

export const StoryHistory = () => {
  const navigate = useNavigate();
  const storyHistory = useStoryHistory();

  const handleNavigateHome = () => {
    void navigate('/');
  };
  const handleNavigateToStory = (storyId: string) => {
    void navigate(`/story/${storyId}`);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <h2 className="text-3xl text-felineGreen-dark text-center font-cursive">Archiwum</h2>

      {storyHistory.error && (
        <p className="text-red-500">
          {storyHistory.error instanceof Error ? storyHistory.error.message : 'Wystąpił błąd'}
        </p>
      )}

      {storyHistory.isPending && (
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
              onClick={() => handleNavigateToStory(story.id)}
            />
          ))}
        </div>
      )}

      {!!storyHistory.data && storyHistory.data.length === 0 && (
        <p className="text-center text-xl">Brak archwalnych opowiadań</p>
      )}

      <button
        onClick={() => handleNavigateHome()}
        className="text-felineGreen-dark hover:text-felineGreen-darker self-center"
      >
        wróć
      </button>
    </div>
  );
};
