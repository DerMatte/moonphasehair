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



## X API cron tweets

The Vercel cron job `/api/cron/x-tweets` checks every 10 minutes and posts:

- 2 days before the next moon phase change
- At noon (UTC) on the day of the phase change

Required environment variables:

```
CRON_SECRET=your_cron_secret
X_API_KEY=your_x_app_key
X_API_SECRET=your_x_app_secret
X_ACCESS_TOKEN=your_x_access_token
X_ACCESS_SECRET=your_x_access_secret
```

Optional (idempotency + safe testing):

```
KV_REST_API_URL=your_vercel_kv_rest_url
KV_REST_API_TOKEN=your_vercel_kv_rest_token
X_TWEET_DRY_RUN=true
```

## Todo

- [x] Update the big moon to show the actual moon phase 
- [x] fix the moon phase carousel 
- [x] add time and date to the moon phase carousel
- [ ] update the big moon to show the azimuth and elevation of the moon
- [ ] add timezone to the moon phase carousel & current phase info 
- [ ] fix location data & make it redundant
- [ ] page transition animation