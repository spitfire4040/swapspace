import { useEffect, useRef } from 'react';
import { usePhotoStack } from '../hooks/usePhotoStack';
import { SwipeCard, SwipeCardHandle } from './SwipeCard';
import { Spinner } from './ui/Spinner';

export function CardStack() {
  const { cards, isLoading, isEmpty, removeTop } = usePhotoStack();
  const topCardRef = useRef<SwipeCardHandle>(null);

  // Keyboard shortcuts: → like, ← skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (cards.length === 0) return;
      if (e.key === 'ArrowRight') {
        topCardRef.current?.like();
      } else if (e.key === 'ArrowLeft') {
        topCardRef.current?.skip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cards.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEmpty || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="text-6xl">✨</div>
        <h2 className="text-2xl font-bold text-gray-700">You're all caught up!</h2>
        <p className="text-gray-500">No more photos to swipe. Check back later.</p>
      </div>
    );
  }

  // Render top 3 cards
  const visible = cards.slice(0, 3);

  return (
    <div className="relative w-full h-full">
      {visible
        .slice()
        .reverse()
        .map((photo, reversedIndex) => {
          const stackIndex = visible.length - 1 - reversedIndex;
          const isTop = stackIndex === 0;
          return (
            <SwipeCard
              key={photo.id}
              ref={isTop ? topCardRef : undefined}
              photo={photo}
              onDismiss={removeTop}
              isTop={isTop}
              stackIndex={stackIndex}
            />
          );
        })}
    </div>
  );
}
