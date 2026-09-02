# Deploying FarmDirect publicly (Vercel + Neon)

This gets you a public HTTPS URL anyone can open. Free tier is enough for a demo.

Two accounts needed (I can't create these for you — sign up yourself):
- **Neon** — https://neon.tech (managed Postgres)
- **Vercel** — https://vercel.com (hosts the Next.js app)

---

## 1. Push this folder to GitHub

The repo is already `git init`-ed with a first commit. Create an empty repo on
GitHub (no README), then:

```bash
cd ~/Documents/farmdirect-local
git remote add origin https://github.com/<your-username>/farmdirect.git
git branch -M main
git push -u origin main
```

`.env.local` is git-ignored, so your local secrets are not pushed.

---

## 2. Create the database on Neon

1. Sign up at neon.tech → **New Project** (pick a region near you, e.g. Singapore).
2. On the project dashboard, **Connection Details** → copy the
   **Pooled connection** string. It looks like:
   ```
   postgresql://<user>:<pass>@ep-xxxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require
   ```
   Keep the `?sslmode=require` on the end.

---

## 3. Load the schema into Neon (from your machine, one time)

```bash
cd ~/Documents/farmdirect-local
DATABASE_URL="<paste the Neon pooled string>" npx drizzle-kit push
```

Type `y` if it asks to apply changes. This creates the 5 tables.

---

## 4. Deploy on Vercel

1. Sign up at vercel.com with your GitHub account.
2. **Add New → Project** → import the `farmdirect` repo.
3. Framework preset auto-detects **Next.js**. Leave build settings default.
4. Before clicking Deploy, expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon **pooled** connection string from step 2 |
   | `JWT_SECRET` | any long random string (e.g. run `openssl rand -hex 32`) |

5. Click **Deploy**. Wait ~2 min. You get a URL like
   `https://farmdirect-xxxx.vercel.app`.

---

## 5. Seed the demo data

Open once in your browser (or curl):

```
https://<your-app>.vercel.app/api/seed
```

You should see `{"seeded":true,...}`. This creates 14 users, 20 crop listings,
12 orders, reviews, and 30-day mandi price history.

Demo logins (also in README.md):

| Role | Phone | Password |
|---|---|---|
| admin | `9999999999` | `admin123` |
| farmer | `9876543210` | `farmer123` |
| consumer | `9811111111` | `consumer123` |

There's a "Reset Demo DB" button and a persona switcher in the top bar.

---

## Notes / known limitations on serverless

- **Photo upload when adding produce** (`/api/upload`) writes to the local
  filesystem, which is read-only on Vercel. The "Add Produce" form already
  falls back to a crop-based placeholder image when upload fails, so listings
  still work — the custom photo just won't stick. Fine for a demo; if you need
  real uploads later, switch that route to Vercel Blob or Cloudinary.
- Neon's free tier sleeps the DB after ~5 min idle; the first request after
  that takes a few extra seconds to wake it. Use the **pooled** connection
  string (not the direct one) to minimise connection issues on serverless.
- To re-seed from scratch: hit `/api/seed` again — it wipes and repopulates
  when the user count is below 12, or use the in-app "Reset Demo DB" button.

---

## Alternative: keep everything in one place

If you'd rather not use two services, **Railway** (railway.app) can host both
the Next.js app and a Postgres add-on in one project. Same env vars
(`DATABASE_URL`, `JWT_SECRET`); Railway injects `DATABASE_URL` automatically
when you add the Postgres plugin. Then run steps 3 and 5 the same way.
