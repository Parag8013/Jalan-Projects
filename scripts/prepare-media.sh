#!/usr/bin/env bash
#
# Turns a raw Flow export into everything the site needs from it.
#
# Usage, from the repo root, in Git Bash:
#
#   bash scripts/prepare-media.sh scrub  build     ~/Downloads/assembly.mp4
#   bash scripts/prepare-media.sh scrub  orbit     ~/Downloads/orbit.mp4 loop
#   bash scripts/prepare-media.sh scrub  interior  ~/Downloads/interior.mp4
#   bash scripts/prepare-media.sh loop   land      ~/Downloads/land.mp4
#   bash scripts/prepare-media.sh loop   close     ~/Downloads/close.mp4
#
# `scrub` produces a frame sequence, a compressed clip for mobile and a poster.
# `loop`  produces a compressed looping clip and a poster.
#
# It prints the frame count at the end. Paste that into the matching component —
# it tells you which one.

set -euo pipefail

MODE="${1:-}"
NAME="${2:-}"
SRC="${3:-}"

if [ -z "$MODE" ] || [ -z "$NAME" ] || [ -z "$SRC" ]; then
  sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "No such file: $SRC" >&2
  exit 1
fi

command -v ffmpeg >/dev/null || { echo "ffmpeg is not on PATH." >&2; exit 1; }

OUT=public/media
mkdir -p "$OUT"

# Roughly this many frames across the whole scrub, whatever the clip's length.
# Below ~180 the scrub steps visibly; above ~240 the extra weight buys nothing a
# viewer can see. The frame rate is derived, so a 12s clip and a 32s clip both
# land on the same count and the same file size.
TARGET_FRAMES=210

# Which watermark the generator burns in, and how it is taken out.
#
#   sparkle  Gemini / Flow's four-pointed star, about 89% across and 82% down.
#            Removed with delogo. It sits too far into the frame to crop:
#            reaching it from the right costs 12% of the width and from the
#            bottom 20% of the height, to delete a mark 40px across. At the
#            1200px the frames are cut to, the residue is a faint smudge.
#   corner   The older "Veo" wordmark, hard into the bottom-right corner.
#            Cropped, because a crop is exact and 6% off the bottom is
#            invisible under cover-fit.
#   both     If a clip somehow carries both.
#   none     A watermark-free source. Google AI Ultra does not burn one in, and
#            if you are on that tier this should be `none` — delogo over clean
#            footage smears a patch where there was nothing to remove.
#
# Override for a single run:
#   WATERMARK=corner bash scripts/prepare-media.sh scrub build ~/Downloads/x.mp4
WATERMARK="${WATERMARK:-sparkle}"

# Built per source rather than hardcoded, so it survives a switch to 1080p or
# 4K: the watermark scales with the frame, so a fraction of the frame does too.
# Emits a trailing comma, or nothing at all, so it can be pasted straight onto
# the front of a filter chain.
watermark_filter () {
  local src="$1" w h f=""
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$src")
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$src")

  case "$WATERMARK" in
    sparkle|both)
      f="delogo=x=$(awk -v v="$w" 'BEGIN{printf "%d", v*0.885}')"
      f="$f:y=$(awk -v v="$h" 'BEGIN{printf "%d", v*0.788}')"
      f="$f:w=$(awk -v v="$w" 'BEGIN{printf "%d", v*0.042}')"
      f="$f:h=$(awk -v v="$h" 'BEGIN{printf "%d", v*0.077}'),"
      ;;
  esac

  # Ordered after delogo deliberately: delogo's coordinates are measured on the
  # full frame, so anything that changes the geometry has to come later.
  case "$WATERMARK" in
    corner|both)
      f="${f}crop=iw:floor(ih*0.94/2)*2:0:0,"
      ;;
  esac

  printf '%s' "$f"
}

duration () {
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$1" | cut -d. -f1
}

# The clip's own frame rate. Asking ffmpeg for more frames than the source
# holds just duplicates them: same weight, no extra smoothness. An 8s Flow
# export at 24fps has 192 frames and that is the ceiling.
source_fps () {
  ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate     -of csv=p=0 "$1" | awk -F/ '{ printf "%.4f", ($2 ? $1/$2 : $1) }'
}

encode_clip () {
  # $1 source, $2 output basename, $3 crf
  ffmpeg -v error -y -i "$1" \
    -c:v libx264 -crf "$3" -preset slow -pix_fmt yuv420p \
    -vf "$(watermark_filter "$1")scale='min(1600,iw)':-2" \
    -movflags +faststart -an "$OUT/$2.mp4"
}

# Flow shots move at a constant speed and never return to where they started,
# so a plain `loop` jump-cuts back to frame one every time round. Playing the
# clip forward then backward makes the join seamless: the camera reverses, which
# on a slow drift against black is far less noticeable than a cut. Costs double
# the file, which is why only the three looping clips get it.
pingpong () {
  local tmp="${1%.mp4}-pp.mp4"
  ffmpeg -v error -y -i "$1" -filter_complex     "[0:v]split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[v]"     -map "[v]" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p     -movflags +faststart -an "$tmp"
  mv "$tmp" "$1"
}

poster () {
  # $1 clip, $2 output basename, $3 seek seconds
  #
  # No watermark_filter here, deliberately: this reads the clip encode_clip
  # has already cleaned. Running it twice would delogo a patch of clean
  # picture, and under `corner` would crop the poster to a different frame
  # from the sequence that paints over it.
  ffmpeg -v error -y -ss "$3" -i "$1" -frames:v 1 -q:v 5 \
    -vf "scale='min(1600,iw)':-2" "$OUT/$2.jpg"
}

case "$MODE" in
  scrub)
    DUR="$(duration "$SRC")"
    [ "$DUR" -ge 1 ] || DUR=8
    SFPS="$(source_fps "$SRC")"
    FPS=$(awk -v t="$TARGET_FRAMES" -v d="$DUR" -v s="$SFPS"       'BEGIN{ f = t/d; if (s > 0 && f > s) f = s; printf "%.4f", f }')

    DIR="$OUT/seq/$NAME"
    rm -rf "$DIR"
    mkdir -p "$DIR"

    echo "Source is ${DUR}s. Extracting at ${FPS} fps for ~${TARGET_FRAMES} frames…"
    # 1200 wide at q8. The canvas draws cover-fit and the source is soft, so
    # this still holds up on a 2560px display, and it is a third of the weight
    # of the 1600/q6 that looks identical in motion.
    ffmpeg -v error -y -i "$SRC" -vf "fps=$FPS,$(watermark_filter "$SRC")scale=1200:-2" -q:v 8 "$DIR/%04d.jpg"

    # The mobile fallback: mobile plays the clip rather than scrubbing frames.
    encode_clip "$SRC" "$NAME" 28
    # `orbit` is also the loop that takes over behind the hero, so it needs the
    # seamless join. Pass `loop` as a 4th argument for that.
    [ "${4:-}" = "loop" ] && pingpong "$OUT/$NAME.mp4" 
    poster "$OUT/$NAME.mp4" "$NAME-poster" 1

    COUNT=$(find "$DIR" -name '*.jpg' | wc -l | tr -d ' ')
    SIZE=$(du -sh "$DIR" | cut -f1)

    case "$NAME" in
      build)    FILE="components/scenes/Assembly.tsx  → BUILD_FRAMES" ;;
      orbit)    FILE="components/scenes/SpecOrbit.tsx → ORBIT_FRAMES" ;;
      interior) FILE="components/scenes/Interior.tsx  → INTERIOR_FRAMES" ;;
      *)        FILE="the component that uses seq/$NAME" ;;
    esac

    echo
    echo "  frames : $COUNT  ($SIZE)"
    echo "  set    : $FILE = $COUNT"
    echo
    ;;

  loop)
    encode_clip "$SRC" "loop-$NAME" 27
    pingpong "$OUT/loop-$NAME.mp4"
    poster "$OUT/loop-$NAME.mp4" "loop-$NAME-poster" 1
    echo
    echo "  wrote  : $OUT/loop-$NAME.mp4 + $OUT/loop-$NAME-poster.jpg"
    echo
    ;;

  *)
    echo "Unknown mode '$MODE'. Use 'scrub' or 'loop'." >&2
    exit 1
    ;;
esac

echo "public/media is now $(du -sh "$OUT" | cut -f1)"
echo
echo "  ! Bump MEDIA_VERSION in lib/media.ts before deploying."
echo "    /media is cached for 30 days. Without a new stamp, everyone who has"
echo "    visited in the last month keeps the old footage — or worse, a mix."
echo
