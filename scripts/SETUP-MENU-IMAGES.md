# Menu Images Setup

Two-step manual setup before the new menu-image features work.

## 1. Create Supabase Storage bucket (one time)

1. Go to **Supabase dashboard → Storage → New bucket**
2. Name: `menu-images`
3. **Public bucket: ON** (so menu photos load without auth)
4. Click **Save**

## 2. Add service-role key to environment

The upload endpoint uses the Supabase service-role key to bypass row-level security on Storage.

### Local

In `.env.local`, add:

```
SUPABASE_SERVICE_ROLE_KEY=<paste from Supabase>
```

Get the key from: Supabase dashboard → **Project Settings → API → Project API keys → `service_role`** (click reveal).

> ⚠ The service-role key is a server-only secret. Never expose it to the browser. The route at `app/api/menu/upload/route.js` uses it from `process.env` only, so it stays server-side.

### Vercel

In Vercel project → **Settings → Environment Variables**, add the same `SUPABASE_SERVICE_ROLE_KEY` for **Production**, **Preview**, and **Development**, then redeploy.

## 3. Seed initial images (one time)

Open Supabase **SQL Editor → New query** and paste the contents of [seed-menu-images.sql](./seed-menu-images.sql), then **Run**.

This populates `image_url` on all 11 existing menu items with Unsplash stock photos. Swap any photo afterwards from the admin UI.

## Verify

- Restart `npm run dev` (env-var changes need a fresh server)
- Visit `/menu` — every card shows a photo
- Visit `/admin` → Menu tab → edit any item → click **Muat Naik Gambar** → upload a JPG → save → reload `/menu` to confirm
