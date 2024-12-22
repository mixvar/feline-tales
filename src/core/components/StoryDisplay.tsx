import { useStoryQueryById } from '../hooks/useStoryQueryById.ts';
import { StoryDisplaySkeleton } from './StoryDisplaySkeleton';

interface StoryDisplayProps {
  storyId: string;
  onReset: () => void;
}

export const StoryDisplay = ({ storyId, onReset }: StoryDisplayProps) => {
  const storyQuery = useStoryQueryById(storyId);

  if (storyQuery.isLoading) {
    return <StoryDisplaySkeleton />;
  }

  if (storyQuery.error) {
    return <div className="text-red-500 text-center">{storyQuery.error.message}</div>;
  }

  if (!storyQuery.data) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 md:flex-shrink-0 overflow-hidden">
            <img
              src={storyQuery.data.imageUrl}
              alt="Ilustracja do historii"
              className="w-full h-[300px] md:h-[500px] object-cover scale-105 transition-transform duration-500 hover:scale-100"
            />
          </div>
          <div className="p-6 md:w-1/2 md:overflow-y-auto md:max-h-[500px]">
            <h2 className="font-cursive text-xl md:text-3xl mb-4">{storyQuery.data.title}</h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{storyQuery.data.text}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="bg-felineGreen-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker self-center"
      >
        Opowiedz nową historię
      </button>
    </div>
  );
};
