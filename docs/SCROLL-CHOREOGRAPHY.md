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
| **Scrubbed** (assembly, orbit, interior) | ~210 frames at 1200px, painted to `<canvas>` on scroll, `scrub: 0.25` |
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

## Snapping

Scroll is quantised, but not uniformly — a page that treats a film and a column of prose the same way
gets one of them wrong.

| Where | Behaviour |
|---|---|
| **Inside a pinned scene** | *Committed.* Any gesture hands the page to the next stop in that direction and the journey cannot be interrupted. One flick, one construction stage |
| **Section boundaries** | *Magnetic.* Only pulls when the visitor has already stopped within 12 % of a viewport of a section top. Alignment, not transport |
| **Everywhere else** | Free. A long section is read a screenful at a time, as it should be |

Stops are registered by the scenes themselves (`lib/snap.ts`), as **functions rather than values** —
every one is derived from a ScrollTrigger whose `start` and `end` move on each refresh, so reading
them at the moment of the gesture means there is no cache to invalidate.

### Why not ScrollTrigger's own `snap`

It snaps by animating the window's scroll position. Lenis reads that as external interference and
drags it back toward its own internal target, and the two fight visibly. Every snap goes through
`lenis.scrollTo` instead, so only one thing is ever moving the page.

### Three details that decide whether it feels right

**Every step plays at the same frame rate.** Duration is derived from the number of frames a step
crosses, not fixed. The hero's stages are spaced to the footage rather than evenly, so one fixed
duration gave one step 44 frames and the next 10 — a fourfold swing in smoothness between one
gesture and the next, which is exactly the unevenness that reads as cheap. Holding the rate at 44
fps and letting the duration vary between 0.38 s and 1.05 s trades a difference nobody can see for
one everybody can.

| | before | after |
|---|---|---|
| Hero, effective fps per step | 12 · 25 · 44 · 25 · 42 · 52 · 27 · 20 | 28 · 44 · 44 · 44 · 44 · 44 · 44 · 44 |

**A step eases in as well as out.** It commits on the first scroll event of a gesture, when the page
has barely begun to move; an ease-out starts at maximum velocity, and against that near-standstill
it reads as a yank.

**A stop sits after a caption's cue, not on it.** A cue is where a caption *begins* fading in, so
resting exactly there lands on the worst frame in the scene: the incoming caption at zero opacity,
the outgoing one half gone, nothing readable. `restPoints()` carries each stop past the end of the
fade. It costs a few frames of footage and it is what makes every stop look composed.

**Groups overlap deliberately, and the first one with somewhere to go wins.** A scene claims a
lead-in of 0.35 of a viewport above its own start, so its opening frame is a stop rather than
something the visitor is already past. Two scenes that sit against each other therefore overlap, and
the outgoing one — which has no further stops to offer — would swallow the gesture and make the next
scene's opening frame unreachable. The engine walks every group covering the position and takes the
first that actually has a next stop.

**The settle pass is the safety net under the step pass.** A step commits, arrives, and holds a
90 ms cooldown; any wheel still in flight during that cooldown moves the page a few pixels off the
stage with no gesture left to commit the next one. Coming to rest 16 px past a composed frame is
exactly the not-quite the whole mechanism exists to remove, so at rest inside a scene the position
is re-aligned to the nearest stop. Bounded to the scene's own range and not its lead-in — a visitor
leaving upward is briefly still inside the lead zone, and re-aligning there would pull them back
into a scene they have just decided to leave.

### Where it is off

Touch keeps its native momentum, and below 768 px the scenes are not pinned at all, so there is
nothing to step through. Under `prefers-reduced-motion` Lenis never initialises and none of this
runs.

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

**One clock.** Lenis is driven from GSAP's ticker, so smooth scroll and every ScrollTrigger share a
single rAF loop. Two separate loops is the usual cause of scrub jitter.

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
| **`prefers-reduced-motion`** | Lenis never initialises. Every scene shows its poster and resolves every overlay to its final state. Nothing moves, nothing is missing |
