// Contact types

export interface IContact {
  id: string;
  tenant_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  source: ContactSource;
  tags: string[];
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactSource =
  | 'phone'
  | 'chat'
  | 'website'
  | 'referral'
  | 'google'
  | 'ghost_lead'
  | 'manual'
  | 'sms';

export interface IContactCreateInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  source: ContactSource;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
