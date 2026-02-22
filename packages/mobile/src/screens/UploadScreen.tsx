import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../api/photo.api';

export function UploadScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [imageType, setImageType] = useState('image/jpeg');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageName(asset.fileName ?? `photo_${Date.now()}.jpg`);
      setImageType(asset.mimeType ?? 'image/jpeg');
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;
    setIsUploading(true);
    try {
      await uploadPhoto(imageUri, imageName, imageType, caption || undefined);
      Alert.alert('Success', 'Photo uploaded!');
      setImageUri(null);
      setCaption('');
    } catch (err: unknown) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Upload a Photo</Text>

        <TouchableOpacity style={styles.picker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.pickerText}>Tap to select a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption (optional)..."
          placeholderTextColor="#9ca3af"
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        <TouchableOpacity
          style={[styles.uploadBtn, (!imageUri || isUploading) && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={!imageUri || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadBtnText}>Upload Photo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, alignItems: 'center' },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  cameraIcon: { fontSize: 48 },
  pickerText: { color: '#6b7280', fontSize: 16 },
  captionInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    width: '100%',
    backgroundColor: '#FF4458',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
