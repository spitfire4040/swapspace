import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { usePhotoStack } from '../hooks/usePhotoStack';
import { SwipeCard } from './SwipeCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export function CardStack() {
  const { cards, isLoading, isEmpty, removeTop } = usePhotoStack();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4458" />
      </View>
    );
  }

  if (isEmpty || cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>✨</Text>
        <Text style={styles.emptyTitle}>You're all caught up!</Text>
        <Text style={styles.emptySubtitle}>No more photos to swipe. Check back later.</Text>
      </View>
    );
  }

  const visible = cards.slice(0, 3);

  return (
    <View style={styles.stack}>
      {visible
        .slice()
        .reverse()
        .map((photo, reversedIndex) => {
          const stackIndex = visible.length - 1 - reversedIndex;
          const isTop = stackIndex === 0;
          return (
            <SwipeCard
              key={photo.id}
              photo={photo}
              onDismiss={removeTop}
              isTop={isTop}
              stackIndex={stackIndex}
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
