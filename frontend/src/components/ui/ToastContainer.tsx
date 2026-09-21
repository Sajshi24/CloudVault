import { useToast } from '@/context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastVariant } from '@/context/ToastContext';

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; classes: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-200 bg-white text-emerald-700',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-rose-200 bg-white text-rose-700',
  },
  info: {
    icon: Info,
    classes: 'border-blue-200 bg-white text-blue-700',
  },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => {
        const cfg = variantConfig[t.variant];
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-slate-900/5 animate-[toast-in_0.2s_ease-out] ${cfg.classes}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium text-slate-700">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 text-slate-400 transition hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
