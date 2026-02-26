import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadPhoto, getMyPhotos, deletePhoto, Photo } from '../api/photo.api';
import { pickPhoto } from '../lib/pickPhoto';
import { isNative } from '../lib/platform';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyPhotos = useCallback(async () => {
    try {
      const { photos } = await getMyPhotos();
      setMyPhotos(photos);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchMyPhotos();
  }, [fetchMyPhotos]);

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('Delete this photo?')) return;
    setDeletingId(photoId);
    try {
      await deletePhoto(photoId);
      setMyPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      await uploadPhoto(file, caption || undefined, setProgress);
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption('');
      if (inputRef.current) inputRef.current.value = '';
      fetchMyPhotos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 md:px-6 md:py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload a Photo</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* File picker */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-8 text-center cursor-pointer hover:border-brand-pink active:border-brand-pink transition-colors"
          onClick={() => {
            if (!isNative()) {
              inputRef.current?.click();
              return;
            }
            pickPhoto()
              .then((nativeFile) => {
                if (nativeFile) {
                  setFile(nativeFile);
                  setPreview(URL.createObjectURL(nativeFile));
                  setSuccess(false);
                  setError('');
                } else {
                  inputRef.current?.click();
                }
              })
              .catch(() => {
                inputRef.current?.click();
              });
          }}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <span className="text-5xl">{'\u{1F4F7}'}</span>
              <p className="font-medium">Tap or click to select a photo</p>
              <p className="text-xs">JPEG, PNG, WebP — max 10MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Input
          label="Caption (optional)"
          placeholder="Write something about this photo..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-pink h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
            {'\u2713'} Photo uploaded successfully!
          </p>
        )}

        <Button type="submit" isLoading={uploading} disabled={!file}>
          Upload Photo
        </Button>
      </form>

      {myPhotos.length > 0 && (
        <section className="mt-10">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Your Photos ({myPhotos.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {myPhotos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.caption ?? ''}
                  className="w-full h-full object-cover rounded-xl"
                />
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/50 px-2 py-1 rounded-b-xl truncate">
                    {photo.caption}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                  className="absolute -top-1 -right-1 w-10 h-10 bg-black/60 text-white rounded-full text-xs flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-40"
                  aria-label="Delete photo"
                >
                  {'\u2715'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
