import { useState, useMemo } from 'react';
import { useStoryRatingMutation } from '../hooks/useStoryRatingMutation.ts';
import { StoryObject } from '../utils/stories.ts';

interface StoryRatingProps {
  story: StoryObject;
}

export const StoryRatingForm = ({ story }: StoryRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { mutate: rateStory } = useStoryRatingMutation();

  const storyRating = story.rating ?? 0;

  const starAudio = useMemo(() => new Audio('/star-click.mp3'), []);

  const handleStarClick = (rating: number) => {
    if (storyRating === rating) {
      return;
    }

    starAudio.volume = 0.5 + rating * 0.1;
    starAudio.currentTime = 0;
    void starAudio.play();

    rateStory({ storyId: story.id, rating });
  };

  const resolveOpacity = (position: number) => {
    const referenceRating = hoveredRating ?? storyRating;
    return position <= referenceRating ? 1 : 0.25;
  };

  return (
    <section className="mt-5 pt-5 flex flex-col gap-1 border-t border-felineOrange-dark border-opacity-30">
      <span className="text-sm">Jak oceniasz tą historię?</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((position) => {
          return (
            <span
              key={position}
              className="cursor-pointer text-2xl transition-opacity"
              style={{ opacity: resolveOpacity(position) }}
              onMouseEnter={() => setHoveredRating(position)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => handleStarClick(position)}
            >
              ⭐
            </span>
          );
        })}
      </div>
    </section>
  );
};
