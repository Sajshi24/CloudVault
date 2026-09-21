import { useState } from 'react';
import { Sidebar } from './SideBar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, HardDrive, FolderOpen, User, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed bottom-0 left-0 top-0 z-50 w-72 bg-white p-4 shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-lg font-bold tracking-tight text-slate-800">
                Cloud<span className="text-blue-600">Vault</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-5 space-y-1">
              {[
                { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/files', label: 'My Files', icon: HardDrive },
                { to: '/folders', label: 'Folders', icon: FolderOpen },
                { to: '/profile', label: 'Profile', icon: User },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileOpen(true)} onSearch={setSearch} />
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-0" data-search={search}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
