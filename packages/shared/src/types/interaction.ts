// Interaction types (activity feed)

export interface IInteraction {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: InteractionType;
  direction: InteractionDirection;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type InteractionType =
  | 'call'
  | 'sms'
  | 'chat'
  | 'email'
  | 'booking'
  | 'note'
  | 'ghost_lead'
  | 'stage_change';

export type InteractionDirection = 'inbound' | 'outbound' | 'system';

// Type-specific metadata shapes
export interface ICallMetadata {
  call_session_id: string;
  call_leg_id: string;
  duration_seconds: number;
  recording_url: string | null;
  hangup_cause: string;
  hangup_source: string;
}

export interface ISmsMetadata {
  telnyx_message_id: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
}

export interface IGhostLeadMetadata {
  call_session_id: string;
  call_leg_id: string;
  hangup_cause: string;
  hangup_source: string;
  sms_follow_up_sent: boolean;
}
