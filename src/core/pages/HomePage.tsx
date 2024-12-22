import clsx from 'clsx';
import felineStoriesLogo from '../../assets/feline-stories.webp';
import { StoryDisplay } from '../components/StoryDisplay';
import { StoryGenerationProgress } from '../components/StoryGenerationProgress';
import { StoryInputForm } from '../components/StoryInputForm';
import { UserWidget } from '../components/UserWidget';
import { useStoryGeneration } from '../hooks/useStoryGeneration';
import { User } from '../types';

export const HomePage = ({ user }: { user: User }) => {
  const storyGen = useStoryGeneration();
  const showSmallLayout = !!storyGen.storyId || storyGen.isLoading;

  const handleSubmit = (userInput: string) => {
    void storyGen.generate(userInput);
  };

  return (
    <>
      <UserWidget user={user} />
      <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-start gap-4">
        <img
          onClick={() => {
            if (!storyGen.isLoading) {
              storyGen.reset();
            }
          }}
          className={clsx(
            'transition-all duration-300 cursor-pointer',
            showSmallLayout ? 'h-[150px] md:h-[200px]' : 'h-[300px] md:h-[400px]'
          )}
          src={felineStoriesLogo}
          alt="logo"
        />
        <h1
          className={`text-felineGreen-dark font-cursive text-gradient-animation transition-all duration-300 ${
            showSmallLayout ? 'text-5xl md:text-6xl' : 'text-5xl md:text-[6rem]'
          }`}
        >
          Kocie Opowieści
        </h1>

        {storyGen.isLoading ? (
          <StoryGenerationProgress />
        ) : storyGen.storyId ? (
          <StoryDisplay storyId={storyGen.storyId} onReset={storyGen.reset} />
        ) : (
          <StoryInputForm onSubmit={handleSubmit} error={storyGen.error} />
        )}
      </div>
    </>
  );
};
