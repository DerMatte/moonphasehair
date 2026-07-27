-- Reproducible baseline for the application-owned Supabase tables.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  subscription_type text NOT NULL DEFAULT 'hair',
  subscription_data jsonb NOT NULL,
  target_phase text NOT NULL,
  next_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_subscription_type_check
    CHECK (subscription_type IN ('hair', 'fasting')),
  CONSTRAINT subscriptions_target_phase_check
    CHECK (target_phase IN (
      'New Moon',
      'Waxing Crescent',
      'First Quarter',
      'Waxing Gibbous',
      'Full Moon',
      'Waning Gibbous',
      'Last Quarter',
      'Waning Crescent'
    )),
  CONSTRAINT subscriptions_fasting_phase_check
    CHECK (subscription_type <> 'fasting' OR target_phase = 'Full Moon')
);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Legacy rows predate authentication and cannot be assigned safely. Re-consent
-- is required rather than continuing to send to an ownerless push endpoint.
DELETE FROM public.subscriptions WHERE user_id IS NULL;
ALTER TABLE public.subscriptions ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due
  ON public.subscriptions(next_date, id);

CREATE TABLE IF NOT EXISTS public.fasting_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  start_time timestamptz,
  end_time timestamptz,
  duration integer CHECK (duration IN (24, 48, 72)),
  scheduled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fasting_states_user_id
  ON public.fasting_states(user_id);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

REVOKE ALL ON TABLE public.subscriptions FROM anon;
REVOKE ALL ON TABLE public.fasting_states FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.subscriptions FROM authenticated;
REVOKE ALL ON TABLE public.fasting_states FROM authenticated;
REVOKE ALL ON TABLE public.profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.fasting_states TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.fasting_states TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

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

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
