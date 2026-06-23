-- OKKA Platform - Migration: Multi-Tenant Whatsapp Config Column Identity
-- Remove check constraint checking id = 1 if it still exists
ALTER TABLE public.whatsapp_config DROP CONSTRAINT IF EXISTS whatsapp_config_id_check;

-- Create sequence for id if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.whatsapp_config_id_seq;

-- Set default for id column to nextval of sequence
ALTER TABLE public.whatsapp_config ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_config_id_seq');

-- Adjust the sequence value to be greater than the max id in the table (which is 1)
SELECT setval('public.whatsapp_config_id_seq', COALESCE((SELECT MAX(id) FROM public.whatsapp_config), 1));
