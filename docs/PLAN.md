# Jalan Projects — Build Plan

Companion to `DESIGN-SYSTEM.md`. That file decides how it looks and moves; this one decides what
gets built, with what, and in what order.

---

## 1. What the business actually sells

Ordered by weight of business. This order drives site hierarchy.

| # | Line | Share | Notes |
|---|---|---|---|
| 1 | **Land sourcing across West Bengal** | ~50% | Any size, any district. This is the flagship and gets the largest, most-invested page. |
| 2 | **Three owned industrial parks** | Major | Sankrail Industrial Park (Dhulagori, Howrah) · Jalan Industrial Park (Amta Road, Howrah) · Amta Industrial Park (Amta Road, Howrah). Any size plot within them. |
| 3 | **Build-to-suit warehouses** | | Built to customer spec, handed over. |
| 4 | **Factory sheds** | | Built to customer spec, handed over. |
| 5 | **Logistics warehouses** | | Customised to logistics operator needs. |
| 6 | **General construction inside the parks** | Minor | Any building from scratch. Present, but not headlined. |

The single strongest sentence available: **"If we don't have it, we'll find it."** Lines 1 and 2
together mean this company can almost always produce land. That is the site's whole argument.

---

## 2. Tech stack

### Framework — **Next.js 15, App Router**

Not Vite. The money keywords here are local and high-intent: *industrial land Howrah*, *warehouse
for rent Dhulagori*, *factory shed West Bengal*, *industrial plot NH-16*. A client-rendered SPA
throws that away. Next gives server rendering, per-route metadata, sitemap, and `LocalBusiness` +
`Place` JSON-LD for all three parks — which for a business like this is worth more than the
animation budget. It also leaves the door open for ISR on a live plot-availability page.

React 19, TypeScript strict.

### Styling — **Tailwind v4** (CSS-first `@theme`) + a tokens layer

All tokens from `DESIGN-SYSTEM.md` §2–4 live as CSS custom properties in `app/tokens.css` and are
exposed to Tailwind through `@theme`. No raw hex anywhere in a component.

### Motion — **GSAP 3.13 + `@gsap/react` + ScrollTrigger + Lenis**

`useGSAP()` for automatic cleanup on unmount (critical in App Router — leaked ScrollTriggers across
route changes are the #1 cause of scroll jank on sites like this). One `<SmoothScroll>` provider in
the root layout owns the Lenis instance. `ScrollTrigger.refresh()` after fonts and hero media load.

### Media — **ImageKit**

- Custom ImageKit loader for `next/image` — keeps `sizes`, `priority`, and layout stability while
  ImageKit does format negotiation (AVIF/WebP), resize, and CDN delivery.
- Aerial and site stills: ImageKit URL transforms, `tr:q-75,f-auto`.
- Hero video: ≤ 6s silent loop, ≤ 2.5MB, `muted playsinline preload="metadata"`, poster frame
  always present, `<source>` for WebM + MP4. Never autoplay video on `prefers-reduced-motion` or on
  metered connections (`navigator.connection.saveData`).
- Park walkthroughs: ImageKit adaptive streaming (HLS), click-to-play only.

### Backend — **none**

Client chose email + WhatsApp for leads, and declined a lead database. That removes the only thing
Supabase was load-bearing for, so v1 ships with **no database at all**.

Content (three parks, plot specs, connectivity figures, service specs) lives as **typed TypeScript
content files in the repo** — `content/parks.ts`, `content/services.ts`. With three parks, content
that changes maybe twice a year, and no live availability data in existence yet, a database would be
infrastructure serving nothing. Typed content also means a wrong field name is a build error rather
than a blank space on a live page.

**Add Supabase later, not now** — the trigger is real plot-level availability that changes often
enough that a redeploy is annoying. Until then it's cost and surface area for no gain.

Skip a CMS in v1 for the same reason. If editorial appetite appears later (news, case studies), add
Sanity then.

### Leads — Resend + WhatsApp

Two separate channels, both wired:

**1. Enquiry form → email.** Server action → `zod` validate → **Resend** sends a formatted enquiry to
sales. Includes requirement type, area needed, preferred location, timeline, contact. Reply-to set
to the enquirer so sales can respond from their inbox in one tap.

**2. Enquiry form → WhatsApp notification to sales.** Requires **WhatsApp Business Cloud API** (Meta
Business account + a pre-approved message template, since this is business-initiated). Budget a day
for setup and template approval — approval is not instant and is the one item here that can slip.
Twilio's WhatsApp API is the fallback if Meta approval stalls.

**3. Also ship click-to-WhatsApp for the visitor** — a plain `wa.me` link in the nav, footer, and
sticky mobile bar. Zero backend, zero approval, and in this market it will almost certainly
out-convert the form. Track every tap.

There is no lead database, so **email delivery is the single point of failure**. Send to a shared
sales alias rather than one person's inbox, and add a second BCC recipient. A dropped email is a
lost deal with no record that it existed.

### Forms
`react-hook-form` + `zod`. Honeypot field + **Cloudflare Turnstile**. Server action → Resend →
WhatsApp notification. Optimistic UI, explicit success state, and the enquirer's details echoed back
so they know what was sent.

### Analytics
GA4 + Vercel Analytics. Track **phone tap**, **WhatsApp tap**, and **form submit** as three separate
conversions. In this market the first two outnumber form fills, and a site measuring only form
submissions will look like it's underperforming when it isn't.

### Hosting
Vercel. Custom domain, `www` → apex redirect, Vercel Image/Edge caching.

### Full dependency list

```
next react react-dom typescript
tailwindcss @tailwindcss/postcss
gsap @gsap/react lenis
react-hook-form zod @hookform/resolvers
resend
lucide-react
```

Sitemap and robots via `app/sitemap.ts` and `app/robots.ts` — no extra dependency. No database
client, no ORM, no auth. Deliberately small.

---

## 3. Site architecture

| Route | Purpose |
|---|---|
| `/` | Home — the full argument in one scroll |
| `/land` | Land sourcing across West Bengal. **The flagship page.** District coverage, size range, title/diligence process, "tell us the requirement" form. |
| `/industrial-parks` | Index of the three parks, comparison table |
| `/industrial-parks/sankrail` | Sankrail Industrial Park, Dhulagori, Howrah |
| `/industrial-parks/jalan-amta-road` | Jalan Industrial Park, Amta Road, Howrah |
| `/industrial-parks/amta` | Amta Industrial Park, Amta Road, Howrah |
| `/warehouses` | Build-to-suit warehousing |
| `/factory-sheds` | Factory shed construction |
| `/logistics-warehouses` | Logistics-specific warehousing |
| `/projects` | Completed work |
| `/about` | Company, scale, leadership |
| `/contact` | Enquiry form, all three park locations, direct lines |

Separate pages for warehouses / factory sheds / logistics rather than tabs on one page — they share
a template but each targets a distinct search intent. That is worth three routes.

### Each park page carries

Plot plan (animated boundary) · total area and available area · connectivity (NH-16 / Kona
Expressway / Amta Road, distance to Kolkata, Haldia port, airport, nearest rail) · power supply and
sanction capacity · road width inside park · water · drainage · security · current occupants or
sectors · available plot sizes with an enquiry CTA per plot.

Connectivity is what actually closes these deals. Give it real numbers, not a vague map.

---

## 4. Home page — section order

Full scene-by-scene spec, including scroll percentages, data requirements and fallbacks, lives in
**`SCROLL-CHOREOGRAPHY.md`**. Summary:

| # | Scene | Register | Motion |
|---|---|---|---|
| 1 | **Hero** — full-bleed aerial loop. *"Land, anywhere in West Bengal."* | Video | Brackets draw + one dimension line |
| 2 | **Capability ledger** — six lines as a drawing schedule table, not cards | Paper | Rules draw, staggered rows |
| 3 | **Coverage** — WB districts draw in, proving *anywhere* | Paper | Scrub, counter to district total |
| 4 | **Scale Comparator** — plot grows 1 → 5 → 20 → 100 acres, proving *any size* ⚑ | Paper → Prussian | **PINNED** |
| 5 | **Three parks** | **Prussian** | **PINNED** horizontal scrub |
| 6 | **Frame Assembly** — steel shed builds itself, stage by stage ⚑ | Paper | **PINNED** |
| 7 | **Scale band** — acres, sq ft, years, parks, districts | **Prussian** | Mono counters |
| 8 | **Land process** — requirement → diligence → conversion & mutation → possession | Paper | Scrub timeline |
| 9 | **Enquiry** | Paper | Focus-driven only |
| 10 | **Footer** | **Prussian** | None |

Scenes 4 and 6 are the signatures and carry the site. Scene 8 is the quiet trust-builder — naming
conversion and mutation explicitly addresses the exact fear a West Bengal land buyer arrives with.

---

## 5. Asset plan

**Current position: no photography, no drone footage, no survey drawings.** Everything is generated
(Google Flow) for v1, and replaced with real assets when they exist.

This constrains what the site can honestly show, and the plan is built around that constraint rather
than pretending it away.

### The rule: generate land, never buildings

| Generate | Do not generate |
|---|---|
| High-altitude aerial of flat land — fields, plot divisions, a highway edge, a canal | Warehouses, factory sheds, any building presented as one of yours |
| Slow orthographic-ish top-down drift over open land | Loading docks, trucks, workers, signage, gates |
| Abstract texture — soil, laterite, concrete, steel surface, at macro scale | Interiors of any kind |
| Ambient section transitions | Anything with readable text, logos, or number plates |

Generated **land at altitude** holds up: it is generic by nature, and no viewer forms an expectation
that a specific field is a specific field. Generated **buildings** do not hold up. A prospective
lessee looks closely at exactly those images, and the failure mode — being caught showing a
warehouse that doesn't exist — destroys the credibility this site exists to build.

### What replaces the building photography

The drawing language, deliberately. See `DESIGN-SYSTEM.md` §5.

- **Build-to-suit / factory sheds / logistics** → animated portal-frame section elevations with real
  spec annotation (clear span, eave height, floor load, bay spacing, roof pitch). More informative
  than a photograph, and honest.
- **Park pages** → generated aerial plate + the plot-boundary SVG overlay carrying the real
  geometry. The drawing carries the meaning; the plate is texture beneath it.
- **Projects page** → hold until real photos exist. **Do not populate it with generated buildings.**
  Ship v1 without `/projects`, or ship it as a spec-led list (type, area, location, year, clear
  height) with no imagery. A specification table with no photos reads as discreet; a generated photo
  reads as fraudulent.

### Labelling

Every generated plate carries `INDICATIVE VISUALISATION` in the corner — mono, `--fs-label`,
`--graphite`. Standard Indian property-marketing practice, costs nothing, removes all risk.

### Plot geometry

The plot boundaries need to be *approximately true* even if drawn by hand. Sources, in order of
preference: existing survey drawings → the parks' own layout plans → traced from satellite imagery
against known total acreage. Boundary shapes that are visibly wrong are worse than no boundary at
all, since the whole design argues that this company is precise about land.

### Replacement plan

Structure every media reference so swapping in real assets is a URL change in one manifest file, not
a component rewrite. When the drone day happens, the site should upgrade in an afternoon.

**Priority when budget appears:** a single drone day across all three parks, including a top-down
orthographic pass over each — that frame is what the plot boundary SVG registers against, and it is
the highest-leverage asset on the entire project.

---

## 6. Build phases

| Phase | Scope |
|---|---|
| **0 — Foundation** | Next 15 + TS + Tailwind v4 scaffold, tokens layer, self-hosted fonts, Lenis + GSAP provider, reduced-motion matchMedia harness, base layout, drafting grid overlay |
| **1 — Signature scenes** | **Frame Assembly (scene 6), then Scale Comparator (scene 4).** Both are pure SVG + GSAP with zero media dependency, so they can be built and judged immediately while Flow generation runs in parallel. If the Scale Comparator doesn't produce the intended "oh — *that's* how big" reaction, that must be discovered in week one. |
| **1b — Media generation** | In parallel: hero aerial loop and plates in Flow against `ASSET-PROMPTS.md`, graded to palette, onto ImageKit |
| **2 — Hero + shell** | Hero with real generated footage, nav, footer, tokens, Lenis/GSAP provider. Gate: does the generated aerial hold at full-bleed on a 27"? |
| **3 — Home** | Remaining scenes 2, 3, 5, 7, 8, 9, ImageKit loader, all reveals, counters |
| **4 — Park pages** | Shared template, three instances, plot boundary SVGs, connectivity data |
| **5 — Service pages** | `/land` (flagship, most content), warehouses, factory sheds, logistics — each with its own section elevation |
| **6 — Leads** | Enquiry server action, Turnstile, Resend, WhatsApp Cloud API + template approval, click-to-WhatsApp, conversion tracking |
| **7 — SEO & content** | Metadata per route, JSON-LD (`Organization`, three × `Place`/`LocalBusiness`), sitemap, robots, OG images, real copy pass |
| **8 — Performance & QA** | Lighthouse ≥ 95 mobile, CLS < 0.05, LCP < 2.5s on 4G, mid-range Android scroll test, keyboard pass, screen-reader pass, 375/768/1024/1440 |

**Phases 1 and 2 are real gates**, with two independent failure modes. Phase 1: if the Scale
Comparator and Frame Assembly don't carry the information load on their own, the site needs
photography sooner than planned and the timeline changes. Phase 2: if the generated aerial doesn't
hold at full-bleed on a large screen, the hero changes there — rather than after ten pages depend on
it. Both are cheap to learn now and ruinous to learn in phase 8.

The sequencing matters: **phase 1 needs no assets at all.** Frame Assembly and the Scale Comparator
are pure SVG. Real work is on screen while Flow generation and data gathering are still running.

Start WhatsApp Business API registration during phase 1 — template approval is the one dependency
here that is outside our control and it should not be discovered late.

---

## 7. Performance guardrails

Non-negotiable, because "tons of animations" and "smooth" are in tension and the animation loses.

- LCP < 2.5s on simulated 4G. Hero text is server-rendered and never animated in from `opacity: 0`
  without a no-JS fallback.
- CLS < 0.05. Every image and video declares its aspect ratio.
- GSAP animates `transform` and `opacity` only. Never `width`, `height`, `top`, `left`.
- `will-change: transform` on parallax layers only, removed once scroll settles.
- ScrollTrigger instances all created inside `useGSAP()` scoped to their component so route changes
  clean up completely.
- Test on a mid-range Android over 4G, not a MacBook on wifi. That is the actual audience device.
- Total JS on the home route: target < 200KB gzipped.

---

## 8. Decisions taken

| Decision | Choice |
|---|---|
| Hero | Photography-led — full-bleed aerial loop, headline over it |
| Boundary Draw | Moved off the hero; carries parks, build-to-suit, and the WB map |
| Imagery | All generated for v1. Land only, never buildings. Labelled `INDICATIVE VISUALISATION`. |
| Backend | None. Typed content files in-repo. Supabase deferred until live plot availability exists. |
| Leads | Resend email to a shared sales alias + WhatsApp Cloud API notification + click-to-WhatsApp for visitors |

---

## 9. Open questions — blocking

These are load-bearing. The site's entire argument is quantitative, and placeholder numbers on a
page built to look precise is the one failure this design cannot survive.

1. **The numbers.** Total acres across the three parks, available area at each, years in operation,
   total sq ft delivered, number of districts covered. Needed before phase 3.
2. **Plot geometry.** Any layout plan, survey drawing, or even a hand sketch with approximate
   dimensions for the three parks. Without it the boundaries get traced from satellite against known
   acreage — workable, but a visibly wrong boundary undermines a site that claims precision about
   land. Needed before phase 4.
3. **Connectivity figures.** Distance from each park to Kolkata, Haldia port, NSCBI airport, nearest
   rail siding, and which highway each sits on. This is what actually closes these deals.

### Non-blocking, but decide before phase 7

4. **Occupant names / client logos** — usable publicly, or confidential? Changes how the trust
   section is built.
5. **Bengali language version** — needed, or is English sufficient for this buyer? Affects font
   loading (Noto Sans Bengali) and routing, so cheaper to decide early than to retrofit.
6. **`/projects` page** — ships empty or spec-only until real photography exists. Confirm that's
   acceptable, or cut the route from v1 navigation entirely.
