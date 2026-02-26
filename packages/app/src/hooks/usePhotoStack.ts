import { useState, useEffect, useCallback, useRef } from 'react';
import { getUnseenPhotos, Photo } from '../api/photo.api';

const PAGE_SIZE = 10;
const REFETCH_THRESHOLD = 2;

export function usePhotoStack() {
  const [cards, setCards] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchMore = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { photos, nextCursor } = await getUnseenPhotos(PAGE_SIZE, cursorRef.current ?? undefined);
      cursorRef.current = nextCursor;

      if (photos.length === 0 && cards.length === 0) {
        setIsEmpty(true);
      } else {
        setCards((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...photos.filter((p) => !existingIds.has(p.id))];
        });
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [cards.length]);

  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeTop = useCallback(() => {
    setCards((prev) => {
      const next = prev.slice(1);
      if (next.length <= REFETCH_THRESHOLD && cursorRef.current !== null) {
        fetchMore();
      }
      if (next.length === 0 && cursorRef.current === null) {
        setIsEmpty(true);
      }
      return next;
    });
  }, [fetchMore]);

  return { cards, isLoading, isEmpty, removeTop };
}
