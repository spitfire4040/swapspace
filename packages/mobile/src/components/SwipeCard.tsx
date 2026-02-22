import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Photo } from '../api/photo.api';
import { useCardSwipe } from '../hooks/useCardSwipe';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// The backend base URL for images
const IMG_BASE = 'http://localhost:4000';

interface SwipeCardProps {
  photo: Photo;
  onDismiss: () => void;
  isTop: boolean;
  stackIndex: number;
}

export function SwipeCard({ photo, onDismiss, isTop, stackIndex }: SwipeCardProps) {
  const { cardStyle, likeStampStyle, nopeStampStyle, gesture, handleLike, handleSkip } =
    useCardSwipe({ photoId: photo.id, onDismiss });

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 10;

  if (!isTop) {
    return (
      <View
        style={[
          styles.card,
          {
            transform: [{ scale }, { translateY: yOffset }],
            zIndex: 3 - stackIndex,
          },
        ]}
      >
        <Image
          source={{ uri: `${IMG_BASE}${photo.thumbnailUrl}` }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle, { zIndex: 10 }]}>
        <Image
          source={{ uri: `${IMG_BASE}${photo.thumbnailUrl}` }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* LIKE stamp */}
        <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        {/* NOPE stamp */}
        <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        {/* Info overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.username}>@{photo.username ?? 'user'}</Text>
          {photo.caption ? (
            <Text style={styles.caption} numberOfLines={2}>
              {photo.caption}
            </Text>
          ) : null}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSkip}>
            <Text style={styles.actionBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Text style={[styles.actionBtnText, { color: '#FF4458' }]}>♥</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stamp: {
    position: 'absolute',
    top: 32,
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  likeStamp: {
    left: 24,
    borderColor: '#22c55e',
    transform: [{ rotate: '-25deg' }],
  },
  nopeStamp: {
    right: 24,
    borderColor: '#ef4444',
    transform: [{ rotate: '25deg' }],
  },
  likeText: {
    color: '#22c55e',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 4,
  },
  nopeText: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 4,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 16,
    background: 'transparent',
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: {
    fontSize: 22,
    color: '#666',
  },
});
