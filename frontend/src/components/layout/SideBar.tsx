import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HardDrive,
  FolderOpen,
  User,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { StorageWidget } from './StorageWidget';
import { authService } from '@/services/authService';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/files', label: 'My Files', icon: HardDrive },
  { to: '/folders', label: 'Folders', icon: FolderOpen },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <Logo size="sm" />
        </div>
        <div className={`${collapsed ? 'block' : 'hidden'}`}>
          <Logo size="sm" showText={false} />
        </div>
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        {!collapsed ? (
          <StorageWidget />
        ) : (
          <div className="flex justify-center py-2">
            <HardDrive className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <button
          onClick={() => {
            authService.clearToken();
            window.location.href = '/login';
          }}
          className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
