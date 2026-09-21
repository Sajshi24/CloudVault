// ===== Auth =====
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  storage_used: number;
  storage_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

// ===== User =====
export type UserProfile = AuthUser;

export interface UpdateProfilePayload {
  full_name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface StorageUsageResponse {
  storage_used: number;
  storage_limit: number;
  remaining_storage: number;
  percentage_used: number;
}

// ===== Files =====
export interface FileItem {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
  folder_id: string;
  owner_id: string;
  created_at: string;
}

// ===== Folders =====
export interface FolderItem {
  id: string;
  name: string;
  owner_id: string;
  parent_folder_id: string | null;
  created_at: string;
  updated_at: string;
}

// ===== Share =====
export interface ShareResponse {
  share_url: string;
  access: string;   // "anyone" | "restricted"
  created_at: string;
}

// ===== Dashboard =====
export interface DashboardData {
  total_files: number;
  total_folders: number;
  shared_files: number;
  storage_used: number;
  storage_limit: number;
  remaining_storage: number;
  recent_uploads: FileItem[];
}

// ===== Notifications =====
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
