# Google Flow prompts — the "Fabric" set

Five generations. Everything on the site comes out of them.

Read **What went wrong**, **How Veo actually reads a prompt** and **Budget** before you generate
anything. There are six credits and five clips to get, so the order and the wording both matter.

The prompts are short on purpose, they contain no negations on purpose, and the word *drone* appears
nowhere in them on purpose. Each of those is a lesson paid for in credits — the section on how Veo
reads a prompt explains all three.

---

## What went wrong

**The first set** asked for the building as an object in a black studio void: no sky, no ground,
muted amber-on-charcoal, 50mm at shallow depth of field. The client's words were that it "looks a
model thingy," that it "doesn't look detailed enough," that the land shot "looks like solar panel
types," and that they wanted "real colors." Every one of those was a correct reading of what the
brief had asked for.

**The second brief over-corrected.** It tried to fix the scale problem with people, workers, moving
trucks, motorcycles, farmers and a dense village landscape. That is the right instinct applied with
the wrong tool: generative video is worst at exactly those things. Faces melt, limbs swap, wheels
slide, and a crowd in the middle distance boils. A clip with one warping human in it is less
believable than a clip with none, however good the building is.

**The third attempt** got the look right and the wording wrong: the prompts were too long, stuffed
with negations, and asked for a "drone shot". They came back as FPV footage carrying a checklist of
everything the negations had named. That is the subject of the next section but one, and it is the
most useful thing in this document.

So the failure modes are now on the table together, and the set has to thread between them:

| | Reads as a model | Reads as an AI artefact |
|---|---|---|
| Cause | No small-scale detail, shallow focus, high steep camera, building on a visible plinth | People, crowds, moving vehicles, busy environments, anything with a face |
| The old brief | ✅ caused this | avoided it |
| The second brief | avoided it | ✅ caused this |

**The way through is the client's own suggestion: put the detail into the building, not into the
world around it.** Generative video is genuinely good at hard surfaces, repeated geometry, materials
and light. It is bad at anything alive. So the building carries the whole shot, the environment is
kept deliberately plain, and nothing in frame is animate.

---

## Where the scale comes from

This is the part that replaces people, and it is worth understanding rather than just copying.

**A surface tells you its size through the detail repeated across it.** A 60-metre wall of profile
sheeting has ribs every 200 millimetres — three hundred of them. The eye does not count them, but it
reads the density, and density at that ratio can only mean a very large wall. The same wall rendered
smooth could be six metres or sixty; there is nothing in it to measure against.

That is the actual reason the first set looked like a model, and it is more fundamental than the
missing people. Scale models are smooth. They have the 10-metre tier of detail — the massing, the
roof pitch, the openings — and none of the 100-millimetre tier, because at model scale that tier is
smaller than a grain of rice. **A viewer who has seen a hundred architectural models has learned
that smoothness at size means model, and they apply it instantly and without thinking about it.**

So every prompt below loads the building with detail at three tiers, and the small one matters most:

| Tier | Elements |
|---|---|
| ~10 m | Massing, roof pitch, bay rhythm, the office block, the dock run |
| ~1 m | Roller shutters, dock levellers, personnel doors, windows, downpipes, bollards, kerbs, apron joints |
| ~100 mm | Cladding ribs, sheet laps, flashings, fixing screw lines, gutter brackets, mullion sections, panel joints |

**Known-size components do the rest.** A 2.1-metre personnel door beside a 5-metre roller shutter
fixes the scale of both. So do handrails at 1.1 m, dock levellers, standard downpipe diameters, a
1.5-metre curtain-wall mullion grid, painted parking bays, and expansion joints sawn into the apron
on a 5-metre grid. None of these are alive and none of them will warp.

**A parked truck or a shipping container is allowed** — a static box is geometry, not animation, and
the generator handles it. It must be stationary and it must be at a dock. Nothing moves in these
clips. If a truck comes out deformed, drop it and let the architecture carry the shot; the detail
tiers above are doing most of the work anyway.

---

## The building

Every clip except `land` shows the same building, and **this description is the most important text
in the document.** Paste it into each prompt in full. Vague size language is most of why the first
set had no sense of scale.

> A single-storey industrial warehouse, 60 metres long and 30 metres wide, 12 metres to the eave and
> 15.5 metres to the ridge, in eight structural bays of 7.5 metres. Low-pitched gable roof at about
> 10 degrees. Walls and roof clad in off-white trapezoidal ribbed profile steel sheeting with
> closely spaced vertical ribs, visible horizontal sheet laps and rows of fixing screws, over a
> darker grey base course to waist height. A deep eaves gutter runs the full length with a circular
> downpipe at every column line. Translucent skylight strips alternate along the roof, and a row of
> ridge ventilators sits along the top. A continuous band of clerestory glazing runs below the eaves.
> Along one long side, six loading docks with grey roller shutters, dock levellers, concertina dock
> shelters, rubber buffers and a projecting canopy, with a small personnel door beside them. A
> two-storey glazed office block at one gable end, curtain walling on a 1.5 metre mullion grid with
> spandrel panels and an entrance canopy. Corner, ridge, eaves and verge flashings throughout. Grey
> concrete apron with sawn expansion joints on a five metre grid, painted line markings, kerbs and
> bollards.

That footprint is roughly a football pitch under one roof. It should never look like something you
could pick up.

---

## How Veo actually reads a prompt

Three generations went into learning this, so it is written down rather than left as instinct. All of
it comes from Google's own Veo prompting guidance and from what the test clips actually did.

### 1. "Drone" is not a camera instruction

Veo's documented camera vocabulary is **dolly shot, tracking shot, crane shot, aerial view, slow pan,
POV shot, 180-degree arc shot, high angle, wide shot**. `drone` is not in it, and neither are `FPV` or
`orbit`.

A word the model has no instruction for does not get ignored — it falls through to whatever that word
looks like in training data, and "drone shot" in training data is DJI and FPV footage: ultrawide
glass, a barrel-distorted horizon, and a fast forward rush low over the ground. That is exactly the
clip it returned. **Never use the word. Say `aerial view` and name the move separately.**

### 2. Short beats long

A prompt naming one shot type, one camera move and one focus setting reliably outperforms a
two-hundred-word description. The prompts that failed were 330 words; the ones below are about half
that, and the trimming came entirely out of repetition and negation.

Also: **give the camera move its own sentence.** Movement instructions parse better when they are not
buried inside a description of the subject.

### 3. Negation in the positive prompt summons the thing

This is the big one, and Google states it directly: describe what you want to exclude by writing
*"a desolate landscape with no buildings or roads"* rather than *"no man-made structures"*. Naming a
noun puts it in the frame whether or not a `no` sits in front of it.

The evidence was unusually clean. The last segment-1 prompt carried about twenty negations, and the
clip came back carrying a checklist of them:

| In the positive prompt | In the clip |
|---|---|
| "no standing water" | Flooded ground, water channels throughout |
| "no large flat concrete panels" | Large flat concrete panels |
| "no lens flare and no blown-out highlights" | Blown-out sun with heavy flare |
| "no distortion" | Barrel distortion |

**So: the positive prompt states only what is present. Every exclusion lives in the negative-prompt
field**, which is a separate mechanism and is not subject to this. Where a state has to be ruled out,
describe the state that replaces it — "a plot where only the foundations have been cast" rather than
"no building".

### 4. Veo adds narrative unless told not to

Left alone it will give you a story with a beginning and an end, because that is what eight seconds of
"construction site" implies. That is where the cross-dissolve to a finished building came from.
Narrative suppression belongs in the negative prompt — `dissolve, transition, montage, cutaway,
time-lapse` — where it works well.

---

## The look bible

Every prompt below already ends with a version of this, trimmed to the materials that exist in that
clip. **The prompts are complete as written — you do not need to add anything.** It is here so a new
clip can be written to match.

> Bright midday sunlight, deep blue sky with scattered white cloud, crisp shadows, natural accurate
> colour. Quiet and deserted. Photorealistic architectural photography, deep focus throughout, steady
> constant-speed movement, one continuous take.

Note what is gone from the old version: the focal length (Veo has no documented understanding of
`35mm`, and it reads as ambiguous between a lens and a film stock), the long material list (each clip
now names only its own materials), and every `no …` clause, all moved to the negative prompt.

`deep focus` is the one phrase never to drop. It is documented vocabulary, and it is the single
strongest defence against the tilt-shift look that made the first set read as a model.

### Why the environment is deliberately plain

Flat open ground, plain blue sky, a hazy treeline, and nothing else. No villages, no traffic, no
crowded vegetation.

Every additional element is another thing the generator can render badly, and environmental artefacts
are more damaging than they look: a boiling treeline tells the viewer the image is synthetic, and once
they know that, the building stops being believed too. The environment contributes almost nothing to
what this site sells. **Spend the frame on the building.**

Three environmental elements earn their place: **the sky**, because it supplies the daylight and the
reflections in the glazing; **sharp sun shadows**, because a shadow raking across ribbed cladding is
itself a scale cue; and **haze on the horizon**, because atmospheric perspective is a distance cue a
scale model physically cannot have.

### Type over daylight

Bright footage under white and gold type is a contrast problem, solved on the page rather than in the
generation. The hero and `AmbientScene` carry gradient scrims currently tuned for near-black footage;
they **will need re-tuning once these clips land** — see Step 3 under **After generating**.

Do not compensate by asking for darker footage. A dimmed sunny shot is not atmospheric, it is badly
exposed.

---

## The negative prompt

One list, used for every clip. Paste it into the negative-prompt field — **not** into the prompt.

```
drone footage, FPV, racing drone, fisheye, barrel distortion, curved horizon, wide-angle distortion, lens flare, sun flare, blown highlights, overexposure, people, workers, crowds, faces, moving vehicles, traffic, animals, birds, dissolve, cross-fade, transition, montage, cutaway, cuts, jump cut, time-lapse, camera shake, handheld, zoom, whip pan, shallow depth of field, bokeh, blurred background, selective focus, miniature, tilt-shift, toy, model, scale model, diorama, tabletop, plinth, display base, videogame, cartoon, illustration, clay render, low-poly, wireframe, smooth untextured walls, text, letters, numbers, signage, logos, watermarks, brand names, night, darkness
```

The `assembly` clip takes an extra line on top, because it is the one clip in which the building must
not exist:

```
completed building, finished warehouse, steel frame, steel columns, walls, roof, cladding, construction machinery, scaffolding, continuous concrete slab, concrete raft, precast panels, flooded ground, water basins
```

If your build has no negative-prompt field, append this sentence to the prompt instead — it is the one
place a negation is unavoidable, so keep it short: *"Deep focus throughout, deserted and still,
rectilinear lens with a level horizon, one continuous take."*

---

## Budget: five clips, one credit each

**The four-segment Extend chain is abandoned.** It cost four credits for the hero alone and it failed
twice at segment 1. Every clip below is a single 8-second generation with no dependencies, so a
failure costs one credit rather than a chain.

Recommended order, because it spends the scarcest thing — retry budget — on the clips used most:

| Order | Clip | Why |
|---|---|---|
| 1 | `orbit` | Used twice: the specification section and the hero's background loop |
| 2 | `interior` | Handover |
| 3 | `land` | Sourcing |
| 4 | `close` | Enquiry |
| 5 | `assembly` | Only if the four above land first time — otherwise keep the clip already on disk |

`orbit`, `land` and `close` are ping-ponged by `prepare-media.sh` into seamless loops, so 8 seconds is
enough for all three.

---

## 1 — `orbit` · the finished building ⚑ generate first

```
Aerial view, slow 180-degree arc shot circling left at constant height, deep focus. A single finished industrial warehouse standing alone on a levelled plot: sixty metres long with a low-pitched gable roof, walls and roof in off-white ribbed profile steel sheeting with closely spaced vertical ribs and rows of fixing screws over a dark grey base course, a continuous band of clerestory glazing below the eaves, translucent skylight strips along the roof, an eaves gutter with a downpipe at every column line, six grey roller-shutter loading docks with dock levellers and a projecting canopy along one long side, and a two-storey glazed office block at one end reflecting the sky. A grey concrete apron with sawn joints, painted line markings, kerbs and yellow bollards surrounds it. The camera circles steadily, keeping the building centred. Flat open farmland runs away to a distant hazy treeline. Bright midday sunlight, deep blue sky with scattered white cloud, crisp shadows, natural accurate colour. Quiet and deserted. Photorealistic architectural photography, deep focus throughout, steady constant-speed movement, one continuous take.
```

Hard requirement: the arc must never stop or reverse. The site loops this behind the hero, and a clip
that decelerates at the end stalls visibly every time round.

---

## 2 — `interior` · handover

```
Tracking shot, slow forward dolly down the exact centre line, deep focus. The interior of a vast empty finished warehouse: a pale polished concrete floor with sawn control joints running sixty metres to the far wall, tall grey steel columns lining both sides at regular intervals with visible base plates and bolts, an exposed steel roof truss structure twelve metres overhead, translucent skylight panels along the roof casting broad shafts of daylight across the floor in a regular rhythm, and a band of clerestory windows along both side walls. A row of closed grey roller shutters sits at the far end with a single shutter open, showing bright sunlit ground beyond. The camera moves forward at constant speed. The floor is bare and the building is empty. Natural daylight, crisp shadows, natural accurate colour. Photorealistic architectural photography, deep focus throughout, one continuous take.
```

Empty is the point — a warehouse photographed full of someone else's stock is a photograph of someone
else's business.

---

## 3 — `land` · sourcing

```
Aerial view, slow forward tracking shot at low altitude, deep focus. Wide flat open farmland on a bright sunny day: large irregular fields of green and pale gold crop divided by raised earth bunds, a narrow curving dirt track, a shallow irrigation ditch, and scattered clumps of trees and palms along the field edges casting long shadows. The land runs green and open to a hazy treeline on the horizon. The camera glides forward slowly and steadily. Bright midday sunlight, deep blue sky with scattered white cloud, natural accurate colour. Quiet and empty farmland. Photorealistic aerial landscape photography, deep focus throughout, steady constant-speed movement, one continuous take.
```

This is the clip the client called "solar panel types," and the cause was an older prompt asking for
dark rectangular parcels divided by glowing amber lines. Land is divided by things that are physically
there — bunds, tracks, ditches, treelines. Glowing geometry reads as a solar farm.

---

## 4 — `close` · the enquiry

```
Aerial view, slow pull-back rising gently, deep focus. Six finished industrial warehouses standing together in an industrial park on flat open ground: off-white ribbed steel roofs and walls over dark grey base courses, low-pitched gable roofs with translucent skylight strips and ridge ventilators, rows of grey roller-shutter loading docks, and glazed office blocks at their gable ends reflecting the sky. Wide grey concrete aprons with painted line markings, kerbs and access roads run between them, and two empty levelled plots wait at the edge of the park. More of the park enters frame as the camera retreats. Bright midday sunlight, deep blue sky with scattered white cloud, crisp shadows, natural accurate colour. Quiet and deserted. Photorealistic aerial architectural photography, deep focus throughout, steady constant-speed movement, one continuous take.
```

---

## 5 — `assembly` · the hero, in two segments

Two generations chained with **Extend**, downloaded as one ~16-second file. This is the only clip in
the set that is worth spending two credits on: it is the whole first impression, and sixteen seconds
of one unbroken camera move carries a build that eight cannot.

### Why two segments works where four failed

The four-segment attempt failed at segment 1, twice, and the reason is now clear: **it asked for a
clip in which nothing happens.** Veo will not do that. Given a construction site and eight seconds it
wants a beginning, a middle and an end, and when told it may not have one it smuggles the ending in
through a cross-dissolve.

Two segments work with that instinct instead of against it. Each has a genuine arc and a defined
stopping point:

| Segment | Starts | Ends |
|---|---|---|
| 1 | Foundations cast on a levelled plot | An open steel skeleton, no walls, no roof |
| 2 | That skeleton | The finished building |

Neither is asked to stand still. Segment 1 is allowed to build something — just not everything — and
"ends as an open skeleton" is a destination rather than a prohibition.

### The risk, and the decision point

Extend chains fail as a unit. If segment 2 goes wrong, segment 1 alone is not a hero — a building
that never finishes is not a story — and both credits are gone.

**So check segment 1 before spending the second credit.** If it comes back with the building already
clad or finished, stop: you still have the existing hero on disk, and you have only lost one credit.

### Segment 1 — ground to frame

```
Aerial view, slow arc shot circling left and rising gently, deep focus. A levelled construction plot where a steel portal frame is going up: grey steel columns stand bolted to concrete pad footings in rows down the length of the plot, and roof rafters lift into place across the span to form a tall open skeleton twelve metres high. Bare compacted earth, tyre tracks and small heaps of spoil lie below, with flat open farmland running away to a hazy treeline. The camera arcs steadily leftward and climbs. The frame stands open to the sky, bare steel throughout, and the last frame is still an open skeleton. Bright midday sunlight, deep blue sky with scattered white cloud, crisp shadows, natural accurate colour. Quiet and deserted. Photorealistic architectural photography, deep focus throughout, steady constant-speed movement, one continuous take.
```

Segment 1 takes an extra negative line on top of the standard list:

```
cladding, wall panels, roof sheeting, glazing, enclosed building, finished building, completed warehouse
```

**Reject and regenerate if** the building is clad or finished; the camera stops, reverses or rushes
forward; the horizon curves; anything dissolves.

### Segment 2 — frame to finished ⚑ only after segment 1 passes

Select the segment 1 clip → **Extend** → paste this. Then download the whole extended result as one
file.

```
Continuing the identical slow leftward arc at exactly the same speed, still rising gently. Steel purlins settle across the rafters and off-white ribbed profile steel sheeting closes across the roof and down the long walls bay by bay over a dark grey base course, until the building stands complete: a sixty-metre industrial warehouse with a low-pitched gable roof, a continuous band of clerestory glazing below the eaves, translucent skylight strips, an eaves gutter with a downpipe at every column line, six grey roller-shutter loading docks with dock levellers and a projecting canopy along one long side, and a two-storey glazed office block at one end reflecting the sky. A grey concrete apron with painted line markings, kerbs and yellow bollards spreads around it. Bright midday sunlight, deep blue sky with scattered white cloud, crisp shadows, natural accurate colour. Quiet and deserted. Photorealistic architectural photography, deep focus throughout, steady constant-speed movement, one continuous take.
```

Standard negative prompt for this one — the extra line above must **not** be carried over, since this
segment's whole job is to clad and finish the building.

### After it lands

A 16-second source gives 210 frames rather than 192, and `RUN` in `Assembly.tsx` goes up to about 22
so the film is not sped up. The `BEATS` table can also go back to six or seven stages — columns,
rafters, cladding and glazing become separate visible events in a continuous build, which they never
were in the eight-second version.

---

## After generating

### Step 0 — judge each clip before you cut it

Open the clip and ask, in this order. It takes a minute and it is cheaper than finding out after the
whole set is cut.

1. **Zoom into a wall. Are the ribs there?** Closely spaced vertical lines, sheet laps, screw rows.
   If the cladding is smooth, the clip has failed — that is the model look, and nothing downstream
   fixes it.
2. **Is the background sharp?** Any blur behind the subject on a wide shot is tilt-shift creeping
   back in.
3. **Is there anything under the building?** A base, a platform, a clean edge where the ground stops.
4. **Is anything alive or moving?** One warping figure discredits the whole clip.
5. **Is there any wear on it?** Rain streaks under the gutters, dust on the base course, tyre marks
   on the apron.

### Step 1 — check the watermark, then run the script

**Look at the bottom-right corner of the clip first.** The two test generations came back with
different watermarks, so this is not a one-time setting:

| What you see | Run it as |
|---|---|
| A four-pointed sparkle, roughly 90% across and 80% down | `WATERMARK=sparkle` (the default — just run the command) |
| The word **Veo**, hard into the very corner | `WATERMARK=corner …` |
| Nothing at all (Google AI Ultra does not burn one in) | `WATERMARK=none …` |

Getting this wrong is not fatal but it is untidy in both directions: the wrong mode leaves a
watermark on the deployed site, and `sparkle` over clean footage smears a small patch of picture
where there was nothing to remove.

Then, from the repo root **in Git Bash**:

```bash
WATERMARK=corner  bash scripts/prepare-media.sh scrub orbit     ~/Downloads/orbit.mp4 loop
WATERMARK=corner  bash scripts/prepare-media.sh scrub interior  ~/Downloads/interior.mp4
WATERMARK=corner  bash scripts/prepare-media.sh loop  land      ~/Downloads/land.mp4
WATERMARK=corner  bash scripts/prepare-media.sh loop  close     ~/Downloads/close.mp4
WATERMARK=sparkle bash scripts/prepare-media.sh scrub build     ~/Downloads/assembly.mp4
```

The `build` line is written for the clip already on disk, which carries the sparkle. Change each
prefix to whatever that clip actually has.

The script extracts the frame sequence, encodes the mobile fallback, cuts the poster, removes the
watermark, and prints a line like:

```
  frames : 192
  set    : components/scenes/Assembly.tsx  → BUILD_FRAMES = 192
```

**Put whatever it prints into the constant it names.** An 8-second clip at 24fps gives 192 frames,
not the 210 the older 32-second sources produced, so all three counts will change this time.

### Step 2 — tune the stage timings

Generated video will not hit a timing brief exactly, so the captions move to the footage. Run
`npm run dev`, watch the hero, and read the **live percentage in the bottom-right corner** — it only
appears in development. Note the percentage where each stage actually arrives, then edit the `at`
values in the `BEATS` table in `components/scenes/Assembly.tsx`.

⚠ **The scenes play on a clock now, not on scroll.** Nothing is pinned; you cannot hold a stage still
to read it. Two consequences:

- Each beat's `note` must be readable in its slot, and the tightest slot is about 1.5 seconds. Keep
  them to one short line.
- `RUN` and `HOLD` at the top of `Assembly.tsx` set how long the film takes and how long the headline
  holds first. If a new assembly clip is much longer or shorter than 32 s, `RUN` is the knob.

Do the same for `HANDOVER` in `Interior.tsx` and the row timings in `SpecOrbit.tsx`.

### Step 3 — re-tune the scrims

**New with daylight footage, and do not skip it.** Every scrim on the site was tuned against
near-black clips. Over a bright sky the same values read as a grey sheet laid over a photograph, and
white type over pale cladding will not meet contrast either way.

- `components/motion/AmbientScene.tsx` — the `scrim` gradients
- `components/scenes/Assembly.tsx` — the inline bottom gradient behind the hero copy

Check the hero headline, the stage captions and the `SpecOrbit` sheet specifically. Those are the
three places where type sits directly on footage.

### Step 4 — bump `MEDIA_VERSION`

One character in `lib/media.ts`. Do not skip it.

`vercel.json` caches everything under `/media` for 30 days, which is right for frames that never
change — but only if the URL changes when the bytes do. Overwrite the footage without bumping the
stamp and every browser that has been to the site in the last month keeps serving the old frames
from disk, and serves a *mix* of old and new as individual entries expire at different times.

The same header caches a 404 just as eagerly. That is how the hero's frames stayed invisible after
they were restored to a deploy: the files were correct at the origin, and every browser that had
already visited went on believing they were not there.

### Step 5 — check the weight

```bash
du -sh public/media
```

**Budget: 22 MB or less.** Three frame sequences are the bulk of it. The current set is over budget
at ~37 MB, and this footage will compress worse than the old black-void set — a black frame is
almost free to encode, and sky, ribbed cladding and texture are not. Expect to pull a lever.

The levers in order: raise `-q:v 8` to `-q:v 10` in `scripts/prepare-media.sh`, then drop
`scale=1200` to `scale=1024`. Do not cut `TARGET_FRAMES` below about 180 — the sequences play on a
timer now and frames are what the playback smoothness is made of.

⚠ **Watch the ribs when you compress.** Closely spaced vertical lines are the hardest thing in the
frame for JPEG and H.264 to hold, and they are the detail this entire brief exists to produce. After
any quality change, open a frame and zoom into a wall before you accept it. If the ribs have gone
mushy, take the resolution down rather than the quality — a sharp 1024px rib beats a smeared 1200px
one.

---

## What is in `public/media` right now

**The original void set**, watermark-cropped and re-cut through the current pipeline so the site
works end to end. It is exactly what this brief exists to replace: it is the footage the client saw,
and the building in it is the one they called a model.

Overwrite it with the script above. No component changes are needed beyond the frame counts, the
stage timings and the scrim pass.
