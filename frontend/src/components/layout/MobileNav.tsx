import { NavLink } from 'react-router-dom';
import { LayoutDashboard, HardDrive, FolderOpen, User } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/files', label: 'Files', icon: HardDrive },
  { to: '/folders', label: 'Folders', icon: FolderOpen },
  { to: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`
          }
        >
          <item.icon className="h-5 w-5" strokeWidth={1.75} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
