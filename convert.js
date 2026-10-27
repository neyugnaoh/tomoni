#!/usr/bin/env node
/* ============================================================================
 * convert.js — Anki .apkg  ->  data/vocab.json  +  media/
 *
 * Zero npm dependencies: shells out to the system `unzip` and `sqlite3` CLIs.
 * Run once (re-run when the deck updates):   node convert.js
 *
 * Output:
 *   data/vocab.json           array of vocab entries (see schema below)
 *   media/pic/<id>.png        picture per word (when present)
 *   media/audio/<id>.mp3      word audio (when present)
 *   media/sentence/<id>.mp3   example-sentence audio (when present)
 *
 * Media is renamed to deterministic ASCII paths keyed by the Anki note id so
 * the web app never has to URL-encode Japanese filenames.
 * ========================================================================== */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const APKG = fs.readdirSync(ROOT).find((f) => f.toLowerCase().endsWith(".apkg"));
if (!APKG) {
  console.error("No .apkg file found in", ROOT);
  process.exit(1);
}
const TMP = path.join(ROOT, ".apkg_tmp");
const DB = path.join(TMP, "collection.anki21");
const DATA_DIR = path.join(ROOT, "data");
const MEDIA_DIR = path.join(ROOT, "media");

/* --- 1. unzip ------------------------------------------------------------- */
console.log("Unzipping", APKG, "…");
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
execFileSync("unzip", ["-o", "-q", path.join(ROOT, APKG), "-d", TMP]);

/* --- sqlite helper -------------------------------------------------------- */
function query(sql) {
  const out = execFileSync("sqlite3", [DB, "-json", sql], {
    maxBuffer: 1 << 30,
  }).toString();
  return out.trim() ? JSON.parse(out) : [];
}

/* --- 2. metadata: field names, deck names, media map ---------------------- */
const col = query("SELECT models, decks FROM col")[0];
const models = JSON.parse(col.models);
const model = Object.values(models).find((m) => m.name === "MSK");
if (!model) throw new Error("MSK note-type not found");
const FIELDS = model.flds.map((f) => f.name);

const decks = JSON.parse(col.decks);
const deckNameById = {};
for (const d of Object.values(decks)) deckNameById[d.id] = d.name;

// media map: { "<num>": "<realname>" }  ->  invert to realname -> num
const mediaMap = JSON.parse(fs.readFileSync(path.join(TMP, "media"), "utf8"));
const numByRealName = {};
for (const [num, name] of Object.entries(mediaMap)) numByRealName[name] = num;

/* --- helpers -------------------------------------------------------------- */
const stripHtml = (s) =>
  (s || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// Deck uses "N/A", "N_A", "-" etc. as "not applicable" placeholders.
const PLACEHOLDER = /^(n[\/_ ]?a|none|null|-|—|n\/a\.?)$/i;
const clean = (s) => {
  const t = stripHtml(s);
  return PLACEHOLDER.test(t) ? "" : t;
};

const extractSound = (s) => {
  const m = (s || "").match(/\[sound:([^\]]+)\]/);
  return m ? m[1].trim() : null;
};
const extractImg = (s) => {
  const m = (s || "").match(/<img[^>]*src=['"]([^'"]+)['"]/i);
  return m ? m[1].trim() : null;
};
const lessonFromDeck = (name) => {
  if (!name) return null;
  const m = name.match(/Lesson-(\d+)/i);
  if (m) return parseInt(m[1], 10);
  if (/^ClASS$/i.test(name)) return 0; // parent bucket -> "Extra" words
  return null; // Default etc. -> skip
};

/* --- media copy ----------------------------------------------------------- */
fs.rmSync(MEDIA_DIR, { recursive: true, force: true });
for (const sub of ["pic", "audio", "sentence"]) {
  fs.mkdirSync(path.join(MEDIA_DIR, sub), { recursive: true });
}
let copied = 0,
  missing = 0;
function copyMedia(realName, destRel) {
  if (!realName) return null;
  const num = numByRealName[realName];
  if (num === undefined) {
    missing++;
    return null;
  }
  const src = path.join(TMP, num);
  if (!fs.existsSync(src)) {
    missing++;
    return null;
  }
  fs.copyFileSync(src, path.join(MEDIA_DIR, destRel));
  copied++;
  return destRel;
}

/* --- 3. notes -> schema --------------------------------------------------- */
const rows = query(
  `SELECT n.id AS nid, n.flds AS flds, MIN(c.did) AS did
     FROM notes n JOIN cards c ON c.nid = n.id
    GROUP BY n.id`
);

const vocab = [];
for (const row of rows) {
  const vals = row.flds.split("\x1f");
  const f = {};
  FIELDS.forEach((name, i) => (f[name] = vals[i] || ""));

  const id = row.nid; // stable integer key
  const lesson = lessonFromDeck(deckNameById[row.did]);
  if (lesson === null) continue; // skip Default / non-lesson notes

  // Front is the kana headword (also the reading); Kanji is the kanji form.
  const word = stripHtml(f.Front);
  if (!word) continue;

  const picRef = extractImg(f.Picture);
  const audioRef = extractSound(f.Pronounce) || extractSound(f.Front);
  const sentAudioRef = extractSound(f["japanese_sentence-audio"]);

  const picture = picRef ? copyMedia(picRef, `pic/${id}.png`) : null;
  const audio = audioRef ? copyMedia(audioRef, `audio/${id}.mp3`) : null;
  const exAudio = sentAudioRef
    ? copyMedia(sentAudioRef, `sentence/${id}.mp3`)
    : null;

  vocab.push({
    id,
    lesson,
    word,
    kanji: clean(f.Kanji),
    reading: word, // Front is already kana
    romaji: stripHtml(f.Romaji),
    meaning_en: stripHtml(f.English),
    picture,
    audio,
    example: {
      jp: stripHtml(f.japanese_sentence),
      en: stripHtml(f.sentence_in_english),
      romaji: stripHtml(f.sentence_in_romaji),
      audio: exAudio,
    },
    forms: {
      masu: clean(f["ますForm"]),
      te: clean(f["て_form"]),
      ta: clean(f["た_Form"]),
      nai: clean(f.Negative_form),
      dict: clean(f.Dictionary),
    },
  });
}

vocab.sort((a, b) => a.lesson - b.lesson || a.id - b.id);

/* --- 4. write vocab.json -------------------------------------------------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
const json = JSON.stringify(vocab, null, 0);
fs.writeFileSync(path.join(DATA_DIR, "vocab.json"), json);
// Also emit a plain-script version so the app runs from file:// (double-click),
// without a server — ES-module import + fetch() are blocked on file://.
fs.writeFileSync(
  path.join(DATA_DIR, "vocab.js"),
  "window.VOCAB_DATA = " + json + ";\n"
);

/* --- 4b. bundled sets: Minna + any files in sets/ (shared via git) --------- */
const SETS_DIR = path.join(ROOT, "sets");
const extraSets = [];
if (fs.existsSync(SETS_DIR)) {
  for (const file of fs.readdirSync(SETS_DIR).sort()) {
    const full = path.join(SETS_DIR, file);
    const name = file.replace(/\.(json|csv|tsv|txt)$/i, "");
    try {
      let words = [];
      if (/\.json$/i.test(file)) {
        const arr = JSON.parse(fs.readFileSync(full, "utf8"));
        words = (Array.isArray(arr) ? arr : arr.words || []);
      } else if (/\.(csv|tsv|txt)$/i.test(file)) {
        words = parseDelimited(fs.readFileSync(full, "utf8"));
      } else continue;
      words = words.map((w, i) => ({
        id: w.id || `${name}-${i}`, lesson: w.lesson || 1, word: w.word, kanji: w.kanji || "",
        reading: w.reading || w.word, romaji: w.romaji || "", meaning_en: w.meaning_en || w.meaning || "",
        tags: w.tags || [],
        picture: null, audio: null, example: w.example || { jp: "", en: "", audio: null }, forms: w.forms || {},
      })).filter((w) => w.word);
      if (words.length) { extraSets.push({ id: "bundled-" + name.toLowerCase().replace(/\s+/g, "-"), name, words }); }
    } catch (e) { console.warn("  skip set " + file + ": " + e.message); }
  }
}
const bundledJs =
  "window.BUNDLED_SETS = [\n" +
  extraSets.map((s) => "  " + JSON.stringify(s)).join(",\n") +
  (extraSets.length ? "\n" : "") +
  "];\n";
fs.writeFileSync(path.join(DATA_DIR, "bundled.js"), bundledJs);

function parseDelimited(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  lines.forEach((line, i) => {
    const delim = line.includes("\t") ? "\t" : (line.includes(",") ? "," : ";");
    const c = line.split(delim).map((x) => x.trim().replace(/^"|"$/g, ""));
    if (i === 0 && c.map((x) => x.toLowerCase()).some((x) => ["word", "reading", "meaning", "kana"].includes(x))) return;
    if (!c[0]) return;
    out.push({ word: c[0], reading: c[1] || c[0], meaning: c[2] || "", kanji: c[3] || "", lesson: parseInt(c[4], 10) || 1 });
  });
  return out;
}

/* --- report --------------------------------------------------------------- */
const lessons = [...new Set(vocab.map((v) => v.lesson))].sort((a, b) => a - b);
console.log(`\n✓ Wrote data/vocab.json — ${vocab.length} words, ${lessons.length} lessons`);
console.log(`  media copied: ${copied}  (missing refs: ${missing})`);
console.log(`  with picture: ${vocab.filter((v) => v.picture).length}`);
console.log(`  with audio:   ${vocab.filter((v) => v.audio).length}`);
console.log(`  with example: ${vocab.filter((v) => v.example.jp).length}`);
console.log(`  bundled sets: ${extraSets.length}${extraSets.length ? " (" + extraSets.map((s) => s.name).join(", ") + ")" : ""}`);

// Clean up temp extraction
fs.rmSync(TMP, { recursive: true, force: true });
