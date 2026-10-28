#!/usr/bin/env node
/* ============================================================================
 * gen-image-helper.js — build a clickable image-sourcing page for a vocab set.
 *
 *   node tools/gen-image-helper.js ["Set Name"]   (default: the Vietnamese set)
 *
 * For every word that has NO picture yet, it emits a row with:
 *   - the word (kanji + reading) + Vietnamese & English meaning
 *   - the exact filename to save the image as (romaji → sets-media/<name>.jpg)
 *   - one-click buttons: Google Images, Google イラスト (illustrations),
 *     Irasutoya (free clipart), Bing Images
 *
 * Workflow: open tools/image-search.html → click a button → pick an image →
 * save it into sets-media/ with the shown filename → `node convert.js`.
 * (Saving with the shown romaji name lets convert.js auto-link it — see below.)
 * ========================================================================== */
const fs = require("fs");
const path = require("path");
const { romajiFile } = require("./romaji");

const ROOT = path.join(__dirname, "..");
const setName = process.argv[2] || "Minna no Nihongo - Vietnamese";
const setPath = path.join(ROOT, "sets", setName + ".json");
if (!fs.existsSync(setPath)) { console.error("Set not found:", setPath); process.exit(1); }

const words = JSON.parse(fs.readFileSync(setPath, "utf8"));

// A word already has an image if its JSON sets `picture`, or a sets-media/ file
// matches its romaji (the same auto-link rule convert.js uses).
const SETS_MEDIA = path.join(ROOT, "sets-media");
const haveStem = new Set();
if (fs.existsSync(SETS_MEDIA)) {
  for (const f of fs.readdirSync(SETS_MEDIA)) {
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(f)) haveStem.add(f.replace(/\.[^.]+$/, "").toLowerCase());
  }
}
const missing = words.filter((w) => !w.picture && !haveStem.has(romajiFile(w.reading || w.word)));

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const q = (s) => encodeURIComponent(s);

const row = (w) => {
  const jp = w.kanji || w.word;
  const file = romajiFile(w.reading || w.word) + ".jpg";
  const g = `https://www.google.com/search?tbm=isch&q=${q(jp)}`;
  const gi = `https://www.google.com/search?tbm=isch&q=${q(jp + " イラスト")}`;
  const ira = `https://www.google.com/search?q=${q("site:irasutoya.com " + jp)}`;
  const bing = `https://www.bing.com/images/search?q=${q(jp)}`;
  return `<tr>
    <td class="jp">${esc(jp)}<div class="rd">${esc(w.reading)}</div></td>
    <td class="mn">${esc(w.meaning_en)}<div class="ls">Bài ${w.lesson}</div></td>
    <td class="fn"><code>${esc(file)}</code></td>
    <td class="lk">
      <a href="${g}" target="_blank">Google ảnh</a>
      <a href="${gi}" target="_blank">イラスト</a>
      <a href="${ira}" target="_blank">Irasutoya</a>
      <a href="${bing}" target="_blank">Bing</a>
    </td></tr>`;
};

const html = `<!doctype html><meta charset="utf-8"><title>Image search — ${esc(setName)}</title>
<style>
 body{font-family:system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#222}
 h1{font-size:1.2rem} .sub{color:#666;margin-bottom:16px}
 table{border-collapse:collapse;width:100%} td{border-bottom:1px solid #eee;padding:8px 6px;vertical-align:top}
 .jp{font-size:1.25rem;white-space:nowrap} .rd{font-size:.8rem;color:#888}
 .mn{font-size:.9rem} .ls{font-size:.72rem;color:#aaa}
 .fn code{background:#f3f1ea;padding:2px 6px;border-radius:5px;font-size:.82rem;white-space:nowrap}
 .lk a{display:inline-block;margin:0 .35rem .3rem 0;font-size:.82rem;text-decoration:none;
   background:#1b2a4a;color:#fff;padding:3px 9px;border-radius:99px}
 .lk a:nth-child(2){background:#3a6ea5}.lk a:nth-child(3){background:#2e7d4f}.lk a:nth-child(4){background:#777}
</style>
<h1>Tìm ảnh — ${esc(setName)}</h1>
<div class="sub">${missing.length} từ chưa có ảnh. Bấm nút → chọn ảnh → lưu vào <code>sets-media/</code> với tên hiển thị → <code>node convert.js</code>.</div>
<table>${missing.map(row).join("")}</table>`;

const out = path.join(__dirname, "image-search.html");
fs.writeFileSync(out, html);
console.log(`✓ ${out}`);
console.log(`  ${missing.length} words without images (of ${words.length} total)`);
