// User types

export interface IUser {
  id: string;
  tenant_id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  push_token: string | null;
  push_platform: 'ios' | 'android' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'viewer';

export interface IUserInvite {
  email: string;
  role: UserRole;
  display_name: string;
}
