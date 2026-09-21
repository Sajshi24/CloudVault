import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import type { StorageUsageResponse } from '@/services/types';
import { formatBytes } from '@/lib/format';
import { HardDrive } from 'lucide-react';

export function StorageWidget() {
  const [storage, setStorage] = useState<StorageUsageResponse | null>(null);

  useEffect(() => {
    let active = true;
    userService
      .getStorage()
      .then((data) => {
        if (active) setStorage(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const used = storage?.storage_used ?? 0;
  const total = storage?.storage_limit ?? 0;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-2 flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-500">Storage</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">
        {formatBytes(used)} of {formatBytes(total)} used
      </p>
    </div>
  );
}
