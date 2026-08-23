# Jalan Projects — Design System

**Direction name: "Whiteprint"**

---

## 1. The thesis

Jalan Projects is not a construction company in the way the phrase is normally used. It is a
**land and industrial infrastructure partner**. Half the business is the ability to produce land —
any size, any district in West Bengal. The rest is turning that land into a specific building a
specific business asked for.

The buyer is an industrialist, a 3PL operator, an FMCG distributor, a manufacturer expanding into
the east. Their fear is not "will it look nice." Their fear is: unclear title, no approach road, no
power, brokers in the middle, eighteen months of nothing. What they want is **certainty about land**.

So the site does not sell atmosphere. It sells **measurement**.

Every visual decision below comes from the instruments this business actually uses: the survey
drawing, the cadastral plot map, the diazo whiteprint, the dimension line, the steel section
elevation, the drawing title block.

**Rejected directions and why**

| Rejected | Why |
|---|---|
| Cinzel / Josefin Sans, cream + gold | Luxury villa realtor. Wrong buyer entirely — nobody signs a 12-acre industrial lease because the headline had Roman capitals. |
| Glassmorphism, trust teal | SaaS dashboard idiom. Has no relationship to land, steel, or soil. |
| Slate grey + safety orange | The construction-industry default. Every competitor already looks like this; using it guarantees you are indistinguishable. |
| Hard-hat / crane / sunset-over-site hero photography | Generic stock language. Says nothing only Jalan can say. |

---

## 2. Color — "Whiteprint & Oxide"

Engineering drawings moved from cyanotype (white lines on blue) to diazo whiteprint (blue-black
lines on warm off-white paper). The site uses **both**, and the switch between them means something.

### Light register — the paper. Default for ~75% of the site.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#E7E5DE` | Base ground. Diazo print stock — warm, but greyer and cooler than the usual cream. |
| `--paper-hi` | `#F2F1EC` | Raised plane: cards, sticky nav, form fields. |
| `--ink` | `#111820` | Primary text. Near-black with a blue cast, never pure `#000`. |
| `--graphite` | `#5C6670` | Secondary text, grid lines, dimension lines, rules. |
| `--oxide` | `#A8412A` | **The accent.** Redline markup + West Bengal laterite soil. |
| `--survey` | `#D8E5EA` | Pale cyanotype wash. Plot fills, hatch, chart areas. |

### Dark register — the cyanotype. Reserved, not decorative.

Used for exactly three things: the **industrial parks** section, the **numbers/scale** band, and
the **footer**. The inversion reads as "this is the drawn, planned, engineered asset."

| Token | Hex | Role |
|---|---|---|
| `--prussian` | `#13293D` | Inverted ground. |
| `--prussian-hi` | `#1C374C` | Raised plane on dark. |
| `--graphite-hi` | `#8A9AA8` | Secondary text on dark. |
| accent on dark | `--survey` `#D8E5EA` | The accent flips to the cyan wash. |

### Contrast — verified, not assumed

| Pair | Ratio | Verdict |
|---|---|---|
| `--ink` on `--paper` | **14.1:1** | AAA |
| `--graphite` on `--paper` | **4.64:1** | AA body text |
| `--oxide` on `--paper` | **4.82:1** | AA text, AA+ for UI/non-text |
| white on `--oxide` | **6.08:1** | AA — CTA buttons safe |
| `--paper` on `--prussian` | **11.8:1** | AAA |
| `--graphite-hi` on `--prussian` | **5.18:1** | AA |
| `--survey` on `--prussian` | **11.6:1** | AAA |
| `--oxide` on `--prussian` | **2.46:1** | **FAILS** |

**Hard rule:** `--oxide` never carries text or meaning on the dark register. On `--prussian` it may
appear only as a decorative 2px rule or boundary stroke where the information is redundant. The
informational accent on dark is `--survey`.

### Discipline

One accent. `--oxide` on light, `--survey` on dark. It appears on: the primary CTA, the active
dimension callout, the boundary stroke as it draws, and the current nav item. Nowhere else. If a
third colour starts to feel necessary, the layout is wrong, not the palette.

---

## 3. Typography

Three roles, chosen for engineering authority rather than luxury signalling.

| Role | Face | Why this one |
|---|---|---|
| **Display** | **Archivo** (variable, `wdth` 110–125, `wght` 600–700) | A grotesk with a real width axis. Set expanded, it reads as *horizontal extent* — as frontage, as land. Sober enough for industrial B2B; nobody else in this category uses a width axis. |
| **Body** | **IBM Plex Sans** (400 / 500 / 600) | Plex was drawn for an engineering and industrial context. Not Inter — Inter is the reflexive default and reads as generic product UI. |
| **Data / utility** | **IBM Plex Mono** (400 / 500) | The drafting-adjacent mono. Carries every number, label, code, and dimension on the site. |

All three are free, on Google Fonts, and self-hostable via `next/font` (do self-host — no
render-blocking third-party request).

### The typographic move

**Every quantity on this site is set in IBM Plex Mono with `font-variant-numeric: tabular-nums`.**
Acres, square feet, clear height, tonnage, years, plot codes, district counts. Not "styled like"
data — actually all of it, without exception. The effect is that the site reads as a spec sheet
rather than a brochure, which is exactly what the buyer is trying to get from you.

Display type appears at **only two sizes**: the hero statement and section heads. Restraint here is
what stops the page looking like a template with a font swap.

### Scale (fluid)

```css
--fs-display-xl: clamp(2.75rem, 7vw, 7rem);    /* Archivo 700, wdth 125, lh 0.92, tracking -0.02em, UPPERCASE */
--fs-display-l:  clamp(2rem, 4vw, 3.5rem);     /* Archivo 700, wdth 118, lh 1.0,  tracking -0.015em */
--fs-title:      1.375rem;                      /* Plex Sans 600, lh 1.25 */
--fs-lead:       1.25rem;                       /* Plex Sans 400, lh 1.5 */
--fs-body:       1.0625rem;                     /* Plex Sans 400, lh 1.6, max-width 68ch */
--fs-numeral:    clamp(2rem, 4vw, 3.25rem);     /* Plex Mono 500, tabular-nums */
--fs-label:      0.75rem;                       /* Plex Mono 500, UPPERCASE, tracking 0.12em */
```

---

## 4. Layout — "The Site Plan"

### The sheet

A fixed drafting grid overlays the entire document: 1px `--graphite` lines at **6% opacity**, 96px
module, `position: fixed`, `pointer-events: none`, sits under content. Barely perceptible. Its job
is to make every section feel measured on the same sheet rather than assembled from blocks.

At `prefers-reduced-transparency` or on low-end devices it can be dropped entirely with no loss.

### The grid

12 columns, 24px gutters, max content width 1440px, page margin `clamp(20px, 5vw, 96px)`.

Composition is **deliberately asymmetric**, the way a drawing sheet is: the drawing area on one
side, the title block on the other. Text blocks sit in columns 2–6 or 7–12; imagery bleeds off one
edge. Never centre a section unless it is genuinely the terminal CTA.

### The title block

Every major section carries a small mono title block in its top-right corner, mirroring a real
drawing sheet. It carries **real data only** — never invented sequence numbers for decoration:

```
SECTION 02 · INDUSTRIAL PARKS · 3 LOCATIONS · HOWRAH, WB
```

Numbering is used in exactly one place — the **process** section — because that content genuinely
is an ordered sequence and the order is information the reader needs. The six business lines are
*ordered by weight of business* but are not numbered, because publishing an internal revenue ratio
is not something the customer needs to see.

### Spacing

8px base unit. Section rhythm: `--space-section: clamp(96px, 12vw, 200px)`. Generous — this is a
low-density, high-consideration page, not a dashboard.

### Radius, shadow, borders

- `--radius: 2px` on interactive elements only. Everything structural is **square**. Drawings do
  not have rounded corners.
- **No box-shadows.** Depth comes from the paper/prussian plane change and from 1px `--graphite`
  hairlines at 25% opacity.
- Images are never bare: each gets **corner brackets** (four L-shaped 1px marks, `--graphite`) that
  draw on entry — the surveyor's crop mark.

---

## 5. Signature — Scale, made comprehensible

**Nobody can feel an acre.** A buyer reads "18.4 acres" and forms no picture at all. Closing that gap
is the site's actual job, and it is an information-design problem solved by motion — which is
fortunate, because the numbers are strong and the imagery is thin.

The drawing language below is the vocabulary. `SCROLL-CHOREOGRAPHY.md` is where it becomes scenes,
and the two signature moments live there: the **Scale Comparator** (scene 4) and the **Frame
Assembly** (scene 6).

**Everything else stays quiet to let those two land.**

### Where it lives

Client decision: the **hero is photography-led** — a full-bleed aerial loop with the headline over
it. The Boundary Draw therefore does not carry the hero. It carries everything below it, and it
carries the pages where we have no photography at all.

This turns out to be the stronger arrangement, because there is currently **no real imagery of any
kind** (see `PLAN.md` §5). A drawing is honest where a generated photograph is not — nobody mistakes
a section elevation for a photograph, so the drawing language can do the work that photography would
otherwise have to, without asking the viewer to believe something false.

### The mechanic

In SVG, on scroll entry:

1. A plot boundary strokes itself on (`stroke-dashoffset`, 900ms, `power2.inOut`), `--oxide`, 2px.
2. Corner nodes snap in as 6px squares, staggered 60ms.
3. Dimension lines extend outward with arrow ticks, and mono labels count up — `1,240 FT`,
   `18.4 ACRES`.

### Where it recurs — consistency is the point

| Surface | Treatment |
|---|---|
| **Hero (restrained)** | Video is framed by corner brackets that draw on load, plus **one** dimension line with a single mono label along the lower edge. That's all — the identity is present, the video is the subject. |
| **Three parks** | Each park's plot outline draws over its aerial plate, with internal road lines and available-plot fills in `--survey`. This is the main visual on those pages. |
| **Build-to-suit** | A **portal-frame section elevation** — the steel shed cross section — draws itself, with clear span dimensioned across and eave height marked vertically. Replaces the interior photography we don't have, and communicates more. |
| **Land / West Bengal** | District boundaries draw rather than pins dropping. |
| **Every image** | Corner brackets, four L-shaped 1px `--graphite` marks, drawn on scroll entry. |

### The risk being taken, and the justification

The bold move is now below the fold rather than in it: the site's most memorable moments are
technical drawings, not renders. For a company whose product is land of a given size in a given
place, dimension *is* the promise. It also means the site's credibility does not rest on imagery
that cannot currently be produced honestly.

### Generated imagery — labelling

Any aerial or site plate that is generated rather than photographed carries a small mono label in
the corner: `INDICATIVE VISUALISATION`, `--fs-label`, `--graphite`. This is normal practice in
Indian property marketing ("artist's impression") and costs nothing in credibility — whereas being
caught presenting a generated warehouse as a real one costs everything.

**Generated buildings are not used anywhere on this site.** Generated land, at altitude, only.

---

## 6. Motion

**Library:** GSAP 3.13 + `@gsap/react` (`useGSAP`) + ScrollTrigger. Scroll is native — there is no
smooth-scroll library. See SCROLL-CHOREOGRAPHY.md § Scroll is native.
As of GSAP 3.13 the former Club plugins (SplitText, Flip, DrawSVG, ScrollSmoother) are free —
verify licensing terms at build time. The boundary draws use plain `stroke-dashoffset` regardless,
so they carry no plugin dependency.

`syncTouch: false` is deliberate — native momentum on touch is smoother than a synced emulation,
and syncTouch is the usual cause of janky mobile scroll on sites like this.

### Motion budget

| Move | Spec |
|---|---|
| Element reveal | `opacity 0→1`, `y 14→0`, 350ms, `power2.out`, stagger 0.06 |
| Boundary / bracket draw | `stroke-dashoffset`, 900ms, `power2.inOut` |
| Number count-up | 1200ms, snap to integer, tabular-nums so width never shifts |
| Hover (links, cards) | 180ms, `power1.out` |
| Page transition | Flip on the shared park image, 600ms `expo.inOut` |
| Parallax | `yPercent` delta ≤ 12, background layers only — never text |

**Pin budget — responsive, not fixed.** See `SCROLL-CHOREOGRAPHY.md` for the full scene spec.

| Viewport | Pins |
|---|---|
| ≥1024px | **3** — Scale Comparator, Three Parks, Frame Assembly |
| 768–1023px | **1** — Frame Assembly only |
| <768px | **0** — all scenes become stepped reveals |

Three pins is the ceiling and all three earn it by carrying information, not effect. Pinning is the
main way "premium animated" sites become unusable on a mid-range Android, which is most of this
audience — hence zero on mobile. **The information never degrades across breakpoints, only the
choreography does.** Text is never parallaxed and never split-animated beyond the hero headline.

**The test every scene must pass:** remove it — is a fact lost? If not, cut it. That test is what
separates this from a showreel.

### Reduced motion

Wrap everything in `gsap.matchMedia()`. Under `prefers-reduced-motion: reduce`: motion does not
initialise, all boundaries and brackets render in their final state, counters show final values, no
pins, no scrubs, no parallax. Opacity-only fades at 200ms are retained — the page should still feel
alive, just not kinetic.

---

## 7. Quality floor

- Responsive at 375 / 768 / 1024 / 1440. No horizontal overflow at any width.
- Visible keyboard focus everywhere: `2px solid var(--oxide)`, `outline-offset: 3px`. Focus rings
  are never removed.
- Touch targets ≥ 44×44px with ≥ 8px separation.
- SVG icons only (Lucide). No emoji as icons.
- All imagery has real alt text describing the site or building, not "image".
- Every image and video reserves its aspect ratio — target CLS < 0.05.
- `cursor: pointer` on everything clickable.
- Bengali and long district names must not break layout — test with the longest real names.

---

## 8. Voice

Plain, specific, unembellished. The buyer is a decision-maker who wants numbers.

- **Say:** "12 acres available at Sankrail, on NH-16." **Not:** "Unlock your industrial potential."
- Buttons name their outcome: "Send enquiry" → toast "Enquiry sent." Never "Submit."
- Numbers wherever a number exists. Vague scale claims are worse than no claim.
- Empty and error states give direction, not apology: "No plots match that size at this park. Try a
  wider range, or send us the requirement and we'll source it." — which is literally true, and is
  also the strongest sentence on the site.
