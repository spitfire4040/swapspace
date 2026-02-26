import { isNative } from './platform';

/**
 * Opens the native camera/photo picker on Capacitor.
 * Returns a File object on native, or null on web (caller falls back to HTML input).
 * Returns null on user cancellation or any error so the caller can fall back gracefully.
 */
export async function pickPhoto(): Promise<File | null> {
  if (!isNative()) return null;

  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 90,
    });

    if (!image.webPath) return null;

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    const ext = image.format || 'jpeg';
    return new File([blob], `photo.${ext}`, { type: `image/${ext}` });
  } catch {
    // User cancelled or permissions denied — fall back to HTML input
    return null;
  }
}
