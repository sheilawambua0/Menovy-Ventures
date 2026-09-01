# Putting Menovy Ventures live on the internet

You have two separate pieces to deploy:

1. **The backend** (`menovy-backend` folder) — a small server that texts
   your sister whenever someone applies for a loan.
2. **The website** (`menovy-ventures-website.html`) — the page people
   actually visit.

Do them in this order, because the website needs to know the backend's
address before it can notify anyone.

---

## Part 1 — Deploy the backend (Render, free tier)

Render is used here because it's free for a small always-on-ish service,
and doesn't require a credit card to start.

### 1. Put the backend code on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository, e.g. `menovy-backend` (keep it private if
   you prefer — Render can still access it).
3. In VS Code, open the `menovy-backend` folder and push it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/menovy-backend.git
   git push -u origin main
   ```
   **Important:** make sure `.env` is NOT committed — it holds your API
   key. Add a `.gitignore` file with this line first:
   ```
   .env
   node_modules
   ```

### 2. Create the service on Render

1. Go to https://render.com and sign up (you can sign in with GitHub).
2. Click **New → Web Service**.
3. Connect your GitHub account and pick the `menovy-backend` repo.
4. Fill in:
   - **Name:** `menovy-notify` (or anything you like)
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
5. Under **Environment Variables**, add the same values from your local
   `.env`:
   - `AT_USERNAME`
   - `AT_API_KEY`
   - `NOTIFY_PHONE`
   - `AT_SENDER_ID` (optional, can leave blank)
   - `ALLOWED_ORIGIN` — set this to your future website address once you
     have it (Part 2), or leave as `*` for now
6. Click **Create Web Service**. Render will build and start it —
   watch the logs for the same "server running" message you saw
   locally.
7. Once it's live, Render gives you a URL like:
   ```
   https://menovy-notify.onrender.com
   ```
   Your endpoint is `https://menovy-notify.onrender.com/api/apply`.
   Test it's alive by visiting `https://menovy-notify.onrender.com/health`
   in a browser — it should show `{"ok":true}`.

**Free-tier note:** Render's free web services "sleep" after periods of
inactivity and take ~30–60 seconds to wake up on the next request. Fine
for a small business getting occasional applications; if that delay
becomes a problem later, a paid instance ($7/mo) keeps it always-on.

---

## Part 2 — Deploy the website (Netlify, free)

Netlify's drag-and-drop deploy is the simplest option for a single HTML
file — no command line needed.

### 1. Point the website at your live backend

Before uploading, open `menovy-ventures-website.html` and find:

```js
const NOTIFY_ENDPOINT = "http://localhost:3000/api/apply";
```

Change it to your Render URL from Part 1:

```js
const NOTIFY_ENDPOINT = "https://menovy-notify.onrender.com/api/apply";
```

Save the file.

### 2. Deploy to Netlify

1. Go to https://app.netlify.com and sign up (free).
2. On the dashboard, look for **"Deploys"** → drag-and-drop area (or
   "Add new site" → "Deploy manually").
3. Drag `menovy-ventures-website.html` straight into the browser
   window. Netlify uploads it and gives you a live URL immediately,
   e.g.:
   ```
   https://menovy-ventures-abc123.netlify.app
   ```
4. Open that link — your site is now live for anyone, anywhere.

### 3. Lock down CORS (recommended)

Now that you know the real website address, go back to Render →
your service → **Environment**, and set:

```
ALLOWED_ORIGIN=https://menovy-ventures-abc123.netlify.app
```

Save — Render will redeploy automatically. This stops other websites
from calling your SMS endpoint.

### 4. (Optional) Use your own domain

If you buy a domain (e.g. `menovyventures.co.ke`) from a registrar like
Namecheap or Truehost:
- In Netlify: **Site settings → Domain management → Add a custom domain**,
  then follow the DNS instructions Netlify gives you.
- Do the same for the backend in Render if you want a custom API
  subdomain, though the default `.onrender.com` address works fine
  since users never see it directly.

---

## Quick checklist

- [ ] Backend pushed to GitHub, `.env` excluded
- [ ] Backend deployed on Render, env vars set, `/health` returns `{"ok":true}`
- [ ] `NOTIFY_ENDPOINT` in the website updated to the Render URL
- [ ] Website deployed on Netlify
- [ ] `ALLOWED_ORIGIN` on Render updated to the Netlify URL
- [ ] Test: submit the live form and confirm the SMS arrives
