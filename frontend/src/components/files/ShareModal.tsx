import { useEffect, useState } from 'react';
import {
  Copy,
  Check,
  Link as LinkIcon,
  Trash2,
  Globe,
  Lock,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { shareService } from '@/services/shareService';
import type { FileItem } from '@/services/types';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';

interface ShareModalProps {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
}

const WHATSAPP_GREEN = '#25D366';

export function ShareModal({ file, open, onClose }: ShareModalProps) {
  const { notify } = useToast();
  const [url, setUrl] = useState('');
  const [access, setAccess] = useState<'anyone' | 'restricted'>('anyone');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  // Reset state when a new file is opened
  useEffect(() => {
    if (!open || !file) {
      setUrl('');
      setAccess('anyone');
      return;
    }
  }, [open, file]);

  const createShare = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await shareService.createShare(file.id);
      setUrl(result.share_url);
      setAccess(result.access as 'anyone' | 'restricted');
      notify('Share link created', 'success');
    } catch {
      notify('Could not create share link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!url) return;
    // Build the frontend share URL (the SPA route, not the direct API URL)
    const sharePageUrl = buildSharePageUrl(url);
    await navigator.clipboard.writeText(sharePageUrl);
    setCopied(true);
    notify('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const buildSharePageUrl = (apiUrl: string): string => {
    // Extract the token from the API URL and build the frontend /share/<token> path
    const token = apiUrl.split('/share/').pop() || '';
    return `${window.location.origin}/share/${token}`;
  };

  const changeAccess = async (newAccess: 'anyone' | 'restricted') => {
    if (!file || !url) return;
    setAccessLoading(true);
    setAccessOpen(false);
    try {
      const result = await shareService.updateAccess(file.id, newAccess);
      setAccess(result.access as 'anyone' | 'restricted');
      if (newAccess === 'restricted') {
        notify('Link access restricted — only you can access this file', 'info');
      } else {
        notify('Anyone with the link can now view this file', 'success');
      }
    } catch {
      notify('Could not update access', 'error');
    } finally {
      setAccessLoading(false);
    }
  };

  const removeShare = async () => {
    if (!file) return;
    setRemoving(true);
    try {
      await shareService.deleteShare(file.id);
      setUrl('');
      setAccess('anyone');
      notify('Sharing link removed', 'success');
    } catch {
      notify('Could not remove sharing link', 'error');
    } finally {
      setRemoving(false);
    }
  };

  const sharePageUrl = url ? buildSharePageUrl(url) : '';

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Check out this file on CloudVault: ${sharePageUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener');
  };

  const shareGmail = () => {
    const subject = encodeURIComponent(`Shared file: ${file?.original_name ?? ''}`);
    const body = encodeURIComponent(`I've shared a file with you via CloudVault.\n\nOpen it here: ${sharePageUrl}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share file"
      description="Manage access and sharing options for this file."
    >
      {file && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <FileTypeIcon file={file} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {file.original_name}
            </p>
          </div>

          {url ? (
            <>
              {/* Access selector */}
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">General access</p>
                <div className="relative">
                  <button
                    onClick={() => setAccessOpen((v) => !v)}
                    disabled={accessLoading}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${access === 'anyone' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {access === 'anyone' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-medium">{access === 'anyone' ? 'Anyone with the link' : 'Restricted'}</p>
                      <p className="text-xs text-slate-400">{access === 'anyone' ? 'Anyone on the internet can view' : 'Only you can access this file'}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${accessOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {accessOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-900/10">
                      {(['anyone', 'restricted'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => changeAccess(opt)}
                          className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-sm transition hover:bg-slate-50 ${access === opt ? 'bg-blue-50' : ''}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${opt === 'anyone' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {opt === 'anyone' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-700">{opt === 'anyone' ? 'Anyone with the link' : 'Restricted'}</p>
                            <p className="text-xs text-slate-400">{opt === 'anyone' ? 'Anyone on the internet can view' : 'Only you can access'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Link row */}
              {access === 'anyone' && (
                <>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Share link</p>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <LinkIcon className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        readOnly
                        value={sharePageUrl}
                        className="min-w-0 flex-1 bg-transparent px-1 text-xs text-slate-500 outline-none"
                      />
                      <button
                        onClick={copyLink}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* External share buttons */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Share via</p>
                    <div className="flex gap-2">
                      <button
                        onClick={shareWhatsApp}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {/* WhatsApp SVG icon */}
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill={WHATSAPP_GREEN}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={shareGmail}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-rose-500" />
                        Gmail
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Remove share */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={removeShare}
                  disabled={removing}
                  className="inline-flex items-center gap-2 text-xs font-medium text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {removing ? 'Removing…' : 'Remove share link'}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={createShare}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <LinkIcon className="h-4 w-4" />
              {loading ? 'Creating link…' : 'Create share link'}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
