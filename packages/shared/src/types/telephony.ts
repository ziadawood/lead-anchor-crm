// Telephony types

export type CallState = 'IDLE' | 'RINGING' | 'IVR_ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface IPhoneNumber {
  id: string;
  tenant_id: string;
  number: string;
  telnyx_number_id: string | null;
  telnyx_connection_id: string | null;
  telnyx_messaging_profile_id: string | null;
  type: PhoneNumberType;
  is_active: boolean;
  created_at: string;
}

export type PhoneNumberType = 'tracking' | 'sms' | 'main';

export interface ITelnyxCallPayload {
  call_control_id: string;
  connection_id: string;
  call_leg_id: string;
  call_session_id: string;
  client_state: string | null;
  from: string;
  to: string;
  direction: 'incoming' | 'outgoing';
  state: string;
  hangup_cause?: string;
  hangup_source?: string;
}

export interface ITelnyxMessagePayload {
  id: string;
  from: { phone_number: string };
  to: { phone_number: string }[];
  text: string;
  direction: 'inbound' | 'outbound';
  type: 'SMS' | 'MMS';
  media?: { url: string; content_type: string }[];
}

export interface INumberSearchParams {
  country_code: string;
  area_code: string;
  limit?: number;
}

export interface IAvailableNumber {
  phone_number: string;
  region: string;
  city: string;
  features: string[];
  monthly_cost: string;
}
