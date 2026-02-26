import { CardStack } from '../components/CardStack';

export default function SwipePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Card stack area — fills available space */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-6">
        <div className="relative w-full max-w-sm h-full max-h-[600px]">
          <CardStack />
        </div>
      </div>

      {/* Keyboard hints (desktop only) */}
      <div className="hidden md:block shrink-0 text-center pb-4 text-xs text-gray-400">
        &larr; skip &nbsp;|&nbsp; &rarr; like
      </div>
    </div>
  );
}
