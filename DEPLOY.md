# Deploying FluxionOS for free

This app has two parts that deploy to different places:

| Part | Where | Cost |
|------|-------|------|
| `apps/web` (Next.js) | **Vercel** | Free (always on) |
| `apps/api` + workers | **Render** | Free (sleeps after 15 min idle) |
| Postgres | **Neon** | Free |
| Redis | **Upstash** | Free |

> ⚠️ The free Render service **sleeps after ~15 minutes of no traffic**, so Gmail
> polling pauses until the next request wakes it. That's the trade-off for $0.
> The workers run **inside** the API process (`RUN_WORKERS=true`), so one free
> service covers both.

Do everything below in order. You'll collect a few values (connection strings,
URLs) along the way — keep them in a scratch note.

---

## 1. Push the repo to GitHub

Vercel and Render both deploy from a Git repo.

```bash
git add .
git commit -m "Add free deploy config"
git push   # to a GitHub repo you own
```

## 2. Postgres — Neon (free)

1. Sign up at https://neon.tech (use "Continue with GitHub").
2. Create a project (any name, e.g. `fluxionos`). Region near you.
3. On the project dashboard, copy the **Pooled connection string**. It looks like:
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
4. Save it as `DATABASE_URL`.

## 3. Redis — Upstash (free)

1. Sign up at https://upstash.com (GitHub login).
2. Create a **Redis** database. Pick a region; enable **TLS** (default).
3. Copy the connection string that starts with `rediss://` (note the double `s`).
4. Save it as `REDIS_URL`.

## 4. Google OAuth credentials

1. Go to https://console.cloud.google.com → APIs & Services → Credentials.
2. Create an **OAuth client ID** → type **Web application**.
3. You'll fill **Authorized redirect URI** after step 5 (once you know the API
   URL). For now leave it; you'll come back.
4. Copy the **Client ID** and **Client secret** → `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`.

## 5. API + workers — Render (free)

1. Sign up at https://render.com (GitHub login) and connect your repo.
2. Click **New → Blueprint**. Render reads the committed
   [`render.yaml`](render.yaml) and proposes the `fluxionos-api` service.
3. When prompted, fill the env vars marked `sync: false`:
   - `DATABASE_URL` → from Neon (step 2)
   - `REDIS_URL` → from Upstash (step 3)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` → from step 4
   - `ENCRYPTION_KEY` → run `openssl rand -hex 32` and paste the result
   - `WEB_URL` → leave as a placeholder for now (you set it in step 6)
   - `API_URL` and `GOOGLE_REDIRECT_URI` → fill once you know the service URL
     (Render shows it as `https://fluxionos-api.onrender.com`). Set:
     - `API_URL=https://fluxionos-api.onrender.com`
     - `GOOGLE_REDIRECT_URI=https://fluxionos-api.onrender.com/api/auth/google/callback`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` → auto-generated, leave them.
4. Deploy. The build runs migrations then starts the API + workers.
5. Go back to **Google Cloud Console** and add the redirect URI from above to the
   OAuth client's **Authorized redirect URIs**.
6. Verify: open `https://fluxionos-api.onrender.com/api/health` → `{"status":"ok"}`.

## 6. Web — Vercel (free)

1. Sign up at https://vercel.com (GitHub login) and import the same repo.
2. In the import screen, set **Root Directory** to `apps/web`.
   (Vercel auto-detects Next.js and pnpm workspaces.)
3. Add an **Environment Variable**:
   - `NEXT_PUBLIC_API_URL = https://fluxionos-api.onrender.com`
4. Deploy. You'll get a URL like `https://fluxionos.vercel.app`.
5. Back on **Render**, set `WEB_URL=https://fluxionos.vercel.app` and redeploy
   (needed for CORS + OAuth redirects).

## 7. Done — test the flow

1. Open the Vercel URL → Login with Google.
2. After consent you should land back on the app authenticated.

---

## Notes / gotchas

- **Cold starts:** first request after idle takes ~30–60s while Render wakes.
- **Neon free** auto-suspends the DB when idle too — also adds a small wake delay.
- **Upstash free** has a daily command limit; fine for personal use.
- **Always-on workers** (no sleep) require a paid Render plan (~$7/mo) running
  the worker as a separate Background Worker; flip `RUN_WORKERS` off on the web
  service and add a worker service with `pnpm --filter @fluxionos/api run dev:workers`
  compiled equivalent (`node dist/workers/index.js`).
- **Secrets:** never commit real values. `render.yaml` only declares the keys;
  values live in the Render dashboard. The web app's only secret-free public var
  is `NEXT_PUBLIC_API_URL`.
