-- Supabase SQL Migration for Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  contact_id UUID REFERENCES contacts(id),
  messages JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('active','resolved','escalated')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's chat sessions"
ON chat_sessions FOR SELECT
USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
));

CREATE POLICY "Users can update their tenant's chat sessions"
ON chat_sessions FOR UPDATE
USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE auth_id = auth.uid()
));
