-- Add mobile_phone column to customers and recipients (separate from landline phone)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile_phone text;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS mobile_phone text;
