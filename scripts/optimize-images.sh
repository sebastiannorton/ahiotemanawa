#!/bin/bash
# ============================================================
# optimize-images.sh — make web-sized copies of the gallery photos.
#
#   Thumbs: public/images/gallery-web/<folder>/thumbs/<file>  (max 640px)
#   Full:   public/images/gallery-web/<folder>/full/<file>    (max 2000px)
#
# Originals in public/images/gallery/<folder>/ are never modified.
# Also regenerates js/gallery-manifest.js so new photos appear on the
# site automatically after running this script.
#
# Usage:  bash scripts/optimize-images.sh
# (macOS only — uses the built-in `sips` tool)
# ============================================================
set -e
cd "$(dirname "$0")/.."

for d in whare whenua tangata; do
  mkdir -p "public/images/gallery-web/$d/thumbs"
  mkdir -p "public/images/gallery-web/$d/full"
  find "public/images/gallery/$d" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) | while read -r f; do
    name="$(basename "$f")"
    sips -Z 640  "$f" --out "public/images/gallery-web/$d/thumbs/$name" >/dev/null 2>&1
    sips -Z 2000 "$f" --out "public/images/gallery-web/$d/full/$name" >/dev/null 2>&1
  done
  echo "$d: $(ls "public/images/gallery-web/$d/thumbs" | wc -l | tr -d ' ') thumbs, $(ls "public/images/gallery-web/$d/full" | wc -l | tr -d ' ') full-size"
done

node scripts/build-gallery-manifest.js
echo "Done. Gallery web copies + js/gallery-manifest.js regenerated."