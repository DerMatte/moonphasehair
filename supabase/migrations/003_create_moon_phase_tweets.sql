CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table to record moon phase tweet emissions
CREATE TABLE IF NOT EXISTS public.moon_phase_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  phase_name text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  tweet_body text NOT NULL,
  tweet_id text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Track updates automatically
CREATE OR REPLACE FUNCTION public.set_moon_phase_tweets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_moon_phase_tweets_updated_at ON public.moon_phase_tweets;
CREATE TRIGGER trg_set_moon_phase_tweets_updated_at
BEFORE UPDATE ON public.moon_phase_tweets
FOR EACH ROW
EXECUTE FUNCTION public.set_moon_phase_tweets_updated_at();

-- Index for querying by event type and schedule
CREATE INDEX IF NOT EXISTS idx_moon_phase_tweets_event_schedule
  ON public.moon_phase_tweets (event_type, scheduled_for DESC);

-- Disable RLS since this table is managed exclusively by server-side cron jobs
ALTER TABLE public.moon_phase_tweets DISABLE ROW LEVEL SECURITY;
