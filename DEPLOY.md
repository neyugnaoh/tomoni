# Deploying to GitHub Pages

The app is a fully static site (no backend), so hosting is just pushing the repo
and turning on Pages. All paths are **relative**, so it works under a project
subpath like `https://<you>.github.io/<repo>/` with no config changes.

## 1. Generate the data (once, and whenever the deck changes)

```bash
node convert.js
```

This produces the files the site serves at runtime:

- `data/vocab.js` — vocabulary as a global (loaded by `index.html`)
- `data/vocab.json` — same data as JSON (for export / reference)
- `media/` — pictures + audio (pic/`<id>`.png, audio/`<id>`.mp3, sentence/`<id>`.mp3)

**Commit these** — they are what the hosted site needs. (They already exist if
you've run `convert.js`.)

## 2. What to commit vs. ignore

- **Commit:** `index.html`, `app.js`, `reading.js`, `styles.css`, `manifest.json`,
  `sw.js`, `icon.svg`, `.nojekyll`, `data/`, `media/`, `lib/`.
- **Do NOT commit** the ~89 MB source `.apkg` — it's only needed to *re-run*
  `convert.js`, not to run the site. `.gitignore` already excludes it, keeping the
  repo ~96 MB instead of ~186 MB. (Keep the `.apkg` locally if you want to
  regenerate later.)

> `.nojekyll` is important: it stops GitHub's Jekyll from processing/omitting
> files. It's already in the repo.

## 3. Push and enable Pages

```bash
git init          # if not already a repo
git add .
git commit -m "Japanese Learner app"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source:
“Deploy from a branch” → Branch: `main` / `/ (root)` → Save.**

Wait ~1 minute, then open:

```
https://<you>.github.io/<repo>/
```

Because it's served over **HTTPS**, the service worker, offline caching, and PWA
“Add to Home Screen” all work.

## 4. Limits (you're well within them)

- Media is ~94 MB total; GitHub Pages allows <1 GB per repo and <100 MB per file
  (your largest media file is tiny).
- Soft bandwidth limit is 100 GB/month — plenty for a class.
- No Git LFS needed (all files are small individually).

## 5. Natural neural audio (optional, separate)

The Azure neural voice is **not** part of the static site — it needs the tiny
Cloudflare Worker proxy. See [`worker/README.md`](worker/README.md):

1. Create a free Azure Speech resource (tier **F0**), get Key + Region.
2. `cd worker && wrangler deploy`, then set `AZURE_KEY` and `AZURE_REGION` secrets.
3. In the app → **⚙ Settings → Giọng neural (Azure)** → turn on, paste the Worker
   URL, pick a voice, **Nghe thử**.

The site works without it — it falls back to the device's built-in voice.

## 6. Publishing shared vocab sets (no database)

Two kinds of sets exist:

- **Bundled sets** — committed in the repo, shared with everyone. Add one by
  dropping a `.json`/`.csv` file in [`sets/`](sets/README.md), running
  `node convert.js` (regenerates `data/bundled.js`), then committing + pushing.
  All users get it on next load (the service worker fetches `data/` **network-first**,
  so updates propagate without a version bump).
- **Local sets** — created in-app (⚙ → Bộ từ → Tạo bộ từ). These live only in that
  user's browser (IndexedDB), are private, and are **not** affected by your pushes.
  Users can export them to share manually. (Real cross-device sync would need a
  backend — out of scope for static hosting.)

## 7. Updating the site later

- **Content changed** (new/updated deck): re-run `node convert.js`, then
  `git add data media && git commit && git push`.
- **Code changed**: commit and push as usual.
- Bump the `VERSION` constant in `sw.js` when you change cached files, so returning
  visitors get the update instead of a stale cached copy.

## Quick checklist

- [ ] `node convert.js` run; `data/` and `media/` present
- [ ] `.nojekyll` committed
- [ ] `.apkg` not committed (ignored)
- [ ] Pushed to GitHub, Pages enabled on `main` / root
- [ ] Opened the Pages URL and it loads
- [ ] (Optional) Worker deployed + URL pasted in Settings for neural audio
