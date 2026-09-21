import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  Database,
  FileText,
  FolderOpen,
  Share2,
  Upload,
  Plus,
  ArrowRight,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardData, FileItem } from '@/services/types';
import { getGreeting, formatBytes, formatDate } from '@/lib/format';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { DashboardCardSkeleton, FileRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { useToast } from '@/context/ToastContext';
import { fileService } from '@/services/fileService';
import { ShareModal } from '@/components/files/ShareModal';
import { FilePreviewModal } from '@/components/files/FilePreviewModal';

export function DashboardPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await dashboardService.getData();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const download = async (file: FileItem) => {
    try {
      const blob = await fileService.download(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notify('Could not download file', 'error');
    }
  };

  const remove = async () => {
    if (!deleteFile) return;
    setDeleting(true);
    try {
      await fileService.delete(deleteFile.id);
      setData((prev) =>
        prev
          ? { ...prev, recent_uploads: prev.recent_uploads.filter((f) => f.id !== deleteFile.id) }
          : prev
      );
      notify('File deleted', 'success');
      setDeleteFile(null);
    } catch {
      notify('Could not delete file', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const used = data?.storage_used ?? 0;
  const total = data?.storage_limit ?? 0;
  const recent = data?.recent_uploads || [];

  const metrics = loading
    ? null
    : [
        {
          label: 'Storage Used',
          value: formatBytes(used),
          sub: `of ${formatBytes(total)}`,
          icon: HardDrive,
          iconClass: 'bg-blue-50 text-blue-600',
          barPercent: total ? Math.min(100, (used / total) * 100) : 0,
          barColor: 'bg-blue-500',
        },
        {
          label: 'Available',
          value: formatBytes(Math.max(total - used, 0)),
          sub: 'remaining',
          icon: Database,
          iconClass: 'bg-emerald-50 text-emerald-600',
        },
        {
          label: 'Total Files',
          value: String(data?.total_files ?? 0),
          sub: 'uploaded',
          icon: FileText,
          iconClass: 'bg-amber-50 text-amber-600',
        },
        {
          label: 'Folders',
          value: String(data?.total_folders ?? 0),
          sub: 'created',
          icon: FolderOpen,
          iconClass: 'bg-violet-50 text-violet-600',
        },
        {
          label: 'Shared',
          value: String(data?.shared_files ?? 0),
          sub: 'public links',
          icon: Share2,
          iconClass: 'bg-rose-50 text-rose-600',
        },
      ];

  const fileMenuItems = (file: FileItem) => [
    {
      label: 'Preview',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => setPreviewFile(file),
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      onClick: () => download(file),
    },
    {
      label: 'Share',
      icon: <Share2 className="h-4 w-4" />,
      onClick: () => setShareFile(file),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setDeleteFile(file),
      danger: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-600">{getGreeting()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            {user?.full_name || 'there'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">Here's what's happening with your CloudVault.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/files?action=upload"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" /> Upload files
          </Link>
          <Link
            to="/folders?action=create"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
          >
            <Plus className="h-4 w-4" /> New folder
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white">
          <ErrorState onRetry={load} />
        </div>
      ) : (
        <>
          {/* ─── 5 compact metric cards ─── */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <DashboardCardSkeleton key={i} />)
              : metrics!.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/[0.02] transition hover:shadow-md"
                  >
                    <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${card.iconClass}`}>
                      <card.icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <p className="text-xl font-bold tracking-tight text-slate-800">{card.value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">{card.label}</p>
                    {card.sub && <p className="mt-0.5 text-[10px] text-slate-400">{card.sub}</p>}
                    {card.barPercent !== undefined && (
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${card.barColor}`}
                          style={{ width: `${card.barPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
          </div>

          {/* ─── Recent files ─── */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Recent files</p>
                <p className="mt-0.5 text-xs text-slate-400">Your latest uploads</p>
              </div>
              <Link
                to="/files"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <FileRowSkeleton key={i} />)
              ) : recent.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-9 w-9" />}
                  title="No files yet"
                  description="Upload your first file to start using CloudVault."
                  action={
                    <Link
                      to="/files?action=upload"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Upload file
                    </Link>
                  }
                />
              ) : (
                recent.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-slate-50/60"
                  >
                    <FileTypeIcon file={file} size="sm" />
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="truncate text-sm font-medium text-slate-700 hover:text-blue-600 text-left w-full"
                        title={`Preview ${file.original_name}`}
                      >
                        {file.original_name}
                      </button>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatBytes(file.size)} · {formatDate(file.created_at)}
                      </p>
                    </div>
                    <span className="hidden text-xs text-slate-400 sm:block">{file.mime_type}</span>
                    <ContextMenu items={fileMenuItems(file)} />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <FilePreviewModal
        file={previewFile}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={download}
      />
      <ShareModal file={shareFile} open={!!shareFile} onClose={() => setShareFile(null)} />
      <ConfirmDialog
        open={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete this file?"
        message="This action cannot be undone."
      />
    </div>
  );
}
