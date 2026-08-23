// Booking types

export interface IBooking {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  deal_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  service_type: string | null;
  status: BookingStatus;
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface IBookingCreateInput {
  contact_id?: string;
  deal_id?: string;
  scheduled_at: string;
  duration_minutes?: number;
  service_type?: string;
  notes?: string;
}
