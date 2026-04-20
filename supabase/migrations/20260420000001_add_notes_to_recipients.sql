ALTER TABLE public.recipients
  ADD COLUMN IF NOT EXISTS notes TEXT;
