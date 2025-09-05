# Supabase Setup Guide

This guide will help you complete the migration from Redis to Supabase for the MoonPhase Hair notification system.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase

## Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keep your existing VAPID keys for push notifications
VAPID_EMAIL=your_email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Cron secret for scheduled jobs
CRON_SECRET=your_cron_secret
```

## Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migration script located at `/workspace/supabase/migrations/001_update_subscriptions_for_auth.sql`

## Authentication Setup

### 1. Enable Social Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable the following providers:
   - **Google**:
     - Create a Google Cloud project
     - Set up OAuth 2.0 credentials
     - Add authorized redirect URIs:
       - `https://your-project.supabase.co/auth/v1/callback`
       - `http://localhost:3000/api/auth/callback` (for local development)
   - **Twitter (X)**:
     - Create a Twitter Developer app
     - Get your API key and secret
     - Add callback URLs similar to Google

### 2. Configure Redirect URLs

In Supabase dashboard > Authentication > URL Configuration:
- Site URL: `http://localhost:3000` (for development)
- Redirect URLs: Add `http://localhost:3000/api/auth/callback`

## Features Implemented

### 1. User Authentication
- Social login with Google and Twitter
- Profile management with avatar support
- Session management with middleware

### 2. Notification System
- Push notifications tied to authenticated users
- Subscription management in Supabase
- Automatic cleanup when users delete their accounts

### 3. Database Schema
- **profiles**: Stores user profile information
- **subscriptions**: Stores push notification subscriptions with user association
- **fasting_states**: Stores fasting schedules with user association

### 4. Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authentication required for all notification operations

## Testing the Setup

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Test authentication:
   - Click the profile icon in the navbar
   - Sign in with Google or Twitter
   - Verify your profile appears in the dropdown

3. Test notifications:
   - After signing in, enable notifications
   - The system will now store your subscription in Supabase
   - Notifications are tied to your user account

## Cron Job Setup (Production)

For the notification system to work in production, you need to set up a cron job that calls:
```
GET /api/check-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

This should run every few hours to check for due notifications.

## Migration Notes

### From Redis to Supabase
- All notification subscriptions are now stored in Supabase
- User authentication is required for notifications
- Data persists beyond Redis expiration times
- Better reliability and user management

### Key Changes
1. **API Routes**: Now require authentication
2. **Subscriptions**: Linked to user accounts
3. **Data Storage**: PostgreSQL instead of Redis
4. **Security**: RLS policies protect user data

## Troubleshooting

1. **Authentication not working**: Check your social provider configurations and redirect URLs
2. **Database errors**: Ensure you've run the migration script
3. **Notifications not sending**: Verify VAPID keys are correctly set

## Next Steps

1. Configure production environment variables
2. Set up production cron job for notifications
3. Test the complete flow in production
4. Monitor Supabase dashboard for usage and errors