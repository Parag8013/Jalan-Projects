# Scroll Choreography

The core document for this build. `DESIGN-SYSTEM.md` decides how it looks; `FLOW-PROMPTS.md`
supplies the footage; this decides how the two move together.

---

## The form

**Film is the medium. Scroll is the transport.**

The site is one dark theatre. Three scenes are scroll-scrubbed film — the visitor turns the wheel and
drives the camera — and everything between them is either a looping ambient scene or type on the
dark ground.

The spine is the hero: scroll builds a building out of light, from an empty plot through frame,
cladding and glazing to a lit finished shed. When the assembly lands, a slow orbit of the same
building takes over the background and loops.

---

## Why frame sequences and not `<video>`

Driving `video.currentTime` from scroll is the obvious approach and it fails. Browsers seek to the
nearest keyframe, so the scrub stutters; iOS Safari will not seek reliably at all. Encoding
all-intra fixes the seeking and triples the file.

So scrubbed scenes are **decoded JPEG sequences painted to a canvas**, which is what every polished
scroll-video site actually ships. `scripts/prepare-media.sh` turns a Flow export into one.

| | Approach |
|---|---|
| **Scrubbed** (assembly, orbit, interior) | ~210 frames at 1200px, painted to `<canvas>` on scroll, `scrub: 0.4` |
| **Ambient** (land, close) | `<video muted playsinline loop>`, fetched only as its section approaches |
| **Mobile, all scenes** | The clip itself, played once on entry. No sequence is ever downloaded |

### Three details in `ScrubSequence` that matter

**Frames load coarse-to-fine, not in order.** Requesting 0, 1, 2… means the last third of the scene
is still missing when a fast scroller reaches it. The loader walks the strip at stride 8, then 4,
then 2, then 1 — so after roughly an eighth of the bytes the whole scrub is already covered at a low
frame rate, and everything after that just fills in.

**A missing frame paints its nearest decoded neighbour**, and asks for itself out of turn. Without
the fallback the canvas holds the last frame it managed to draw, and a fast scroll through a
half-loaded sequence freezes instead of running rough — degrading to a lower frame rate is always
better than degrading to a still. Without the demand request, the frame the visitor is actually
looking at waits its turn behind two hundred it cannot see.

**No more than twelve requests are in flight at once.** This is the one that decides whether the
coarse pass means anything. Firing all 210 at once looks like it must be fastest and over HTTP/2 it
is the opposite: the server round-robins every open stream, so the last frame requested lands at
about the moment the first does, and the ordering above buys nothing at all.

| Against the deployed CDN | |
|---|---|
| All 210 in parallel | **3027 ms** before the strip is covered |
| 27-frame coarse pass, twelve at a time | **350 ms** |

Same bytes, same order. The only difference is the constraint — and three seconds of nearest-
neighbour fallback at the top of the page is most of what "unpolished" means.

### And one in `prepare-media.sh`

**The looping clips are played forward then backward.** Flow shots move at a constant speed and
never return to where they started — the orbit covers about 70 degrees of arc and stops facing the
gable end — so a plain `loop` jump-cuts back to frame one every time round. `pingpong()` concatenates
the clip with its own reverse, which makes the join seamless at the cost of doubling the file. The
camera visibly reverses direction, which on a slow drift against black is far less noticeable than a
cut. Only `orbit`, `loop-land` and `loop-close` get it; scrubbed sequences never loop.

The alternative is a crossfade loop, and it does not work here: blending a tail 70 degrees around
from the head double-exposes the building at two angles. Crossfading only helps when the ends
already nearly match.

---

## The assembly

One pin, 560 % of viewport, `scrub: 0.7`. Seven captions cross-fade against the footage.

| Progress | Beat | What the footage is doing |
|---|---|---|
| 0.00 | **Site** | Bare slab, motes gathering |
| 0.10 | **Foundation** | Pad footings landing in a grid |
| 0.28 | **Columns** | Steel columns extruding upward |
| 0.38 | **Portal frame** | Rafters closing to the ridge |
| 0.55 | **Cladding** | Roof and wall panels sealing, dock openings cut |
| 0.76 | **Glazing** | Glass condensing out of the particles |
| 0.87 | **Handover** | Complete, lit from within |
| 0.93 | — | The orbit loop takes the background |

**These numbers are tuned to the clip, never the other way round.** Generated video does not hit a
timing brief, so after new footage lands, scrub the hero in dev — a live percentage sits in the
bottom-right corner in development only — note where each stage actually arrives, and edit the
`BEATS` table in `components/scenes/Assembly.tsx`.

The last beat has to clear `HANDOFF` by a comfortable margin. The stage readout fades out one
percent after the handoff begins, so a caption placed at the handoff is on screen for a fraction of
a viewport and nobody reads it.

---

## Scroll is native

Nothing intercepts it. A wheel notch moves the page by exactly what the operating system says,
immediately, and the position the visitor lands on is the position they asked for.

This was not always true. The build carried Lenis for smooth scrolling and, later, a snapping engine
that took each gesture and drove the page to the next stage of the film. Both are gone, and the
reason is worth keeping because the snapping demoed well.

**Smoothing the page means the scroll position is no longer the number the visitor asked for.** Every
frame it is somewhere between where they were and where they are going, and every pin, every scrub
and every fixed element is recomputed against that moving approximation. When the frame budget is
free it is invisible. When something else on the frame is expensive — and painting a 1200px JPEG to a
canvas every frame is expensive — it stops tracking the input, and the result reads as lag and
stutter: exactly the failure it was there to prevent. Snapping compounded it, because a gesture that
does something other than what the hand did is only pleasant while it is perfectly smooth.

**Smoothing the film instead costs nothing and cannot fail that way.** `SCRUB` in `ScrubSequence`
eases the canvas toward the scroll position; the scroll position itself stays honest and instant, and
no layout depends on it. A wheel notch is ~100px, which at the hero's density is five frames at once,
so some easing is needed for the picture not to step — but it belongs on the picture.

---

## Two things that were got wrong, and why they are the way they are

**Type never crossfades with the ground behind it.** The first version faded the caption colour from
ink to white while the scene faded from cream to black. Both pass through the same mid grey at the
same instant and the copy disappears for a whole beat — and no ordering of the two fixes it, because
a crossfade always passes through the middle. Every scrubbed scene now puts its copy on a fixed
scrim at fixed contrast.

**Scrims follow the copy, not the composition.** The specification scene runs a heading down the left
edge and a spec sheet down the right, and a single right-weighted gradient left the heading sitting
on bare cladding. It now uses a flat base plus a reinforced column under each block of type.

---

## The running order

Twelve sections, all on the dark register. Rhythm comes from value steps between `void`, `carbon` and
`slate`, and from spacing the three scrubbed scenes apart — a visitor who has just driven one camera
for five viewports needs something to read before they drive another.

| # | Section | Ground | Motion |
|---|---|---|---|
| 01 | Assembly | film | **Pinned, scrubbed** |
| 02 | Ledger | carbon | Counters |
| 03 | What we do | carbon | Sticky card stack |
| 04 | Requirement | void | Interactive |
| 05 | Sourcing | film | Ambient loop |
| 06 | Parks | void | **Pinned, horizontal** |
| 07 | Specification | film | **Pinned, scrubbed** |
| 08 | Handover | film | **Pinned, scrubbed** |
| 09 | Sectors | slate | Velocity marquee |
| 10 | Process | carbon | Scrubbed rail |
| 11 | Leadership | carbon | Nameplate |
| 12 | Questions | void | Disclosure |
| 13 | Enquiry | film | Ambient loop |

**Four pins.** That is one more than the old budget allowed, and it is deliberate: three of them are
the film, which is what the site is for.

---

## Technical spec

**Native scroll, one rAF loop.** ScrollTrigger runs on the browser's own scroll events and GSAP's
ticker. `ScrollRoot` sets `ignoreMobileResize` so that a mobile browser hiding its chrome does not
re-measure every pin mid-scroll, and `lagSmoothing(0)` so GSAP does not clamp a large delta after a
stall — scrubbed timelines are driven by scroll position, not elapsed time, so a clamp only
desynchronises them from the page.

**Overlays run off paused timelines that scroll scrubs.** A scene with seven cross-fading captions
costs zero React re-renders. Each timeline is padded to a duration of exactly 1 with a trailing
`set()` — without it the duration is wherever the last tween happens to end, and `progress()` maps
scroll onto a shorter span, firing every caption early.

**Pins refresh after fonts load.** Pins compute their distance from element heights; if that happens
before the webfont swaps, every pin lands in the wrong place.

---

## Degradation

Information never degrades across breakpoints. Only the choreography does.

| Context | Behaviour |
|---|---|
| **Desktop / tablet** ≥ 768 px | Full choreography, sequences scrubbed |
| **Mobile** ≤ 767 px | No sequence is downloaded. Each scrubbed scene plays its clip once on entry and runs the same overlay on a seven-second timer, so every figure still arrives. Parks stacks instead of pinning |
| **`prefers-reduced-motion`** | Every scene shows its poster and resolves every overlay to its final state. Nothing moves, nothing is missing |
