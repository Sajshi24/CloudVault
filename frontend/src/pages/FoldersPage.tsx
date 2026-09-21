import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FolderOpen, FolderPlus, ChevronRight, Trash2, Pencil, ArrowRight } from 'lucide-react';
import { folderService } from '@/services/folderService';
import type { FolderItem } from '@/services/types';
import { formatDate } from '@/lib/format';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';

export function FoldersPage() {
  const [searchParams] = useSearchParams();
  const { notify } = useToast();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(searchParams.get('action') === 'create');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteFolder, setDeleteFolder] = useState<FolderItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renameFolder, setRenameFolder] = useState<FolderItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Pass null to get top-level folders; filter out the system ROOT folder
      const all = await folderService.list(null);
      setFolders(all.filter((f) => f.name !== 'ROOT'));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const folder = await folderService.create(name.trim());
      setFolders((current) => [folder, ...current]);
      setName('');
      setCreateOpen(false);
      notify('Folder created', 'success');
    } catch {
      notify('Could not create folder', 'error');
    } finally { setCreating(false); }
  };

  const remove = async () => {
    if (!deleteFolder) return;
    setDeleting(true);
    try {
      await folderService.delete(deleteFolder.id);
      setFolders((current) => current.filter((folder) => folder.id !== deleteFolder.id));
      setDeleteFolder(null);
      notify('Folder deleted', 'success');
    } catch { notify('Could not delete folder', 'error'); }
    finally { setDeleting(false); }
  };

  const rename = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!renameFolder || !renameValue.trim()) return;
    setRenaming(true);
    try {
      const updated = await folderService.rename(renameFolder.id, renameValue.trim());
      setFolders((current) => current.map((folder) => folder.id === updated.id ? updated : folder));
      setRenameFolder(null);
      notify('Folder renamed', 'success');
    } catch { notify('Could not rename folder', 'error'); }
    finally { setRenaming(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Folders</h1>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Link to="/dashboard" className="hover:text-blue-600">Home</Link><ChevronRight className="h-3.5 w-3.5" /><span className="text-slate-600">Folders</span></div>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"><FolderPlus className="h-4 w-4" /> New folder</button>
      </div>

      {error ? <div className="mt-8 rounded-2xl border border-slate-100 bg-white"><ErrorState onRetry={load} /></div> : loading ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="mt-5 h-4 w-2/3" /><Skeleton className="mt-2 h-3 w-1/2" /></div>)}</div> : folders.length === 0 ? <div className="mt-8 rounded-2xl border border-slate-100 bg-white"><EmptyState icon={<FolderOpen className="h-9 w-9" />} title="No folders yet" description="Create your first folder to keep your files organized." action={<button onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Create folder</button>} /></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{folders.map((folder) => <div key={folder.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><FolderOpen className="h-6 w-6" strokeWidth={1.75} /></div><ContextMenu items={[{ label: 'Rename', icon: <Pencil className="h-4 w-4" />, onClick: () => { setRenameFolder(folder); setRenameValue(folder.name); } }, { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteFolder(folder), danger: true }]} /></div><p className="mt-5 truncate text-sm font-semibold text-slate-700">{folder.name}</p><div className="mt-1.5 flex items-center justify-between text-xs text-slate-400"><span>Folder</span><span>{formatDate(folder.updated_at || folder.created_at)}</span></div><Link to={`/files?folder_id=${folder.id}`} className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">Open folder <ArrowRight className="h-3 w-3" /></Link></div>)}</div>}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create new folder" description="Give your new folder a name."><form onSubmit={create}><label className="mb-1.5 block text-sm font-medium text-slate-700">Folder name</label><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Work projects" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button><button disabled={creating || !name.trim()} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{creating ? 'Creating…' : 'Create folder'}</button></div></form></Modal>
      <Modal open={!!renameFolder} onClose={() => setRenameFolder(null)} title="Rename folder"><form onSubmit={rename}><input autoFocus value={renameValue} onChange={(event) => setRenameValue(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRenameFolder(null)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button><button disabled={renaming || !renameValue.trim()} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{renaming ? 'Saving…' : 'Save changes'}</button></div></form></Modal>
      <ConfirmDialog open={!!deleteFolder} onClose={() => setDeleteFolder(null)} onConfirm={remove} loading={deleting} title="Delete this folder?" message="This action cannot be undone." />
    </div>
  );
}
