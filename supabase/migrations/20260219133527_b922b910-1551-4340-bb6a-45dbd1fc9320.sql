
-- Add preference and referral columns to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS favorite_genre text,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS card_last_four text,
  ADD COLUMN IF NOT EXISTS card_holder_name text;

-- Create index on referral_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_referral_code ON public.leads (referral_code);

-- Allow users to update their own leads (for preferences/card)
CREATE POLICY "Anyone can update leads"
  ON public.leads
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
