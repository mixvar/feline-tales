import { FormattedMessage, useIntl } from 'react-intl';
import { PrimaryButton } from './base/PrimaryButton';
import { SecondaryButton } from './base/SecondaryButton';

interface StoryInputFormProps {
  onSubmit: (input: string) => void;
  onHistoryClick: () => void;
  error: string | null;
  userInput: string;
  onUserInputChange: (value: string) => void;
}

export const StoryInputForm = ({
  onSubmit,
  onHistoryClick,
  error,
  userInput,
  onUserInputChange,
}: StoryInputFormProps) => {
  const intl = useIntl();
  const storyInputPrefix = intl.formatMessage({ id: 'storyInput.prefix' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    onSubmit(`${storyInputPrefix} ${userInput}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-4">
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 text-center text-felineGreen-dark pointer-events-none opacity-80">
          {storyInputPrefix}...
        </div>
        <textarea
          value={userInput}
          onChange={(e) => onUserInputChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
          className="w-full pt-12 px-4 pb-4 rounded-lg border border-felineGreen-dark min-h-[100px] resize-none bg-white bg-opacity-50 focus:outline-felineGreen-dark text-left text-lg"
        />
      </div>
      <div className="flex flex-col gap-2">
        <PrimaryButton disabled={!userInput.trim()} buttonProps={{ type: 'submit' }}>
          <FormattedMessage id="storyInput.submit" />
        </PrimaryButton>
        <SecondaryButton onClick={onHistoryClick} buttonProps={{ type: 'button' }}>
          <FormattedMessage id="storyInput.archive" />
        </SecondaryButton>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
};
