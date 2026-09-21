import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { shareService } from '@/services/shareService';
import { formatBytes } from '@/lib/format';

interface FileMeta {
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

function isInlineable(mimeType: string): 'image' | 'pdf' | 'video' | 'audio' | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return null;
}

export function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    setMetaLoading(true);
    shareService
      .getSharedMeta(token)
      .then(setMeta)
      .catch((err: { response?: { status?: number } }) => {
        if (err?.response?.status === 403) {
          setRestricted(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setMetaLoading(false));
  }, [token]);

  const download = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const { blob, filename } = await shareService.downloadSharedFile(token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename ?? meta?.original_name ?? 'download';
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadDone(true);
    } catch {
      setNotFound(true);
    } finally {
      setDownloading(false);
    }
  };

  const streamUrl = token ? shareService.getShareStreamUrl(token) : '';
  const previewType = meta ? isInlineable(meta.mime_type) : null;

  if (metaLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4"><Logo /></div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {restricted ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-800">Access restricted</h1>
            <p className="mt-2 text-sm text-slate-500">
              This file is not shared publicly. Only the owner can access it.
            </p>
          </div>
        ) : notFound ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-800">File not available</h1>
            <p className="mt-2 text-sm text-slate-500">
              This link may have expired or the file was removed.
            </p>
          </div>
        ) : meta ? (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* File header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{meta.original_name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(meta.size)} · {meta.mime_type}</p>
                </div>
              </div>
              <button
                onClick={download}
                disabled={downloading || downloadDone}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {downloading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Download className="h-4 w-4" />}
                {downloading ? 'Preparing…' : downloadDone ? 'Downloaded' : 'Download'}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-slate-50 p-4">
              {previewType === 'image' && (
                <div className="flex min-h-[50vh] items-center justify-center p-4">
                  <img
                    src={streamUrl}
                    alt={meta.original_name}
                    className="max-h-[70vh] max-w-full rounded-xl object-contain shadow"
                  />
                </div>
              )}
              {previewType === 'pdf' && (
                <iframe
                  src={streamUrl}
                  title={meta.original_name}
                  className="min-h-[75vh] w-full rounded-xl border-0"
                />
              )}
              {previewType === 'video' && (
                <div className="flex min-h-[50vh] items-center justify-center p-4">
                  <video src={streamUrl} controls className="max-h-[70vh] max-w-full rounded-xl">
                    Your browser does not support video playback.
                  </video>
                </div>
              )}
              {previewType === 'audio' && (
                <div className="flex items-center justify-center p-8">
                  <audio src={streamUrl} controls className="w-full max-w-lg" />
                </div>
              )}
              {previewType === null && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                    <FileText className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Preview not available</p>
                  <p className="text-xs text-slate-400">
                    {meta.mime_type} files cannot be previewed in the browser.
                  </p>
                  <button
                    onClick={download}
                    disabled={downloading || downloadDone}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {downloadDone ? 'Downloaded' : 'Download to view'}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-3 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Shared securely with CloudVault
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
