# Verify before launch

**Every figure below was generated to make the site read as finished. None of it
came from Jalan Projects.** The design argues that this company is precise about
land, so a wrong number here does more damage than a blank would.

Nothing ships until this file is empty.

---

## Company scale — `content/site.ts` › `SCALE_FIGURES`

✅ **Confirmed** — supplied by Jalan Projects, Sept 2026: 3,000+ acres
transacted, 130M sq ft delivered, 45 years in operation, Howrah district.
Land sourcing range (1 – 100+ acres) and plot availability (all 3 parks) came
from the same sheet.

---

## Parks — `content/site.ts` › `PARKS`

| Park | Total | Available | Power | Roads |
|---|---|---|---|---|
| Sankrail, Dhulagori | **110 ac** | **18 ac** | **5 MVA** | 10 m ✅ |
| Jalan, Amta Road | **85 ac** | **22 ac** | **3 MVA** | 12 m ✅ |
| Amta, Amta Road | **65 ac** | **26 ac** | **2.5 MVA** | 12 m ✅ |

**Available acreage changes.** Whoever owns sales needs to own this row, and it
should be reviewed on a fixed schedule once live.

### Connectivity distances

Every distance to Kolkata, Haldia Port, NSCBI Airport and the nearest rail
siding is estimated. **These close deals** — a buyer who drives it and finds the
number wrong stops trusting the rest of the page. Measure them properly.

Highway designations (`NH-16 · Kona Expressway`, `Amta Road (SH-15)`) also need
confirming.

---

## Scale comparator — `content/scale.ts`

| Item | Generated value | Note |
|---|---|---|
| Dock bays per acre | **17** | Drives every bay figure in the signature scene |
| 5 / 20 / 100 acre bay counts | **85 / 340 / 1,700** | Derived from the ratio above |

Fixing the ratio fixes all four steps. Acreage-to-sq-ft is real arithmetic
(43,560) and needs no checking.

---

## Build-to-suit specs — `content/buildToSuit.ts`

Clear span **24–40 m** · eave height **9–14 m** · bay spacing **6–8 m** · floor
load **5–10 T/sqm** · sheeting **0.5 mm PPGI** · levellers **6–12 T** · footing
**M25**.

These are the most credible content on the site and the easiest for the company
to supply from its own drawings. Get the real ranges.

---

## Process durations — `content/site.ts` › `PROCESS`

Every duration is invented, including **8–16 weeks for conversion and mutation**.

That one is quoted as a differentiator. If the real range is longer, saying so
is still stronger than the competition, who publish no timeline at all.

---

## Answers — `content/site.ts` › `QUESTIONS`

Six answers assert policy: minimum parcel size, whether conversion is included,
lease vs sale, build-to-lease. **These are commercial commitments, not
marketing.** Management signs them off or they come down.

---

## Leadership — `content/site.ts` › `LEADERSHIP`

| Field | Value | Status |
|---|---|---|
| Name | **Brij Mohan Jalan** | Supplied. Confirm spelling as he uses it. |
| Role | **Chief Executive Officer** | Confirm the title he actually uses. |
| Statement | `null` | See below. |

The name appears in four places: the hero, the ledger signature, the leadership
section and the footer. Changing `LEADERSHIP.ceo` updates all four.

**No sentence anywhere on this site is attributed to Mr Jalan.** The four
`principles` are written in the company's voice for exactly that reason — a
quotation invented by a website builder and put in a named person's mouth is not
a placeholder that can be quietly shipped.

If a signed statement is wanted, get the words from him and set
`LEADERSHIP.ceo.statement`. The leadership section already renders it as a pull
quote when it is non-null, and renders nothing when it is not. No other change
is needed.

---

## Year of establishment — `content/site.ts` › `COMPANY.founded`

✅ **Confirmed: 1981.** Shown in the hero eyebrow, the ledger paragraph and the
leadership block. It is tied to the 45 years in operation figure — move one and
the other has to move with it.

---

## Contact — `content/site.ts` › `COMPANY`

**Phone is confirmed: `+91 98360 88855`.** WhatsApp uses the same number.

**Email is still a placeholder** (`enquiry@jalanprojects.in`). Confirm it exists
and is monitored, or remove the email link — a dead address on a live site loses
enquiries silently.

---

## Logo

`public/logo-jalan.jpg` is **244 × 274 px**, which is too small to stay crisp.
It renders at 44px in the header, where it holds, but it cannot be used larger
and cannot go on the dark register: knocking out the white field punches holes
through the lion's muzzle and brow.

The page now alternates between a cream and a near-black register, and the
header follows it. On the dark register the crest fades out and the typographic
wordmark carries the mark alone — the same thing the footer does. That is a
workaround for the asset, not a design decision.

**Ask for the original as SVG, or a PNG with real transparency at 1000px+.**

---

## Imagery — `public/media/`

**Done.** All five clips are the real Flow generations, converted with
`scripts/prepare-media.sh`, and the caption timings in `Assembly.tsx` have been
tuned to them. The raw exports are in `media/` (gitignored) — back them up
somewhere outside the repo, because they are what any recut starts from.

If you regenerate anything, the follow-up steps in `FLOW-PROMPTS.md` still
apply: update the frame-count constant the script prints, and retune the beats.
Captions timed to the old clip will trail the new one.

One thing worth a second opinion: the orbit covers roughly 70 degrees of arc, so
it is played forward-then-backward to loop without a jump. The camera reverses
direction at the turn. It is unobtrusive, but if it bothers you the fix is more
Extends in Flow until the orbit closes a full circle, then dropping the
`loop` argument on that one script invocation.

Any page presenting footage as a specific real asset needs an `INDICATIVE
VISUALISATION` label — the parks section carries one, and the footer carries a
site-wide line. **Once real photography of the actual parks exists, that
disclaimer should be reviewed rather than left standing out of habit.**

---

## The building in the footage — `content/buildToSuit.ts` › `REFERENCE`

The hero shows one specific building being assembled: 30 m span, 12 m eave,
7.5 m bays. Those figures are quoted on screen beside the film.

If the real ranges change, change `REFERENCE` with them **and say so in the Flow
prompt before regenerating** — otherwise the visitor watches a building being
built while reading dimensions belonging to a different one.
