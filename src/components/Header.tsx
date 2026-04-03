import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { User } from 'lucide-react';

type HeaderProps = {
  showRefreshIndicator?: boolean;
  lastRefresh?: Date;
};

const navItems = [
  { label: 'Compare', href: '/compare', activeOn: '/compare' },
  { label: 'Vote', href: '/vote', activeOn: '/vote' },
  { label: 'Analytics', href: '/admin', activeOn: '/admin' },
];

export default function Header({ showRefreshIndicator, lastRefresh }: HeaderProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const formatRefresh = (date: Date) => {
    const mins = Math.round((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'JUST NOW';
    return `${mins}M AGO`;
  };

  return (
    <header className="h-14 border-b border-zinc-200 flex items-center justify-between px-6 lg:px-10 bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="font-display italic text-lg font-bold text-black tracking-tight shrink-0">
        Plebiscite 2026
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-7">
        {navItems.map((item) => {
          const isActive = item.activeOn && location.pathname === item.activeOn;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`font-interface text-[11px] uppercase tracking-[0.18em] pb-0.5 transition-colors ${
                isActive
                  ? 'text-black font-semibold border-b-[2px] border-black'
                  : 'text-zinc-500 hover:text-black'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3 shrink-0">
        {showRefreshIndicator && lastRefresh && (
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-interface text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              Updated {formatRefresh(lastRefresh)}
            </span>
          </div>
        )}

        {user ? (
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center hover:border-zinc-900 transition-colors"
            title="Sign out"
          >
            <User className="w-4 h-4 text-zinc-600" />
          </button>
        ) : (
          <Link
            to="/auth/login"
            className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center hover:border-zinc-900 transition-colors"
          >
            <User className="w-4 h-4 text-zinc-600" />
          </Link>
        )}
      </div>
    </header>
  );
}
