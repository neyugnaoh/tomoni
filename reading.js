/* ============================================================================
 * reading.js — Japanese number / time / currency reading engine
 * Pure, dependency-free ES module. Reused by the Numbers & Time trainer.
 * All sound changes verified by runReadingTests().
 * ========================================================================== */

const DIGIT_KANJI = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const DIGIT_YOMI  = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
const TENS_YOMI = ["", "じゅう", "にじゅう", "さんじゅう", "よんじゅう", "ごじゅう", "ろくじゅう", "ななじゅう", "はちじゅう", "きゅうじゅう"];
const HUNDREDS_YOMI = ["", "ひゃく", "にひゃく", "さんびゃく", "よんひゃく", "ごひゃく", "ろっぴゃく", "ななひゃく", "はっぴゃく", "きゅうひゃく"];
const THOUSANDS_YOMI = ["", "せん", "にせん", "さんぜん", "よんせん", "ごせん", "ろくせん", "ななせん", "はっせん", "きゅうせん"];

const MAX_NUMBER = 99999999; // up to 9999万9999 (just under 億)

function kanji4(n) {
  const th = Math.floor(n / 1000);
  const hu = Math.floor((n % 1000) / 100);
  const te = Math.floor((n % 100) / 10);
  const on = n % 10;
  let out = "";
  if (th) out += (th === 1 ? "" : DIGIT_KANJI[th]) + "千";
  if (hu) out += (hu === 1 ? "" : DIGIT_KANJI[hu]) + "百";
  if (te) out += (te === 1 ? "" : DIGIT_KANJI[te]) + "十";
  if (on) out += DIGIT_KANJI[on];
  return out;
}

function yomi4(n) {
  const th = Math.floor(n / 1000);
  const hu = Math.floor((n % 1000) / 100);
  const te = Math.floor((n % 100) / 10);
  const on = n % 10;
  let out = "";
  if (th) out += THOUSANDS_YOMI[th];
  if (hu) out += HUNDREDS_YOMI[hu];
  if (te) out += TENS_YOMI[te];
  if (on) out += DIGIT_YOMI[on];
  return out;
}

function numberToKanji(n) {
  if (n === 0) return "零";
  if (n < 0 || n > MAX_NUMBER || !Number.isInteger(n)) throw new RangeError("numberToKanji supports integers 0.." + MAX_NUMBER);
  if (n < 10000) return kanji4(n);
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  let out = kanji4(man) + "万";
  if (rest) out += kanji4(rest);
  return out;
}

function numberToYomi(n) {
  if (n === 0) return "ゼロ";
  if (n < 0 || n > MAX_NUMBER || !Number.isInteger(n)) throw new RangeError("numberToYomi supports integers 0.." + MAX_NUMBER);
  if (n < 10000) return yomi4(n);
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  let out = yomi4(man) + "まん";
  if (rest) out += yomi4(rest);
  return out;
}

const HOUR_YOMI = {
  1: "いちじ", 2: "にじ", 3: "さんじ", 4: "よじ", 5: "ごじ",
  6: "ろくじ", 7: "しちじ", 8: "はちじ", 9: "くじ",
  10: "じゅうじ", 11: "じゅういちじ", 12: "じゅうにじ"
};

function hourToKanji(h) {
  if (h < 1 || h > 12 || !Number.isInteger(h)) throw new RangeError("hour 1..12");
  return numberToKanji(h) + "時";
}
function hourToYomi(h) {
  if (h < 1 || h > 12 || !Number.isInteger(h)) throw new RangeError("hour 1..12");
  return HOUR_YOMI[h];
}

const MINUTE_UNIT_YOMI = {
  0: "", 1: "いっぷん", 2: "にふん", 3: "さんぷん", 4: "よんぷん", 5: "ごふん",
  6: "ろっぷん", 7: "ななふん", 8: "はっぷん", 9: "きゅうふん", 10: "じゅっぷん"
};

function minuteToYomi(m) {
  if (m < 0 || m > 59 || !Number.isInteger(m)) throw new RangeError("minute 0..59");
  if (m === 0) return "";
  if (m <= 10) return MINUTE_UNIT_YOMI[m];
  const tens = Math.floor(m / 10);
  const ones = m % 10;
  if (ones === 0) return DIGIT_YOMI[tens] + "じゅっぷん";
  return DIGIT_YOMI[tens] + "じゅう" + MINUTE_UNIT_YOMI[ones];
}

function minuteToKanji(m) {
  if (m < 0 || m > 59 || !Number.isInteger(m)) throw new RangeError("minute 0..59");
  if (m === 0) return "";
  return numberToKanji(m) + "分";
}

function timeToReading(h, m) {
  const numeral = h + ":" + String(m).padStart(2, "0");
  if (m === 0) {
    return { numeral, kanji: hourToKanji(h) + "（ちょうど）", yomi: hourToYomi(h) + "ちょうど" };
  }
  return { numeral, kanji: hourToKanji(h) + minuteToKanji(m), yomi: hourToYomi(h) + minuteToYomi(m) };
}

const CURRENCY = {
  yen:    { symbol: "¥", before: true,  unitKanji: "円",   unitYomi: "えん", yenRule: true },
  dollar: { symbol: "$", before: true,  unitKanji: "ドル", unitYomi: "ドル" },
  dong:   { symbol: "₫", before: false, unitKanji: "ドン", unitYomi: "ドン" }
};

function currencyToReading(n, cur) {
  const c = CURRENCY[cur];
  if (!c) throw new RangeError("unknown currency: " + cur);
  let yomi = numberToYomi(n);
  if (c.yenRule && yomi.endsWith("よん")) yomi = yomi.slice(0, -2) + "よ";
  const amount = n.toLocaleString("en-US");
  return {
    numeral: c.before ? c.symbol + amount : amount + c.symbol,
    kanji: numberToKanji(n) + c.unitKanji,
    yomi: yomi + c.unitYomi
  };
}

const ROMAJI_MAP = {
  "きゃ":"kya","きゅ":"kyu","きょ":"kyo","しゃ":"sha","しゅ":"shu","しょ":"sho",
  "ちゃ":"cha","ちゅ":"chu","ちょ":"cho","にゃ":"nya","にゅ":"nyu","にょ":"nyo",
  "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo","みゃ":"mya","みゅ":"myu","みょ":"myo",
  "りゃ":"rya","りゅ":"ryu","りょ":"ryo","ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
  "じゃ":"ja","じゅ":"ju","じょ":"jo","びゃ":"bya","びゅ":"byu","びょ":"byo",
  "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",
  "あ":"a","い":"i","う":"u","え":"e","お":"o",
  "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
  "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
  "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
  "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
  "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
  "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
  "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
  "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
  "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
  "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
  "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
  "や":"ya","ゆ":"yu","よ":"yo",
  "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
  "わ":"wa","を":"wo","ん":"n","ー":"-"
};

function toRomaji(kana) {
  let out = "";
  let i = 0;
  while (i < kana.length) {
    const two = kana.slice(i, i + 2);
    const one = kana[i];
    if (one === "っ") {
      const nextTwo = kana.slice(i + 1, i + 3);
      const nextOne = kana[i + 1];
      const r = ROMAJI_MAP[nextTwo] || ROMAJI_MAP[nextOne] || "";
      if (r) out += r[0];
      i += 1;
      continue;
    }
    if (ROMAJI_MAP[two]) { out += ROMAJI_MAP[two]; i += 2; continue; }
    if (ROMAJI_MAP[one]) { out += ROMAJI_MAP[one]; i += 1; continue; }
    out += one; i += 1;
  }
  return out;
}

/* Optional self-test — call from console: runReadingTests() */
function runReadingTests() {
  const cases = [];
  const eq = (name, got, want) => cases.push({ name, got, want, ok: got === want });
  eq("425 kanji", numberToKanji(425), "四百二十五");
  eq("300 yomi", numberToYomi(300), "さんびゃく");
  eq("600 yomi", numberToYomi(600), "ろっぴゃく");
  eq("800 yomi", numberToYomi(800), "はっぴゃく");
  eq("3000 yomi", numberToYomi(3000), "さんぜん");
  eq("8000 yomi", numberToYomi(8000), "はっせん");
  eq("10000 yomi", numberToYomi(10000), "いちまん");
  eq("12345 yomi", numberToYomi(12345), "いちまんにせんさんびゃくよんじゅうご");
  eq("3000000 yomi", numberToYomi(3000000), "さんびゃくまん");
  eq("4時", hourToYomi(4), "よじ");
  eq("7時", hourToYomi(7), "しちじ");
  eq("9時", hourToYomi(9), "くじ");
  eq("1分", minuteToYomi(1), "いっぷん");
  eq("30分", minuteToYomi(30), "さんじゅっぷん");
  eq("4:25", timeToReading(4, 25).yomi, "よじにじゅうごふん");
  eq("¥4", currencyToReading(4, "yen").yomi, "よえん");
  eq("$4", currencyToReading(4, "dollar").yomi, "よんドル");
  const failed = cases.filter(c => !c.ok);
  if (failed.length === 0) console.log(`%c✓ reading.js: all ${cases.length} tests passed`, "color:#2a7");
  else { console.error(`✗ reading.js: ${failed.length}/${cases.length} failed`); failed.forEach(c => console.error(` ${c.name}: got "${c.got}" want "${c.want}"`)); }
  return failed.length === 0;
}
