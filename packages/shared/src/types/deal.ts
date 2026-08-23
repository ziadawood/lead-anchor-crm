// Deal types

export interface IDeal {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  stage_id: string;
  title: string;
  value: number | null;
  priority: DealPriority;
  source: string | null;
  assigned_to: string | null;
  notes: string | null;
  closed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  contact?: import('./contact').IContact;
  stage?: IPipelineStage;
  assigned_user?: import('./user').IUser;
}

export type DealPriority = 'high' | 'medium' | 'low';

export interface IPipelineStage {
  id: string;
  tenant_id: string;
  name: string;
  position: number;
  color: string;
  is_closed: boolean;
  created_at: string;
}

export interface IDealCreateInput {
  contact_id?: string;
  stage_id: string;
  title: string;
  value?: number;
  priority?: DealPriority;
  source?: string;
  assigned_to?: string;
  notes?: string;
}

export interface IDealUpdateInput {
  stage_id?: string;
  title?: string;
  value?: number;
  priority?: DealPriority;
  assigned_to?: string | null;
  notes?: string;
}
