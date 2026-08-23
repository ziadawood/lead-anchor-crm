// Billing types

export interface IInvoice {
  id: string;
  tenant_id: string;
  deal_id: string | null;
  contact_id: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  line_items: ILineItem[];
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface ILineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface IInvoiceCreateInput {
  deal_id?: string;
  contact_id: string;
  amount: number;
  due_date?: string;
  line_items: ILineItem[];
}
