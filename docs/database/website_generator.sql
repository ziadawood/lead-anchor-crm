-- Supabase SQL Migration for Website Generator

-- Add slug and theme_config to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"template": "clean-light", "primaryColor": "#0f172a"}';

-- Create a policy to allow public read access to tenant profiles by slug
CREATE POLICY "Allow public read access to tenant public profiles"
ON tenants FOR SELECT
USING (slug IS NOT NULL);
