-- Add mode column to sessions table
ALTER TABLE public.sessions ADD COLUMN mode text NOT NULL DEFAULT 'multi';

-- Add lead_id to sessions to link solo sessions to users
ALTER TABLE public.sessions ADD COLUMN lead_id uuid REFERENCES public.leads(id);