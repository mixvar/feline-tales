import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { StoryDisplaySkeleton } from './StoryDisplaySkeleton';

const CHANGE_MESSAGE_INTERVAL = 4000;

export const StoryGenerationProgress = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const progressMessages = useProgressMessages();

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => (current < progressMessages.length - 1 ? current + 1 : current));
    }, CHANGE_MESSAGE_INTERVAL);

    return () => clearInterval(interval);
  }, [progressMessages.length]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <StoryDisplaySkeleton />
      <p className="text-lg text-felineGreen-dark font-medium text-center">
        {progressMessages[messageIndex]}
      </p>
    </div>
  );
};

const useProgressMessages = () => {
  const intl = useIntl();

  return useMemo(
    () => [
      intl.formatMessage({ id: 'progress.message.1' }),
      intl.formatMessage({ id: 'progress.message.2' }),
      intl.formatMessage({ id: 'progress.message.3' }),
      intl.formatMessage({ id: 'progress.message.4' }),
      intl.formatMessage({ id: 'progress.message.5' }),
      intl.formatMessage({ id: 'progress.message.6' }),
      intl.formatMessage({ id: 'progress.message.7' }),
      intl.formatMessage({ id: 'progress.message.8' }),
      intl.formatMessage({ id: 'progress.message.9' }),
      intl.formatMessage({ id: 'progress.message.10' }),
    ],
    [intl]
  );
};
