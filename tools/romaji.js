/* Compact kana → romaji for stable ASCII filenames (Hepburn-ish, literal).
 * Not a full linguistic transliterator — good enough for slugs like
 * べんきょうします → benkyoushimasu, ゆうびんきょく → yuubinkyoku. */
const BASE = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",
  か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",
  さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
  た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",
  な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",
  は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
  ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",
  ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",を:"o",ん:"n",
  ぁ:"a",ぃ:"i",ぅ:"u",ぇ:"e",ぉ:"o",
};
const YOUON = {
  きゃ:"kya",きゅ:"kyu",きょ:"kyo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",
  しゃ:"sha",しゅ:"shu",しょ:"sho",じゃ:"ja",じゅ:"ju",じょ:"jo",
  ちゃ:"cha",ちゅ:"chu",ちょ:"cho",にゃ:"nya",にゅ:"nyu",にょ:"nyo",
  ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",びゃ:"bya",びゅ:"byu",びょ:"byo",
  ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",みゃ:"mya",みゅ:"myu",みょ:"myo",
  りゃ:"rya",りゅ:"ryu",りょ:"ryo",
};
// Katakana → hiragana so one table covers both.
const kataToHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

function romaji(input) {
  let s = kataToHira(String(input || "")).replace(/[ー・]/g, (c) => (c === "ー" ? "ー" : ""));
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const two = s.substr(i, 2);
    if (YOUON[two]) { out += YOUON[two]; i++; continue; }
    const c = s[i];
    if (c === "っ") { // sokuon: double the next consonant
      const nx = YOUON[s.substr(i + 1, 2)] || BASE[s[i + 1]] || "";
      if (nx) out += nx[0];
      continue;
    }
    if (c === "ー") { const last = out.slice(-1); if (/[aeiou]/.test(last)) out += last; continue; }
    out += BASE[c] != null ? BASE[c] : "";
  }
  return out;
}
// Filesystem-safe slug: romaji, lowercase, ascii only.
const romajiFile = (s) => romaji(s).toLowerCase().replace(/[^a-z0-9]+/g, "") || "img";

module.exports = { romaji, romajiFile };
