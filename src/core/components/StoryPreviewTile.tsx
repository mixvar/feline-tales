import { StoryObject } from '../utils/stories';
import { clsx } from 'clsx';

interface StoryPreviewTileProps {
  story: StoryObject;
  onClick?: () => void;
}

export const StoryPreviewTile = ({ story, onClick }: StoryPreviewTileProps) => {
  const createdAt = new Date(story.createdAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden transition-all duration-300 group',
        onClick && 'hover:bg-opacity-60 cursor-pointer'
      )}
    >
      <div className="flex">
        <div className="w-1/4 flex-shrink-0 overflow-hidden">
          <img
            src={story.imageUrl}
            alt="Ilustracja do historii"
            className="w-full h-[150px] object-cover scale-110 group-hover:scale-105 transition-transform duration-500 bg-felineBg-dark"
          />
        </div>
        <div className="p-4 w-3/4 flex flex-col gap-1">
          <h3 className="font-cursive text-2xl text-felineGreen-dark line-clamp-1">
            {story.title}
          </h3>
          <p className="text-sm text-gray-500 ">{createdAt}</p>
          <p className="text-sm line-clamp-3 text-gray-700">{story.text}</p>
        </div>
      </div>
    </div>
  );
};
