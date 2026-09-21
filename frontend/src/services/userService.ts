import api from './api';
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  StorageUsageResponse,
} from './types';

export const userService = {
  // Backend: GET /users/me
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
  },

  // Backend: PATCH /users/me — body: { full_name }
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>('/users/me', payload);
    return data;
  },

  // Backend: PATCH /users/me/password — body: { current_password, new_password } — 204 No Content
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch('/users/me/password', payload);
  },

  // Backend: GET /users/me/storage — returns { storage_used, storage_limit, remaining_storage, percentage_used }
  async getStorage(): Promise<StorageUsageResponse> {
    const { data } = await api.get<StorageUsageResponse>('/users/me/storage');
    return data;
  },
};
