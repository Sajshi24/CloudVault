import { useState, useRef, useEffect } from 'react';
import { Search, HelpCircle, LogOut, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/ui/Logo';
import { NotificationPanel } from '@/components/layout/NotificationPanel';

interface TopBarProps {
  onMenuClick: () => void;
  onSearch?: (value: string) => void;
}

export function TopBar({ onMenuClick, onSearch }: TopBarProps) {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    notify('You have been signed out', 'info');
    navigate('/login');
  };

  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="md:hidden">
        <Logo size="sm" />
      </div>
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder="Search files and folders"
          className="w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          title="Help"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 sm:flex"
        >
          <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <NotificationPanel />
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold text-white">
              {initials}
            </div>
            <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-600 lg:block">
              {user?.full_name || user?.email || 'Account'}
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl shadow-slate-900/10 animate-[menu-in_0.12s_ease-out]">
              <div className="border-b border-slate-100 px-3.5 py-3">
                <p className="truncate text-sm font-medium text-slate-700">
                  {user?.full_name || 'CloudVault user'}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/profile');
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
