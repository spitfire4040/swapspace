import { useCallback } from 'react';
import { useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { recordSwipe } from '../api/swipe.api';

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const FLY_DISTANCE = 600;

interface UseCardSwipeOptions {
  photoId: string;
  onDismiss: () => void;
}

export function useCardSwipe({ photoId, onDismiss }: UseCardSwipeOptions) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const triggerLike = useCallback(async () => {
    await animate(x, FLY_DISTANCE, { duration: 0.3 });
    onDismiss();
    recordSwipe(photoId, 'like').catch(console.error);
  }, [x, photoId, onDismiss]);

  const triggerSkip = useCallback(async () => {
    await animate(x, -FLY_DISTANCE, { duration: 0.3 });
    onDismiss();
    recordSwipe(photoId, 'skip').catch(console.error);
  }, [x, photoId, onDismiss]);

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
        triggerLike();
      } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
        triggerSkip();
      } else {
        // Snap back to center
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      }
    },
    [x, triggerLike, triggerSkip]
  );

  return { x, rotate, likeOpacity, nopeOpacity, onDragEnd, triggerLike, triggerSkip };
}
