/* ============================================================================
 * app.js — Japanese Learner (Minna no Nihongo N5)
 * Classic script (runs from file://). Depends on reading.js globals and
 * window.VOCAB_DATA (data/vocab.js), both loaded before this file.
 * Design: genkō-yōshi cells, furigana stacking, maru/batsu ink feedback.
 * ========================================================================== */

/* ------------------------------------------------------------------- icons */
const ICON = {
  seal: `<svg class="seal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 8.5h8M12 8v8M8 15.5h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  sound: `<svg class="ico" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" class="ico-fill"/><path d="M9 8.5a5 5 0 010 7"/><path d="M12.5 6a9 9 0 010 12"/><path d="M16 3.5a13 13 0 010 17"/></svg>`,
  next: `<svg class="ico" viewBox="0 0 24 24"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg>`,
  back: `<svg class="ico" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>`,
  close: `<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  settings: `<svg class="ico" viewBox="0 0 24 24"><path d="M3 7.5h9M16.5 7.5H21M3 16.5h4.5M12 16.5H21"/><circle cx="14" cy="7.5" r="2.3"/><circle cx="9.5" cy="16.5" r="2.3"/></svg>`,
  streak: `<svg class="ico" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 8v8M11 8v8M14 8v8" stroke-width="1.3"/><path d="M6.5 15.8l11-6.5" stroke-width="1.3"/></svg>`,
  xp: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 3.5l2.5 5.6 6 .5-4.6 4 1.4 5.9L12 16.9 6.3 19.5l1.4-5.9-4.6-4 6-.5z" stroke-linejoin="round"/></svg>`,
  heart: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-9.6A3.6 3.6 0 0112 7.8a3.6 3.6 0 017 2.6C19 15.5 12 20 12 20z" class="ico-fill" stroke="none"/></svg>`,
  practice: `<svg class="ico" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 10-1 4.3"/><path d="M20 4.5v5h-5"/></svg>`,
  maru: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>`,
  batsu: `<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  library: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 3.5l9 4.8-9 4.8-9-4.8 9-4.8z"/><path d="M3 12.3l9 4.8 9-4.8"/></svg>`,
  plus: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  trash: `<svg class="ico" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></svg>`,
  pencil: `<svg class="ico" viewBox="0 0 24 24"><path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>`,
  info: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5" stroke-width="1.9"/><circle cx="12" cy="7.6" r="0.4" class="ico-fill"/></svg>`,
  download: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>`,
};
const ENSO = `<svg class="enso" viewBox="0 0 100 100" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" d="M52 13 C80 14 90 40 85 58 C80 80 58 90 40 85 C19 80 10 56 17 38 C23 22 40 13 60 15"/></svg>`;
function maruMark() { return `<div class="mark maru"><svg viewBox="0 0 100 100"><path class="stroke" pathLength="1" d="M52 13 C80 14 90 40 85 58 C80 80 58 90 40 85 C19 80 10 56 17 38 C23 22 40 13 60 15"/></svg></div>`; }
function batsuMark() { return `<div class="mark batsu"><svg viewBox="0 0 100 100"><path class="stroke s1" pathLength="1" d="M24 22 L78 80"/><path class="stroke s2" pathLength="1" d="M79 24 L23 80"/></svg></div>`; }

/* ------------------------------------------------------------------- i18n */
const I18N = {
  vi: {
    _name: "Tiếng Việt", brand: "Tomoni",
    dashVocab: "Từ vựng", dashNumbers: "Số & Giờ", numbersSub: "Đọc · nghe · tiền tệ", comingSoon: "Sắp có",
    areaKanji: "Kanji", areaGrammar: "Ngữ pháp", areaListen: "Luyện nghe", areaTalk: "Hội thoại",
    dailyGoal: "Mục tiêu hôm nay", goalDone: "Đã đạt mục tiêu!", xpToday: "XP hôm nay",
    coreLessons: "Minna no Nihongo N5 · 25 bài",
    extra: "Thêm", numbers: "Số & Giờ",
    practice: "Ôn tập", practiceSub: (n) => `${n} từ đến hạn`, practiceNone: "Ôn lại các từ yếu nhất",
    lesson: "Bài", wordsN: (n) => `${n} từ`,
    learn: "Học từ", test: "Kiểm tra", learnFirst: "Học hết từ rồi kiểm tra", reviewWords: "Xem lại từ",
    learnProgress: (a, b) => `${a} / ${b}`, learnDone: "Đã xem hết từ", startTest: "Bắt đầu kiểm tra",
    check: "Kiểm tra", cont: "Tiếp tục", again: "Chưa thuộc", good: "Đã thuộc",
    correct: "Đúng", wrong: "Chưa đúng", answerWas: "Đáp án:",
    iMeaning: "Từ này nghĩa là gì?", iWord: "Từ nào mang nghĩa này?", iListen: "Nghe và chọn từ",
    iType: "Gõ cách đọc (romaji hoặc kana)", iFlip: "Chạm để lật — tự chấm",
    typePh: "romaji…", tap: "chạm để hiện",
    resPass: "Hoàn thành!", resFail: "Cố thêm chút nữa",
    accuracy: "Chính xác", words: "Từ", xp: "XP", backHome: "Về trang chính", retry: "Làm lại",
    settings: "Cài đặt", language: "Ngôn ngữ",
    voiceLabel: "Giọng đọc", voiceSub: "Chọn giọng tự nhiên nhất", voiceAuto: "Tự động (tốt nhất)",
    ttsNeural: "Giọng neural (Azure)", ttsNeuralSub: "Giọng tự nhiên qua proxy", ttsVoice: "Giọng", ttsTest: "Nghe thử",
    ttsHelp: "Xem worker/README.md để cài đặt proxy miễn phí.", ttsOk: "Giọng neural OK", ttsErr: "Lỗi kết nối — dùng giọng máy",
    strict: "Chế độ nghiêm", strictSub: "Hết tim thì dừng bài",
    sound: "Âm thanh", soundSub: "Hiệu ứng khi trả lời",
    reset: "Xóa tiến trình", resetSub: "Xóa toàn bộ dữ liệu", resetConfirm: "Xóa toàn bộ tiến trình?",
    ntNumber: "Số", ntTime: "Giờ", ntCurrency: "Tiền tệ",
    ntRange: "Phạm vi", ntWriting: "Cách viết", ntBoth: "Cả hai", ntKanji: "Kanji", ntKana: "Kana",
    ntCur: "Tiền", ntListen: "Nghe", ntNext: "Tiếp", ntReadAloud: "Hãy đọc to",
    ntRead: "Đọc", ntListenMode: "Luyện nghe", ntListenFill: "Nghe rồi điền số",
    guideTitle: "Quy tắc đọc", tag_change: "biến âm", tag_irregular: "bất quy tắc", tag_keep1: "giữ 一", tag_drop1: "bỏ 一", tag_two: "2 cách đọc",
    youTyped: "Bạn điền", answerLabel: "Đáp án",
    setBar: "Bộ từ", sets: "Bộ từ vựng", chooseSet: "Chọn bộ từ để học", current: "Đang dùng",
    importBtn: "Nhập (.apkg / .json)", exportApkg: "Xuất .apkg", exportJson: "Xuất .json",
    builtin: "Có sẵn", deleteSet: "Xóa bộ từ", deleteSetConfirm: "Xóa bộ từ này?", restoreBuiltin: "Khôi phục bộ có sẵn",
    importing: "Đang nhập…", imported: (n) => `Đã nhập ${n} từ`, importFail: "Nhập thất bại: ",
    createSet: "Tạo bộ từ", createHelp: "Tự nhập hoặc dán danh sách từ (cũng mở được file .csv).",
    createName: "Tên bộ từ", createFormat: "Mỗi dòng một từ — từ, cách đọc, nghĩa, kanji, bài (cách nhau bằng dấu phẩy hoặc tab)",
    createMake: "Tạo", createEmpty: "Chưa có từ nào",
    editSet: "Sửa bộ từ", addWords: "Thêm từ (cuốn chiếu)", addBtn: "Thêm vào",
    loading: "Đang tải…",
  },
  en: {
    _name: "English", brand: "Tomoni",
    dashVocab: "Vocabulary", dashNumbers: "Numbers & Time", numbersSub: "Read · listen · money", comingSoon: "Coming soon",
    areaKanji: "Kanji", areaGrammar: "Grammar", areaListen: "Listening", areaTalk: "Conversation",
    dailyGoal: "Daily goal", goalDone: "Goal reached!", xpToday: "XP today",
    coreLessons: "Minna no Nihongo N5 · 25 lessons",
    extra: "Extra", numbers: "Numbers & Time",
    practice: "Practice", practiceSub: (n) => `${n} words due`, practiceNone: "Review your weakest words",
    lesson: "Lesson", wordsN: (n) => `${n} words`,
    learn: "Learn", test: "Test", learnFirst: "Learn the words, then test", reviewWords: "Review words",
    learnProgress: (a, b) => `${a} / ${b}`, learnDone: "All words reviewed", startTest: "Start the test",
    check: "Check", cont: "Continue", again: "Again", good: "Got it",
    correct: "Correct", wrong: "Not quite", answerWas: "Answer:",
    iMeaning: "What does this mean?", iWord: "Which word means this?", iListen: "Listen and choose",
    iType: "Type the reading (romaji or kana)", iFlip: "Tap to flip — self grade",
    typePh: "romaji…", tap: "tap to reveal",
    resPass: "Complete!", resFail: "Almost there",
    accuracy: "Accuracy", words: "Words", xp: "XP", backHome: "Back home", retry: "Retry",
    settings: "Settings", language: "Language",
    voiceLabel: "Voice", voiceSub: "Pick the most natural voice", voiceAuto: "Auto (best)",
    ttsNeural: "Neural voice (Azure)", ttsNeuralSub: "Natural voice via your proxy", ttsVoice: "Voice", ttsTest: "Test",
    ttsHelp: "See worker/README.md to set up the free proxy.", ttsOk: "Neural voice OK", ttsErr: "Can't connect — using device voice",
    strict: "Strict mode", strictSub: "Running out of hearts ends the lesson",
    sound: "Sound", soundSub: "Answer sound effects",
    reset: "Reset progress", resetSub: "Erase all data", resetConfirm: "Erase all progress?",
    ntNumber: "Numbers", ntTime: "Time", ntCurrency: "Money",
    ntRange: "Range", ntWriting: "Writing", ntBoth: "Both", ntKanji: "Kanji", ntKana: "Kana",
    ntCur: "Currency", ntListen: "Listen", ntNext: "Next", ntReadAloud: "Read this aloud",
    ntRead: "Read", ntListenMode: "Listening", ntListenFill: "Listen and type the number",
    guideTitle: "Reading rules", tag_change: "sound change", tag_irregular: "irregular", tag_keep1: "keeps 一", tag_drop1: "drops 一", tag_two: "2 readings",
    youTyped: "You typed", answerLabel: "Answer",
    setBar: "Set", sets: "Vocabulary sets", chooseSet: "Choose a set to study", current: "In use",
    importBtn: "Import (.apkg / .json)", exportApkg: "Export .apkg", exportJson: "Export .json",
    builtin: "Built-in", deleteSet: "Delete set", deleteSetConfirm: "Delete this set?", restoreBuiltin: "Restore built-in set",
    importing: "Importing…", imported: (n) => `Imported ${n} words`, importFail: "Import failed: ",
    createSet: "Create set", createHelp: "Type or paste a word list (also opens .csv files).",
    createName: "Set name", createFormat: "One word per line — word, reading, meaning, kanji, lesson (comma- or tab-separated)",
    createMake: "Create", createEmpty: "No words yet",
    editSet: "Edit set", addWords: "Add words", addBtn: "Add",
    loading: "Loading…",
  },
  ja: {
    _name: "日本語", brand: "Tomoni 共に",
    dashVocab: "語彙", dashNumbers: "数字と時間", numbersSub: "読む・聞く・通貨", comingSoon: "近日公開",
    areaKanji: "漢字", areaGrammar: "文法", areaListen: "聞き取り", areaTalk: "会話",
    dailyGoal: "今日の目標", goalDone: "目標達成！", xpToday: "今日のXP",
    coreLessons: "みんなの日本語 N5 · 全25課",
    extra: "その他", numbers: "数字と時間",
    practice: "復習", practiceSub: (n) => `${n}語 期限`, practiceNone: "苦手な語を復習",
    lesson: "第", wordsN: (n) => `${n}語`,
    learn: "学ぶ", test: "テスト", learnFirst: "学んでからテスト", reviewWords: "語を見る",
    learnProgress: (a, b) => `${a} / ${b}`, learnDone: "全部見ました", startTest: "テスト開始",
    check: "こたえる", cont: "つづける", again: "もう一度", good: "できた",
    correct: "正解", wrong: "ざんねん", answerWas: "こたえ：",
    iMeaning: "意味は？", iWord: "この意味の語は？", iListen: "聞いて選ぼう",
    iType: "読みを入力（ローマ字/かな）", iFlip: "タップしてめくる — 自己採点",
    typePh: "ローマ字…", tap: "タップして表示",
    resPass: "クリア！", resFail: "もう少し",
    accuracy: "正答率", words: "語", xp: "XP", backHome: "ホームへ", retry: "もう一度",
    settings: "設定", language: "言語",
    voiceLabel: "音声", voiceSub: "自然な音声を選択", voiceAuto: "自動（最適）",
    ttsNeural: "ニューラル音声 (Azure)", ttsNeuralSub: "プロキシ経由の自然な音声", ttsVoice: "音声", ttsTest: "試聴",
    ttsHelp: "設定は worker/README.md を参照（無料）。", ttsOk: "ニューラル音声 OK", ttsErr: "接続できません — 端末の音声を使用",
    strict: "ハードモード", strictSub: "ハートが尽きると終了",
    sound: "効果音", soundSub: "解答時の効果音",
    reset: "進捗リセット", resetSub: "全データ消去", resetConfirm: "進捗を全消去しますか？",
    ntNumber: "数字", ntTime: "時間", ntCurrency: "通貨",
    ntRange: "範囲", ntWriting: "表記", ntBoth: "両方", ntKanji: "漢字", ntKana: "かな",
    ntCur: "通貨", ntListen: "聞く", ntNext: "次へ", ntReadAloud: "声に出して読もう",
    ntRead: "読む", ntListenMode: "聞き取り", ntListenFill: "聞いて数字を入力",
    guideTitle: "読み方", tag_change: "音便", tag_irregular: "不規則", tag_keep1: "一あり", tag_drop1: "一なし", tag_two: "2通り",
    youTyped: "入力", answerLabel: "こたえ",
    setBar: "セット", sets: "単語セット", chooseSet: "学習するセットを選択", current: "使用中",
    importBtn: "読み込み (.apkg / .json)", exportApkg: ".apkg 書き出し", exportJson: ".json 書き出し",
    builtin: "内蔵", deleteSet: "セット削除", deleteSetConfirm: "このセットを削除？", restoreBuiltin: "内蔵セットを復元",
    importing: "読み込み中…", imported: (n) => `${n}語を読み込みました`, importFail: "読み込み失敗: ",
    createSet: "セット作成", createHelp: "単語リストを入力/貼り付け（.csv も可）。",
    createName: "セット名", createFormat: "1行1語 — 単語, 読み, 意味, 漢字, 課（カンマ/タブ区切り）",
    createMake: "作成", createEmpty: "単語がありません",
    editSet: "セット編集", addWords: "単語を追加", addBtn: "追加",
    loading: "読み込み中…",
  },
};
let LANG = "vi";
function t(key, ...a) { const v = (I18N[LANG] && I18N[LANG][key]) ?? I18N.en[key] ?? key; return typeof v === "function" ? v(...a) : v; }

/* ------------------------------------------------------------------- state */
const SKEY = "jl-state-v1";
const DEFAULT_STATE = () => ({
  progress: {}, lessons: {},
  stats: { streak: 0, lastStudied: null, xp: 0, dailyXp: 0, dailyDate: null, dailyGoal: 40 },
  settings: { lang: "vi", strict: false, sound: true, voice: null, ttsOn: false, ttsUrl: "", azVoice: "ja-JP-NanamiNeural" },
});
let S = load();
function load() { try { const r = JSON.parse(localStorage.getItem(SKEY)); if (r && r.progress) return Object.assign(DEFAULT_STATE(), r); } catch {} return DEFAULT_STATE(); }
function save() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch {} }

/* --------------------------------------------------------------------- SRS */
const DAY = 86400000;
const BOX_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
const now = () => Date.now();
function srsUpdate(id, correct) {
  const p = S.progress[id] || { box: 0, due: 0, seen: 0, correct: 0, wrong: 0 };
  p.seen++;
  if (correct) { p.correct++; p.box = Math.min(5, (p.box || 0) + 1); }
  else { p.wrong++; p.box = 1; }
  p.due = now() + BOX_DAYS[p.box] * DAY;
  S.progress[id] = p;
}
const isDue = (id) => { const p = S.progress[id]; return p && p.due <= now(); };

const todayStr = () => new Date().toISOString().slice(0, 10);
function registerStudyDay() {
  const today = todayStr(); if (S.stats.lastStudied === today) return;
  const y = new Date(Date.now() - DAY).toISOString().slice(0, 10);
  S.stats.streak = S.stats.lastStudied === y ? S.stats.streak + 1 : 1;
  S.stats.lastStudied = today;
}
function addXp(n) { const today = todayStr(); if (S.stats.dailyDate !== today) { S.stats.dailyDate = today; S.stats.dailyXp = 0; } S.stats.xp += n; S.stats.dailyXp += n; }

/* -------------------------------------------------------------- vocab sets */
// Bundled sets = committed in the repo (data/bundled.js → window.BUNDLED_SETS).
// Updating/adding one = commit a file + git push; every user gets it. No DB.
function bundledSets() {
  if (Array.isArray(window.BUNDLED_SETS) && window.BUNDLED_SETS.length) return window.BUNDLED_SETS;
  return [{ id: "minna", name: "Minna no Nihongo N5", words: window.VOCAB_DATA || [] }]; // fallback
}
const bundledById = (id) => bundledSets().find((s) => s.id === id);
const DEFAULT_SET_ID = () => (bundledSets()[0] || {}).id || "minna";
const SETS_KEY = "jl-sets-v1";
let SETSREG = loadSetsReg();
function loadSetsReg() { try { const r = JSON.parse(localStorage.getItem(SETS_KEY)); if (r && r.active) { r.custom ||= []; r.hiddenBundled ||= []; return r; } } catch {} return { active: null, custom: [], hiddenBundled: [] }; }
function saveSetsReg() { try { localStorage.setItem(SETS_KEY, JSON.stringify(SETSREG)); } catch {} }
const activeSetId = () => SETSREG.active || DEFAULT_SET_ID();
function activeSetName() {
  const id = activeSetId();
  return (bundledById(id) || SETSREG.custom.find((s) => s.id === id) || {}).name || "—";
}

/* IndexedDB — custom set payloads (can be large) */
function idbOpen() { return new Promise((res, rej) => { const r = indexedDB.open("jl", 1); r.onupgradeneeded = () => r.result.createObjectStore("sets"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function idbPut(k, v) { const d = await idbOpen(); return new Promise((res, rej) => { const tx = d.transaction("sets", "readwrite"); tx.objectStore("sets").put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
async function idbGet(k) { const d = await idbOpen(); return new Promise((res, rej) => { const tx = d.transaction("sets", "readonly"); const q = tx.objectStore("sets").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function idbDel(k) { const d = await idbOpen(); return new Promise((res, rej) => { const tx = d.transaction("sets", "readwrite"); tx.objectStore("sets").delete(k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }

/* -------------------------------------------------------------------- data */
let VOCAB = [], BY_LESSON = {}; const LESSONS = [];
async function loadVocab() {
  const id = activeSetId();
  const bundled = bundledById(id);
  if (bundled) VOCAB = bundled.words || [];
  else {
    const s = await idbGet(id).catch(() => null);
    if (s && s.words && s.words.length) VOCAB = s.words;
    else { SETSREG.active = DEFAULT_SET_ID(); saveSetsReg(); VOCAB = (bundledById(activeSetId()) || {}).words || []; }
  }
  if (!VOCAB.length) throw new Error("vocab data missing — run: node convert.js");
  BY_LESSON = {};
  for (const w of VOCAB) (BY_LESSON[w.lesson] ||= []).push(w);
  LESSONS.length = 0;
  for (const k of Object.keys(BY_LESSON).map(Number).sort((a, b) => a - b)) LESSONS.push(k);
}

/* ---------------------------------------------- lazy libraries (import/export) */
function loadScript(src) { return new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src.includes(src))) return res(); const s = document.createElement("script"); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("Cannot load " + src)); document.head.appendChild(s); }); }
let SQLp = null;
async function getSQL() { await loadScript("lib/sql-asm.js"); SQLp ||= window.initSqlJs(); return SQLp; }
async function getZip() { await loadScript("lib/fflate.min.js"); return window.fflate; }

/* ------------------------------------------------------- import helpers */
const stripHtml = (s) => (s == null ? "" : String(s)).replace(/<br\s*\/?>(?!$)/gi, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const PLACEHOLDER = /^(n[\/_ ]?a|none|null|-|—)$/i;
const cleanField = (s) => { const t = stripHtml(s); return PLACEHOLDER.test(t) ? "" : t; };
function lessonFromDeck(name, fallbackMap) {
  if (!name) return fallbackMap.get("") || 0;
  const m = name.match(/lesson[\s\-_]*(\d+)/i) || name.match(/(\d+)\s*課/) || name.match(/(\d{1,3})/);
  if (m) return parseInt(m[1], 10);
  if (!fallbackMap.has(name)) fallbackMap.set(name, fallbackMap.size + 1);
  return fallbackMap.get(name);
}
function mapNote(fields, vals) {
  const find = (names) => { for (const want of names) { const i = fields.findIndex((f) => f.toLowerCase().replace(/[_\s-]/g, "").includes(want)); if (i >= 0 && cleanField(vals[i])) return cleanField(vals[i]); } return ""; };
  // MSK (our deck) special case
  if (fields.includes("Front") && fields.includes("English")) {
    const word = cleanField(vals[fields.indexOf("Front")]);
    if (!word) return null;
    return { word, kanji: cleanField(vals[fields.indexOf("Kanji")] || ""), reading: word, romaji: cleanField(vals[fields.indexOf("Romaji")] || ""), meaning_en: cleanField(vals[fields.indexOf("English")] || ""), picture: null, audio: null, example: { jp: "", en: "", romaji: "", audio: null }, forms: {} };
  }
  // generic
  const word = find(["front", "expression", "word", "vocab", "term", "japanese", "kanji"]) || cleanField(vals[0]);
  if (!word) return null;
  const reading = find(["reading", "kana", "furigana", "yomi", "pronun"]);
  const meaning = find(["meaning", "english", "translation", "definition", "sense", "back", "vietnamese", "nghia"]) || cleanField(vals[1]) || "";
  return { word, kanji: find(["kanji"]), reading: reading || word, romaji: find(["romaji", "roma", "latin"]), meaning_en: meaning, picture: null, audio: null, example: { jp: find(["sentence", "example"]), en: "", romaji: "", audio: null }, forms: {} };
}
async function parseApkgWords(arrayBuffer) {
  const [SQL, zip] = await Promise.all([getSQL(), getZip()]);
  const files = zip.unzipSync(new Uint8Array(arrayBuffer));
  const dbName = files["collection.anki21"] ? "collection.anki21" : (files["collection.anki2"] ? "collection.anki2" : null);
  if (!dbName) throw new Error("Not a valid .apkg (no collection database)");
  const db = new SQL.Database(files[dbName]);
  const col = db.exec("SELECT models, decks FROM col")[0].values[0];
  const models = JSON.parse(col[0]), decks = JSON.parse(col[1]);
  const deckName = {}; for (const d of Object.values(decks)) deckName[d.id] = d.name;
  const modelFields = {}; for (const [mid, m] of Object.entries(models)) modelFields[mid] = m.flds.map((f) => f.name);
  const rows = db.exec("SELECT n.id, n.flds, n.mid, MIN(c.did) FROM notes n JOIN cards c ON c.nid=n.id GROUP BY n.id");
  if (!rows.length) throw new Error("No notes found in deck");
  const fallbackMap = new Map(), words = [];
  for (const [id, flds, mid, did] of rows[0].values) {
    const fields = modelFields[mid] || [];
    const vals = String(flds).split("\x1f");
    const mapped = mapNote(fields, vals);
    if (mapped) words.push({ id, lesson: lessonFromDeck(deckName[did], fallbackMap), ...mapped });
  }
  words.sort((a, b) => a.lesson - b.lesson || a.id - b.id);
  return words;
}
// Parse typed/pasted/CSV rows into words. Columns: word, reading, meaning, kanji, lesson.
// Separator auto-detected (tab, comma, or semicolon). A header row is skipped.
function parseWords(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const words = [];
  const base = Date.now();
  lines.forEach((line, i) => {
    const delim = line.includes("\t") ? "\t" : (line.includes(",") ? "," : ";");
    const cols = line.split(delim).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (i === 0) { const low = cols.map((c) => c.toLowerCase()); if (low.some((c) => ["word", "từ", "reading", "kana", "meaning", "nghĩa", "nghia"].includes(c))) return; }
    const [word, reading, meaning, kanji, lesson] = cols;
    if (!word) return;
    words.push({ id: base * 1000 + words.length, lesson: parseInt(lesson, 10) || 1, word, kanji: kanji || "", reading: reading || word, romaji: "", meaning_en: meaning || "", picture: null, audio: null, example: { jp: "", en: "", audio: null }, forms: {} });
  });
  return words;
}
async function saveCustomSet(name, words) {
  if (!words.length) throw new Error("No words found");
  const id = "set_" + Date.now();
  await idbPut(id, { id, name: name || "My set", words });
  SETSREG.custom.push({ id, name: name || "My set", count: words.length, lessons: new Set(words.map((w) => w.lesson)).size, createdAt: Date.now() });
  saveSetsReg();
  return { id, count: words.length };
}
async function importSetFromFile(file) {
  const name = file.name.replace(/\.(apkg|json|csv|txt|tsv)$/i, "");
  let words;
  if (/\.json$/i.test(file.name)) {
    const arr = JSON.parse(await file.text());
    words = (Array.isArray(arr) ? arr : arr.words || []).map((w, i) => ({ id: w.id || Date.now() + i, lesson: w.lesson || 1, word: w.word, kanji: w.kanji || "", reading: w.reading || w.word, romaji: w.romaji || "", meaning_en: w.meaning_en || w.meaning || "", picture: null, audio: null, example: w.example || { jp: "", en: "", audio: null }, forms: w.forms || {} })).filter((w) => w.word);
  } else if (/\.(csv|txt|tsv)$/i.test(file.name)) {
    words = parseWords(await file.text());
  } else {
    words = await parseApkgWords(await file.arrayBuffer());
  }
  return saveCustomSet(name, words);
}

/* ------------------------------------------------------- export */
function downloadBlob(blob, filename) { const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
function exportJson() { downloadBlob(new Blob([JSON.stringify(VOCAB)], { type: "application/json" }), activeSetName().replace(/\s+/g, "_") + ".json"); }

function sha1hex(str) {
  function rol(n, s) { return (n << s) | (n >>> (32 - s)); }
  const bytes = unescape(encodeURIComponent(str));
  const words = []; for (let i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
  words[bytes.length >> 2] |= 0x80 << (24 - (bytes.length % 4) * 8);
  words[((bytes.length + 8 >> 6) + 1) * 16 - 1] = bytes.length * 8;
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  for (let i = 0; i < words.length; i += 16) {
    const w = []; for (let j = 0; j < 16; j++) w[j] = words[i + j] | 0;
    for (let j = 16; j < 80; j++) w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
      else { f = b ^ c ^ d; k = 0xCA62C1D6; }
      const tmp = (rol(a, 5) + f + e + k + w[j]) | 0; e = d; d = c; c = rol(b, 30); b = a; a = tmp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return [h0, h1, h2, h3, h4].map((n) => (n >>> 0).toString(16).padStart(8, "0")).join("");
}
async function exportApkg() {
  const [SQL, zip] = await Promise.all([getSQL(), getZip()]);
  const db = new SQL.Database();
  db.run(`CREATE TABLE col (id integer primary key,crt integer,mod integer,scm integer,ver integer,dty integer,usn integer,ls integer,conf text,models text,decks text,dconf text,tags text);
    CREATE TABLE notes (id integer primary key,guid text,mid integer,mod integer,usn integer,tags text,flds text,sfld text,csum integer,flags integer,data text);
    CREATE TABLE cards (id integer primary key,nid integer,did integer,ord integer,mod integer,usn integer,type integer,queue integer,due integer,ivl integer,factor integer,reps integer,lapses integer,left integer,odue integer,odid integer,flags integer,data text);
    CREATE TABLE revlog (id integer primary key,cid integer,usn integer,ease integer,ivl integer,lastIvl integer,factor integer,time integer,type integer);
    CREATE TABLE graves (usn integer,oid integer,type integer);`);
  const nowMs = Date.now(), nowS = Math.floor(nowMs / 1000);
  const mid = 1000000001, did = 1000000002;
  const model = { id: String(mid), name: "JL Export", type: 0, mod: nowS, usn: -1, sortf: 0, did, tmpls: [{ name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}", did: null, bqfmt: "", bafmt: "" }], flds: [{ name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 }, { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 }], css: ".card{font-family:serif;font-size:22px;text-align:center;color:#111;background:#fff}", latexPre: "", latexPost: "", req: [[0, "any", [0]]], tags: [], vers: [] };
  const decks = { "1": { id: 1, name: "Default", mod: nowS, usn: -1, lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0], collapsed: true, browserCollapsed: true, desc: "", dyn: 0, conf: 1, extendNew: 0, extendRev: 0 }, [did]: { id: did, name: activeSetName(), mod: nowS, usn: -1, lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0], collapsed: false, browserCollapsed: false, desc: "", dyn: 0, conf: 1, extendNew: 10, extendRev: 50 } };
  const dconf = { "1": { id: 1, name: "Default", mod: 0, usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true, new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true }, rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 200 }, lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 } } };
  const conf = { nextPos: 1, estTimes: true, activeDecks: [did], sortType: "noteFld", timeLim: 0, sortBackwards: false, addToCur: true, curDeck: did, newBury: true, newSpread: 0, dueCounts: true, curModel: String(mid), collapseTime: 1200 };
  db.run("INSERT INTO col VALUES (1,?,?,?,11,0,0,0,?,?,?,?,'')", [nowS, nowMs, nowMs, JSON.stringify(conf), JSON.stringify({ [mid]: model }), JSON.stringify(decks), JSON.stringify(dconf)]);
  const ins = db.prepare("INSERT INTO notes VALUES (?,?,?,?,-1,'',?,?,?,0,'')");
  const insc = db.prepare("INSERT INTO cards VALUES (?,?,?,0,?,-1,0,0,?,0,0,0,0,0,0,0,0,'')");
  let nid = nowMs, cid = nowMs + 500000, pos = 0;
  for (const w of VOCAB) {
    const front = `${w.kanji || w.word}${w.reading && w.reading !== (w.kanji || w.word) ? "<br><small>" + w.reading + "</small>" : ""}`;
    const back = `${w.meaning_en || ""}${w.romaji ? "<br><small>" + w.romaji + "</small>" : ""}`;
    const sfld = stripHtml(front);
    const flds = front + "\x1f" + back;
    const guid = Math.random().toString(36).slice(2, 12);
    const csum = parseInt(sha1hex(sfld).slice(0, 8), 16);
    ins.run([nid, guid, mid, nowS, flds, sfld, csum]);
    insc.run([cid, nid, did, nowS, pos]);
    nid++; cid++; pos++;
  }
  ins.free(); insc.free();
  const data = db.export();
  const apkg = zip.zipSync({ "collection.anki2": data, "media": window.fflate.strToU8("{}") });
  downloadBlob(new Blob([apkg], { type: "application/octet-stream" }), activeSetName().replace(/\s+/g, "_") + ".apkg");
}

/* --------------------------------------------------------------- utilities */
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const esc = (s) => (s == null ? "" : String(s)).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const normalize = (s) => (s || "").toLowerCase().normalize("NFKC").replace(/[\s　.,!?。、ー~'’"\-]/g, "");

/* genkō hero */
function genkoCells(text, sm) { return `<div class="cells">${[...String(text)].map((c) => `<span class="cell${sm ? " sm" : ""}">${esc(c)}</span>`).join("")}</div>`; }
// Only Japanese characters belong in the manuscript squares. Vocab fields
// sometimes carry an English gloss/annotation — pull that out of the cells.
const JP_CHAR = /[぀-ヿ㐀-鿿ｦ-ﾟ々ー〜ヶ]/;
const EDGE_PUNCT = /^[\s（）()[\]{}・:;,.\-–—~～"'’]+|[\s（）()[\]{}・:;,.\-–—~～"'’]+$/g;
function splitJp(s) {
  s = (s || "").trim();
  // Pull parenthetical annotations out of the cells first (English or Japanese).
  const parens = [];
  const base = s.replace(/[（(][^（）()]*[）)]/g, (m) => { parens.push(m.slice(1, -1).trim()); return " "; });
  const hero = [...base].filter((c) => JP_CHAR.test(c)).join("");
  const leftover = base.replace(/[぀-ヿ㐀-鿿ｦ-ﾟ々ー〜ヶ・]/g, "").replace(/\s+/g, " ").trim().replace(EDGE_PUNCT, "");
  const note = [leftover, ...parens].filter(Boolean).join(" · ").replace(EDGE_PUNCT, "").trim();
  return { hero: hero || s, note };
}
function genkoHero({ hero, ruby, annot, rubyHidden, ink, sm, note }) {
  return `<div class="genko${ink ? " inkin" : ""}">
    ${ruby != null && ruby !== "" ? `<div class="ruby${rubyHidden ? " hidden" : ""}">${esc(ruby)}</div>` : `<div class="ruby"></div>`}
    ${genkoCells(hero, sm)}
    ${note ? `<div class="hero-note">${esc(note)}</div>` : ""}
    ${annot != null && annot !== "" ? `<div class="annot">${esc(annot)}</div>` : ""}
  </div>`;
}
// vocab word -> hero (kanji if present else kana, Japanese only) + furigana reading
function wordHero(w, { rubyHidden, ink } = {}) {
  const hasKanji = w.kanji && w.kanji !== w.word;
  const main = splitJp(hasKanji ? w.kanji : w.word);
  const ruby = hasKanji ? splitJp(w.reading).hero : "";
  return genkoHero({ hero: main.hero, ruby, annot: null, rubyHidden, ink, note: main.note });
}

/* ------------------------------------------------------------------- audio */
let AC = null;
function beep(ok) {
  if (!S.settings.sound) return;
  try {
    AC ||= new (window.AudioContext || window["webkitAudioContext"])();
    const o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    o.type = "sine"; const t0 = AC.currentTime;
    if (ok) { o.frequency.setValueAtTime(620, t0); o.frequency.setValueAtTime(840, t0 + 0.09); }
    else { o.frequency.setValueAtTime(210, t0); o.frequency.setValueAtTime(150, t0 + 0.12); }
    g.gain.setValueAtTime(0.1, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
    o.start(t0); o.stop(t0 + 0.24);
  } catch {}
}
let curAudio = null;
function playWord(w) {
  try {
    if (curAudio) { curAudio.pause(); curAudio = null; }
    if (w.audio) { curAudio = new Audio("media/" + w.audio); curAudio.play().catch(() => speakJa(w.reading || w.word)); }
    else speakJa(w.reading || w.word);
  } catch { speakJa(w.reading || w.word); }
}
let jaVoice = null, jaVoices = [];
// Prefer the most natural-sounding Japanese voice available on the device.
function rankVoice(v) {
  const n = (v.name + " " + (v.voiceURI || "")).toLowerCase();
  let s = 0;
  if (/natural|neural|premium|enhanced/.test(n)) s += 12;
  if (/google/.test(n)) s += 7;
  if (/online/.test(n)) s += 5;
  if (/nanami|keita|kyoko|o-?ren|otoya|mizuki|siri/.test(n)) s += 4;
  if (/haruka|ayumi|sayaka|ichiro/.test(n)) s += 2;
  if (v.localService) s += 1;
  return s;
}
function pickBestVoice() {
  if (!("speechSynthesis" in window)) return;
  jaVoices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("ja"));
  const chosen = S.settings.voice && jaVoices.find((v) => (v.voiceURI || v.name) === S.settings.voice);
  jaVoice = chosen || jaVoices.slice().sort((a, b) => rankVoice(b) - rankVoice(a))[0] || null;
}
function initVoices() {
  if (!("speechSynthesis" in window)) return;
  pickBestVoice();
  speechSynthesis.onvoiceschanged = pickBestVoice;
}
// Chrome/Safari bug: cancel() right before speak() can leave the engine stuck
// in a "paused" state, so it only ever speaks once. Resume + a tiny defer fixes it.
function speakLocal(text) {
  if (!("speechSynthesis" in window) || !text) return;
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP"; u.rate = 0.85; if (jaVoice) u.voice = jaVoice;
  try {
    // Speak immediately while we're still inside the user gesture (desktop
    // browsers block speech started from a deferred/async context). Only when
    // something is already playing do we cancel + briefly defer (Chrome bug).
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(() => { try { synth.resume(); synth.speak(u); } catch {} }, 60);
    } else {
      synth.resume(); synth.speak(u);
    }
  } catch {}
}

// Natural neural voice via the Azure proxy Worker (see worker/README.md).
// Falls back to the device voice on any failure, so it never breaks offline.
const ttsCache = new Map(); // "voice|text" -> object URL
async function remoteTTS(text) {
  const base = (S.settings.ttsUrl || "").trim();
  if (!S.settings.ttsOn || !base || !text) return false;
  const voice = S.settings.azVoice || "ja-JP-NanamiNeural";
  const key = voice + "|" + text;
  try {
    let objUrl = ttsCache.get(key);
    if (!objUrl) {
      const u = base + (base.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(text) + "&voice=" + encodeURIComponent(voice);
      const r = await fetch(u);
      if (!r.ok) throw new Error("tts " + r.status);
      const blob = await r.blob();
      if (!blob.size || !/audio|mpeg|octet/.test(blob.type || "audio")) { /* still try */ }
      objUrl = URL.createObjectURL(blob);
      ttsCache.set(key, objUrl);
    }
    try { if (curAudio) curAudio.pause(); } catch {}
    if ("speechSynthesis" in window) try { speechSynthesis.cancel(); } catch {}
    curAudio = new Audio(objUrl);
    await curAudio.play();
    return true;
  } catch (e) { console.warn("remoteTTS failed, using device voice", e); return false; }
}
function speakJa(text) {
  if (!text) return;
  // When the neural proxy is off (default), speak synchronously so it stays
  // inside the click's user-gesture (desktop requirement). Only the remote
  // path (which is inherently async anyway) goes through a promise.
  if (S.settings.ttsOn && (S.settings.ttsUrl || "").trim()) {
    remoteTTS(text).then((ok) => { if (!ok) speakLocal(text); });
  } else {
    speakLocal(text);
  }
}

/* ------------------------------------------------------------------- toast */
let toastT = null;
function toast(msg) { const el = document.getElementById("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 1800); }

/* ------------------------------------------------------------------ router */
const app = () => document.getElementById("app");
function go(h) { location.hash = h; }
function route() {
  const h = location.hash.replace(/^#/, "") || "/";
  let m;
  if ((m = h.match(/^\/lesson\/(-?\d+)$/))) return renderIntro(parseInt(m[1], 10));
  if ((m = h.match(/^\/learn\/(-?\d+)$/))) return renderLearn(parseInt(m[1], 10));
  if ((m = h.match(/^\/quiz\/(-?\d+)$/))) return startQuiz({ type: "lesson", lesson: parseInt(m[1], 10) });
  if (h === "/practice") return startQuiz({ type: "practice" });
  if (h === "/numbers") return renderNumbers();
  if (h === "/sets") return renderSets();
  if (h === "/create") return renderCreate();
  if ((m = h.match(/^\/edit\/(.+)$/))) return renderEditSet(m[1]);
  if (h === "/settings") return renderSettings();
  if (h === "/vocab") return renderVocab();
  return renderHub();
}

/* ----------------------------------------------------------- lesson helpers */
function lessonMastery(no) { const ws = BY_LESSON[no] || []; if (!ws.length) return 0; let s = 0; for (const w of ws) s += Math.min(S.progress[w.id]?.box || 0, 5) / 5; return Math.round((s / ws.length) * 100); }
function lessonDue(no) { return (BY_LESSON[no] || []).filter((w) => isDue(w.id)).length; }
const lkey = (no) => activeSetId() + ":" + no;
function lessonCrown(no) { return S.lessons[lkey(no)]?.crown || 0; }
function allDue() { return VOCAB.filter((w) => isDue(w.id)); }

/* ---------------------------------------------------------- headers */
function hubHeader() {
  const streak = S.stats.streak || 0, xp = S.stats.xp || 0;
  return `<div class="dash"><div class="dash-bar">
      <span class="brand">${ICON.seal}${t("brand")}</span>
      <span class="spacer"></span>
      <span class="stat streak">${ICON.streak}${streak}</span>
      <span class="stat xp">${ICON.xp}${xp}</span>
      <button class="icon-btn" id="settingsBtn" aria-label="settings">${ICON.settings}</button>
    </div></div>`;
}
function bindHub() { const s = document.getElementById("settingsBtn"); if (s) s.onclick = () => go("/settings"); }
function topbarMin(title) {
  return `<div class="topbar-min"><button class="icon-btn" id="backBtn" aria-label="back">${ICON.back}</button><span class="title">${esc(title)}</span><span class="spacer"></span></div>`;
}
function bindBack(to = "/") { const b = document.getElementById("backBtn"); if (b) b.onclick = () => go(to); }

/* -------------------------------------------------------------------- HUB (home) */
function vocabSub() {
  const core = LESSONS.filter((n) => n >= 1);
  if (!core.length) return "";
  const avg = Math.round(core.reduce((s, n) => s + lessonMastery(n), 0) / core.length);
  return `${t("wordsN", VOCAB.length)} · ${avg}%`;
}
// Practice areas on the home hub. Add future areas here — no navbar surgery.
function hubAreas() {
  return [
    { id: "vocab", kanji: "語", title: t("dashVocab"), sub: vocabSub(), route: "/vocab", enabled: true },
    { id: "numbers", kanji: "数", title: t("dashNumbers"), sub: t("numbersSub"), route: "/numbers", enabled: true },
    { id: "kanji", kanji: "字", title: t("areaKanji"), sub: t("comingSoon"), enabled: false },
    { id: "grammar", kanji: "文", title: t("areaGrammar"), sub: t("comingSoon"), enabled: false },
    { id: "listen", kanji: "耳", title: t("areaListen"), sub: t("comingSoon"), enabled: false },
    { id: "talk", kanji: "話", title: t("areaTalk"), sub: t("comingSoon"), enabled: false },
  ];
}
function renderHub() {
  const goal = S.stats.dailyGoal;
  const dx = S.stats.dailyDate === todayStr() ? S.stats.dailyXp : 0;
  const pct = Math.min(100, Math.round((dx / goal) * 100));
  const cards = hubAreas().map((a) => `
    <button class="area${a.enabled ? "" : " soon"}" data-route="${a.route || ""}" data-enabled="${a.enabled}">
      <span class="area-ico">${a.kanji}</span>
      <span class="area-txt"><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></span>
      ${a.enabled ? `<span class="area-arrow">${ICON.next}</span>` : ""}
    </button>`).join("");
  app().innerHTML = `${hubHeader()}
    <div class="view">
      <div class="goal">
        <div class="ring" style="--p:${pct}"><span class="ring-dot"></span></div>
        <div><div class="g-main">${pct >= 100 ? t("goalDone") : t("dailyGoal")}</div><div class="g-sub">${dx} / ${goal} ${t("xpToday")}</div></div>
      </div>
      <div class="areas">${cards}</div>
    </div>`;
  bindHub();
  app().querySelectorAll(".area").forEach((b) => b.onclick = () => {
    if (b.dataset.enabled !== "true") { toast(t("comingSoon")); return; }
    if (b.dataset.route) go(b.dataset.route);
  });
}

/* -------------------------------------------------------------- VOCAB (lesson path) */
function renderVocab() {
  const dueTotal = allDue().length;
  const lcell = (no, { label }) => {
    const crown = lessonCrown(no);
    const due = lessonDue(no);
    const started = !!(BY_LESSON[no] || []).some((w) => S.progress[w.id]);
    const cls = ["lcell"]; if (crown || started) cls.push("done");
    return `<button class="${cls.join(" ")}" data-target="/lesson/${no}">
      ${due ? `<span class="due">${due}</span>` : ""}
      <span class="sq">${no}</span>
      <span class="crown">${crown ? Array.from({ length: crown }, () => "<i></i>").join("") : ""}</span>
      <span class="lc-label">${esc(label)}</span>
    </button>`;
  };
  let col = "";
  const core = LESSONS.filter((n) => n >= 1);
  core.forEach((no, i) => { col += lcell(no, { label: `${t("lesson")} ${no}` }); if (i < core.length - 1) col += `<div class="path-link"></div>`; });
  if (BY_LESSON[0]?.length) col += `<div class="path-link"></div>` + lcell(0, { label: t("extra") });

  app().innerHTML = `${topbarMin(t("dashVocab"))}
    <div class="view">
      <button class="setbar" id="setBar">
        <span class="sb-ico">${ICON.library}</span>
        <span class="sb-txt"><small>${t("setBar")}</small><b>${esc(activeSetName())}</b></span>
        <span class="sb-arrow">${ICON.next}</span>
      </button>
      <button class="btn btn-ink btn-block practice" id="practiceBtn">
        ${ICON.practice}
        <span class="p-txt"><b>${t("practice")}</b><small>${dueTotal ? t("practiceSub", dueTotal) : t("practiceNone")}</small></span>
      </button>
      <div class="section-head">${t("coreLessons")}</div>
      <div class="lesson-col">${col}</div>
    </div>`;
  bindBack("/");
  document.getElementById("setBar").onclick = () => go("/sets");
  document.getElementById("practiceBtn").onclick = () => go("/practice");
  app().querySelectorAll("[data-target]").forEach((b) => b.onclick = () => go(b.dataset.target));
}

/* -------------------------------------------------------------------- SETS */
// Authoring (create / import / export / edit / delete sets) is enabled only
// when running locally; the deployed site is consume-only. Shared sets are
// published by creating them locally and committing them (see sets/README.md).
const AUTHOR_MODE = location.protocol === "file:" || ["localhost", "127.0.0.1", ""].includes(location.hostname);
function renderSets() {
  const rows = [];
  for (const s of bundledSets()) if (!SETSREG.hiddenBundled.includes(s.id)) rows.push({ id: s.id, name: s.name, count: (s.words || []).length, bundled: true });
  rows.push(...SETSREG.custom.map((s) => ({ ...s, bundled: false })));
  const active = activeSetId();
  const canDelete = rows.length > 1; // always keep at least one set
  const anyHidden = SETSREG.hiddenBundled.length > 0;
  const list = rows.map((s) => `
    <div class="set-row ${s.id === active ? "active" : ""}">
      <button class="set-pick" data-id="${s.id}">
        <span class="set-mark">${s.id === active ? ICON.maru : ""}</span>
        <span class="set-info"><b>${esc(s.name)}</b><small>${t("wordsN", s.count)}${s.bundled ? " · " + t("builtin") : ""}${s.id === active ? " · " + t("current") : ""}</small></span>
      </button>
      ${AUTHOR_MODE && !s.bundled ? `<button class="icon-btn set-edit" data-edit="${s.id}" aria-label="edit">${ICON.pencil}</button>` : ""}
      ${AUTHOR_MODE && canDelete ? `<button class="icon-btn set-del" data-del="${s.id}" aria-label="delete">${ICON.trash}</button>` : ""}
    </div>`).join("");
  const authoring = AUTHOR_MODE ? `
      ${anyHidden ? `<button class="btn btn-block mt" id="restoreBtn">${t("restoreBuiltin")}</button>` : ""}
      <input type="file" id="importFile" accept=".apkg,.json,.csv,.txt,.tsv" style="display:none">
      <button class="btn btn-ink btn-block btn-lg mt" id="createBtn">${ICON.plus}${t("createSet")}</button>
      <button class="btn btn-ink-outline btn-block mt" id="importBtn">${ICON.library}${t("importBtn")}</button>
      <div class="grade-row mt">
        <button class="btn btn-ink-outline btn-block" id="expApkg">${ICON.download}${t("exportApkg")}</button>
        <button class="btn btn-ink-outline btn-block" id="expJson">${ICON.download}${t("exportJson")}</button>
      </div>` : "";
  app().innerHTML = `${topbarMin(t("sets"))}
    <div class="view">
      <div class="sub muted" style="margin-bottom:1rem">${t("chooseSet")}</div>
      <div class="set-list">${list}</div>
      ${authoring}
    </div>`;
  bindBack("/");
  app().querySelectorAll(".set-pick").forEach((b) => b.onclick = () => switchSet(b.dataset.id));
  app().querySelectorAll(".set-edit").forEach((b) => b.onclick = (e) => { e.stopPropagation(); go("/edit/" + b.dataset.edit); });
  app().querySelectorAll(".set-del").forEach((b) => b.onclick = async (e) => {
    e.stopPropagation();
    if (!confirm(t("deleteSetConfirm"))) return;
    const id = b.dataset.del;
    if (bundledById(id)) { if (!SETSREG.hiddenBundled.includes(id)) SETSREG.hiddenBundled.push(id); }
    else { await idbDel(id).catch(() => {}); SETSREG.custom = SETSREG.custom.filter((s) => s.id !== id); }
    if (activeSetId() === id) {
      const firstVisibleBundled = bundledSets().find((s) => !SETSREG.hiddenBundled.includes(s.id));
      SETSREG.active = (firstVisibleBundled && firstVisibleBundled.id) || (SETSREG.custom[0] && SETSREG.custom[0].id) || DEFAULT_SET_ID();
    }
    saveSetsReg(); await loadVocab(); renderSets();
  });
  if (!AUTHOR_MODE) return; // deployed site is consume-only
  const restore = document.getElementById("restoreBtn");
  if (restore) restore.onclick = () => { SETSREG.hiddenBundled = []; saveSetsReg(); renderSets(); };
  document.getElementById("createBtn").onclick = () => go("/create");
  const fileInp = document.getElementById("importFile");
  document.getElementById("importBtn").onclick = () => fileInp.click();
  fileInp.onchange = async () => {
    const f = fileInp.files[0]; if (!f) return;
    app().innerHTML = `<div class="loading">${t("importing")}</div>`;
    try { const r = await importSetFromFile(f); toast(t("imported", r.count)); await switchSet(r.id); }
    catch (e) { console.error(e); renderSets(); toast(t("importFail") + (e.message || e)); }
  };
  document.getElementById("expApkg").onclick = async () => { try { await exportApkg(); } catch (e) { toast(t("importFail") + (e.message || e)); } };
  document.getElementById("expJson").onclick = () => exportJson();
}

/* ------------------------------------------------------------ CREATE SET */
function renderCreate() {
  if (!AUTHOR_MODE) { go("/sets"); return; }
  const example = "みず, みず, water, 水, 1\nねこ, ねこ, cat, 猫, 1\nがっこう, がっこう, school, 学校, 2";
  app().innerHTML = `${topbarMin(t("createSet"))}
    <div class="view">
      <div class="sub muted" style="margin-bottom:.8rem">${t("createHelp")}</div>
      <input class="tts-url" id="setName" type="text" autocomplete="off" placeholder="${t("createName")}">
      <div class="muted" style="font-size:.78rem;margin:.6rem 0 .3rem">${t("createFormat")}</div>
      <textarea id="setRows" class="set-textarea" spellcheck="false" placeholder="${esc(example)}"></textarea>
      <button class="btn btn-ink btn-block btn-lg mt" id="makeBtn">${t("createMake")}</button>
    </div>`;
  bindBack("/sets");
  document.getElementById("makeBtn").onclick = async () => {
    const name = document.getElementById("setName").value.trim() || t("createName");
    const words = parseWords(document.getElementById("setRows").value);
    if (!words.length) { toast(t("createEmpty")); return; }
    app().innerHTML = `<div class="loading">${t("importing")}</div>`;
    try { const r = await saveCustomSet(name, words); toast(t("imported", r.count)); await switchSet(r.id); }
    catch (e) { renderCreate(); toast(t("importFail") + (e.message || e)); }
  };
}

/* ------------------------------------------------------------ EDIT SET (incremental) */
async function renderEditSet(id) {
  if (!AUTHOR_MODE) { go("/sets"); return; }
  const set = await idbGet(id).catch(() => null);
  if (!set || !set.words) { go("/sets"); return; }
  const meta = SETSREG.custom.find((s) => s.id === id) || { name: set.name };
  const wordRow = (w, i) => `<div class="wl"><span class="wl-jp">${esc(w.kanji || w.word)}</span><span class="wl-en">${esc(w.meaning_en)}</span><button class="icon-btn wl-del" data-i="${i}" aria-label="delete">${ICON.trash}</button></div>`;
  app().innerHTML = `${topbarMin(t("editSet"))}
    <div class="view">
      <input class="tts-url" id="setName" type="text" autocomplete="off" value="${esc(meta.name || "")}" placeholder="${t("createName")}">
      <div class="muted" style="font-size:.78rem;margin:.9rem 0 .3rem">${t("addWords")} — ${t("createFormat")}</div>
      <textarea id="addRows" class="set-textarea" style="min-height:120px" spellcheck="false" placeholder="みず, みず, water, 水, 1"></textarea>
      <button class="btn btn-ink btn-block mt" id="addBtn">${ICON.plus}${t("addBtn")}</button>
      <div class="section-head" style="text-align:left;margin:1.4rem 0 .4rem">${t("wordsN", set.words.length)}</div>
      <div class="wordlist" id="wlist">${set.words.map(wordRow).join("")}</div>
    </div>`;
  bindBack("/sets");
  const persist = async () => {
    meta.count = set.words.length; meta.lessons = new Set(set.words.map((w) => w.lesson)).size;
    const idx = SETSREG.custom.findIndex((s) => s.id === id); if (idx >= 0) SETSREG.custom[idx] = { ...SETSREG.custom[idx], ...meta };
    saveSetsReg(); await idbPut(id, set);
    if (activeSetId() === id) await loadVocab();
  };
  document.getElementById("setName").onchange = async (e) => { meta.name = e.target.value.trim() || meta.name; set.name = meta.name; await persist(); };
  document.getElementById("addBtn").onclick = async () => {
    const added = parseWords(document.getElementById("addRows").value);
    if (!added.length) { toast(t("createEmpty")); return; }
    set.words.push(...added); await persist(); toast(t("imported", added.length)); renderEditSet(id);
  };
  app().querySelectorAll(".wl-del").forEach((b) => b.onclick = async () => {
    set.words.splice(parseInt(b.dataset.i, 10), 1); await persist(); renderEditSet(id);
  });
}

/* ------------------------------------------------------------ LESSON INTRO */
function renderIntro(no) {
  const ws = BY_LESSON[no] || []; if (!ws.length) { go("/"); return; }
  const title = no === 0 ? t("extra") : `${t("lesson")} ${no}`;
  const list = ws.map((w) => {
    const box = S.progress[w.id]?.box || 0;
    return `<div class="wl"><span class="wl-jp">${esc(w.kanji || w.word)}</span><span class="wl-en">${esc(w.meaning_en)}</span><span class="wl-box ${box >= 4 ? "b" : ""}"></span></div>`;
  }).join("");
  app().innerHTML = `${topbarMin(title)}
    <div class="view intro">
      <div class="big">${esc(title)}</div>
      <div class="sub">${t("wordsN", ws.length)} · ${t("learnFirst")}</div>
      <div style="display:flex;gap:.7rem">
        <button class="btn btn-ink btn-block btn-lg" id="learnBtn">${t("learn")}</button>
        <button class="btn btn-ink-outline btn-block btn-lg" id="testBtn">${t("test")}</button>
      </div>
      <div class="section-head" style="text-align:left;margin-left:.1rem">${t("reviewWords")}</div>
      <div class="wordlist">${list}</div>
    </div>`;
  bindBack("/");
  document.getElementById("learnBtn").onclick = () => go("/learn/" + no);
  document.getElementById("testBtn").onclick = () => go("/quiz/" + no);
}

/* ------------------------------------------------------------- LEARN cards */
let LRN = null;
function renderLearn(no) {
  const ws = BY_LESSON[no] || []; if (!ws.length) { go("/"); return; }
  if (!LRN || LRN.no !== no) LRN = { no, order: shuffle(ws), idx: 0 };
  if (LRN.idx >= LRN.order.length) return renderLearnDone(no);
  const w = LRN.order[LRN.idx];
  const pct = Math.round((LRN.idx / LRN.order.length) * 100);
  app().innerHTML = `${topbarMin(`${t("lesson")} ${no}`)}
    <div class="session">
      <div class="sess-top"><button class="close-x icon-btn" id="closeX">${ICON.close}</button><div class="progress"><span style="width:${pct}%"></span></div></div>
      <div class="q-area">
        <div class="fc">
          <div class="fc-face">
            ${w.picture ? `<img class="q-pic" src="media/${esc(w.picture)}" alt="" style="width:130px">` : ""}
            ${wordHero(w, { rubyHidden: false, ink: true })}
            <div class="q-meaning" style="font-size:1.25rem">${esc(w.meaning_en)}</div>
            <div class="muted" style="font-size:.9rem">${esc(w.romaji)}</div>
          </div>
        </div>
        <div class="nt-actions" style="margin-top:1.4rem">
          <button class="btn btn-ink-outline" id="sp">${ICON.sound}${t("ntListen")}</button>
          <button class="btn btn-ink" id="nextBtn">${t("ntNext")} ${ICON.next}</button>
        </div>
        <div class="center muted mt" style="font-size:.8rem">${t("learnProgress", LRN.idx + 1, LRN.order.length)}</div>
      </div>
    </div>`;
  bindBack("/lesson/" + no);
  document.getElementById("closeX").onclick = () => go("/lesson/" + no);
  document.getElementById("sp").onclick = () => playWord(w);
  document.getElementById("nextBtn").onclick = () => { srsUpdate(w.id, true); LRN.idx++; save(); renderLearn(no); };
  playWord(w); // in-gesture (triggered by tapping the lesson / Next)
}
function renderLearnDone(no) {
  LRN = null;
  app().innerHTML = `${topbarMin(`${t("lesson")} ${no}`)}
    <div class="view result">
      <div class="enso">${ENSO}</div>
      <div class="big">${t("learnDone")}</div>
      <button class="btn btn-ink btn-block btn-lg" id="testBtn">${t("startTest")}</button>
      <button class="btn btn-block mt" id="homeBtn">${t("backHome")}</button>
    </div>`;
  bindBack("/");
  document.getElementById("testBtn").onclick = () => go("/quiz/" + no);
  document.getElementById("homeBtn").onclick = () => go("/");
}

/* -------------------------------------------------------------- QUIZ engine */
const TYPES = ["mcq_meaning", "mcq_word", "listen", "type", "flash"];
let SESS = null;
function makeQuestion(w, type, pool) {
  const q = { w, type };
  if (type === "mcq_meaning") { q.options = shuffle([w, ...sample(pool.filter((x) => x.id !== w.id && x.meaning_en !== w.meaning_en), 3)]); q.answer = w; }
  else if (type === "mcq_word" || type === "listen") { q.options = shuffle([w, ...sample(pool.filter((x) => x.id !== w.id && x.word !== w.word), 3)]); q.answer = w; }
  return q;
}
function buildQuestions(words, pool, count) {
  const base = shuffle(words), qs = [];
  for (let i = 0; i < count; i++) {
    const w = base[i % base.length];
    let type = TYPES[i % TYPES.length];
    if (type === "listen" && !w.audio && !("speechSynthesis" in window)) type = "mcq_meaning";
    qs.push(makeQuestion(w, type, pool));
  }
  return shuffle(qs);
}
function startQuiz(opts) {
  let words, pool, count;
  if (opts.type === "practice") {
    let due = allDue();
    if (due.length < 8) { const extra = VOCAB.filter((w) => !due.includes(w)).sort((a, b) => (S.progress[a.id]?.box || 0) - (S.progress[b.id]?.box || 0)); due = due.concat(extra.slice(0, 12 - due.length)); }
    words = shuffle(due).slice(0, 12); pool = VOCAB; count = Math.max(6, Math.min(12, words.length));
  } else {
    words = BY_LESSON[opts.lesson] || []; if (!words.length) { go("/"); return; }
    pool = words.length >= 5 ? words : VOCAB; count = Math.min(12, Math.max(6, words.length));
  }
  SESS = { opts, queue: buildQuestions(words, pool, count), idx: 0, total: count, correctFirst: 0, hearts: 5, wrongIds: new Set(), seenIds: new Set() };
  renderQuestion();
}
function sessTop() {
  const pct = Math.round((SESS.idx / SESS.total) * 100);
  const hearts = S.settings.strict ? `<span class="hearts">${Array.from({ length: 5 }, (_, i) => `<span class="${i < SESS.hearts ? "" : "lost"}">${ICON.heart}</span>`).join("")}</span>` : "";
  return `<div class="sess-top"><button class="icon-btn" id="closeX" aria-label="close">${ICON.close}</button><div class="progress"><span style="width:${pct}%"></span></div>${hearts}</div>`;
}
function renderQuestion() {
  if (SESS.idx >= SESS.queue.length) return renderResult();
  const q = SESS.queue[SESS.idx], w = q.w;
  let body = "";
  if (q.type === "mcq_meaning") {
    body = `<div class="q-instruction">${t("iMeaning")}</div>
      <div class="q-hero">${w.picture ? `<img class="q-pic" src="media/${esc(w.picture)}" alt="">` : ""}${wordHero(w, { rubyHidden: false, ink: true })}
      <button class="icon-btn q-sound" id="sp" aria-label="sound">${ICON.sound}</button></div>
      <div class="choices">${q.options.map((o, i) => `<button class="choice" data-i="${i}">${esc(o.meaning_en)}</button>`).join("")}</div>`;
  } else if (q.type === "mcq_word") {
    body = `<div class="q-instruction">${t("iWord")}</div>
      <div class="q-hero"><div class="q-meaning">${esc(w.meaning_en)}</div></div>
      <div class="choices">${q.options.map((o, i) => `<button class="choice" data-i="${i}">${o.picture ? `<img class="c-pic" src="media/${esc(o.picture)}" alt="">` : ""}<span class="jp">${esc(o.kanji || o.word)}</span></button>`).join("")}</div>`;
  } else if (q.type === "listen") {
    body = `<div class="q-instruction">${t("iListen")}</div>
      <div class="q-hero"><button class="icon-btn q-sound" id="sp" aria-label="sound" style="transform:scale(1.8);margin:1.2rem 0 1.6rem">${ICON.sound}</button></div>
      <div class="choices">${q.options.map((o, i) => `<button class="choice" data-i="${i}"><span class="jp">${esc(o.kanji || o.word)}</span></button>`).join("")}</div>`;
  } else if (q.type === "type") {
    body = `<div class="q-instruction">${t("iType")}</div>
      <div class="q-hero"><div class="q-meaning">${esc(w.meaning_en)}</div>${w.kanji && w.kanji !== w.word ? genkoCells(splitJp(w.kanji).hero, true) : ""}
      <button class="icon-btn q-sound" id="sp" aria-label="sound">${ICON.sound}</button></div>
      <input class="type-input" id="typeIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${t("typePh")}">`;
  } else if (q.type === "flash") {
    body = `<div class="q-instruction">${t("iFlip")}</div>
      <div class="fc" id="fc"><div class="fc-face" id="fcFace">
        ${wordHero(w, { rubyHidden: true, ink: true })}
        <div class="fc-hint">${t("tap")}</div>
      </div></div>`;
  }
  app().innerHTML = `${topbarMin("")}<div class="session">${sessTop()}<div class="q-area" id="qArea">${body}</div><div id="fbSlot"></div></div>`;
  document.getElementById("backBtn").onclick = () => go(SESS.opts.type === "practice" ? "/" : "/lesson/" + SESS.opts.lesson);
  document.getElementById("closeX").onclick = () => go(SESS.opts.type === "practice" ? "/" : "/lesson/" + SESS.opts.lesson);
  const sp = document.getElementById("sp"); if (sp) sp.onclick = () => playWord(w);
  if (q.type === "listen") playWord(w); // in-gesture (triggered by Continue/choice)

  if (["mcq_meaning", "mcq_word", "listen"].includes(q.type)) {
    app().querySelectorAll(".choice").forEach((btn) => btn.onclick = () => gradeMcq(q, parseInt(btn.dataset.i, 10), btn));
  } else if (q.type === "type") {
    const inp = document.getElementById("typeIn"); inp.focus();
    showFooter(`<button class="btn btn-ink btn-block btn-lg" id="checkBtn">${t("check")}</button>`);
    document.getElementById("checkBtn").onclick = () => gradeType(q, inp.value);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") gradeType(q, inp.value); });
  } else if (q.type === "flash") {
    const face = document.getElementById("fcFace"), w2 = w;
    document.getElementById("fc").onclick = () => {
      face.innerHTML = `${w2.picture ? `<img class="q-pic" src="media/${esc(w2.picture)}" alt="" style="width:120px">` : ""}<div class="q-meaning" style="font-size:1.3rem">${esc(w2.meaning_en)}</div><div class="ruby" style="filter:none">${esc(w2.reading)}</div><div class="muted" style="font-size:.9rem">${esc(w2.romaji)}</div>`;
    };
    showFooter(`<div class="grade-row"><button class="btn btn-block" id="againBtn">${ICON.batsu}${t("again")}</button><button class="btn btn-ink btn-block" id="goodBtn">${ICON.maru}${t("good")}</button></div>`);
    document.getElementById("againBtn").onclick = () => gradeSelf(q, false);
    document.getElementById("goodBtn").onclick = () => gradeSelf(q, true);
  }
}
function showFooter(html) { document.getElementById("fbSlot").innerHTML = html; }
function recordAnswer(q, correct) {
  const first = !SESS.seenIds.has(q.w.id); SESS.seenIds.add(q.w.id);
  srsUpdate(q.w.id, correct);
  if (correct) { if (first && !SESS.wrongIds.has(q.w.id)) SESS.correctFirst++; addXp(10); }
  else { SESS.wrongIds.add(q.w.id); if (S.settings.strict) SESS.hearts--; SESS.queue.push(makeQuestion(q.w, "mcq_meaning", SESS.opts.type === "practice" ? VOCAB : (BY_LESSON[SESS.opts.lesson] || VOCAB))); SESS.total++; }
  beep(correct);
}
function showMark(ok) { const a = document.getElementById("qArea"); if (a) a.insertAdjacentHTML("beforeend", ok ? maruMark() : batsuMark()); }
function feedback(correct, answerText) {
  showMark(correct);
  const cls = correct ? "ok" : "no";
  const head = `${correct ? ICON.maru : ICON.batsu}${correct ? t("correct") : t("wrong")}`;
  const ans = correct ? "" : `<div class="fb-ans">${t("answerWas")} <b>${esc(answerText)}</b></div>`;
  showFooter(`<div class="feedback ${cls}"><div class="fb-head">${head}</div>${ans}<button class="btn ${correct ? "btn-ink" : "btn-ink-outline"} btn-block btn-lg" id="contBtn">${t("cont")}</button></div>`);
  const c = document.getElementById("contBtn"); c.focus(); c.onclick = () => { SESS.idx++; renderQuestion(); };
}
function gradeMcq(q, i, btn) {
  const correct = q.options[i].id === q.answer.id;
  app().querySelectorAll(".choice").forEach((b, j) => { b.classList.add("disabled"); if (q.options[j].id === q.answer.id) b.classList.add("correct"); });
  if (!correct) btn.classList.add("wrong");
  recordAnswer(q, correct);
  const ans = q.type === "mcq_meaning" ? q.answer.meaning_en : `${q.answer.kanji || q.answer.word} · ${q.answer.reading}`;
  feedback(correct, ans);
}
function gradeType(q, val) {
  const input = normalize(val); if (!input) return;
  const targets = [q.w.reading, q.w.word, q.w.romaji, toRomaji(q.w.reading)].map(normalize);
  const correct = targets.includes(input);
  recordAnswer(q, correct);
  feedback(correct, `${q.w.reading}${q.w.romaji ? " · " + q.w.romaji : ""}`);
}
function gradeSelf(q, good) { recordAnswer(q, good); SESS.idx++; renderQuestion(); }
function renderResult() {
  registerStudyDay();
  const denom = Math.max(1, Math.min(SESS.total, SESS.queue.length));
  const acc = Math.round((SESS.correctFirst / denom) * 100);
  const xpEarned = SESS.correctFirst * 10 + 20; addXp(20);
  if (SESS.opts.type === "lesson") {
    const L = (S.lessons[lkey(SESS.opts.lesson)] ||= { crown: 0, bestAccuracy: 0, passed: false });
    if (acc >= 60) { L.passed = true; L.crown = Math.min(3, (L.crown || 0) + 1); }
    L.bestAccuracy = Math.max(L.bestAccuracy || 0, acc);
  }
  save();
  const pass = acc >= 60;
  app().innerHTML = `${topbarMin("")}
    <div class="view result">
      <div class="enso">${ENSO}</div>
      <div class="big">${pass ? t("resPass") : t("resFail")}</div>
      <div class="result-stats">
        <div class="rstat xp"><div class="rv">+${xpEarned}</div><div class="rl">${t("xp")}</div></div>
        <div class="rstat acc"><div class="rv">${acc}%</div><div class="rl">${t("accuracy")}</div></div>
        <div class="rstat"><div class="rv">${SESS.seenIds.size}</div><div class="rl">${t("words")}</div></div>
      </div>
      <button class="btn btn-ink btn-block btn-lg" id="homeBtn">${t("backHome")}</button>
      <button class="btn btn-block mt" id="retryBtn">${t("retry")}</button>
    </div>`;
  document.getElementById("backBtn").onclick = () => go("/");
  document.getElementById("homeBtn").onclick = () => go("/");
  document.getElementById("retryBtn").onclick = () => startQuiz(SESS.opts);
}

/* ------------------------------------------------- Reading-rules guide (slides) */
const NT_GUIDE = [
  { title: { vi: "Số 1–10", en: "Numbers 1–10", ja: "数字 1〜10" },
    note: { vi: "Vài số có 2 cách đọc.", en: "Some numbers have two readings.", ja: "一部は読み方が2通り。" },
    rows: [
      { n: "1", kanji: "一", yomi: "いち" }, { n: "2", kanji: "二", yomi: "に" }, { n: "3", kanji: "三", yomi: "さん" },
      { n: "4", kanji: "四", yomi: "よん", tag: "two", alt: "し" }, { n: "5", kanji: "五", yomi: "ご" },
      { n: "6", kanji: "六", yomi: "ろく" }, { n: "7", kanji: "七", yomi: "なな", tag: "two", alt: "しち" },
      { n: "8", kanji: "八", yomi: "はち" }, { n: "9", kanji: "九", yomi: "きゅう", tag: "two", alt: "く" }, { n: "10", kanji: "十", yomi: "じゅう" },
    ] },
  { title: { vi: "Hàng trăm (百)", en: "Hundreds (百)", ja: "百の位" },
    note: { vi: "Biến âm ở 300, 600, 800.", en: "Sound changes at 300, 600, 800.", ja: "300・600・800で音便。" },
    rows: [
      { n: "100", kanji: "百", yomi: "ひゃく" }, { n: "300", kanji: "三百", yomi: "さんびゃく", tag: "change" },
      { n: "600", kanji: "六百", yomi: "ろっぴゃく", tag: "change" }, { n: "800", kanji: "八百", yomi: "はっぴゃく", tag: "change" },
      { n: "400", kanji: "四百", yomi: "よんひゃく" },
    ] },
  { title: { vi: "Nghìn (千) & Vạn (万)", en: "Thousands (千) & 万", ja: "千・万" },
    note: { vi: "Biến âm ở 3000, 8000. 万 luôn giữ 一.", en: "Changes at 3000, 8000. 万 always keeps 一.", ja: "3000・8000で音便。万は一あり。" },
    rows: [
      { n: "1,000", kanji: "千", yomi: "せん" }, { n: "3,000", kanji: "三千", yomi: "さんぜん", tag: "change" },
      { n: "8,000", kanji: "八千", yomi: "はっせん", tag: "change" },
      { n: "10,000", kanji: "一万", yomi: "いちまん", tag: "keep1" }, { n: "30,000", kanji: "三万", yomi: "さんまん" },
    ] },
  { title: { vi: "Quy tắc 一 (bỏ / giữ)", en: "The 一 rule", ja: "一のルール" },
    note: { vi: "Bỏ 一 trước 十/百/千; nhưng 万 giữ 一.", en: "Drop 一 before 十/百/千; keep it for 万.", ja: "十・百・千は一を省く。万は残す。" },
    rows: [
      { n: "10", kanji: "十", yomi: "じゅう", tag: "drop1" }, { n: "100", kanji: "百", yomi: "ひゃく", tag: "drop1" },
      { n: "1,000", kanji: "千", yomi: "せん", tag: "drop1" }, { n: "10,000", kanji: "一万", yomi: "いちまん", tag: "keep1" },
    ] },
  { title: { vi: "Giờ (時)", en: "Hours (時)", ja: "時" },
    note: { vi: "Phần lớn +じ, trừ 3 ngoại lệ.", en: "Mostly +じ, except three.", ja: "基本は+じ、例外3つ。" },
    rows: [
      { n: "1:00", kanji: "一時", yomi: "いちじ" }, { n: "4:00", kanji: "四時", yomi: "よじ", tag: "irregular" },
      { n: "7:00", kanji: "七時", yomi: "しちじ", tag: "irregular" }, { n: "9:00", kanji: "九時", yomi: "くじ", tag: "irregular" },
    ] },
  { title: { vi: "Phút (分): ふん / ぷん", en: "Minutes (分): fun / pun", ja: "分：ふん・ぷん" },
    note: { vi: "1,3,4,6,8,10 → ぷん. 2,5,7,9 → ふん.", en: "1,3,4,6,8,10 → pun. 2,5,7,9 → fun.", ja: "1,3,4,6,8,10は「ぷん」。2,5,7,9は「ふん」。" },
    rows: [
      { n: "1", kanji: "一分", yomi: "いっぷん", tag: "change" }, { n: "3", kanji: "三分", yomi: "さんぷん", tag: "change" },
      { n: "6", kanji: "六分", yomi: "ろっぷん", tag: "change" }, { n: "10", kanji: "十分", yomi: "じゅっぷん", tag: "change" },
      { n: "5", kanji: "五分", yomi: "ごふん" }, { n: "30", kanji: "三十分", yomi: "さんじゅっぷん" },
    ] },
  { title: { vi: "0 phút & tiền tệ", en: "O'clock & money", ja: "ちょうど・通貨" },
    note: { vi: "0 phút = ちょうど. 円: 4円 biến âm. ドル/ドン không đổi.", en: "0 min = ちょうど. 円: 4円 changes. Dollar/dong don't.", ja: "0分はちょうど。円は4円で音便。ドル・ドンは不変。" },
    rows: [
      { n: "4:00", kanji: "四時ちょうど", yomi: "よじちょうど" }, { n: "¥4", kanji: "四円", yomi: "よえん", tag: "change" },
      { n: "¥1,000", kanji: "千円", yomi: "せんえん" }, { n: "$5", kanji: "五ドル", yomi: "ごドル" }, { n: "₫500", kanji: "五百ドン", yomi: "ごひゃくドン" },
    ] },
  { title: { vi: "Mẹo: っ + hàng ぱ", en: "Tip: っ + p-sounds", ja: "コツ：促音＋ぱ行" },
    note: { vi: "Số 1,6,8,10 gặp 百/分… thường thêm っ và đổi sang ぱ行 (ぴゃ/ぷん).", en: "1,6,8,10 before 百/分… often add っ and shift to p-sounds.", ja: "1,6,8,10＋百/分…は促音化＋半濁音になりやすい。" },
    rows: [
      { n: "1分", kanji: "一分", yomi: "いっぷん", tag: "change" }, { n: "600", kanji: "六百", yomi: "ろっぴゃく", tag: "change" },
      { n: "800", kanji: "八百", yomi: "はっぴゃく", tag: "change" }, { n: "10分", kanji: "十分", yomi: "じゅっぷん", tag: "change" },
    ] },
];
let GUIDE_I = 0;
function openGuide() { GUIDE_I = 0; renderGuideOverlay(); }
function closeGuide() { const ov = document.getElementById("guideOv"); if (ov) ov.remove(); }
function renderGuideOverlay() {
  let ov = document.getElementById("guideOv");
  if (!ov) { ov = document.createElement("div"); ov.id = "guideOv"; ov.className = "guide-ov"; document.body.appendChild(ov); }
  const L = I18N[LANG] ? LANG : "en";
  const tr = (o) => o[L] || o.en;
  const s = NT_GUIDE[GUIDE_I];
  const row = (r) => `<div class="g-row">
    <span class="g-n">${esc(r.n)}</span>
    <span class="g-k">${esc(r.kanji)}</span>
    <span class="g-r"><span>${esc(r.yomi)}${r.alt ? " <em>/ " + esc(r.alt) + "</em>" : ""}</span><small>${esc(toRomaji(r.yomi))}</small></span>
    ${r.tag ? `<span class="g-tag ${r.tag}">${esc(t("tag_" + r.tag))}</span>` : ""}
  </div>`;
  ov.innerHTML = `<div class="guide-card">
    <div class="guide-head"><b>${esc(tr(s.title))}</b><button class="icon-btn" id="gClose" aria-label="close">${ICON.close}</button></div>
    <div class="guide-body">
      <div class="guide-note">${esc(tr(s.note))}</div>
      <div class="guide-rows">${s.rows.map(row).join("")}</div>
    </div>
    <div class="guide-foot">
      <button class="icon-btn" id="gPrev" ${GUIDE_I === 0 ? "disabled" : ""} aria-label="prev">${ICON.back}</button>
      <span class="guide-dots">${NT_GUIDE.map((_, i) => `<i class="${i === GUIDE_I ? "on" : ""}"></i>`).join("")}</span>
      <button class="icon-btn" id="gNext" ${GUIDE_I === NT_GUIDE.length - 1 ? "disabled" : ""} aria-label="next">${ICON.next}</button>
    </div>
  </div>`;
  ov.onclick = (e) => { if (e.target === ov) closeGuide(); };
  document.getElementById("gClose").onclick = closeGuide;
  document.getElementById("gPrev").onclick = () => { if (GUIDE_I > 0) { GUIDE_I--; renderGuideOverlay(); } };
  document.getElementById("gNext").onclick = () => { if (GUIDE_I < NT_GUIDE.length - 1) { GUIDE_I++; renderGuideOverlay(); } };
}

/* --------------------------------------------------------- NUMBERS trainer */
const NT = { mode: "number", range: 99999, cur: "yen", style: "both", revealed: false, item: null, practice: false, answered: false, correct: false, userInput: "" };
function ntRand(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function ntGen() {
  if (NT.mode === "time") NT.item = timeToReading(ntRand(1, 12), ntRand(0, 59));
  else if (NT.mode === "currency") NT.item = currencyToReading(ntRand(1, NT.range), NT.cur);
  else { const n = ntRand(1, NT.range); NT.item = { numeral: n.toLocaleString("en-US"), kanji: numberToKanji(n), yomi: numberToYomi(n) }; }
  NT.revealed = false; NT.answered = false; NT.correct = false;
  ntRenderBody(true); ntRenderActions();
  if (NT.practice) speakJa(NT.item.yomi); // in-gesture when triggered by Next/tab click
}
// The number/time is the hero; the written form is secondary and hidden.
function ntWritingHtml() {
  const c = NT.item;
  if (NT.style === "kana") return genkoHero({ hero: c.yomi, ruby: "", annot: null, sm: true });
  if (NT.style === "kanji") return genkoHero({ hero: c.kanji, ruby: "", annot: null, sm: true });
  return genkoHero({ hero: c.kanji, ruby: c.yomi, annot: null, sm: true }); // furigana above kanji
}
function ntRenderBody(ink) {
  const card = document.getElementById("ntCard");
  const c = NT.item;
  if (!NT.practice) {
    // READ mode: numeral hero, writing hidden until tap
    card.innerHTML = `
      <div class="q-instruction">${t("ntReadAloud")}</div>
      <div class="nt-big${ink ? " inkin" : ""}">${esc(c.numeral)}</div>
      <div class="nt-writing${NT.revealed ? "" : " hidden"}">${ntWritingHtml()}</div>
      <div class="fc-hint" style="margin-top:.7rem">${NT.revealed ? "&nbsp;" : t("tap")}</div>`;
    card.style.cursor = "pointer";
    card.onclick = () => { NT.revealed = !NT.revealed; ntRenderBody(false); };
  } else {
    // LISTEN mode: hear the reading, type the number, then it grades
    card.style.cursor = "default"; card.onclick = null;
    if (!NT.answered) {
      const ph = NT.mode === "time" ? "4:25" : (NT.mode === "currency" ? "1000" : "12345");
      card.innerHTML = `
        <div class="q-instruction">${t("ntListenFill")}</div>
        <button class="speak-big" id="ntReplay" aria-label="replay">${ICON.sound}</button>
        <input class="type-input" id="ntInput" type="text" inputmode="numeric" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${ph}">`;
      const inp = document.getElementById("ntInput"); inp.focus();
      // Numbers only (time also allows ":"); strip anything else as you type.
      const strip = NT.mode === "time" ? /[^0-9:]/g : /[^0-9]/g;
      inp.addEventListener("input", () => { const cleaned = inp.value.replace(strip, ""); if (cleaned !== inp.value) inp.value = cleaned; });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") ntCheck(); });
      document.getElementById("ntReplay").onclick = () => speakJa(c.yomi);
    } else {
      card.innerHTML = `
        <div class="q-instruction">${NT.correct ? t("correct") : t("wrong")}</div>
        <div class="nt-markbox">${NT.correct ? maruMark() : batsuMark()}</div>
        <div class="nt-yours ${NT.correct ? "ok" : "no"}">${t("youTyped")}: <b>${esc(NT.userInput || "—")}</b></div>
        <div class="nt-answer-label">${t("answerLabel")}</div>
        <div class="nt-big">${esc(c.numeral)}</div>
        <div class="nt-writing">${ntWritingHtml()}</div>`;
    }
  }
}
function ntCheck() {
  const inp = document.getElementById("ntInput"); if (!inp) return;
  const raw = (inp.value || "").trim();
  const got = raw.replace(/[^0-9]/g, "");
  if (!got) return;
  NT.userInput = raw;
  const want = NT.item.numeral.replace(/[^0-9]/g, "");
  NT.correct = got === want;
  NT.answered = true;
  beep(NT.correct);
  ntRenderBody(false); ntRenderActions();
}
function ntRenderActions() {
  const a = document.getElementById("ntActions");
  if (!NT.practice) {
    a.innerHTML = `<button class="btn btn-ink-outline" id="ntListen">${ICON.sound}${t("ntListen")}</button><button class="btn btn-ink" id="ntNext">${t("ntNext")} ${ICON.next}</button>`;
    document.getElementById("ntListen").onclick = () => speakJa(NT.item.yomi);
    document.getElementById("ntNext").onclick = ntGen;
  } else if (!NT.answered) {
    a.innerHTML = `<button class="btn btn-ink-outline" id="ntListen">${ICON.sound}${t("ntListen")}</button><button class="btn btn-ink" id="ntCheck">${t("check")}</button>`;
    document.getElementById("ntListen").onclick = () => speakJa(NT.item.yomi);
    document.getElementById("ntCheck").onclick = ntCheck;
  } else {
    a.innerHTML = `<button class="btn btn-ink btn-block" id="ntNext">${t("ntNext")} ${ICON.next}</button>`;
    document.getElementById("ntNext").onclick = ntGen;
  }
}
function renderNumbers() {
  const tab = (m, label) => `<button class="tab ${NT.mode === m ? "active" : ""}" data-m="${m}" style="font-size:1rem">${label}</button>`;
  app().innerHTML = `${topbarMin(t("dashNumbers"))}
    <div class="view">
      <div class="tabs" style="justify-content:center;border:none;margin-bottom:.7rem">
        ${tab("number", t("ntNumber"))}${tab("time", t("ntTime"))}${tab("currency", t("ntCurrency"))}
      </div>
      <div class="nt-bar">
        <div class="seg nt-mode">
          <button data-p="0" class="${!NT.practice ? "active" : ""}">${t("ntRead")}</button>
          <button data-p="1" class="${NT.practice ? "active" : ""}">${t("ntListenMode")}</button>
        </div>
        <button class="guide-btn" id="ntGuide">${ICON.info}${t("guideTitle")}</button>
      </div>
      <div class="fc" id="ntCard" style="max-width:420px"></div>
      <div class="nt-actions" id="ntActions"></div>
      <div class="nt-opts">
        <span id="ntRangeWrap">${t("ntRange")}
          <select id="ntRange"><option value="99">1–99</option><option value="999">1–999</option><option value="9999">1–9,999</option><option value="99999">1–99,999</option><option value="999999">1–999,999</option></select>
        </span>
        <span id="ntCurWrap" style="display:none">${t("ntCur")}
          <select id="ntCur"><option value="yen">¥ JPY</option><option value="dollar">$ USD</option><option value="dong">₫ VND</option></select>
        </span>
        <span id="ntStyleWrap">${t("ntWriting")}
          <select id="ntStyle"><option value="both">${t("ntBoth")}</option><option value="kanji">${t("ntKanji")}</option><option value="kana">${t("ntKana")}</option></select>
        </span>
      </div>
    </div>`;
  bindBack("/");
  document.getElementById("ntGuide").onclick = openGuide;
  document.getElementById("ntRangeWrap").style.display = NT.mode === "time" ? "none" : "";
  document.getElementById("ntCurWrap").style.display = NT.mode === "currency" ? "" : "none";
  app().querySelectorAll("[data-m]").forEach((b) => b.onclick = () => { NT.mode = b.dataset.m; renderNumbers(); });
  app().querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { NT.practice = b.dataset.p === "1"; renderNumbers(); });
  const rg = document.getElementById("ntRange"); rg.value = String(NT.range); rg.onchange = (e) => { NT.range = parseInt(e.target.value, 10); ntGen(); };
  const cu = document.getElementById("ntCur"); cu.value = NT.cur; cu.onchange = (e) => { NT.cur = e.target.value; ntGen(); };
  const st = document.getElementById("ntStyle"); st.value = NT.style; st.onchange = (e) => { NT.style = e.target.value; if (!NT.practice || NT.answered) ntRenderBody(false); };
  ntGen();
}

/* ------------------------------------------------------------------ SETTINGS */
const AZ_VOICES = [
  { id: "ja-JP-NanamiNeural", name: "Nanami ♀" }, { id: "ja-JP-KeitaNeural", name: "Keita ♂" },
  { id: "ja-JP-AoiNeural", name: "Aoi ♀" }, { id: "ja-JP-DaichiNeural", name: "Daichi ♂" },
  { id: "ja-JP-MayuNeural", name: "Mayu ♀" }, { id: "ja-JP-NaokiNeural", name: "Naoki ♂" },
  { id: "ja-JP-ShioriNeural", name: "Shiori ♀" },
];
function renderSettings() {
  const langSeg = Object.keys(I18N).map((l) => `<button class="${LANG === l ? "active" : ""}" data-lang="${l}">${I18N[l]._name}</button>`).join("");
  app().innerHTML = `${topbarMin(t("settings"))}
    <div class="view">
      <div class="rows">
        <div class="row"><div class="r-label">${t("language")}</div><div class="seg" id="langSeg">${langSeg}</div></div>
        ${jaVoices.length ? `<div class="row"><div><div class="r-label">${t("voiceLabel")}</div><div class="r-sub">${t("voiceSub")}</div></div>
          <select class="voice-sel" id="voiceSel"><option value="">${t("voiceAuto")}</option>${jaVoices.map((v) => `<option value="${esc(v.voiceURI || v.name)}" ${(S.settings.voice === (v.voiceURI || v.name)) ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select></div>` : ""}
        <div class="row"><div><div class="r-label">${t("strict")}</div><div class="r-sub">${t("strictSub")}</div></div><button class="switch ${S.settings.strict ? "on" : ""}" id="strictSw"></button></div>
        <div class="row"><div><div class="r-label">${t("sound")}</div><div class="r-sub">${t("soundSub")}</div></div><button class="switch ${S.settings.sound ? "on" : ""}" id="soundSw"></button></div>
        <div class="row"><div><div class="r-label">${t("ttsNeural")}</div><div class="r-sub">${t("ttsNeuralSub")}</div></div><button class="switch ${S.settings.ttsOn ? "on" : ""}" id="ttsSw"></button></div>
        ${S.settings.ttsOn ? `<div class="tts-config">
          <input class="tts-url" id="ttsUrl" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://…workers.dev" value="${esc(S.settings.ttsUrl || "")}">
          <div class="tts-row">
            <select class="voice-sel" id="azVoice">${AZ_VOICES.map((v) => `<option value="${v.id}" ${S.settings.azVoice === v.id ? "selected" : ""}>${v.name}</option>`).join("")}</select>
            <button class="btn btn-ink-outline" id="ttsTest">${ICON.sound}${t("ttsTest")}</button>
          </div>
          <div class="muted" style="font-size:.74rem;margin-top:.5rem">${t("ttsHelp")}</div>
        </div>` : ""}
        <div class="row"><div><div class="r-label">${t("reset")}</div><div class="r-sub">${t("resetSub")}</div></div><button class="btn btn-ink-outline" id="resetBtn">${ICON.practice}</button></div>
      </div>
      <div class="center muted mt" style="font-size:.78rem">${VOCAB.length} ${t("words")} · ${LESSONS.filter((n) => n >= 1).length} ${t("lesson")}</div>
    </div>`;
  bindBack("/");
  document.getElementById("langSeg").querySelectorAll("button").forEach((b) => b.onclick = () => { LANG = b.dataset.lang; S.settings.lang = LANG; save(); document.documentElement.lang = LANG === "ja" ? "ja" : LANG; renderSettings(); });
  const vs = document.getElementById("voiceSel");
  if (vs) vs.onchange = () => { S.settings.voice = vs.value || null; save(); pickBestVoice(); speakJa("はじめまして。よろしくおねがいします。"); };
  const sw1 = document.getElementById("strictSw"); sw1.onclick = () => { S.settings.strict = !S.settings.strict; save(); sw1.classList.toggle("on"); };
  const sw2 = document.getElementById("soundSw"); sw2.onclick = () => { S.settings.sound = !S.settings.sound; save(); sw2.classList.toggle("on"); };
  const tsw = document.getElementById("ttsSw"); tsw.onclick = () => { S.settings.ttsOn = !S.settings.ttsOn; save(); renderSettings(); };
  const tUrl = document.getElementById("ttsUrl");
  if (tUrl) tUrl.oninput = () => { S.settings.ttsUrl = tUrl.value.trim(); ttsCache.clear(); save(); };
  const az = document.getElementById("azVoice");
  if (az) az.onchange = () => { S.settings.azVoice = az.value; ttsCache.clear(); save(); };
  const tTest = document.getElementById("ttsTest");
  if (tTest) tTest.onclick = async () => { const ok = await remoteTTS("こんにちは。よんひゃくにじゅうごえん。"); toast(ok ? t("ttsOk") : t("ttsErr")); if (!ok) speakLocal("こんにちは"); };
  document.getElementById("resetBtn").onclick = () => { if (confirm(t("resetConfirm"))) { S = DEFAULT_STATE(); LANG = "vi"; S.settings.lang = "vi"; save(); go("/"); } };
}

/* ---------------------------------------------------------------------- boot */
async function boot() {
  LANG = S.settings.lang || "vi";
  document.documentElement.lang = LANG === "ja" ? "ja" : LANG;
  initVoices();
  // Keep-alive: recover speechSynthesis if the engine gets stuck paused (Chrome bug).
  if ("speechSynthesis" in window) {
    setInterval(() => { try { const s = window.speechSynthesis; if (s.paused && s.speaking) s.resume(); } catch {} }, 4000);
    document.addEventListener("visibilitychange", () => { try { if (!document.hidden) window.speechSynthesis.resume(); } catch {} });
  }
  app().innerHTML = `<div class="loading">${t("loading")}</div>`;
  try { await loadVocab(); } catch (e) { app().innerHTML = `<div class="loading">⚠ ${esc(String(e))}</div>`; return; }
  window.addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
}
// Re-load the active set's words, then navigate home.
async function switchSet(id) { SETSREG.active = id; saveSetsReg(); await loadVocab(); go("/"); if ((location.hash.replace(/^#/, "") || "/") === "/") renderHome(); }
boot();
