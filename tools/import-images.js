#!/usr/bin/env node
/* ============================================================================
 * import-images.js — pull word images from a drop folder into sets-media/.
 *
 *   node tools/import-images.js ["/path/to/source"] ["Set Name"]
 *   (defaults: ~/Desktop/jp samples  and  Minna no Nihongo - Vietnamese)
 *
 * For each image whose name (romaji, or Japanese → romanized) matches a word's
 * reading, it converts to JPEG, resizes to ≤500 px (aspect kept, no distortion),
 * writes sets-media/<romaji>.jpg, and DELETES the source file. Files that don't
 * match any word are left in place and listed, so you can rename them.
 *
 * After running:  node convert.js   (auto-links the new images).
 * ========================================================================== */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { romajiFile } = require("./romaji");

const ROOT = path.join(__dirname, "..");
const SRC = process.argv[2] || path.join(os.homedir(), "Desktop", "jp samples");
const setName = process.argv[3] || "Minna no Nihongo - Vietnamese";
const DEST = path.join(ROOT, "sets-media");

if (!fs.existsSync(SRC)) { console.error("Source folder not found:", SRC); process.exit(1); }
fs.mkdirSync(DEST, { recursive: true });

const words = JSON.parse(fs.readFileSync(path.join(ROOT, "sets", setName + ".json"), "utf8"));
const stemToWord = {};
for (const w of words) stemToWord[romajiFile(w.reading || w.word)] = w;

const IMG = /\.(png|jpe?g|webp|gif)$/i;
const hasJP = (s) => /[぀-ヿ㐀-鿿]/.test(s);

let done = 0; const unmatched = [];
for (const f of fs.readdirSync(SRC)) {
  if (!IMG.test(f)) continue;
  const base = f.replace(/\.[^.]+$/, "");
  const stem = hasJP(base) ? romajiFile(base) : base.toLowerCase().replace(/[^a-z0-9]/g, "");
  const w = stemToWord[stem];
  if (!w) { unmatched.push(f); continue; }
  const dest = path.join(DEST, stem + ".jpg");
  execFileSync("sips", ["-Z", "500", "-s", "format", "jpeg", "-s", "formatOptions", "72",
    path.join(SRC, f), "--out", dest], { stdio: "ignore" });
  fs.unlinkSync(path.join(SRC, f));
  console.log(`  ${f}  →  sets-media/${stem}.jpg  (${w.kanji || w.word} · ${w.meaning_en})`);
  done++;
}

console.log(`\n✓ imported ${done} image(s), deleted from source.`);
if (unmatched.length) {
  console.log(`\n⚠ ${unmatched.length} unmatched (left in source — rename to a word's romaji):`);
  for (const f of unmatched) console.log(`   ${f}`);
}
