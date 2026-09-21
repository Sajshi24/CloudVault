import {
  File as FileIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileType,
} from 'lucide-react';
import { fileIconColor, getFileExtension } from '@/lib/format';

export function FileTypeIcon({
  file,
  size = 'md',
}: {
  file: { name?: string; original_name?: string; type?: string; mime_type?: string };
  size?: 'sm' | 'md' | 'lg';
}) {
  const type = (file.mime_type || file.type || '').toLowerCase();
  const filename = file.original_name ?? file.name ?? '';
  const ext = getFileExtension(filename);

  let Icon = FileIcon;
  if (type.includes('image')) Icon = FileImage;
  else if (type.includes('video')) Icon = FileVideo;
  else if (type.includes('audio')) Icon = FileAudio;
  else if (
    type.includes('pdf') ||
    type.includes('text') ||
    type.includes('document') ||
    type.includes('word')
  )
    Icon = FileText;
  else if (type.includes('zip') || type.includes('compressed') || type.includes('archive'))
    Icon = FileArchive;
  else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv'))
    Icon = FileSpreadsheet;
  else if (type.includes('code') || ['JS', 'TS', 'PY', 'JSON', 'HTML', 'CSS', 'GO', 'RS', 'JAVA'].includes(ext))
    Icon = FileCode;
  else if (type.includes('presentation') || type.includes('powerpoint'))
    Icon = FileType;

  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 rounded-lg'
      : size === 'lg'
      ? 'h-16 w-16 rounded-2xl'
      : 'h-12 w-12 rounded-xl';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <div
      className={`flex items-center justify-center ${sizeClass} ${fileIconColor(type)}`}
    >
      <Icon className={iconSize} strokeWidth={1.75} />
    </div>
  );
}
