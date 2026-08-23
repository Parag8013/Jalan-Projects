# Google Flow prompts — the "Void" set

Five generations. Everything on the site comes out of them.

Read **The look bible** and **How to build the long shots** before you generate anything. The prompts
below assume both, and generating without them produces five clips that will not cut together.

---

## What the site does with each clip

| # | Clip | Length | Used as | Where |
|---|------|--------|---------|-------|
| 1 | **assembly** | ~28–32 s | Scroll-scrubbed frame sequence | The hero. Scroll builds the building |
| 2 | **orbit** | ~16 s | Scrubbed sequence **and** a background loop | Specification section, plus the loop that takes over when the hero assembly finishes |
| 3 | **interior** | ~12–16 s | Scroll-scrubbed frame sequence | Handover |
| 4 | **land** | 8 s | Looping background | Sourcing |
| 5 | **close** | 8 s | Looping background | Enquiry |

Clip 2 does double duty on purpose. The hero needs a slow rotation to hand over to when the assembly
lands, and that is the same shot the specification section wants — generating it twice would only
give you two orbits that do not match.

**Generate clip 1 first.** It is five viewports of scroll and it is the whole first impression.

---

## The look bible

Every prompt below ends with this paragraph. **Paste it verbatim. Do not paraphrase it, do not
"improve" it, do not drop the last sentence.** Five separately generated clips will otherwise arrive
as five different films, and no colour grade fixes that afterwards.

> Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon,
> no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark
> steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep
> clean shadows falling away into black. Fine motes of warm golden light drift slowly through the
> air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of
> field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed
> camera movement, mechanically smooth, one unbroken take, no cuts.

### Why a void and not a real site

Three reasons, and they all matter more than they sound:

1. **Consistency.** A generated sky, horizon or landscape will differ in every clip and every extend.
   A black void is identical every time, so five clips genuinely look like one film.
2. **Legibility.** Every scene on this site has type over it. A dark, low-detail background is the
   difference between headlines that read and headlines that need a heavy scrim dropped on top.
3. **It is the more expensive-looking choice.** A building photographed as an object in a black
   studio is how a watch is photographed. A building photographed on a muddy plot is how a
   contractor's brochure is photographed.

### Negative prompt

```
text, letters, numbers, signage, logos, watermarks, people, workers, hard hats, vehicles, cranes, forklifts, sky, clouds, sun, horizon, grass, trees, landscape, daylight, rain, snow, fog, fire, smoke, cartoon, illustration, low-poly, videogame, miniature, tilt-shift, toy, model, blueprint, wireframe, hologram, neon, camera shake, handheld, cuts, jump cut, zoom, whip pan, time-lapse flicker, strobing
```

`miniature`, `toy`, `model` and `tilt-shift` are in there deliberately — the footage this replaces
read as a tabletop model, and that is the single failure mode to guard against.

If your Flow build has no negative-prompt field, append this sentence to the prompt instead:
*"No text, no people, no vehicles, no sky, no daylight, no miniature or toy-model appearance."*

---

## How to build the long shots

Flow generates **8 seconds at a time.** Clips 1, 2 and 3 are longer than that, so they are built with
**Extend**, which continues a clip from its own final frame. That is what keeps the building, the
lighting and the camera move continuous across the join — a second independent generation would
restart all three.

**The method, for clip 1:**

1. Generate **Segment 1** from its prompt below.
2. Look at it. If the camera stops, reverses, or the shot cuts, regenerate before going further —
   every later segment inherits the last frame of this one, so a bad segment 1 poisons the whole
   shot.
3. Select the clip → **Extend** → paste **Segment 2**. Repeat for 3 and 4.
4. Download the whole extended result as one file.

**Two rules that decide whether this works:**

- **Keep the camera doing one thing the whole way through.** Every segment says *continuing the same
  slow leftward orbit*. If a segment asks for a new move, the join becomes a visible lurch.
- **Never ask a segment to finish the building.** Each one advances it by one trade and hands over
  mid-motion. Segments that complete something tend to end on a held, static frame, and the next
  extend then has to start the camera moving again from a standstill.

If Extend is unavailable to you, use **Frames to Video** instead: render the four stage images
first, then interpolate between consecutive pairs. It is more work and the joins are weaker, but it
is workable.

---

## 1 — `assembly` · the hero ⚑ generate first

Four segments, chained with Extend. Target ~28–32 s total.

The site's captions are timed to these stages, so keeping them in this order matters more than
matching any particular second. (After you drop the clip in, you tune the caption timings to what
you actually got — see **After generating**.)

### Segment 1 — the plot, and the first light

```
An empty rectangular plot of dark polished concrete in a black infinite void, lit by a single warm amber light from high left. Fine motes of golden light drift in from the darkness and settle in a precise grid across the plot, and where they gather, low square concrete foundation pads rise smoothly out of the surface one after another down the length of the plot. The camera orbits slowly and steadily to the left at low height, close to the ground. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

### Segment 2 — the frame

```
Continuing the same slow leftward orbit, now rising gradually. Slender dark steel columns extend upward out of each concrete foundation pad in sequence down the length of the plot, and angled roof rafters lower into place across the full width to meet at a ridge, forming a tall open skeletal frame with no walls and no roof. Golden motes of light stream along each steel member as it forms. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

### Segment 3 — the skin

```
Continuing the same slow leftward orbit at roof height. Fine steel purlins settle across the rafters, then large flat matte grey metal cladding panels glide in out of the darkness and lock into place across the roof and down the side walls one bay at a time, closing the open frame into a solid building. Rectangular dock openings are left dark and empty along one long side. Golden motes of light trail behind each panel as it seats. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

### Segment 4 — glass, and the lights come on

```
Continuing the same slow leftward orbit, drifting slightly higher. Dense swarms of golden light particles gather in the remaining openings and condense into panes of clear glass — a tall glazed office front at the near end, a continuous band of clerestory windows running the full length below the roofline, and long glazed skylight strips set into the roof. As the last pane forms, warm amber light rises inside the building and spills out through the glass into the void. The finished building stands complete and lit while the camera keeps orbiting. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

**Reject and regenerate if:** the camera stops or reverses at any join; the building is finished
before segment 4; a segment cuts to a different angle; anything readable as text appears on the
cladding.

---

## 2 — `orbit` · the finished building

Two segments — generate the first, then one Extend. Target ~16 s.

This one has a hard requirement: **a single continuous constant-speed orbit that never stops.** The
site loops it behind the hero once the assembly lands, so a clip that decelerates at the end
visibly stalls every time it repeats.

### Segment 1

```
A slow continuous orbit around a single finished modern industrial building standing alone in a black infinite void. The building is long and low with a shallow pitched matte grey metal roof, a continuous band of clerestory glazing running its full length below the roofline, a row of closed dock doors along one long side, and a tall glazed office section at one end glowing warm from within. Fine golden motes drift through the air around it. The camera circles steadily at roof height, keeping the building centred, never stopping and never reversing. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

### Segment 2 — Extend

```
Continuing the identical orbit at exactly the same speed and the same height, carrying on around the far side of the building and back toward the glazed office end. Nothing changes, nothing is added, the building stays exactly as it is. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

---

## 3 — `interior` · handover

One or two segments. Target ~12–16 s.

The building has to be **empty** — no racking, no pallets, no forklifts. A warehouse photographed
full of someone else's stock is a photograph of someone else's business, and this section is about
handing an empty one over.

```
A slow steady forward dolly down the exact centre of a vast empty finished warehouse interior. A pale polished concrete floor stretches away with nothing standing on it, tall dark steel columns line both sides, an exposed steel roof structure crosses overhead, and long glazed skylight strips run down the roof letting shafts of warm amber light fall across the floor. A row of closed dock doors sits at the far end. Completely empty — no racking, no pallets, no shelving, no machinery. Fine golden motes drift through the light shafts. The camera moves forward at constant speed in one unbroken take. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

---

## 4 — `land` · sourcing

8 s, loops. This section is about ground nobody has built on yet, so it is the one clip with no
building in it.

```
A slow aerial drift high above a vast expanse of flat empty dark ground in a black infinite void, the surface faintly marked out into enormous rectangular parcels by thin softly glowing amber lines that fade away into the darkness in every direction. Nothing is built on it. Fine golden motes drift below the camera. The camera glides forward slowly and steadily in one unbroken take. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

---

## 5 — `close` · the enquiry

8 s, loops. The last thing on the page: stepping back from finished work.

```
A slow aerial pull-back away from a group of several finished industrial buildings standing together in a black infinite void, their pitched metal roofs and glazed ends glowing warm from within, wide empty concrete aprons between them, and a few dark unbuilt rectangular plots at the edges. More of the group enters frame as the camera retreats and the far edges fall softly out of focus into black. Fine golden motes drift through the air. One unbroken take at constant speed. Photoreal architectural visualisation rendered in a dark infinite studio void — no sky, no horizon, no ground plane beyond the building's own base. Materials are matte poured concrete, brushed dark steel and clear glass. One warm amber key light from high left, a cool rim light from behind, deep clean shadows falling away into black. Fine motes of warm golden light drift slowly through the air. Muted palette: charcoal, graphite, pale concrete grey, warm amber. 50mm lens, shallow depth of field, gentle anamorphic flare, cinematic colour grade, subtle film grain. Slow constant-speed camera movement, mechanically smooth, one unbroken take, no cuts.
```

---

## After generating

### Step 1 — run the script

Download each clip as a single file, then from the repo root **in Git Bash**:

```bash
bash scripts/prepare-media.sh scrub build     ~/Downloads/assembly.mp4
bash scripts/prepare-media.sh scrub orbit     ~/Downloads/orbit.mp4
bash scripts/prepare-media.sh scrub interior  ~/Downloads/interior.mp4
bash scripts/prepare-media.sh loop  land      ~/Downloads/land.mp4
bash scripts/prepare-media.sh loop  close     ~/Downloads/close.mp4
```

It extracts the frame sequence, encodes the mobile fallback, cuts the poster, and prints a line like:

```
  frames : 210
  set    : components/scenes/Assembly.tsx  → BUILD_FRAMES = 210
```

It derives the frame rate from each clip's own length, so a 32-second assembly and a 12-second
interior both come out at ~210 frames. If the count is not exactly 210, put whatever it printed into
the constant it names.

### Step 2 — tune the caption timings

This is the step that makes the difference, and it takes about two minutes per scene.

Generated video will not hit a timing brief exactly, so the captions have to be moved to the
footage. Run `npm run dev`, scroll the hero, and watch the **live percentage in the bottom-right
corner** — it only appears in development. Note the percentage where each stage actually arrives,
then edit the `at` values in the `BEATS` table at the top of `components/scenes/Assembly.tsx`.

Do the same for `HANDOVER` in `Interior.tsx` if the four figures drift out of step with what the
camera is passing.

### Step 3 — bump `MEDIA_VERSION`

One character in `lib/media.ts`. Do not skip it.

`vercel.json` caches everything under `/media` for 30 days, which is right for
frames that never change — but only if the URL changes when the bytes do.
Overwrite the footage without bumping the stamp and every browser that has been
to the site in the last month keeps serving the old frames from disk, and serves
a *mix* of old and new as individual entries expire at different times. A
half-old scrub looks far worse than a missing one.

The same header caches a 404 just as eagerly. That is how the hero's frames
stayed invisible after they were restored to the deploy: the files were correct
at the origin, and every browser that had already visited went on believing they
were not there.

### Step 4 — check the weight

```bash
du -sh public/media
```

**Budget: 22 MB or less.** Three frame sequences is the bulk of it, and they are the reason the
scrub is smooth, so the lever to pull is quality rather than count — open `scripts/prepare-media.sh`
and raise `-q:v 8` to `-q:v 10`, or drop `scale=1200` to `scale=1024`. Do not cut `TARGET_FRAMES`
below about 180; that is where the scrub starts to step visibly.

Sequences are fetched only when their section is one viewport away, so nothing here is on the
critical path — but it is still real bandwidth on a phone.

---

## What is in `public/media` right now

**Stand-ins.** They are frames pulled from the old tabletop-miniature clips, sitting under the
correct filenames so the whole site works end to end while you generate. They are exactly what this
set is meant to replace.

Overwrite them with the script above. No component changes are needed beyond the frame counts and
the caption timings.
