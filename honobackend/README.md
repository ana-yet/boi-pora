# honobackend (Hono on Cloudflare Workers)

Public books read API for the frontend (`NEXT_PUBLIC_GET_API_URL`).

## Which env file for what?

| | **Local (`pnpm dev`)** | **Cloudflare (production)** |
|---|------------------------|-----------------------------|
| **Use** | **`.env`** (with `--env-file .env`) | **Wrangler secrets** + **`wrangler.jsonc`** |
| **Secrets** (`MONGODB_URI`) | `.env` (gitignored) | `wrangler secret put MONGODB_URI` or Dashboard → Settings → Variables → **Secrets** |
| **Non-secrets** (`CORS_ORIGIN`, `DB_NAME`) | `.env` or `.env.example` | `wrangler.jsonc` → `env.production.vars` (edit before deploy) or Dashboard → **Environment variables** |
| **`.dev.vars`** | Optional Wrangler-native alternative to `.env` for local only; not deployed | Not used on deploy |

**Recommendation:** keep **`.env` for local** (same habit as `backend/`). For Cloudflare, **never commit secrets** — use **`wrangler secret put`** and put production `CORS_ORIGIN` in **`env.production`** in `wrangler.jsonc` (or the Dashboard).

Neither `.env` nor `.dev.vars` is uploaded when you run `pnpm deploy`. Only `wrangler.jsonc` and built code go up; secrets must be set on the Worker in Cloudflare.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Server: `http://localhost:8787`

### Local dev: use Nest proxy (recommended)

The MongoDB Node driver often **hangs** inside `wrangler dev`, which makes the browser show a **CORS** error (the runtime error has no CORS headers).

**Fix:** run Nest on port 4000 and set in `.env`:

```env
BOOKS_API_PROXY=http://127.0.0.1:4000
```

```bash
# terminal 1
npm run dev:api

# terminal 2
cd honobackend && pnpm dev
```

Hono on `:8787` adds CORS and forwards `/api/v1/books*` to Nest.

For **Cloudflare production**, use **MongoDB Atlas** (`mongodb+srv://...`) in `wrangler secret put MONGODB_URI` and leave `BOOKS_API_PROXY` unset.

## Deploy to Cloudflare

### 1. One-time

```bash
cd honobackend
pnpm install
npx wrangler login
```

Edit `wrangler.jsonc` → `env.production.vars.CORS_ORIGIN` to your real frontend URL(s), comma-separated, e.g.:

`https://boi-pora.vercel.app,https://www.yourdomain.com`

### 2. Set the MongoDB secret (required)

```bash
npx wrangler secret put MONGODB_URI --env production
# Paste your Atlas URI when prompted (same DB as Nest is fine)
```

Or: Cloudflare Dashboard → Workers → **honobackend** → Settings → Variables → Add **Secret** `MONGODB_URI`.

Use a **MongoDB Atlas** URI that allows Cloudflare (Network Access: `0.0.0.0/0` or Atlas “allow access from anywhere” for Workers).

### 3. Deploy

```bash
pnpm deploy
```

Note the `*.workers.dev` URL (or your custom domain) and set the frontend:

```env
NEXT_PUBLIC_GET_API_URL=https://honobackend.<your-subdomain>.workers.dev
```

### 4. Optional: more secrets via Dashboard

Same place as `MONGODB_URI` if you add keys later. Plain vars can be edited under **Environment variables** for the `production` environment without redeploying code (depending on setting).

## Commands

```bash
pnpm dev      # local, loads .env
pnpm deploy   # production Worker (--env production)
pnpm cf-typegen
```
