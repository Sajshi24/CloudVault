import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, Clock, Loader2 } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import type { NotificationItem } from '@/services/types';
import { formatDate } from '@/lib/format';

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await notificationService.list();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) load();
    setOpen((v) => !v);
  };

  const markRead = async (id: string) => {
    try {
      const updated = await notificationService.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {
      // silently ignore
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        id="notification-bell"
        onClick={toggle}
        title="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/15 animate-[menu-in_0.12s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500">Could not load notifications.</p>
                <button onClick={load} className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">Retry</button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
                <p className="text-xs text-slate-400">No new notifications at this time.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 border-b border-slate-50 px-4 py-3.5 transition last:border-0 hover:bg-slate-50 ${!item.is_read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${item.is_read ? 'bg-slate-200' : 'bg-blue-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${item.is_read ? 'text-slate-600' : 'text-slate-800'}`}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.body}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-300" />
                      <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
                      {!item.is_read && (
                        <button
                          onClick={() => markRead(item.id)}
                          className="ml-auto flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Check className="h-3 w-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes menu-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
