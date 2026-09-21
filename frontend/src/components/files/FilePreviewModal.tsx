import { useEffect, useState } from 'react';
import { X, Download, FileText, AlertTriangle } from 'lucide-react';
import { fileService } from '@/services/fileService';
import type { FileItem } from '@/services/types';
import { formatBytes } from '@/lib/format';

interface FilePreviewModalProps {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (file: FileItem) => void;
}

function isPreviewable(mimeType: string): 'image' | 'pdf' | 'text' | 'video' | 'audio' | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return null;
}

export function FilePreviewModal({ file, open, onClose, onDownload }: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  const previewType = file ? isPreviewable(file.mime_type) : null;
  const previewUrl = file ? fileService.getPreviewUrl(file.id) : '';

  // Load text content for text files
  useEffect(() => {
    if (!open || !file || previewType !== 'text') {
      setTextContent(null);
      return;
    }
    setTextLoading(true);
    fetch(previewUrl)
      .then((r) => r.text())
      .then(setTextContent)
      .catch(() => setTextContent(null))
      .finally(() => setTextLoading(false));
  }, [open, file, previewType, previewUrl]);

  if (!open || !file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{file.original_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)} · {file.mime_type}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onDownload && (
              <button
                onClick={() => onDownload(file)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-slate-50 min-h-0">
          {previewType === 'image' && (
            <div className="flex h-full min-h-[40vh] items-center justify-center p-6">
              <img
                src={previewUrl}
                alt={file.original_name}
                className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          )}

          {previewType === 'pdf' && (
            <iframe
              src={previewUrl}
              title={file.original_name}
              className="h-full min-h-[70vh] w-full border-0"
            />
          )}

          {previewType === 'video' && (
            <div className="flex h-full min-h-[50vh] items-center justify-center p-6">
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {previewType === 'audio' && (
            <div className="flex h-full min-h-[20vh] items-center justify-center p-8">
              <audio src={previewUrl} controls className="w-full max-w-lg" />
            </div>
          )}

          {previewType === 'text' && (
            <div className="p-6">
              {textLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                </div>
              ) : textContent !== null ? (
                <pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 text-sm text-slate-100 font-mono overflow-x-auto">
                  {textContent}
                </pre>
              ) : (
                <p className="text-sm text-slate-500">Could not load file content.</p>
              )}
            </div>
          )}

          {previewType === null && (
            <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Preview not available</p>
                <p className="mt-1 text-xs text-slate-400">
                  {file.mime_type} files cannot be previewed in the browser.
                </p>
              </div>
              {onDownload && (
                <button
                  onClick={() => onDownload(file)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download to view
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
