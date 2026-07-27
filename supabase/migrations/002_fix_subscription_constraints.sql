-- Atomic subscription upserts use this exact conflict key.
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

DELETE FROM public.subscriptions
WHERE target_phase NOT IN (
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

DO $$
BEGIN
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
    scheduled = COALESCE(scheduled, false);

-- Preserve the most recently updated live state if legacy races created more
-- than one row for a user.
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
  ALTER COLUMN scheduled SET NOT NULL;

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
CREATE UNIQUE INDEX unique_user_live_fasting
  ON public.fasting_states(user_id)
  WHERE is_active OR scheduled;
