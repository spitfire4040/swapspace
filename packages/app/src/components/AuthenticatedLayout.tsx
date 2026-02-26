import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const tabs = [
  { to: '/swipe', label: 'Swipe', active: '\u{1F525}', inactive: '\u{1F0CF}' },
  { to: '/upload', label: 'Upload', active: '\u{1F4F8}', inactive: '\u{1F4F7}' },
  { to: '/liked', label: 'Liked', active: '\u2665\uFE0F', inactive: '\u{1F90D}' },
] as const;

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header — fixed height, safe area aware */}
      <header
        className="shrink-0 flex items-center justify-between px-4 md:px-6 pb-3 bg-white shadow-sm"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      >
        <NavLink to="/swipe" className="text-xl md:text-2xl font-black text-brand-pink">
          SwapSpace
        </NavLink>
        <nav className="flex items-center gap-3 md:gap-4" aria-label="Main navigation">
          <NavLink
            to="/swipe"
            className={({ isActive }) =>
              `hidden md:inline text-sm font-medium transition-colors ${isActive ? 'text-brand-pink' : 'text-gray-600 hover:text-brand-pink'}`
            }
          >
            Swipe
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `hidden md:inline text-sm font-medium transition-colors ${isActive ? 'text-brand-pink' : 'text-gray-600 hover:text-brand-pink'}`
            }
          >
            Upload
          </NavLink>
          <NavLink
            to="/liked"
            className={({ isActive }) =>
              `hidden md:inline text-sm font-medium transition-colors ${isActive ? 'text-brand-pink' : 'text-gray-600 hover:text-brand-pink'}`
            }
          >
            Liked
          </NavLink>
          <span className="text-sm text-gray-400">@{user?.username}</span>
          <button
            onClick={() => logout()}
            className="text-xs md:text-sm font-medium text-gray-500 hover:text-red-500 active:text-red-600 transition-colors min-h-[44px] px-3"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Page content — fills remaining height */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden shrink-0 bg-white border-t border-gray-200 h-tab-bar-total z-50" aria-label="Tab navigation">
        <div className="flex justify-around items-center h-tab-bar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center min-h-[48px] min-w-[64px] py-1"
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl leading-none" aria-hidden="true">{isActive ? tab.active : tab.inactive}</span>
                  <span
                    className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-brand-pink' : 'text-gray-500'}`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
