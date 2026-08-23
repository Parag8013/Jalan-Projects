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
    -vf "scale='min(1600,iw)':-2" \
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
    ffmpeg -v error -y -i "$SRC" -vf "fps=$FPS,scale=1200:-2" -q:v 8 "$DIR/%04d.jpg"

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
