# Deploying to Vercel

## What ships

| | Size | Files |
|---|---|---|
| `public/media/seq` — 3 scrub sequences | ~23 MB | 612 |
| `public/media` — 5 clips + posters | ~14 MB | 12 |
| **Total in repo** | **~37 MB** | ~625 |

Almost all of it is the three frame sequences, and they are the reason the scrubbed
scenes are smooth — see `SCROLL-CHOREOGRAPHY.md`. None of it is on the critical
path: each sequence is fetched only when its section is about a viewport away, and
mobile never downloads one at all.

If you need to bring the weight down, the lever is quality rather than frame count.
`scripts/prepare-media.sh` has both knobs at the top, and the guidance is in
`FLOW-PROMPTS.md` under **Check the weight**.

`media/` (52 MB of raw exports) is gitignored. It is source material, not deployed —
but it is what you re-cut from, so **back it up somewhere outside the repo.**

---

## One-time setup

### 1. Create the repo

```bash
cd C:/JalanProjects
git init -b main
git add .
git commit -m "Jalan Projects site"
git remote add origin https://github.com/Parag8013/Jalan-Projects.git
git push -u origin main
```

If `origin` already exists, `git remote add` fails and leaves the old URL in
place. Overwrite it instead:

```bash
git remote set-url origin https://github.com/Parag8013/Jalan-Projects.git
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

Bandwidth is worth a look alongside it. A desktop visitor who reaches the bottom of
the page pulls roughly **31 MB** — three frame sequences (23 MB), the orbit loop and
the two ambient clips — so Hobby's 100 GB/month would run out somewhere around
**3,300 full desktop visits**, and Vercel bills overage. The repo is larger than that
because the mobile fallbacks for `build` and `interior` are never fetched on desktop,
and the sequences are never fetched on mobile. Nobody downloads all 37 MB.

Pro's allowance plus the 30-day cache headers make this comfortable, but watch usage
in the first month. If sequences turn out to dominate the bill, move `public/media`
to ImageKit — the loader in `lib/imagekit-loader.ts` already exists, and
`PlaySequence` builds its own frame URLs in one place.

---

## What `vercel.json` does

**`"regions": ["bom1"]`** — Mumbai. Static assets serve from Vercel's global edge
regardless, but any server rendering and, later, the enquiry form's server action
execute here instead of the US East default. Your buyers are in West Bengal; this
removes a pointless round trip across the planet.

**Cache headers on `/frames/*` and `/media/*`** — 30 days. Vercel serves `public/`
assets with `max-age=0, must-revalidate` by default, so without this every repeat
visitor refetches the whole media folder, sequences included. The `/media/*` rule now
covers `public/media/seq` as well, which is where nearly all the weight is. The
`/frames/*` rule is dead — that directory no longer exists — but it is harmless.

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
