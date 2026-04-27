-- Add furigana (kana reading) column to customers and recipients
ALTER TABLE customers ADD COLUMN IF NOT EXISTS furigana text;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS furigana text;
