import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { getLikedPhotos, Photo } from '../api/photo.api';

const { width } = Dimensions.get('window');
const NUM_COLS = 3;
const ITEM_SIZE = (width - 4) / NUM_COLS;

const IMG_BASE = 'http://localhost:4000';

export function LikedScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLikedPhotos()
      .then(({ photos }) => setPhotos(photos))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4458" />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyEmoji}>💔</Text>
        <Text style={styles.emptyText}>No liked photos yet.</Text>
        <Text style={styles.emptySubtext}>Start swiping to fill this up!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Liked Photos ♥</Text>
      <FlatList
        data={photos}
        numColumns={NUM_COLS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image
            source={{ uri: `${IMG_BASE}${item.thumbnailUrl}` }}
            style={styles.gridItem}
            resizeMode="cover"
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  emptySubtext: { fontSize: 14, color: '#9ca3af' },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
  },
});
