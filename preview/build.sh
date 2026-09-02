#!/usr/bin/env bash
set -euo pipefail
cd /home/claude/mecanorme

OUT=/tmp/preview
mkdir -p "$OUT"

# 1. Tailwind stylesheet for the whole component tree
npx tailwindcss -i src/app/globals.css -o "$OUT/app.css" --minify 2>&1 | tail -2

# 2. Single-file JS bundle: react, three, r3f, drei, framer-motion and all site code
npx esbuild preview/entry.tsx \
  --bundle \
  --format=iife \
  --platform=browser \
  --target=es2020 \
  --minify \
  --jsx=automatic \
  --tsconfig=tsconfig.json \
  --alias:next/dynamic=./preview/shim-dynamic.tsx \
  --define:process.env.NODE_ENV=\"production\" \
  --outfile="$OUT/app.js" \
  --log-level=warning

echo "--- sizes ---"
ls -lh "$OUT/app.css" "$OUT/app.js"
