-- Reconcile databases that applied the original hand-written migrations.
-- This migration is intentionally idempotent.

DELETE FROM public.subscriptions
WHERE user_id IS NULL
   OR endpoint IS NULL
   OR subscription_data IS NULL
   OR target_phase IS NULL
   OR next_date IS NULL
   OR subscription_type NOT IN ('hair', 'fasting')
   OR target_phase NOT IN (
     'New Moon',
     'Waxing Crescent',
     'First Quarter',
     'Waxing Gibbous',
     'Full Moon',
     'Waning Gibbous',
     'Last Quarter',
     'Waning Crescent'
   )
   OR (subscription_type = 'fasting' AND target_phase <> 'Full Moon');

UPDATE public.subscriptions
SET subscription_type = COALESCE(subscription_type, 'hair'),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now());

ALTER TABLE public.subscriptions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN endpoint SET NOT NULL,
  ALTER COLUMN subscription_type SET DEFAULT 'hair',
  ALTER COLUMN subscription_type SET NOT NULL,
  ALTER COLUMN subscription_data SET NOT NULL,
  ALTER COLUMN target_phase SET NOT NULL,
  ALTER COLUMN next_date SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due
  ON public.subscriptions(next_date, id);

WITH ranked_subscriptions AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, endpoint, target_phase, subscription_type
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS position
  FROM public.subscriptions
)
DELETE FROM public.subscriptions AS subscription
USING ranked_subscriptions AS ranked
WHERE subscription.id = ranked.id
  AND ranked.position > 1;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS unique_endpoint_type;
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS unique_user_endpoint_type;
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_endpoint_key;
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_endpoint_subscription_type_key;
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS unique_user_endpoint_phase_type;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT unique_user_endpoint_phase_type
  UNIQUE (user_id, endpoint, target_phase, subscription_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_subscription_type_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_subscription_type_check
      CHECK (subscription_type IN ('hair', 'fasting'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_endpoint_length_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_endpoint_length_check
      CHECK (char_length(endpoint) BETWEEN 1 AND 2048);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_target_phase_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_target_phase_check
      CHECK (target_phase IN (
        'New Moon',
        'Waxing Crescent',
        'First Quarter',
        'Waxing Gibbous',
        'Full Moon',
        'Waning Gibbous',
        'Last Quarter',
        'Waning Crescent'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_fasting_phase_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_fasting_phase_check
      CHECK (subscription_type <> 'fasting' OR target_phase = 'Full Moon');
  END IF;
END;
$$;

UPDATE public.fasting_states
SET is_active = COALESCE(is_active, false),
    scheduled = COALESCE(scheduled, false),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now());

WITH ranked_live_states AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS position
  FROM public.fasting_states
  WHERE COALESCE(is_active, false) OR COALESCE(scheduled, false)
)
DELETE FROM public.fasting_states AS fasting_state
USING ranked_live_states AS ranked
WHERE fasting_state.id = ranked.id
  AND ranked.position > 1;

ALTER TABLE public.fasting_states
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT false,
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN scheduled SET DEFAULT false,
  ALTER COLUMN scheduled SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fasting_states_live_state_check'
      AND conrelid = 'public.fasting_states'::regclass
  ) THEN
    ALTER TABLE public.fasting_states
      ADD CONSTRAINT fasting_states_live_state_check
      CHECK (NOT (is_active AND scheduled));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fasting_states_time_order_check'
      AND conrelid = 'public.fasting_states'::regclass
  ) THEN
    ALTER TABLE public.fasting_states
      ADD CONSTRAINT fasting_states_time_order_check
      CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time);
  END IF;
END;
$$;

DROP INDEX IF EXISTS public.unique_user_fasting;
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_live_fasting
  ON public.fasting_states(user_id)
  WHERE is_active OR scheduled;

UPDATE public.profiles
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now());

ALTER TABLE public.profiles
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.sent_tweets
SET created_at = COALESCE(created_at, now());

ALTER TABLE public.sent_tweets
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_tweets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete their own subscriptions"
  ON public.subscriptions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own fasting states" ON public.fasting_states;
CREATE POLICY "Users can view their own fasting states"
  ON public.fasting_states FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own fasting states" ON public.fasting_states;
CREATE POLICY "Users can create their own fasting states"
  ON public.fasting_states FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own fasting states" ON public.fasting_states;
CREATE POLICY "Users can update their own fasting states"
  ON public.fasting_states FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own fasting states" ON public.fasting_states;
CREATE POLICY "Users can delete their own fasting states"
  ON public.fasting_states FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

REVOKE ALL ON TABLE public.subscriptions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.fasting_states FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.sent_tweets FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.fasting_states TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.fasting_states TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sent_tweets TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL
    REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'failed', 'sent', 'skipped')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_deliveries_subscription_schedule_key
    UNIQUE (subscription_id, scheduled_for)
);

CREATE INDEX IF NOT EXISTS notification_deliveries_claim_idx
  ON public.notification_deliveries(next_attempt_at, created_at)
  WHERE processed_at IS NULL;

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.notification_deliveries
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notification_deliveries
  TO service_role;

CREATE OR REPLACE FUNCTION public.claim_due_notifications(
  p_now timestamptz DEFAULT now(),
  p_limit integer DEFAULT 50,
  p_lease_seconds integer DEFAULT 900
)
RETURNS TABLE (
  delivery_id uuid,
  subscription_id uuid,
  subscription_type text,
  subscription_data jsonb,
  target_phase text,
  scheduled_for timestamptz,
  attempt_count integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  safe_limit integer := LEAST(GREATEST(p_limit, 1), 100);
  safe_lease interval := make_interval(
    secs => LEAST(GREATEST(p_lease_seconds, 60), 3600)
  );
BEGIN
  -- A user upsert can replace a schedule while an older attempt is pending.
  UPDATE public.notification_deliveries AS delivery
  SET status = 'skipped',
      processed_at = p_now,
      claimed_at = NULL,
      last_error = 'schedule_replaced',
      updated_at = p_now
  FROM public.subscriptions AS subscription
  WHERE delivery.subscription_id = subscription.id
    AND delivery.processed_at IS NULL
    AND delivery.scheduled_for <> subscription.next_date;

  INSERT INTO public.notification_deliveries (
    subscription_id,
    scheduled_for,
    next_attempt_at
  )
  SELECT subscription.id, subscription.next_date, p_now
  FROM public.subscriptions AS subscription
  WHERE subscription.next_date <= p_now
    AND NOT EXISTS (
      SELECT 1
      FROM public.notification_deliveries AS existing
      WHERE existing.subscription_id = subscription.id
        AND existing.scheduled_for = subscription.next_date
    )
  ORDER BY subscription.next_date, subscription.id
  LIMIT safe_limit
  ON CONFLICT (subscription_id, scheduled_for) DO NOTHING;

  RETURN QUERY
  WITH candidates AS (
    SELECT delivery.id
    FROM public.notification_deliveries AS delivery
    JOIN public.subscriptions AS subscription
      ON subscription.id = delivery.subscription_id
     AND subscription.next_date = delivery.scheduled_for
    WHERE delivery.processed_at IS NULL
      AND delivery.next_attempt_at <= p_now
      AND (
        delivery.status IN ('pending', 'failed')
        OR (
          delivery.status = 'processing'
          AND delivery.claimed_at < p_now - safe_lease
        )
      )
    ORDER BY delivery.next_attempt_at, delivery.created_at, delivery.id
    LIMIT safe_limit
    FOR UPDATE OF delivery SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.notification_deliveries AS delivery
    SET status = 'processing',
        claimed_at = p_now,
        attempt_count = delivery.attempt_count + 1,
        last_error = NULL,
        updated_at = p_now
    FROM candidates
    WHERE delivery.id = candidates.id
    RETURNING delivery.*
  )
  SELECT
    claimed.id,
    subscription.id,
    subscription.subscription_type,
    subscription.subscription_data,
    subscription.target_phase,
    claimed.scheduled_for,
    claimed.attempt_count
  FROM claimed
  JOIN public.subscriptions AS subscription
    ON subscription.id = claimed.subscription_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_notification_delivery(
  p_delivery_id uuid,
  p_next_date timestamptz,
  p_outcome text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  claimed_delivery public.notification_deliveries%ROWTYPE;
BEGIN
  IF p_outcome NOT IN ('sent', 'skipped') THEN
    RAISE EXCEPTION 'Invalid notification outcome';
  END IF;

  SELECT *
  INTO claimed_delivery
  FROM public.notification_deliveries
  WHERE id = p_delivery_id
    AND processed_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF p_next_date <= claimed_delivery.scheduled_for THEN
    RAISE EXCEPTION 'Next notification date must be later than the claimed date';
  END IF;

  UPDATE public.notification_deliveries
  SET status = p_outcome,
      processed_at = now(),
      claimed_at = NULL,
      last_error = NULL,
      updated_at = now()
  WHERE id = p_delivery_id;

  UPDATE public.subscriptions
  SET next_date = p_next_date,
      updated_at = now()
  WHERE id = claimed_delivery.subscription_id
    AND next_date = claimed_delivery.scheduled_for;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_notification_delivery(
  p_delivery_id uuid,
  p_error text,
  p_retry_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.notification_deliveries
  SET status = 'failed',
      next_attempt_at = GREATEST(p_retry_at, now() + interval '1 minute'),
      claimed_at = NULL,
      last_error = left(COALESCE(p_error, 'Delivery failed'), 500),
      updated_at = now()
  WHERE id = p_delivery_id
    AND processed_at IS NULL;

  RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_due_notifications(timestamptz, integer, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_notification_delivery(uuid, timestamptz, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fail_notification_delivery(uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_due_notifications(timestamptz, integer, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_notification_delivery(uuid, timestamptz, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_notification_delivery(uuid, text, timestamptz)
  TO service_role;
