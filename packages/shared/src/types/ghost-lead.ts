// Ghost Lead types

export interface IGhostLead {
  contact_id: string;
  deal_id: string;
  interaction_id: string;
  phone: string;
  hangup_cause: string;
  sms_sent: boolean;
  sms_sent_at: string | null;
  created_at: string;
}

export interface IGhostLeadNotification {
  event: 'ghost_lead_captured';
  payload: {
    deal_id: string;
    contact_id: string;
    phone: string;
    message: string;
    tenant_id: string;
  };
}

export interface IGhostLeadStats {
  total_captured: number;
  sms_response_rate: number;
  conversion_rate: number;
  revenue_generated: number;
  avg_response_time_minutes: number;
}
