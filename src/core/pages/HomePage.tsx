import felineStoriesLogo from '../../assets/feline-stories.webp';
import { UserWidget } from '../components/UserWidget';
import { User } from '../types';
import { StoryDisplay } from '../components/StoryDisplay';
import { StoryInputForm } from '../components/StoryInputForm';
import { useStoryGeneration } from '../hooks/useStoryGeneration';

export const HomePage = ({ user }: { user: User }) => {
  const storyGen = useStoryGeneration();

  const handleSubmit = (userInput: string) => {
    void storyGen.generate(userInput);
  };

  return (
    <>
      <UserWidget user={user} />
      <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-start gap-4">
        <img
          className={`transition-all duration-300 ${
            storyGen.storyId ? 'h-[150px] md:h-[200px]' : 'h-[300px] md:h-[400px]'
          }`}
          src={felineStoriesLogo}
          alt="logo"
        />
        <h1
          className={`text-felineGreen-dark font-cursive text-gradient-animation transition-all duration-300 ${
            storyGen.storyId ? 'text-5xl md:text-6xl' : 'text-5xl md:text-[6rem]'
          }`}
        >
          Kocie Opowieści
        </h1>

        {!storyGen.storyId ? (
          <StoryInputForm
            onSubmit={handleSubmit}
            isLoading={storyGen.isLoading}
            error={storyGen.error}
          />
        ) : (
          <StoryDisplay storyId={storyGen.storyId} onReset={storyGen.reset} />
        )}
      </div>
    </>
  );
};
