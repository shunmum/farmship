-- Add group_name to customers (e.g. "田中家" for grouping spouse/family customers)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS group_name text;
CREATE INDEX IF NOT EXISTS idx_customers_group_name ON customers(group_name);
