-- LeadAnchor Development Seed Data
-- This file creates a demo tenant with realistic sample data for development.
-- Safe to run multiple times (idempotent via ON CONFLICT).

-- ============================================================================
-- DEMO TENANT
-- ============================================================================

INSERT INTO tenants (id, name, slug, track, phone, address, city, state, zip, hours, integrations)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Mike''s Plumbing & Repair',
  'mikes-plumbing',
  'trades',
  '+1 (214) 555-0199',
  '742 Evergreen Terrace',
  'Dallas',
  'TX',
  '75201',
  '8:00 AM - 6:00 PM',
  '{"telnyx": true, "stripe": true, "google_business": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Note: Default pipeline stages are auto-created by the trigger

-- ============================================================================
-- DEMO CONTACTS
-- ============================================================================

INSERT INTO contacts (id, tenant_id, first_name, last_name, phone, email, source, tags) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'Sarah', 'Johnson', '(555) 111-2222', 'sarah.j@email.com', 'phone', ARRAY['residential', 'repeat']),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Michael', 'Chen', '(555) 333-4444', 'mchen@email.com', 'website', ARRAY['commercial']),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'Emily', 'Rodriguez', '(555) 555-6666', null, 'ghost_lead', ARRAY['emergency']),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001',
   'James', 'Williams', '(555) 777-8888', 'jwilliams@email.com', 'chat', ARRAY['residential']),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001',
   'Lisa', 'Park', '(555) 999-0000', 'lisa.park@email.com', 'referral', ARRAY['residential', 'vip'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO DEALS (using pipeline stages from trigger)
-- ============================================================================

-- Get stage IDs dynamically
DO $$
DECLARE
  stage1_id UUID;
  stage2_id UUID;
  stage3_id UUID;
  stage4_id UUID;
BEGIN
  SELECT id INTO stage1_id FROM pipeline_stages
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND position = 1;
  SELECT id INTO stage2_id FROM pipeline_stages
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND position = 2;
  SELECT id INTO stage3_id FROM pipeline_stages
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND position = 3;
  SELECT id INTO stage4_id FROM pipeline_stages
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001' AND position = 4;

  INSERT INTO deals (id, tenant_id, contact_id, stage_id, title, value, priority, source) VALUES
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0001-000000000001', stage1_id,
     'Kitchen Faucet Replacement', 450.00, 'high', 'phone'),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0001-000000000002', stage2_id,
     'Office Bathroom Renovation', 1200.00, 'medium', 'website'),
    ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0001-000000000003', stage1_id,
     'Ghost Lead - (555) 555-6666', null, 'high', 'ghost_lead'),
    ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0001-000000000004', stage3_id,
     'Water Heater Installation', 2500.00, 'medium', 'chat'),
    ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0001-000000000005', stage4_id,
     'Emergency Pipe Repair', 800.00, 'high', 'referral')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- DEMO INTERACTIONS
-- ============================================================================

INSERT INTO interactions (tenant_id, contact_id, deal_id, type, direction, title, body) VALUES
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001',
   'call', 'inbound', '📞 Inbound Call',
   'Sarah called about a leaking kitchen faucet. Scheduled inspection.'),
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000002',
   'chat', 'inbound', '💬 AI Web Chat Inquiry',
   'Michael inquired about office bathroom renovation. Quote requested.'),
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000003',
   'ghost_lead', 'inbound', '📞 Ghost Lead (Abandoned Call)',
   'Missed call from (555) 555-6666. Auto-SMS follow-up sent.'),
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000004',
   'booking', 'system', '📅 Booking Confirmed',
   'Water heater installation scheduled for next Tuesday at 10 AM.'),
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000005',
   'note', 'system', '✅ Job Completed',
   'Emergency pipe repair completed. Customer very satisfied. Review requested.');

-- ============================================================================
-- DEMO PHONE NUMBER
-- ============================================================================

INSERT INTO phone_numbers (tenant_id, number, type, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+1 (214) 555-0199',
  'tracking',
  true
)
ON CONFLICT DO NOTHING;
