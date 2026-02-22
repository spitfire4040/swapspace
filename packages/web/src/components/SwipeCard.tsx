import { motion, MotionValue } from 'framer-motion';
import { Photo } from '../api/photo.api';
import { useCardSwipe } from '../hooks/useCardSwipe';

interface SwipeCardProps {
  photo: Photo;
  onDismiss: () => void;
  isTop: boolean;
  stackIndex: number;
}

export function SwipeCard({ photo, onDismiss, isTop, stackIndex }: SwipeCardProps) {
  const { x, rotate, likeOpacity, nopeOpacity, onDragEnd, triggerLike, triggerSkip } =
    useCardSwipe({ photoId: photo.id, onDismiss });

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 8;

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white"
        style={{ scale, y: yOffset, zIndex: 3 - stackIndex }}
        animate={{ scale, y: yOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption ?? 'Photo'}
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-white cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      {/* Photo */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.caption ?? 'Photo'}
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* LIKE stamp */}
      <LikeStamp opacity={likeOpacity} />

      {/* NOPE stamp */}
      <NopeStamp opacity={nopeOpacity} />

      {/* Bottom overlay: info + buttons */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4">
        <p className="text-white font-semibold text-lg">@{photo.username}</p>
        {photo.caption && (
          <p className="text-white/80 text-sm mt-0.5 line-clamp-2">{photo.caption}</p>
        )}

        {/* Manual swipe buttons */}
        <div className="flex justify-center gap-6 mt-3">
          <button
            onClick={triggerSkip}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            aria-label="Skip"
          >
            ✕
          </button>
          <button
            onClick={triggerLike}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LikeStamp({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="absolute top-8 left-8 border-4 border-green-400 rounded-lg px-3 py-1 rotate-[-25deg]"
      style={{ opacity }}
    >
      <span className="text-green-400 font-black text-4xl tracking-widest">LIKE</span>
    </motion.div>
  );
}

function NopeStamp({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-3 py-1 rotate-[25deg]"
      style={{ opacity }}
    >
      <span className="text-red-500 font-black text-4xl tracking-widest">NOPE</span>
    </motion.div>
  );
}
