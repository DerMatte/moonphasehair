# Moon Phase Hair Tracker

Cutting your hair according to the moon phase, can make your hair grow faster and stronger. This simple app will tell you when it's best to cut your hair.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## X API cron tweets

Posting on every moon phase change is already implemented. The Vercel cron job
`/api/cron/x-tweets` runs every 10 minutes (`vercel.json`) and posts:

- 2 days before the next moon phase change
- At noon (UTC) on the day of the phase change
- A generated moon-phase image with accessible alt text on every post

Post copy uses blank lines for readability and does not include a website URL.
The light, neutral image theme is used by default. Set
`X_POST_IMAGE_THEME=dark` to switch back to the preserved dark version.

### What you still need to configure

1. **X Developer App** at [developer.x.com](https://developer.x.com)
   - Create a Project + App
   - App permissions: **Read and Write**
   - Auth type: **OAuth 1.0a** user context (not OAuth 2.0 client credentials)
   - Generate and copy all four keys:
     - API Key → `X_API_KEY`
     - API Key Secret → `X_API_SECRET`
     - Access Token → `X_ACCESS_TOKEN` (looks like `1234567890-xxxx`)
     - Access Token Secret → `X_ACCESS_SECRET`
   - Paid X API access that allows `POST /2/tweets` (Free tier write access is limited; Basic or higher is typically required)

2. **Environment variables** in Vercel (Production) and `.env.local`:

```
CRON_SECRET=long-random-string
X_API_KEY=...
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
```

3. **Supabase migration** `supabase/migrations/003_create_sent_tweets.sql`
   must be applied so tweet dedup works (`sent_tweets` table).

4. **Deploy on Vercel** so the cron in `vercel.json` is active.
   Hobby crons only run daily; every-10-minute schedules need a Pro plan.
   Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when
   `CRON_SECRET` is set.

### Safe testing

```
X_TWEET_DRY_RUN=true
```

Then hit the route manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://www.moonphasehair.com/api/cron/x-tweets
```

Expect `status: "idle"` most of the time, or `dry_run` / `sent` near a phase window.

## Todo

- [x] Update the big moon to show the actual moon phase 
- [x] fix the moon phase carousel 
- [x] add time and date to the moon phase carousel
- [ ] update the big moon to show the azimuth and elevation of the moon
- [ ] add timezone to the moon phase carousel & current phase info 
- [ ] fix location data & make it redundant
- [ ] page transition animation
