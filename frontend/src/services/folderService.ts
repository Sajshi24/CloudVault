import api from './api';
import type { FolderItem } from './types';

export const folderService = {
  // Backend: GET /folders?parent_folder_id=<uuid>
  // Returns array of FolderItem directly (not wrapped in { items })
  async list(parentFolderId?: string | null): Promise<FolderItem[]> {
    const params: Record<string, string> = {};
    if (parentFolderId) params.parent_folder_id = parentFolderId;
    const { data } = await api.get<FolderItem[]>('/folders', { params });
    return Array.isArray(data) ? data : [];
  },

  // Backend: POST /folders — body: { name, parent_folder_id }
  async create(name: string, parentFolderId?: string | null): Promise<FolderItem> {
    const { data } = await api.post<FolderItem>('/folders', {
      name,
      parent_folder_id: parentFolderId ?? null,
    });
    return data;
  },

  // Backend: PATCH /folders/{id} — body: { name }
  async rename(id: string, name: string): Promise<FolderItem> {
    const { data } = await api.patch<FolderItem>(`/folders/${id}`, { name });
    return data;
  },

  // Backend: DELETE /folders/{id}
  async delete(id: string): Promise<void> {
    await api.delete(`/folders/${id}`);
  },
};
