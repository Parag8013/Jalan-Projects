# Scroll Choreography — Motion-graphics scroll narrative

The core document for this build. `DESIGN-SYSTEM.md` decides how it looks; `VIDEO-PROMPTS.md`
supplies the footage; this decides how the two move together.

---

## The form

**Video is the medium. Scroll is the transport.**

The site is one continuous cinematic sequence. Full-bleed footage carries the visitor from the widest
possible view of West Bengal down to a specific floor slab, and data graphics resolve on top of the
footage at timed beats. Closer to an Apple product page than to a brochure.

Two kinds of scene:

| Kind | Behaviour | Used for |
|---|---|---|
| **Scrubbed** | Scroll position drives the video frame. The visitor moves the camera. | V2, V5, V7 — the three big moments |
| **Ambient** | Video autoplays and loops; scroll drives the graphics over it | V1, V3, V4, V6, V8, V9 |

### What the graphics do

Footage alone is atmosphere. The graphics are what make it *information*.

The drawing language from `DESIGN-SYSTEM.md` — boundaries, dimension lines, corner brackets, mono
figures — now lives **on top of real footage** rather than on an empty ground. A clear-span dimension
drawn across a warehouse interior while the camera retreats does something no standalone diagram can:
it puts a number on a space you are currently moving through.

That combination is the whole design. Neither half works alone.

---

## Technical approach — the one decision that matters

**Scrubbed scenes use image sequences on canvas, not `<video>` + `currentTime`.**

Driving `video.currentTime` from scroll is the obvious approach and it fails in practice: browsers
seek to the nearest keyframe, so scrubbing stutters, and iOS Safari refuses to seek reliably at all.
Every polished scroll-video site draws decoded frames to a `<canvas>` instead.

| | Approach | Cost |
|---|---|---|
| **Scrubbed (V2, V5, V7)** | Extract to ~240 JPG/WebP frames, preload, draw to `<canvas>` on scroll | More requests, but ImageKit serves them and it is the only approach that is actually smooth |
| **Ambient (all others)** | `<video muted playsinline loop autoplay>` with a poster | Trivial |

### Frame extraction

```bash
ffmpeg -i v7-interior.mp4 -vf "fps=24,scale=1600:-2" -q:v 6 frames/v7/%04d.jpg
```

24fps over a 16s clip is ~380 frames. Serve at three widths via ImageKit and pick by device pixel
ratio. Budget ~40–60KB per frame at 1600px — around 8–12MB for a full sequence, preloaded during the
preceding scene so it is ready before the scrub begins.

**Mobile:** no scrubbing. The clip plays once on entry as ordinary autoplay video, graphics animate
on a timer instead of on scroll. Identical information, no frame sequence downloaded.

---

## The narrative

Ten scenes. Each names its footage, its behaviour, and what the graphics carry.

### 1 · Opening — `V1` ambient

Full-bleed aerial, looping. Corner brackets draw in, one dimension line along the lower edge, then
the headline sets.

> **LAND, ANYWHERE IN WEST BENGAL.**

On scroll out: footage scales to 1.06 and dims to 0.35 as the headline lifts away.

---

### 2 · Reach — `V1` continues, graphics take over

The claim gets proven before it gets repeated. Over the still-running aerial, an SVG of West Bengal
resolves and districts fill in sequence, counter climbing alongside.

**Data:** confirmed district count. If coverage is 8 districts solid with reach into others, show 8
solid and the rest outline — a buyer in Malda can tell whether you actually work in Malda, and the
honest version persuades harder than the maximal one.

---

### 3 · Descent — `V2` ⚑ SCRUBBED · `end: '+=250%'`

The first big moment. Scroll drives a continuous descent from high altitude down to a single parcel.
**The visitor flies the camera themselves.**

| Scroll % | Beat |
|---|---|
| 0–70 | Pure scrub. Descent only. No graphics — let the footage work. |
| 70–85 | Plot boundary strokes on around the parcel, `--oxide`, corner nodes snap in |
| 85–100 | Dimension lines extend, figures count up, size-range line sets |

Restraint in the first 70% is deliberate. The descent is the effect; decorating it would weaken it.

---

### 4 · Scale — graphics only, `--prussian` ground

**Nobody can feel an acre.** A plot rectangle grows through real size steps — 1 → 5 → 20 → 100 acres
— with warehouse units tiling inside it so growth stays legible. Ends with the boundary running past
the frame edge and one line: `ANY SIZE.`

Reference unit is **truck bays and unit counts**, never football fields. This audience thinks in bays
and clear span; a football-field comparison talks down to them.

Kept graphics-only and on the dark ground so it reads as a deliberate pause between two film
sequences. Pacing needs the contrast.

---

### 5 · The parks — `V3` + `V4` ambient, `--prussian`

Register inverts: these are the owned, planned assets. Three panels scrub horizontally over the
approach footage. Per park — plot boundary draws, available parcels fill, four counters run (total
area, available area, power sanction, distance to Kolkata), connectivity distances type in as a
dimension list.

**Connectivity numbers close industrial deals.** This scene deserves the most data attention of any
on the site.

---

### 6 · Structure — `V5` ⚑ SCRUBBED · `end: '+=200%'`

Scroll raises the camera alongside a steel portal frame, and **scroll direction is construction
sequence**. The mechanic and the subject are the same thing.

| Scroll % | Beat |
|---|---|
| 0–20 | Rise begins, footage only |
| 20–40 | Eave-height dimension extends up the columns, tracking the camera |
| 40–60 | Clear-span dimension draws across the rafters |
| 60–80 | Bay spacing, purlin and bracing annotations light in sequence |
| 80–100 | **Configurability beat** — span and eave figures scrub through their full ranges |

The existing `FrameDrawing` SVG survives here as the overlay layer, registered to the footage.

---

### 7 · Handover — `V6` ambient

Lateral track along the facade. Dock count and bay spacing annotate as the camera passes each door.

---

### 8 · Interior scale — `V7` ⚑ SCRUBBED · `end: '+=250%'` · the money shot

Camera retreats down the centre line of a vast empty column-free floor. The clear-span dimension
draws across the full width and **holds** as the camera pulls back — so the span visibly grows in
frame while the number climbs.

This is where "40 m clear span" stops being a number. Best single use of scroll on the site.

Floor load and eave height annotate in the final 20%.

---

### 9 · In operation — `V8` ambient

Loading yard from above. Throughput and dock figures count up.

---

### 10 · Close — `V9` ambient, into enquiry

Camera rises and pulls back over the landscape. Final line sets, then the enquiry form.

**Motion stops at the form.** The visitor has arrived to act; animation now is friction. Fields
reveal once, then the section is still.

---

## Pin budget

| Viewport | Pins |
|---|---|
| ≥1024px | **3** — scenes 3, 6, 8 (the three scrubbed sequences) |
| 768–1023px | **1** — scene 8 only |
| <768px | **0** — all scrubbed scenes become autoplay with timed graphics |

Information never degrades across breakpoints. Only the choreography does.

---

## Performance

Video-led sites fail on weight, not on animation. Hard budgets:

| Item | Budget |
|---|---|
| Hero video (V1) | ≤ 2.5MB, poster always present |
| Ambient clips | ≤ 2MB each, `preload="none"` until their section approaches |
| Frame sequence | ≤ 12MB per scrubbed scene, preloaded during the *preceding* scene |
| Home route JS | < 200KB gzipped |
| LCP | < 2.5s on 4G — hero **poster image** is the LCP element, never the video |

**Never let video block LCP.** The poster is a real image with `priority`, the video loads after.

Loading discipline: a sequence starts preloading when the previous scene enters, tracked by
ScrollTrigger. Show a thin progress indication if frames are not ready rather than scrubbing a
half-loaded sequence.

**Save-Data and slow connections:** `navigator.connection.saveData` or `effectiveType` of `2g`/`3g`
skips frame sequences entirely and falls back to posters plus graphics. The information survives; the
cinema does not.

**Reduced motion:** no scrubbing, no autoplay. Poster frames, final graphic states, 200ms opacity
fades only.

---

## Build order

1. **Scenes 3, 6, 8** — the scrubbed sequences. Blocked on V2, V5, V7 only.
2. Canvas scrub engine + frame preloader — buildable now against placeholder frames.
3. Scene 4 (Scale) — graphics only, no footage dependency.
4. Ambient scenes — trivial once the language is set.
5. Enquiry, footer, SEO, QA.

The scrub engine is the one piece of real engineering here and it has no asset dependency. It gets
built while the footage generates.
