export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fileIconColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('image')) return 'text-emerald-600 bg-emerald-50';
  if (t.includes('video')) return 'text-rose-600 bg-rose-50';
  if (t.includes('audio')) return 'text-amber-600 bg-amber-50';
  if (t.includes('pdf')) return 'text-red-600 bg-red-50';
  if (t.includes('zip') || t.includes('archive') || t.includes('compressed'))
    return 'text-orange-600 bg-orange-50';
  if (t.includes('text') || t.includes('document') || t.includes('word'))
    return 'text-blue-600 bg-blue-50';
  if (t.includes('spreadsheet') || t.includes('excel') || t.includes('csv'))
    return 'text-green-600 bg-green-50';
  if (t.includes('presentation') || t.includes('powerpoint'))
    return 'text-purple-600 bg-purple-50';
  return 'text-slate-600 bg-slate-100';
}

export function getFileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
