import { CardStack } from '../components/CardStack';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function SwipePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-black text-brand-pink">SwapSpace</h1>
        <nav className="flex items-center gap-4">
          <Link to="/upload" className="text-sm font-medium text-gray-600 hover:text-brand-pink transition-colors">
            Upload
          </Link>
          <Link to="/liked" className="text-sm font-medium text-gray-600 hover:text-brand-pink transition-colors">
            Liked
          </Link>
          <span className="text-sm text-gray-400">@{user?.username}</span>
          <button
            onClick={() => logout()}
            className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Card stack area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-sm h-[520px]">
          <CardStack />
        </div>
      </main>

      {/* Keyboard hints */}
      <footer className="text-center pb-4 text-xs text-gray-400">
        ← skip &nbsp;|&nbsp; → like
      </footer>
    </div>
  );
}
