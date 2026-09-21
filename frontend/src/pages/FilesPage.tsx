import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Upload,
  FolderPlus,
  Grid2X2,
  List,
  Search,
  FileText,
  Download,
  Share2,
  Trash2,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { fileService } from '@/services/fileService';
import { folderService } from '@/services/folderService';
import type { FileItem, FolderItem } from '@/services/types';
import { formatBytes, formatDate } from '@/lib/format';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FileCardSkeleton, FileRowSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ShareModal } from '@/components/files/ShareModal';
import { FilePreviewModal } from '@/components/files/FilePreviewModal';
import { useToast } from '@/context/ToastContext';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export function FilesPage() {
  const [searchParams] = useSearchParams();
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const folderIdParam = searchParams.get('folder_id');

  const [rootFolder, setRootFolder] = useState<FolderItem | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(folderIdParam);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ref that always holds the current resolved folder ID.
  // React state updates are batched and async — upload handlers read this ref
  // directly so they never see a stale null when called before state settles.
  const resolvedFolderIdRef = useRef<string | null>(folderIdParam);

  const resolveFolder = useCallback(async () => {
    if (folderIdParam) {
      resolvedFolderIdRef.current = folderIdParam;
      setActiveFolderId(folderIdParam);
      return folderIdParam;
    }
    const folders = await folderService.list(null);
    const root = folders.find((f) => f.name === 'ROOT') ?? folders[0] ?? null;
    setRootFolder(root);
    const id = root?.id ?? null;
    resolvedFolderIdRef.current = id;
    setActiveFolderId(id);
    return id;
  }, [folderIdParam]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const folderId = await resolveFolder();
      if (!folderId) {
        setFiles([]);
        return;
      }
      setFiles(await fileService.list(folderId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [resolveFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Debounced live search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const id = resolvedFolderIdRef.current;
      if (id) fileService.list(id).then(setFiles).catch(() => {});
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setFiles(await fileService.search(trimmed));
      } catch {
        notify('Search failed', 'error');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, notify]);

  const displayFiles = useMemo(() => files, [files]);

  const download = async (file: FileItem) => {
    try {
      const blob = await fileService.download(file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.original_name;
      anchor.click();
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
      setFiles((current) => current.filter((f) => f.id !== deleteFile.id));
      notify('File deleted', 'success');
      setDeleteFile(null);
    } catch {
      notify('Could not delete file', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const uploadFiles = async (selectedFiles: FileList | File[]) => {
    // Read from ref — always current, never stale regardless of React batch timing
    const folderId = resolvedFolderIdRef.current;
    if (!folderId) {
      notify('No folder available for upload. Please wait for the page to load.', 'error');
      return;
    }
    const incoming = Array.from(selectedFiles);
    for (const file of incoming) {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploads((current) => [...current, { id, name: file.name, progress: 0, status: 'uploading' }]);
      try {
        const uploaded = await fileService.upload(file, folderId, (progress) => {
          setUploads((current) => current.map((item) => item.id === id ? { ...item, progress } : item));
        });
        setFiles((current) => [uploaded, ...current]);
        setUploads((current) => current.map((item) => item.id === id ? { ...item, progress: 100, status: 'complete' } : item));
      } catch {
        setUploads((current) => current.map((item) => item.id === id ? { ...item, status: 'error' } : item));
        notify(`Could not upload ${file.name}`, 'error');
      }
    }
    setTimeout(() => setUploads((current) => current.filter((item) => item.status === 'uploading')), 3000);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files);
  };

  const menuItems = (file: FileItem) => [
    { label: 'Preview', icon: <Eye className="h-4 w-4" />, onClick: () => setPreviewFile(file) },
    { label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => download(file) },
    { label: 'Share', icon: <Share2 className="h-4 w-4" />, onClick: () => setShareFile(file) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteFile(file), danger: true },
  ];

  const isLoading = loading || searching;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">My Files</h1>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Link to="/dashboard" className="transition hover:text-blue-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {rootFolder === null && folderIdParam ? (
              <>
                <Link to="/folders" className="transition hover:text-blue-600">Folders</Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            ) : null}
            <span className="text-slate-600">My Files</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/folders" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:inline-flex">
            <FolderPlus className="h-4 w-4" /> Folders
          </Link>
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700">
            <Upload className="h-4 w-4" /> Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) uploadFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative mt-7 rounded-2xl border-2 border-dashed px-6 py-7 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
      >
        <Upload className={`mx-auto h-7 w-7 ${dragging ? 'text-blue-600' : 'text-slate-300'}`} />
        <p className="mt-2 text-sm font-medium text-slate-600">Drop files here to upload</p>
        <p className="mt-1 text-xs text-slate-400">or <button onClick={() => inputRef.current?.click()} className="font-medium text-blue-600 hover:text-blue-700">browse from your device</button></p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your files" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{displayFiles.length} {displayFiles.length === 1 ? 'file' : 'files'}</span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button onClick={() => setView('grid')} className={`rounded-md p-1.5 transition ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Grid view"><Grid2X2 className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`rounded-md p-1.5 transition ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="List view"><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 w-[calc(100%-3rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Uploads</p>
            <button onClick={() => setUploads([])} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            {uploads.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-2 text-xs">
                  {item.status === 'complete' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : item.status === 'error' ? <AlertCircle className="h-4 w-4 text-rose-500" /> : <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />}
                  <span className="min-w-0 flex-1 truncate text-slate-600">{item.name}</span>
                  <span className="text-slate-400">{item.status === 'error' ? 'Failed' : `${item.progress}%`}</span>
                </div>
                {item.status === 'uploading' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${item.progress}%` }} /></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        {error ? (
          <div className="rounded-2xl border border-slate-100 bg-white"><ErrorState onRetry={loadFiles} /></div>
        ) : isLoading ? (
          view === 'grid'
            ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <FileCardSkeleton key={i} />)}</div>
            : <div className="rounded-2xl border border-slate-100 bg-white">{Array.from({ length: 6 }).map((_, i) => <FileRowSkeleton key={i} />)}</div>
        ) : displayFiles.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white">
            <EmptyState
              icon={<FileText className="h-9 w-9" />}
              title={query ? 'No matching files' : 'No files yet'}
              description={query ? 'Try a different search term.' : 'Upload your first file to start using CloudVault.'}
              action={!query ? <button onClick={() => inputRef.current?.click()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Upload file</button> : undefined}
            />
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayFiles.map((file) => (
              <div key={file.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <FileTypeIcon file={file} size="lg" />
                  <ContextMenu items={menuItems(file)} />
                </div>
                <button
                  onClick={() => setPreviewFile(file)}
                  className="mt-5 w-full truncate text-left text-sm font-semibold text-slate-700 hover:text-blue-600"
                  title={`Preview ${file.original_name}`}
                >
                  {file.original_name}
                </button>
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatBytes(file.size)}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
                <div className="mt-4 h-1 w-0 rounded-full bg-blue-500 transition-all group-hover:w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="hidden items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:flex">
              <span className="flex-1">Name</span>
              <span className="w-20">Type</span>
              <span className="w-20">Size</span>
              <span className="w-24">Modified</span>
              <span className="w-8" />
            </div>
            {displayFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50/70 sm:gap-4">
                <FileTypeIcon file={file} size="sm" />
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="w-full truncate text-left text-sm font-medium text-slate-700 hover:text-blue-600"
                    title={`Preview ${file.original_name}`}
                  >
                    {file.original_name}
                  </button>
                  <p className="mt-0.5 text-xs text-slate-400 sm:hidden">{formatBytes(file.size)} · {formatDate(file.created_at)}</p>
                </div>
                <span className="hidden w-20 truncate text-xs text-slate-400 sm:block">{file.mime_type || 'File'}</span>
                <span className="hidden w-20 text-xs text-slate-400 sm:block">{formatBytes(file.size)}</span>
                <span className="hidden w-24 text-xs text-slate-400 md:block">{formatDate(file.created_at)}</span>
                <ContextMenu items={menuItems(file)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <FilePreviewModal
        file={previewFile}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={download}
      />
      <ShareModal file={shareFile} open={!!shareFile} onClose={() => setShareFile(null)} />
      <ConfirmDialog open={!!deleteFile} onClose={() => setDeleteFile(null)} onConfirm={remove} loading={deleting} title="Delete this file?" message="This action cannot be undone." />
    </div>
  );
}
