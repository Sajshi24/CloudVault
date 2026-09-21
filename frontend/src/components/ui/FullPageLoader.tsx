import { Cloud } from 'lucide-react';

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative">
        <Cloud className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
        <div className="absolute -bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-blue-600" />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-slate-400">Loading CloudVault…</p>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
