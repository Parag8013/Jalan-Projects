# Deploying to Vercel

## What ships

| | Size | Files |
|---|---|---|
| `public/media` — 8 graded clips + posters | 11 MB | 15 |
| `public/frames/m5` — scrub sequence | 10 MB | 192 |
| **Total in repo** | **~21 MB** | 207 |

`media/` (52 MB of raw Flow exports) is gitignored. It is source material, not
deployed — but it is what you re-grade from, so **back it up somewhere outside the
repo.** Losing it means regenerating in Flow.

---

## One-time setup

### 1. Create the repo

```bash
cd C:/JalanProjects
git init -b main
git add .
git commit -m "Jalan Projects site"
git remote add origin https://github.com/<you>/jalan-projects.git
git push -u origin main
```

### 2. Import into Vercel

vercel.com/new → import the repo. Vercel detects Next.js and needs **no build
configuration** — framework, build command and output are all inferred.

Deploy. First build takes 2–3 minutes.

Alternatively, from the terminal:

```bash
npx vercel        # preview deployment
npx vercel --prod # production
```

The CLI is worth having for one-off preview deploys without a push.

### 3. Domain

Project → Settings → Domains → add the domain. Vercel issues the certificate
automatically. Point DNS at Vercel (their nameservers, or `CNAME` for `www` and an
`A` record at the apex — Vercel shows the exact values).

---

## Plan: you need Pro, not Hobby

**Vercel's Hobby tier prohibits commercial use.** This is a company's lead-generating
site, which puts it outside those terms. Budget **$20/month for Pro** before launch.

Bandwidth reinforces it. Every desktop visitor who reaches the build-to-suit scene
downloads the **10 MB frame sequence**. Hobby includes 100 GB/month, so roughly
**10,000 desktop visits would exhaust it** — and Vercel bills overage. Pro's included
allowance plus the 30-day cache headers make this comfortable, but keep an eye on
usage in the first month.

If bandwidth becomes the dominant cost, move `public/frames` to ImageKit. The loader
in `lib/imagekit-loader.ts` already exists, and `ScrubSequence` takes `frameSrc` as a
function, so it is a one-line change at the call site in `FrameAssembly.tsx`.

---

## What `vercel.json` does

**`"regions": ["bom1"]`** — Mumbai. Static assets serve from Vercel's global edge
regardless, but any server rendering and, later, the enquiry form's server action
execute here instead of the US East default. Your buyers are in West Bengal; this
removes a pointless round trip across the planet.

**Cache headers on `/frames/*` and `/media/*`** — 30 days. Vercel serves `public/`
assets with `max-age=0, must-revalidate` by default, so without this every repeat
visitor refetches all 21 MB.

Deliberately **not** `immutable`: filenames are stable across regrades, so a new
grade under the same name would otherwise serve stale for a year. **If you re-export
media, redeploy and purge the cache**, or the old grade lingers.

---

## Why not a static export

Every route currently prerenders as static, so `output: 'export'` would work today.

**Don't.** The enquiry form needs a server action to reach Resend and the WhatsApp
API, and static export forbids both. Vercel already serves your static pages from
the edge — you gain nothing by locking that door and would pay to reopen it.

---

## Environment variables

None required today. Add these in Project → Settings → Environment Variables when the
enquiry form lands, and set them for **all three** environments (Production, Preview,
Development) or preview deploys will fail at runtime:

```
RESEND_API_KEY
ENQUIRY_TO_EMAIL
ENQUIRY_BCC_EMAIL
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_IMAGEKIT_ENDPOINT      # only if media moves to ImageKit
```

`NEXT_PUBLIC_*` values are compiled into the browser bundle. Never put a secret
behind that prefix.

---

## Local commands

```bash
npm run dev     # dev server, port 3000
npm run build   # production build — run before pushing
npm start       # serve the production build locally
```

**Run `npm run build` before you push.** Vercel fails the deploy on a type error, and
finding out locally takes 30 seconds instead of 3 minutes.

Note: `next build` and `next dev` share `.next`. Running a build while the dev server
is up breaks the dev server until you restart it.

---

## Preview deployments

Vercel builds every branch and pull request at its own URL. Use this — the pinned
scroll scenes are far easier to judge on a real deployment over a real network than
on localhost, and it is the only practical way to test the scrub on a phone.

---

## Before the site goes public

`docs/VERIFY-BEFORE-LAUNCH.md` lists every generated figure — acreage, connectivity
distances, process durations, contact details. **All of it is invented.** Phone and
email are placeholders.

Deploy to the `.vercel.app` subdomain first, share that for review, and attach the
real domain only once those numbers are confirmed.
