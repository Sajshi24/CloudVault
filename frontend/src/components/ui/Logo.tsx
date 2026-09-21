import { Cloud } from 'lucide-react';

export function Logo({
  size = 'md',
  showText = true,
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}) {
  const iconSize =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const iconInner =
    size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${iconSize} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shadow-blue-600/20`}
      >
        <Cloud className={`${iconInner} text-white`} strokeWidth={2} />
      </div>
      {showText && (
        <span className={`${textSize} font-bold tracking-tight text-slate-800`}>
          Cloud<span className="text-blue-600">Vault</span>
        </span>
      )}
    </div>
  );
}
