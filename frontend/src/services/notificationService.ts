import api from './api';
import type { NotificationItem } from './types';

export const notificationService = {
  async list(): Promise<NotificationItem[]> {
    const { data } = await api.get<NotificationItem[]>('/notifications');
    return Array.isArray(data) ? data : [];
  },

  async markRead(id: string): Promise<NotificationItem> {
    const { data } = await api.patch<NotificationItem>(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};
