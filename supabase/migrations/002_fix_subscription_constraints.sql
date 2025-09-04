-- Fix subscription constraints to allow multiple moon phase subscriptions per user
-- This migration removes any remaining old constraints and ensures the correct constraint is in place

-- Remove any old constraints that might be blocking multiple subscriptions
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS unique_endpoint_type;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS unique_user_endpoint_type;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_endpoint_key;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_endpoint_subscription_type_key;

-- Ensure the correct constraint exists (allows multiple moon phases per user with same endpoint)
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS unique_user_endpoint_phase_type;
ALTER TABLE public.subscriptions 
ADD CONSTRAINT unique_user_endpoint_phase_type UNIQUE (user_id, endpoint, target_phase, subscription_type);

-- Verify the table structure and constraints
-- This will help us see what constraints are actually in place
DO $$
BEGIN
    RAISE NOTICE 'Current constraints on subscriptions table:';
    FOR rec IN 
        SELECT conname, pg_get_constraintdef(oid) as definition 
        FROM pg_constraint 
        WHERE conrelid = 'public.subscriptions'::regclass
    LOOP
        RAISE NOTICE 'Constraint: % - Definition: %', rec.conname, rec.definition;
    END LOOP;
END $$;
