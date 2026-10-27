# Japanese Learner — Project Plan

A mobile-first, **Duolingo-style** web app to help classmates learn **Minna no Nihongo N5** vocabulary — flashcards, quizzes, listening, and progress tracking. Static site, no backend, free to host (GitHub Pages).

> Status: planning. Numbers & Time trainer already built (`index.html`). This plan covers the **Vocabulary** module, which becomes the main app; Numbers & Time becomes one node on the path.

---

## 1. Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Progress tracking | **Local only** (`localStorage`) | Simple, free, no login; fine for classmates |
| Data source | **The provided Anki deck** (`.apkg`) | Already has 939 words, 25 lessons, audio + pictures |
| Build | **Static site** (no backend) | Host on GitHub Pages; works on any phone |
| Study modes | Flashcards + SRS · Multiple-choice · Typing · Listening | Mixed exercises = "fun & easy" |
| UI/UX | **Duolingo-style patterns**, original branding | Lesson path, XP, streak, hearts, instant feedback |
| Platform | **Mobile-first**, optional PWA | Classmates study on phones |

**IP note:** We copy Duolingo's *UX patterns* (not copyrightable) but use an **original mascot + branding** (e.g. a shiba/daruma character we design) — never Duo the owl, their logo, or their exact assets.

---

## 2. Data source — the Anki deck

File: `Minna_no_Nihongo_N5_Anki_Deck__Vocabulary__Audio__Picture.apkg`

An `.apkg` is a ZIP containing:
- `collection.anki21` — SQLite DB (notes, cards, decks, note-types)
- numbered media files (`0`, `1`, `2`, …) — mp3 + png
- `media` — JSON map `{ "0": "realname.mp3", ... }`

**Deck contents (inspected):**
- **939 notes**, note-type **`MSK`**
- Decks: `ClASS::01-Lesson-01` … `ClASS::25-Lesson-25` → **25 lessons** = the path
- Media: word audio (mp3) + pictures (png) + sentence audio

**`MSK` fields (card data available):**
```
Cardnumber, Front, Romaji, Pronounce, English, DescriptionBack,
japanese_sentence, sentence_in_romaji, sentence-breakdown, sentence_in_english,
japanese_sentence-audio, Usage, Negative_form, Kanji, Kanji_breakdown,
Kanji_reading, た_Form, たい_Form, て_form, ますForm, Dictionary, Picture, Notelink
```

**Field → app card mapping:**
| App field | Anki field(s) | Notes |
|---|---|---|
| `id` | Cardnumber / note id | stable key for SRS |
| `lesson` | deck name `ClASS::NN-Lesson-NN` | via cards→decks join |
| `word` | Front | main prompt (kana/word) |
| `kanji` | Kanji | may be empty |
| `reading` | Kanji_reading / Pronounce | hiragana |
| `romaji` | Romaji | support line |
| `meaning_en` | English | **only English in deck** |
| `picture` | Picture | `<img>` → extract filename |
| `audio` | `[sound:…]` inside Front/Pronounce | extract ref |
| `example.jp` | japanese_sentence | |
| `example.en` | sentence_in_english | |
| `example.audio` | japanese_sentence-audio | |
| `forms` | ますForm, て_form, た_Form, … | optional extras for verbs |

**Open question — Vietnamese meanings:** the deck is English-only. Options: (a) ship English meanings now, add Vietnamese later as an optional column; (b) you provide a `lesson,word,meaning_vi` CSV we merge in; (c) auto-translate (lower quality). *Recommend (a) now, (b) later.*

---

## 3. Data pipeline (build step — run once, re-run when deck updates)

A small **Node or Python converter** turns the `.apkg` into web-ready assets:

```
convert.(js|py)
  1. unzip .apkg
  2. open collection.anki21 (SQLite)
  3. SELECT notes.flds (\x1f-delimited) + join cards→decks for lesson
  4. map MSK fields → app schema
  5. parse media refs ([sound:x.mp3], <img src="y.png">) in fields
     → rename numbered media to real names via `media` JSON
     → copy into /media
  6. write /data/vocab.json
```

Output:
```
/data/vocab.json        # [{id, lesson, word, kanji, reading, romaji, meaning_en,
                        #   picture, audio, example:{jp,en,audio}, forms:{}}]
/media/*.mp3 *.png      # extracted, real filenames
```

> The app reads `vocab.json` at runtime. Keeping a build step (not parsing SQLite in-browser) keeps the app small and fast on phones. The `.apkg` stays the source of truth.

---

## 4. App structure (100% static)

```
japanese-learner/
├── index.html        # app shell + lesson path (home)
├── app.js            # path, lessons, exercises, SRS, gamification
├── reading.js        # existing Number/Time module (extracted & exported)
├── styles.css        # Duolingo-style theme
├── data/vocab.json   # generated from the Anki deck
├── media/            # audio + pictures from the deck
├── convert.js        # the .apkg → vocab.json/media build script
└── sw.js             # (optional) service worker for PWA/offline
```

Reuses from the current `index.html`: flip-card UI, **speech synthesis**, tri-lingual i18n (vi/en/ja), `localStorage` prefs, romaji helper, and the whole number/time reading module.

---

## 5. UX — Duolingo-style

**Home = lesson path:** vertical winding path of 25 lesson bubbles + a "Numbers & Time" node. A lesson unlocks when the previous is passed. Each shows a crown/level (bronze→gold).

**A lesson** = ~12 questions, 2–3 min, a shuffled mix of the 4 exercise types drawn from that lesson's words:
1. **Multiple-choice** — word (+picture) → pick English (or reverse)
2. **Listening** — 🔊 word audio → pick/type what you heard
3. **Typing / recall** — type the reading or meaning (fuzzy match)
4. **Flashcard** — flip (word ⇄ reading+meaning+picture), self-grade

**Feedback:** big green "正解！/ Đúng!" or red with the correct answer + sound. Satisfying, instant.

**Review:** a "Practice" button runs **SRS** over weak/due words across all lessons.

---

## 6. Gamification & tracking (all local)

`localStorage` schema:
```js
{
  progress: { [wordId]: { box, due, seen, correct, wrong } }, // Leitner SRS
  lessons:  { [lessonNo]: { crown, bestAccuracy, passed } },
  stats:    { streak, lastStudied, xp, level, dailyGoal, heartsToday }
}
```
- **SRS (Leitner, 5 boxes):** correct → box up; wrong → box 1. Box = review interval (1,2,4,8,14 days). Box 5 = mastered.
- **Streak 🔥** — consecutive study days (top retention hook)
- **Daily goal ring** — XP toward a daily target
- **Hearts/lives** — optional; wrong answers cost a heart; "free practice" toggle for low pressure
- **Crowns** — repeat a lesson to level it up
- **Per-lesson mastery %** + **"due today" count** on the path

---

## 7. Mobile & PWA
- Mobile-first layout: big tap targets, bottom CTA button, one-column, swipe-friendly.
- Optional **PWA** (`manifest.json` + `sw.js`): "Add to Home Screen", works offline (vocab.json + media cached). Makes it feel like a real app for classmates.

---

## 8. Build prompt (hand off to implementation agent)

> Paste the block below to a coding agent to build it.

```
Build a mobile-first, static (no-backend) web app: a Duolingo-style trainer for
Minna no Nihongo N5 vocabulary. Progress is local (localStorage), hostable on
GitHub Pages.

DATA: parse the provided Anki deck
`Minna_no_Nihongo_N5_Anki_Deck__Vocabulary__Audio__Picture.apkg`.
Write a build script `convert.js` (Node) that:
 - unzips the .apkg, opens collection.anki21 (SQLite; use better-sqlite3),
 - reads notes (note-type "MSK", \x1f-delimited flds), joins cards→decks to get
   each note's lesson from deck name "ClASS::NN-Lesson-NN",
 - maps fields: Front→word, Kanji→kanji, Kanji_reading/Pronounce→reading,
   Romaji→romaji, English→meaning_en, Picture→picture, japanese_sentence→example.jp,
   sentence_in_english→example.en, japanese_sentence-audio→example.audio,
   and extract [sound:x.mp3] / <img src="y.png"> refs,
 - renames numbered media to real filenames via the `media` JSON, copies to /media,
 - writes /data/vocab.json as an array of
   {id, lesson, word, kanji, reading, romaji, meaning_en, picture, audio,
    example:{jp,en,audio}, forms:{masu,te,ta}}.

APP (index.html + app.js + styles.css):
 - Home = a vertical lesson path (25 lessons + a "Numbers & Time" node, which
   reuses the existing reading.js module). Lessons unlock sequentially; show crown level.
 - A lesson = ~12 questions, shuffled mix of 4 exercise types on that lesson's words:
   (1) multiple-choice word↔meaning (show picture when present),
   (2) listening: play audio → choose/type the word,
   (3) typing: type reading or meaning (fuzzy match, ignore spacing/okurigana variants),
   (4) flashcard flip with self-grade.
 - Instant feedback (green correct / red wrong + correct answer) with a sound.
 - SRS "Practice": Leitner 5-box over due words across lessons.
 - Gamification: streak, daily-goal XP ring, hearts (with a "free practice" toggle),
   per-lesson mastery %, crowns. Persist all in localStorage (schema in PLAN.md §6).
 - Audio via Web Speech API fallback if a word has no mp3.
 - i18n vi/en/ja for UI (reuse the existing pattern).
 - Duolingo-style VISUAL patterns (lesson path, big rounded buttons, playful colors,
   progress) but ORIGINAL mascot/branding — do NOT use Duo the owl or Duolingo assets.
 - Mobile-first; optional PWA (manifest + service worker) for offline + add-to-home.

ACCEPTANCE:
 - `node convert.js` produces /data/vocab.json (~939 entries, 25 lessons) + /media.
 - Open index.html → lesson path renders; a lesson runs all 4 exercise types,
   grades answers, updates streak/XP/SRS, persists across reloads.
 - Works well on a phone screen; audio + pictures show on cards.
```

---

## 9. Open questions
1. **Vietnamese meanings** — ship English-only now, add `meaning_vi` later? (recommend yes)
2. **Hearts** — strict (Duolingo-style) or "free practice" default for a relaxed vibe?
3. **Mascot** — want an original character (shiba? daruma? tanuki?) or keep it clean/minimal?
4. **Hosting** — GitHub Pages under your account? (free, HTTPS, works great for a static app)
