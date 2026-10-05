#!/bin/bash
# ============================================================
# optimize-images.sh — make web-sized WebP copies of the gallery
# photos and the page content images, keeping JPG fallbacks.
#
#   Gallery thumbs: public/images/gallery-web/<folder>/thumbs/<base>.webp  (max 640px)
#   Gallery full:   public/images/gallery-web/<folder>/full/<base>.webp    (max 2000px)
#
#   A JPG fallback copy is kept beside every WebP (gallery copies keep
#   their original filename; content images keep their original file).
#
#   Content images (hero, home strip, guardians, events) get a companion
#   <base>.webp next to the original JPG.
#
# Originals in public/images/gallery/<folder>/ are never modified.
# If that folder is absent (already-optimised copies only), the script
# falls back to re-encoding from public/images/gallery-web/<folder>/full.
# Also regenerates js/gallery-manifest.js so new photos appear on the
# site automatically after running this script.
#
# Requires `cwebp` from the WebP tools:
#   macOS:  brew install webp
#   Debian: sudo apt-get install webp
# macOS `sips` can READ WebP but cannot WRITE it, so cwebp does the
# encoding; sips is still used for high-quality resizing.
#
# Usage:  bash scripts/optimize-images.sh
# ============================================================
set -e
cd "$(dirname "$0")/.."

THUMB_MAX=640
FULL_MAX=2000
CONTENT_MAX=1600
HERO_MAX=2400
Q_THUMB=82
Q_FULL=78
Q_CONTENT=80

if ! command -v cwebp >/dev/null 2>&1; then
  echo "ERROR: 'cwebp' not found — install the WebP tools first." >&2
  echo "  macOS:  brew install webp" >&2
  echo "  Debian: sudo apt-get install webp" >&2
  exit 1
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# encode_webp <src-jpg> <out-webp> <quality>
encode_webp() { cwebp -q "$3" -quiet "$1" -o "$2" >/dev/null 2>&1; }
# resize_jpg <src> <max-longest-side> <out-jpg>
resize_jpg() { sips -Z "$2" "$1" --out "$3" >/dev/null 2>&1; }

# ---------- 1. Gallery web copies (WebP + JPG fallback) ----------
for d in whare whenua tangata; do
  src_dir="public/images/gallery/$d"
  # fall back to the already-optimised full-size copies when the
  # original source folder is not present in the checkout
  [ -d "$src_dir" ] || src_dir="public/images/gallery-web/$d/full"
  out_thumbs="public/images/gallery-web/$d/thumbs"
  out_full="public/images/gallery-web/$d/full"
  mkdir -p "$out_thumbs" "$out_full"

  find "$src_dir" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | while read -r f; do
    name="$(basename "$f")"
    base="${name%.*}"
    resize_jpg "$f" "$THUMB_MAX" "$STAGE/thumb.jpg"
    encode_webp "$STAGE/thumb.jpg" "$out_thumbs/$base.webp" "$Q_THUMB"
    resize_jpg "$f" "$FULL_MAX" "$STAGE/full.jpg"
    encode_webp "$STAGE/full.jpg" "$out_full/$base.webp" "$Q_FULL"
    # keep a JPG fallback under the original filename — never overwrite
    # the source file when we are already reading from it
    [ "$f" = "$out_thumbs/$name" ] || cp "$STAGE/thumb.jpg" "$out_thumbs/$name"
    [ "$f" = "$out_full/$name" ]   || cp "$STAGE/full.jpg"  "$out_full/$name"
  done
  echo "$d: $(ls "$out_thumbs"/*.webp 2>/dev/null | wc -l | tr -d ' ') thumb WebP, $(ls "$out_full"/*.webp 2>/dev/null | wc -l | tr -d ' ') full WebP"
done

# ---------- 2. Content images (hero, home strip, guardians, events) ----------
find public/images/home public/images/events -maxdepth 1 -type f \
  \( -iname '*.jpg' -o -iname '*.jpeg' \) | while read -r f; do
  case "$f" in
    *hero*) max="$HERO_MAX" ;;
    *)      max="$CONTENT_MAX" ;;
  esac
  out="${f%.*}.webp"
  resize_jpg "$f" "$max" "$STAGE/content.jpg"
  encode_webp "$STAGE/content.jpg" "$out" "$Q_CONTENT"
done
echo "content images: $(ls public/images/home/*.webp public/images/events/*.webp 2>/dev/null | wc -l | tr -d ' ') WebP"

node scripts/build-gallery-manifest.js
echo "Done. Gallery web copies (WebP + JPG fallback) + js/gallery-manifest.js regenerated."