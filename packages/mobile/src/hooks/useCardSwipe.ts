import { useSharedValue, useAnimatedStyle, useDerivedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { recordSwipe } from '../api/swipe.api';

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const FLY_DISTANCE = 600;

interface UseCardSwipeOptions {
  photoId: string;
  onDismiss: () => void;
}

export function useCardSwipe({ photoId, onDismiss }: UseCardSwipeOptions) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const rotateDeg = useDerivedValue(() => `${translateX.value * 0.08}deg`);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: rotateDeg.value },
    ],
  }));

  const likeOpacity = useDerivedValue(() => {
    const x = translateX.value;
    if (x <= 50) return 0;
    return Math.min((x - 50) / 100, 1);
  });

  const nopeOpacity = useDerivedValue(() => {
    const x = translateX.value;
    if (x >= -50) return 0;
    return Math.min((-x - 50) / 100, 1);
  });

  const likeStampStyle = useAnimatedStyle(() => ({ opacity: likeOpacity.value }));
  const nopeStampStyle = useAnimatedStyle(() => ({ opacity: nopeOpacity.value }));

  function handleLike() {
    recordSwipe(photoId, 'like').catch(console.error);
    onDismiss();
  }

  function handleSkip() {
    recordSwipe(photoId, 'skip').catch(console.error);
    onDismiss();
  }

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationX > SWIPE_THRESHOLD || e.velocityX > VELOCITY_THRESHOLD) {
        translateX.value = withSpring(FLY_DISTANCE);
        runOnJS(handleLike)();
      } else if (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -VELOCITY_THRESHOLD) {
        translateX.value = withSpring(-FLY_DISTANCE);
        runOnJS(handleSkip)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  return { cardStyle, likeStampStyle, nopeStampStyle, gesture, handleLike, handleSkip };
}
