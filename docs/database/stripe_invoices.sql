-- Supabase SQL Migration for Stripe Invoices
-- Also assumes 'stripe_account_id' exists on tenants

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  deal_id UUID REFERENCES deals(id),
  contact_id UUID REFERENCES contacts(id),
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(12,2),
  status TEXT CHECK (status IN ('draft','sent','paid','overdue','cancelled')) DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's invoices"
ON invoices FOR SELECT
USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
));

CREATE POLICY "Users can update their tenant's invoices"
ON invoices FOR UPDATE
USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
));

CREATE POLICY "Users can insert their tenant's invoices"
ON invoices FOR INSERT
WITH CHECK (tenant_id IN (
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
));
