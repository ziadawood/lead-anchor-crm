// Chat types

export interface IChatSession {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  messages: IChatMessage[];
  status: ChatSessionStatus;
  metadata: IChatSessionMetadata;
  created_at: string;
  resolved_at: string | null;
}

export type ChatSessionStatus = 'active' | 'resolved' | 'escalated';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface IChatSessionMetadata {
  qualified_at?: string;
  agent_takeover_at?: string;
  qualification_data?: IQualificationData;
}

export interface IQualificationData {
  is_qualified: boolean;
  name: string | null;
  phone: string | null;
  service_needed: string | null;
  urgency: 'emergency' | 'soon' | 'planning' | null;
  preferred_time: string | null;
}

export interface IChatStreamRequest {
  tenant_slug: string;
  session_id: string;
  message: string;
}

export interface IChatStreamEvent {
  type: 'token' | 'done' | 'lead_qualified' | 'error';
  content?: string;
  session_id?: string;
  contact_id?: string;
  deal_id?: string;
  error?: string;
}
