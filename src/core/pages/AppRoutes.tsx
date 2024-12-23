import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { AppLogo } from '../components/AppLogo.tsx';
import { StoryDisplayWrapper } from '../components/StoryDisplayWrapper.tsx';
import { StoryGenerationProgress } from '../components/StoryGenerationProgress.tsx';
import { StoryInputForm } from '../components/StoryInputForm.tsx';
import { UserWidget } from '../components/UserWidget.tsx';
import { useStoryGeneration } from '../hooks/useStoryGeneration.ts';
import { User } from '../types.ts';
import { StoryHistory } from './StoryHistory.tsx';

export const AppRoutes = ({ user }: { user: User }) => {
  const { pathname } = useLocation();

  const [isLoadingNewStory, setIsLoadingNewStory] = useState(false);
  useEffect(() => {
    setIsLoadingNewStory(false);
  }, [pathname]);

  const showSmallLayout = pathname === '/' ? isLoadingNewStory : true;

  return (
    <>
      <UserWidget user={user} />
      <AppLayout showSmallLayout={showSmallLayout}>
        <Routes>
          <Route
            path="/"
            element={
              <NewStoryRoute onLoadingStateChange={(loading) => setIsLoadingNewStory(loading)} />
            }
          />
          <Route path="/history" element={<HistoryRoute />} />
          <Route path="/story/:id" element={<StoryRoute />} />
        </Routes>
      </AppLayout>
    </>
  );
};

const AppLayout = ({
  children,
  showSmallLayout,
}: {
  children: React.ReactNode;
  showSmallLayout: boolean;
}) => {
  return (
    <>
      <div className="min-h-screen max-w-7xl mx-auto p-3 md:p-8 flex flex-col items-center justify-start gap-4">
        <AppLogo showSmallLayout={showSmallLayout} />
        {children}
      </div>
    </>
  );
};

const NewStoryRoute = ({
  onLoadingStateChange,
}: {
  onLoadingStateChange: (loading: boolean) => void;
}) => {
  const navigate = useNavigate();
  const storyGen = useStoryGeneration();

  useEffect(() => {
    onLoadingStateChange(storyGen.isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyGen.isLoading]);

  const handleHistoryClick = () => {
    void navigate('/history');
  };

  return (
    <>
      {storyGen.isLoading ? (
        <StoryGenerationProgress />
      ) : storyGen.storyId ? (
        <Navigate to={`/story/${storyGen.storyId}?new`} />
      ) : (
        <StoryInputForm
          onSubmit={(userInput) => void storyGen.generate(userInput)}
          error={storyGen.error}
          onHistoryClick={handleHistoryClick}
        />
      )}
    </>
  );
};

const HistoryRoute = () => {
  return <StoryHistory />;
};

const StoryRoute = () => {
  const { id: storyId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.has('new');

  if (!storyId) return <Navigate to="/" />;

  return <StoryDisplayWrapper storyId={storyId} isNew={isNew} />;
};
