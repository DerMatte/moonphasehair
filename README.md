# Moon Phase Hair Tracker

Cutting your hair according to the moon phase, can make your hair grow faster and stronger. This simple app will tell you when it's best to cut your hair.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Automated Moon Tweets

The `GET /api/moon-phase-tweets` endpoint posts to X when:

- the lunar phase changes
- it is Full Moon or New Moon day
- it is two days before the next Full Moon or New Moon

Configure the following environment variables before enabling the cron job:

- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

Run the Supabase migrations to create the `moon_phase_tweets` table, then trigger the endpoint from your scheduler (for example, a Vercel Cron job) with the header `Authorization: Bearer ${CRON_SECRET}`.



## Todo

- [x] Update the big moon to show the actual moon phase 
- [x] fix the moon phase carousel 
- [x] add time and date to the moon phase carousel
- [ ] update the big moon to show the azimuth and elevation of the moon
- [ ] add timezone to the moon phase carousel & current phase info 
- [ ] fix location data & make it redundant
- [ ] page transition animation