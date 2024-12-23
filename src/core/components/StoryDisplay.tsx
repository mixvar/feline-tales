import { StoryObject } from '../utils/stories.ts';

interface StoryDisplayProps {
  story: StoryObject;
  renderButton?: () => React.ReactNode;
}

export const StoryDisplay = ({ story, renderButton }: StoryDisplayProps) => (
  <div className="w-full max-w-6xl flex flex-col gap-6">
    <div className="bg-white bg-opacity-50 rounded-xl shadow-lg overflow-hidden group">
      <div className="md:flex">
        <div className="md:w-1/2 md:flex-shrink-0 overflow-hidden relative">
          <img
            src={story.imageUrl}
            alt="Ilustracja do historii"
            className="w-full h-[300px] md:h-[500px] object-cover scale-110 group-hover:scale-105 transition-transform duration-500"
          />
          {story.narrationAudioUrl && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-80 md:opacity-0 md:group-hover:opacity-80 transition-opacity duration-300">
              <audio controls className="w-full" autoPlay>
                <source src={story.narrationAudioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </div>
        <div className="p-6 md:w-1/2 md:overflow-y-auto md:max-h-[500px]">
          <h2 className="font-cursive text-2xl md:text-4xl mb-4">{story.title}</h2>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{story.text}</p>
        </div>
      </div>
    </div>
    {renderButton?.()}
  </div>
);
