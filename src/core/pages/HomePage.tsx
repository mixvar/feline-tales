import clsx from 'clsx';
import { useState, useRef } from 'react';
import felineStoriesLogo from '../../assets/feline-stories.webp';
import { StoryDisplayWrapper } from '../components/StoryDisplayWrapper.tsx';
import { StoryGenerationProgress } from '../components/StoryGenerationProgress';
import { StoryHistory } from './StoryHistory.tsx';
import { StoryInputForm } from '../components/StoryInputForm';
import { UserWidget } from '../components/UserWidget';
import { useStoryGeneration } from '../hooks/useStoryGeneration';
import { User } from '../types';

export const HomePage = ({ user }: { user: User }) => {
  const storyGen = useStoryGeneration();
  const [showHistory, setShowHistory] = useState(false);
  const showSmallLayout = !!storyGen.storyId || storyGen.isLoading || showHistory;

  const handleSubmit = (userInput: string) => {
    void storyGen.generate(userInput);
  };

  return (
    <>
      <UserWidget user={user} />
      <div className="min-h-screen max-w-7xl mx-auto p-3 md:p-8 flex flex-col items-center justify-start gap-4">
        <AppLogo
          showSmallLayout={showSmallLayout}
          onClick={() => {
            if (!storyGen.isLoading) {
              storyGen.reset();
              setShowHistory(false);
            }
          }}
        />

        {storyGen.isLoading ? (
          <StoryGenerationProgress />
        ) : storyGen.storyId ? (
          <StoryDisplayWrapper storyId={storyGen.storyId} onReset={storyGen.reset} />
        ) : showHistory ? (
          <StoryHistory onClose={() => setShowHistory(false)} />
        ) : (
          <StoryInputForm
            onSubmit={handleSubmit}
            error={storyGen.error}
            onHistoryClick={() => setShowHistory(true)}
          />
        )}
      </div>
    </>
  );
};

const AppLogo = ({
  onClick,
  showSmallLayout,
}: {
  onClick: () => void;
  showSmallLayout: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleImageClick = () => {
    if (!showSmallLayout) {
      meow();
    }

    onClick();
  };

  const meow = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      void audioRef.current.play();
    }
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 1000);
  };

  return (
    <>
      <audio ref={audioRef} src="/meow.mp3" />
      <img
        onClick={handleImageClick}
        className={clsx(
          'transition-all duration-300',
          showSmallLayout
            ? 'h-[150px] md:h-[200px] cursor-pointer hover:scale-105'
            : 'h-[300px] md:h-[400px] cursor-pointer',
          isShaking && 'animate-shake'
        )}
        src={felineStoriesLogo}
        alt="logo"
      />
      <h1
        className={clsx(
          'text-felineGreen-dark font-cursive text-gradient-animation transition-all duration-300 z-10',
          showSmallLayout ? 'text-5xl md:text-6xl' : 'text-5xl md:text-[6rem]'
        )}
      >
        Kocie Opowieści
      </h1>
    </>
  );
};
