import api, { TOKEN_STORAGE_KEY } from './api';
import type { FileItem } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const fileService = {
  // Backend: GET /files?folder_id=<uuid>
  async list(folderId: string): Promise<FileItem[]> {
    const { data } = await api.get<FileItem[]>('/files', {
      params: { folder_id: folderId },
    });
    return Array.isArray(data) ? data : [];
  },

  // Backend: GET /files/search?q=<string>
  async search(q: string): Promise<FileItem[]> {
    const { data } = await api.get<FileItem[]>('/files/search', { params: { q } });
    return Array.isArray(data) ? data : [];
  },

  // Backend: POST /files/upload — multipart: file + folder_id (form fields)
  async upload(
    file: File,
    folderId: string,
    onProgress?: (percent: number) => void
  ): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folderId);

    const { data } = await api.post<FileItem>('/files/upload', formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  // Returns a URL for inline preview (images, PDFs, text) — requires auth token in URL
  // We use the token as a query param because <img src> / <iframe src> can't set headers.
  getPreviewUrl(id: string): string {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    return `${API_BASE}/files/${id}/preview?token=${encodeURIComponent(token)}`;
  },

  // Backend: GET /files/{id}/download — streams binary with attachment header
  async download(id: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  // Backend: PATCH /files/{id} — body: { original_name }
  async rename(id: string, originalName: string): Promise<FileItem> {
    const { data } = await api.patch<FileItem>(`/files/${id}`, {
      original_name: originalName,
    });
    return data;
  },

  // Backend: DELETE /files/{id}
  async delete(id: string): Promise<void> {
    await api.delete(`/files/${id}`);
  },
};
