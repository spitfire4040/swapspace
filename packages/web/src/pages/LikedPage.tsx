import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLikedPhotos, Photo } from '../api/photo.api';
import { Spinner } from '../components/ui/Spinner';

export default function LikedPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLikedPhotos()
      .then(({ photos }) => setPhotos(photos))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-black text-brand-pink">SwapSpace</h1>
        <Link to="/swipe" className="text-sm font-medium text-gray-600 hover:text-brand-pink">
          ← Back to Swipe
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Photos You Liked ♥</h2>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💔</div>
            <p className="text-gray-500">No liked photos yet. Start swiping!</p>
            <Link
              to="/swipe"
              className="mt-4 inline-block text-brand-pink font-semibold hover:underline"
            >
              Go to Swipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden bg-gray-200 hover:opacity-90 transition-opacity"
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.caption ?? 'Liked photo'}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
