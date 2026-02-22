import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { uploadPhoto } from '../api/photo.api';
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-black text-brand-pink">SwapSpace</h1>
        <Link to="/swipe" className="text-sm font-medium text-gray-600 hover:text-brand-pink">
          ← Back to Swipe
        </Link>
      </header>

      <main className="max-w-lg mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload a Photo</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* File picker */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-pink transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <span className="text-5xl">📷</span>
                <p className="font-medium">Click to select a photo</p>
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
              ✓ Photo uploaded successfully!
            </p>
          )}

          <Button type="submit" isLoading={uploading} disabled={!file}>
            Upload Photo
          </Button>
        </form>
      </main>
    </div>
  );
}
