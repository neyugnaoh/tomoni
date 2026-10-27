# Bundled vocabulary sets

Drop set files here to **publish them to everyone** via GitHub Pages (no database).
Each file becomes a built-in set available to all users after you commit + push.

## How
1. Add a file here — either:
   - **JSON** (the app's export format): an array of
     `{word, reading, meaning_en, kanji, lesson}` objects, or
   - **CSV/TSV**: one word per line, columns `word, reading, meaning, kanji, lesson`
     (a header row is auto-skipped).
   The **file name** becomes the set's display name.
2. Re-run the build so the app picks it up:
   ```bash
   node convert.js
   ```
   This regenerates `data/bundled.js` (Minna + every file in this folder).
3. Commit and push:
   ```bash
   git add sets data/bundled.js && git commit -m "Add set" && git push
   ```
   Everyone gets it on next load (the service worker fetches data network-first).

## Example

`sets/JLPT N5 Verbs.csv`
```
word,reading,meaning,kanji,lesson
たべます,たべます,to eat,食べます,1
のみます,のみます,to drink,飲みます,1
```

## Notes
- Bundled sets have **no audio/pictures** (they use the browser's Japanese voice),
  unlike the Minna deck which carries real media from its `.apkg`.
- Users' own locally-created sets are separate and private to their browser.
- Give each word a stable `lesson` number so the lesson path groups them sensibly.
