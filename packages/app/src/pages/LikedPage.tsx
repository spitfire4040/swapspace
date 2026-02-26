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
    <div className="max-w-4xl mx-auto px-4 py-4 md:px-6 md:py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Photos You Liked {'\u2665\uFE0F'}</h2>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{'\u{1F494}'}</div>
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
              className="aspect-square rounded-xl overflow-hidden bg-gray-200"
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
    </div>
  );
}
