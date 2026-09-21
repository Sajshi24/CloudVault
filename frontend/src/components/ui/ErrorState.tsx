import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
        <AlertTriangle className="h-9 w-9" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-700">
        {message || 'Something went wrong'}
      </h3>
      <p className="mt-1.5 text-sm text-slate-400">
        We couldn't load this content. Please try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}
