-- Add vote_type column to distinguish liked / skipped / not_tonight
ALTER TABLE public.votes
ADD COLUMN vote_type text NOT NULL DEFAULT 'skipped';

-- Backfill existing votes based on the liked boolean
UPDATE public.votes SET vote_type = 'liked' WHERE liked = true;
UPDATE public.votes SET vote_type = 'skipped' WHERE liked = false;