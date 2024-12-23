import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import felineStoriesLogo from '../../assets/feline-stories.webp';

export const AppLogo = ({ showSmallLayout }: { showSmallLayout: boolean }) => {
  const navigate = useNavigate();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleImageClick = () => {
    if (!showSmallLayout) {
      meow();
    }
    void navigate('/');
  };

  const meow = () => {
    if (isShaking) return;

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
