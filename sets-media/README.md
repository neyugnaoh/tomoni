# Images for bundled vocab sets

Drop word images here. `node convert.js` copies every file in this folder into
`media/sets/`, so they survive the `media/` rebuild and ship via GitHub Pages.

## How to add an image to a word

1. Put the image file here, e.g. `sets-media/okimasu.jpg`.
2. In the set's JSON (`sets/*.json`), add a `picture` field to that word:
   ```json
   { "lesson": 4, "word": "おきます", "kanji": "起きます",
     "meaning_en": "dậy, thức dậy", "tags": ["verbs"],
     "picture": "sets/okimasu.jpg" }
   ```
   The path is relative to `media/`, so `sets/okimasu.jpg` →
   `media/sets/okimasu.jpg`. (You can also use a full `https://…` URL instead.)
3. Rebuild + commit + push:
   ```bash
   node convert.js
   git add sets sets-media data/bundled.js media/sets && git commit -m "Add word images" && git push
   ```

## Image guidelines

- **Format:** JPEG for photos, PNG for drawings/transparency. WebP also works.
- **Size:** keep it small — resize to ~400–500 px on the long edge, aim for
  **under ~40 KB** per image. The UI only ever shows them at ~120 px.
- **Shape:** square-ish crops look best (the quiz shows them in square tiles).
- **Naming:** use a stable, ASCII name — the romaji or the word's kanji is fine
  (`okimasu.jpg`, `yuubinkyoku.jpg`). Avoid spaces.

## base64 vs files — use files here

**Don't** inline base64 in the bundled JSON. base64 is ~33 % bigger than the
raw bytes, it all loads + parses as JavaScript on every app start, and it bloats
`data/bundled.js` (which the service worker caches whole). Committed image files
are fetched lazily, cached individually, and keep the JS payload tiny.

base64 (`data:` URLs) is only used for **users' own** sets they create in the
app — those live in their browser's IndexedDB and are never committed here.

## Quick resize (optional)

macOS `sips`, batch-resize everything in this folder to 500 px:
```bash
for f in sets-media/*.{jpg,jpeg,png}; do sips -Z 500 "$f"; done
```
