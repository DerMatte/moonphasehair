-- Table for x-tweet dedup (replaces Vercel KV)
CREATE TABLE IF NOT EXISTS public.sent_tweets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_type text NOT NULL,
  phase_name text NOT NULL,
  target_date date NOT NULL,
  tweet_id text,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT unique_tweet_type_phase_date UNIQUE (tweet_type, phase_name, target_date)
);

-- No RLS — only accessed by server-side cron via service role key
