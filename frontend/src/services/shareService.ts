import api from './api';
import type { ShareResponse } from './types';

export const shareService = {
  // Backend: POST /share/{file_id} — authenticated
  // Returns { share_url, access, created_at } — 201 for new, 200 for existing
  async createShare(fileId: string): Promise<ShareResponse> {
    const { data } = await api.post<ShareResponse>(`/share/${fileId}`);
    return data;
  },

  // Backend: PATCH /share/{file_id} — update access level
  async updateAccess(fileId: string, access: 'anyone' | 'restricted'): Promise<ShareResponse> {
    const { data } = await api.patch<ShareResponse>(`/share/${fileId}`, { access });
    return data;
  },

  // Backend: DELETE /share/{file_id} — authenticated
  async deleteShare(fileId: string): Promise<void> {
    await api.delete(`/share/${fileId}`);
  },

  // Backend: GET /share/{token}/meta — PUBLIC, returns file metadata
  async getSharedMeta(token: string): Promise<{ original_name: string; mime_type: string; size: number; created_at: string }> {
    const { data } = await api.get(`/share/${token}/meta`);
    return data;
  },

  // Backend: GET /share/{token} — PUBLIC, streams the file inline
  // Build the URL directly for use in <img>, <iframe>, etc.
  getShareStreamUrl(token: string): string {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
    return `${base}/share/${token}`;
  },

  // Download the shared file as a blob (for the explicit download button)
  async downloadSharedFile(token: string): Promise<{ blob: Blob; filename?: string }> {
    const response = await api.get(`/share/${token}`, {
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'] as string | undefined;
    let filename: string | undefined;
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match?.[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }
    return { blob: response.data as Blob, filename };
  },
};
