CREATE TABLE IF NOT EXISTS public.sent_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_type text NOT NULL CHECK (tweet_type IN ('pre', 'noon')),
  phase_name text NOT NULL,
  target_date date NOT NULL,
  tweet_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_tweet_type_phase_date
    UNIQUE (tweet_type, phase_name, target_date)
);

ALTER TABLE public.sent_tweets ENABLE ROW LEVEL SECURITY;

-- Internal cron ledger: no browser role receives a policy or table privilege.
REVOKE ALL ON TABLE public.sent_tweets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sent_tweets TO service_role;
