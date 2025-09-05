-- Add user_id column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id for better query performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Remove the previous constraint if it exists
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS unique_user_endpoint_type;

-- Create unique constraint for user_id, endpoint, target_phase, and subscription_type
-- This allows a user to subscribe to multiple moon phases with the same endpoint
ALTER TABLE public.subscriptions
ADD CONSTRAINT unique_user_endpoint_phase_type UNIQUE (user_id, endpoint, target_phase, subscription_type);

-- Add user_id to fasting_states if not already present
ALTER TABLE public.fasting_states
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id on fasting_states
CREATE INDEX IF NOT EXISTS idx_fasting_states_user_id ON public.fasting_states(user_id);

-- Create a profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for fasting_states
CREATE POLICY "Users can view their own fasting states" ON public.fasting_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fasting states" ON public.fasting_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting states" ON public.fasting_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting states" ON public.fasting_states
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();