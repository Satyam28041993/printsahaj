import { blanks, word } from "./builders";
import { TEACHER_ANIMALS, TEACHER_COLOURS, TEACHER_FRUITS, others } from "./teacher-lists";
import type { Part, Question, Worksheet } from "./types";

/*
 * First-semester exam practice, Sr. KG 2026-27 (Eklavya Public School).
 *
 * The school sheets list only the question TYPES and marks, not the
 * questions. Each part below follows one printed type, in the printed order
 * and with the printed marks; the questions themselves are our own practice
 * items at Sr. KG level (one item per mark where that fits). They are not
 * the exam paper.
 */

const q = (
  id: string,
  prompt: string,
  answer: string,
  choices: string[],
  extra: Partial<Question> = {},
): Question => ({ id, prompt, answer, choices, ...extra });

const part = (id: string, instruction: string, helper: string, questions: Question[]): Part => ({
  id,
  instruction,
  helper,
  questions,
});

/** "🍎🍎🍎" for counting questions. */
const many = (emoji: string, n: number) => Array.from({ length: n }, () => emoji).join("");

/* ------------------------------------------------------------------ Hindi */

const HI_VOWELS = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"];
const HI_CONS = [
  "क", "ख", "ग", "घ", "ङ",
  "च", "छ", "ज", "झ", "ञ",
  "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न",
  "प", "फ", "ब", "भ", "म",
];
/** Everything printed except these 7 blanks each. */
const except = (n: number, blank: number[]) => new Set(Array.from({ length: n }, (_, i) => i).filter((i) => !blank.includes(i)));

export const HINDI_EXAM: Worksheet = {
  id: "eps-sem1-hindi",
  title: "Hindi — Exam practice (Sem 1)",
  subject: "Hindi",
  lang: "hi",
  builtIn: true,
  parts: [
    part("h1", "प्र. १) स्वर - खाली स्थान मे सही वर्ण लिखो? (७ गुण)", "Vowels: fill the missing letter",
      blanks("hv", HI_VOWELS, except(13, [1, 3, 4, 6, 8, 10, 12]), 5, "hi")),
    part("h2", "प्र. २) अक्षर को चित्र से मिलाओ? (६ गुण)", "Match the letter to the picture whose name starts with it", [
      q("h2-1", "आ — आम कौन सा है?", "🥭", ["🦉", "🍇"], { hint: "आ से आम (mango)" }),
      q("h2-2", "उ — उल्लू कौन सा है?", "🦉", ["🐟", "🥭"], { hint: "उ से उल्लू (owl)" }),
      q("h2-3", "ऐ — ऐनक कौन सी है?", "👓", ["🪁", "🍇"], { hint: "ऐ से ऐनक (spectacles)" }),
      q("h2-4", "अं — अंगूर कौन सा है?", "🍇", ["🥭", "🐟"], { hint: "अं से अंगूर (grapes)" }),
      q("h2-5", "क — कबूतर कौन सा है?", "🕊️", ["🦉", "👓"], { hint: "क से कबूतर (pigeon)" }),
      q("h2-6", "म — मछली कौन सी है?", "🐟", ["🕊️", "🪁"], { hint: "म से मछली (fish)" }),
    ]),
    part("h3", "प्र. ३) व्यंजन - खाली स्थान मे सही वर्ण लिखो? (७ गुण)", "Consonants: fill the missing letter",
      blanks("hc", HI_CONS, except(25, [1, 3, 6, 8, 11, 16, 23]), 5, "hi")),
    part("h4", "प्र. ४) चित्र देखकर पहिला अक्षर लिखो? (६ गुण)", "Look at the picture: which letter does its name start with?", [
      q("h4-1", "पहला अक्षर कौन सा?", "ह", ["क", "म"], { image: "🐘", hint: "यह हाथी है — ह" }),
      q("h4-2", "पहला अक्षर कौन सा?", "ब", ["प", "व"], { image: "🐱", hint: "यह बिल्ली है — ब" }),
      q("h4-3", "पहला अक्षर कौन सा?", "प", ["ब", "फ"], { image: "🪁", hint: "यह पतंग है — प" }),
      q("h4-4", "पहला अक्षर कौन सा?", "ग", ["घ", "क"], { image: "🥕", hint: "यह गाजर है — ग" }),
      q("h4-5", "पहला अक्षर कौन सा?", "क", ["ख", "ग"], { image: "🪷", hint: "यह कमल है — क" }),
      q("h4-6", "पहला अक्षर कौन सा?", "ट", ["ठ", "त"], { image: "🍅", hint: "यह टमाटर है — ट" }),
    ]),
    part("h5", "प्र. ५) सही अक्षर पर गोला लगाओ? (६ गुण)", "Tap the letter that is asked (press 🔊 to hear it)", [
      q("h5-1", "'ग' पर गोला लगाओ", "ग", ["म", "भ", "घ"]),
      q("h5-2", "'ब' पर गोला लगाओ", "ब", ["व", "क", "प"]),
      q("h5-3", "'ध' पर गोला लगाओ", "ध", ["घ", "द", "थ"]),
      q("h5-4", "'ड' पर गोला लगाओ", "ड", ["ङ", "ठ", "ढ"]),
      q("h5-5", "'न' पर गोला लगाओ", "न", ["त", "म", "ल"]),
      q("h5-6", "'भ' पर गोला लगाओ", "भ", ["म", "ग", "त"]),
    ]),
    part("h6", "प्र. ६) अगला वर्ण लिखो? (५ गुण)", "Which letter comes next?", [
      q("h6-1", "अगला वर्ण?", "घ", ["ङ", "ग"], { sequence: ["क", "ख", "ग", "_"], hint: "क ख ग घ" }),
      q("h6-2", "अगला वर्ण?", "झ", ["ञ", "ज"], { sequence: ["च", "छ", "ज", "_"], hint: "च छ ज झ" }),
      q("h6-3", "अगला वर्ण?", "ढ", ["ण", "ड"], { sequence: ["ट", "ठ", "ड", "_"], hint: "ट ठ ड ढ" }),
      q("h6-4", "अगला वर्ण?", "ध", ["न", "द"], { sequence: ["त", "थ", "द", "_"], hint: "त थ द ध" }),
      q("h6-5", "अगला वर्ण?", "भ", ["म", "ब"], { sequence: ["प", "फ", "ब", "_"], hint: "प फ ब भ" }),
    ]),
    part("h7", "प्र. ७) सामान वर्ण का मिलन करो? (६ गुण)", "Find the SAME letter", [
      q("h7-1", "एक जैसा अक्षर ढूँढो", "प", ["ष", "फ", "य"], { sequence: ["प", "=", "_"] }),
      q("h7-2", "एक जैसा अक्षर ढूँढो", "ख", ["व", "स", "र"], { sequence: ["ख", "=", "_"] }),
      q("h7-3", "एक जैसा अक्षर ढूँढो", "र", ["ड", "ह", "द"], { sequence: ["र", "=", "_"] }),
      q("h7-4", "एक जैसा अक्षर ढूँढो", "थ", ["य", "ध", "घ"], { sequence: ["थ", "=", "_"] }),
      q("h7-5", "एक जैसा अक्षर ढूँढो", "ज", ["झ", "त", "न"], { sequence: ["ज", "=", "_"] }),
      q("h7-6", "एक जैसा अक्षर ढूँढो", "य", ["थ", "प", "ष"], { sequence: ["य", "=", "_"] }),
    ]),
    part("h8", "प्र. ८) मध्यम अक्षर लिखो? (५ गुण)", "Which letter comes in the middle?", [
      q("h8-1", "बीच का अक्षर?", "ख", ["घ", "ङ"], { sequence: ["क", "_", "ग"], hint: "क ख ग" }),
      q("h8-2", "बीच का अक्षर?", "छ", ["झ", "च"], { sequence: ["च", "_", "ज"], hint: "च छ ज" }),
      q("h8-3", "बीच का अक्षर?", "ठ", ["ढ", "ण"], { sequence: ["ट", "_", "ड"], hint: "ट ठ ड" }),
      q("h8-4", "बीच का अक्षर?", "थ", ["ध", "न"], { sequence: ["त", "_", "द"], hint: "त थ द" }),
      q("h8-5", "बीच का अक्षर?", "फ", ["भ", "म"], { sequence: ["प", "_", "ब"], hint: "प फ ब" }),
    ]),
    part("h9", "प्र. ९) ई अक्षर पहचान कर गोला लगाओ? (२ गुण)", "Find the letter ई", [
      q("h9-1", "'ई' पर गोला लगाओ", "ई", ["इ", "ऊ", "ए"], { hint: "ई — ईख वाला बड़ी ई" }),
      q("h9-2", "'ई' पर गोला लगाओ", "ई", ["ऐ", "उ", "इ"], { hint: "ई — ईख वाला बड़ी ई" }),
    ]),
  ],
};

/* ---------------------------------------------------------------- English */

const missing = (id: string, row: string[], answer: string, choices: string[]) =>
  q(id, "Which letter is missing?", answer, choices, { sequence: row, hint: `Say the alphabet: ${row.join(" ").replace("_", "?")}` });

const pictureLetter = (id: string, emoji: string, w: string, at: number, choices: string[]) =>
  q(id, "Which letter is missing?", w[at], choices, {
    image: emoji,
    sequence: w.split("").map((c, i) => (i === at ? "_" : c)),
    hint: `It is a ${w}: ${w.split("").join(" - ")}`,
  });

const pictureName = (id: string, emoji: string, answer: string, choices: string[]) =>
  q(id, "What is this?", answer, choices, { image: emoji, hint: `It starts with "${answer[0]}" and has ${answer.length} letters.` });

const rhyme = (id: string, w: string, answer: string, choices: string[]) =>
  q(id, `Which word rhymes with “${w}”?`, answer, choices, { hint: `${w} – ${answer}: they end with the same sound “${answer.slice(-2)}”.` });

export const ENGLISH_EXAM: Worksheet = {
  id: "eps-sem1-english",
  title: "English — Exam practice (Sem 1)",
  subject: "English",
  lang: "en",
  builtIn: true,
  parts: [
    part("e1", "Q.1) Write the missing letter? (6 Marks)", "Capital letters A to Z", [
      missing("e1-1", ["A", "B", "_", "D"], "C", ["E", "G"]),
      missing("e1-2", ["E", "_", "G", "H"], "F", ["I", "D"]),
      missing("e1-3", ["K", "L", "_", "N"], "M", ["O", "J"]),
      missing("e1-4", ["P", "_", "R", "S"], "Q", ["O", "T"]),
      missing("e1-5", ["T", "U", "_", "W"], "V", ["X", "Y"]),
      missing("e1-6", ["W", "X", "_", "Z"], "Y", ["V", "U"]),
    ]),
    part("e2", "Q.2) Match the capital to small letter? (4 Marks)", "Find the small letter", [
      q("e2-1", "Small letter of  B ?", "b", ["d", "p", "q"], { hint: "B and b say the same sound “buh”." }),
      q("e2-2", "Small letter of  D ?", "d", ["b", "p", "g"], { hint: "D and d say the same sound “duh”." }),
      q("e2-3", "Small letter of  G ?", "g", ["q", "p", "j"], { hint: "G and g say the same sound “guh”." }),
      q("e2-4", "Small letter of  M ?", "m", ["n", "w", "u"], { hint: "M and m say the same sound “mmm”." }),
    ]),
    part("e3", "Q.3) See the picture and write the missing letter? (10 Marks)", "Look at the picture and complete its name", [
      pictureLetter("e3-1", "🐱", "cat", 1, ["e", "o"]),
      pictureLetter("e3-2", "🐶", "dog", 1, ["a", "u"]),
      pictureLetter("e3-3", "☀️", "sun", 1, ["a", "i"]),
      pictureLetter("e3-4", "🎒", "bag", 1, ["i", "e"]),
      pictureLetter("e3-5", "🖊️", "pen", 1, ["a", "i"]),
      pictureLetter("e3-6", "🐔", "hen", 1, ["u", "a"]),
      pictureLetter("e3-7", "🐷", "pig", 1, ["e", "o"]),
      pictureLetter("e3-8", "🚌", "bus", 1, ["a", "o"]),
      pictureLetter("e3-9", "🦊", "fox", 1, ["i", "a"]),
      pictureLetter("e3-10", "☕", "cup", 1, ["a", "o"]),
    ]),
    part("e4", "Q.4) Fill in the name from the given box? (5 Marks)", "Box: Ball, Kite, Tree, Fish, Star", [
      pictureName("e4-1", "⚽", "Ball", ["Kite", "Star"]),
      pictureName("e4-2", "🪁", "Kite", ["Tree", "Ball"]),
      pictureName("e4-3", "🌳", "Tree", ["Fish", "Kite"]),
      pictureName("e4-4", "🐟", "Fish", ["Star", "Tree"]),
      pictureName("e4-5", "⭐", "Star", ["Ball", "Fish"]),
    ]),
    part("e5", "Q.5 Match the picture with correct words? (5 Marks)", "Choose the right word for the picture", [
      pictureName("e5-1", "🍎", "Apple", ["Egg", "Car"]),
      pictureName("e5-2", "🚗", "Car", ["House", "Apple"]),
      pictureName("e5-3", "🏠", "House", ["Umbrella", "Car"]),
      pictureName("e5-4", "☂️", "Umbrella", ["Egg", "House"]),
      pictureName("e5-5", "🥚", "Egg", ["Apple", "Umbrella"]),
    ]),
    part("e6", "Q.6 Write the picture name? (10 Marks)", "Try ✏️ Type to write it!", [
      pictureName("e6-1", "🐱", "Cat", ["Rat", "Bat"]),
      pictureName("e6-2", "🐶", "Dog", ["Cow", "Fox"]),
      pictureName("e6-3", "🐄", "Cow", ["Dog", "Goat"]),
      pictureName("e6-4", "🦆", "Duck", ["Hen", "Fish"]),
      pictureName("e6-5", "🐜", "Ant", ["Bee", "Cat"]),
      pictureName("e6-6", "☀️", "Sun", ["Moon", "Star"]),
      pictureName("e6-7", "🌙", "Moon", ["Sun", "Star"]),
      pictureName("e6-8", "🚌", "Bus", ["Car", "Van"]),
      pictureName("e6-9", "🦇", "Bat", ["Cat", "Hat"]),
      pictureName("e6-10", "🎩", "Hat", ["Bat", "Cap"]),
    ]),
    part("e7", "Q.7 Match the rhyming words ? (8 Marks)", "Rhyming words sound the same at the end", [
      rhyme("e7-1", "cat", "hat", ["cup", "sun"]),
      rhyme("e7-2", "hen", "pen", ["pig", "top"]),
      rhyme("e7-3", "sun", "run", ["cat", "bed"]),
      rhyme("e7-4", "pig", "wig", ["map", "sun"]),
      rhyme("e7-5", "dog", "log", ["bat", "cup"]),
      rhyme("e7-6", "bee", "tree", ["ball", "fish"]),
      rhyme("e7-7", "cake", "lake", ["kite", "ship"]),
      rhyme("e7-8", "star", "car", ["moon", "bag"]),
    ]),
    part("e8", "Q.8 Circle the ‘o’ sounds words? (2 Marks)", "The short “o” sound, as in dog", [
      q("e8-1", "Which word has the ‘o’ sound?", "dog", ["cat", "pen"], { hint: "d - o - g: the middle sound is “o”." }),
      q("e8-2", "Which word has the ‘o’ sound?", "pot", ["sun", "bed"], { hint: "p - o - t: the middle sound is “o”." }),
    ]),
  ],
};

/* ---------------------------------------------------------------- Marathi */

const MR_CONS = [
  "क", "ख", "ग", "घ", "ङ",
  "च", "छ", "ज", "झ", "ञ",
  "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न",
  "प", "फ", "ब", "भ", "म",
  "य", "र", "ल", "व", "श",
  "ष", "स", "ह", "ळ", "क्ष", "ज्ञ",
];

const same = (id: string, shown: string, others: string[], prompt: string) =>
  q(id, prompt, shown, others, { sequence: [shown, "=", "_"] });

const fourLetters = (id: string, answer: string, choices: string[]) =>
  q(id, "चार वर्णांचा शब्द कोणता?", answer, choices, {
    hint: `${answer}: ${Array.from(answer.matchAll(/.[ा-्ंः]*/gu), (m) => m[0]).join(" + ")} — चार वर्ण`,
  });

export const MARATHI_EXAM: Worksheet = {
  id: "eps-sem1-marathi",
  title: "Marathi — Exam practice (Sem 1)",
  subject: "Marathi",
  lang: "mr",
  builtIn: true,
  parts: [
    part("m1", "प्र. १ला) रिकाम्या जागी योग्य मुळाक्षरे लिहा? (५ गुण)", "Fill the missing letter",
      blanks("m1", MR_CONS, except(MR_CONS.length, [16, 19, 21, 24, 27]), 5)),
    part("m2", "प्र. २रा) दिलेल्या व्यंजना सोबत एकसारखे व्यंजन जोडा? (५ गुण)", "Find the SAME letter", [
      same("m2-1", "ब", ["व", "क", "प"], "एकसारखे व्यंजन शोधा"),
      same("m2-2", "म", ["भ", "स", "न"], "एकसारखे व्यंजन शोधा"),
      same("m2-3", "घ", ["ध", "ष", "प"], "एकसारखे व्यंजन शोधा"),
      same("m2-4", "ळ", ["ल", "ढ", "द"], "एकसारखे व्यंजन शोधा"),
      same("m2-5", "श", ["स", "ष", "ग"], "एकसारखे व्यंजन शोधा"),
    ]),
    part("m3", "प्र. ३रा) एक सारखे शब्द यांच्या जोड्या लावा? (५ गुण)", "Find the SAME word", [
      same("m3-1", "घर", ["धर", "घट"], "एकसारखा शब्द शोधा"),
      same("m3-2", "कप", ["पक", "खप"], "एकसारखा शब्द शोधा"),
      same("m3-3", "बदक", ["बकद", "दबक"], "एकसारखा शब्द शोधा"),
      same("m3-4", "नळ", ["नल", "मळ"], "एकसारखा शब्द शोधा"),
      same("m3-5", "पतंग", ["पलंग", "पतन"], "एकसारखा शब्द शोधा"),
    ]),
    part("m4", "प्र. ४था) दोन वर्ण मिळून शब्द लिहा? (५ गुण)", "Join two letters to make a word", [
      word("m4-1", ["घ", "र"], "घर", ["रघ", "धर"]),
      word("m4-2", ["क", "प"], "कप", ["पक", "खप"]),
      word("m4-3", ["न", "ळ"], "नळ", ["ळन", "नल"]),
      word("m4-4", ["फ", "ळ"], "फळ", ["ळफ", "फल"]),
      word("m4-5", ["व", "ड"], "वड", ["डव", "वर"]),
    ]),
    part("m5", "प्र. ५वा) तीन वर्ण मिळून शब्द लिहा? (५ गुण)", "Join three letters to make a word", [
      word("m5-1", ["ब", "द", "क"], "बदक", ["दबक", "बकद"]),
      word("m5-2", ["म", "ग", "र"], "मगर", ["गमर", "मरग"]),
      word("m5-3", ["क", "ल", "म"], "कलम", ["लकम", "कमल"]),
      word("m5-4", ["स", "र", "ळ"], "सरळ", ["रसळ", "सळर"]),
      word("m5-5", ["ग", "ज", "र"], "गजर", ["जगर", "गरज"]),
    ]),
    part("m6", "प्र. ६वा) चित्र व शब्दांच्या जोड्या लावा? (५ गुण)", "Choose the word for the picture", [
      q("m6-1", "हे काय आहे?", "कमळ", ["मासा", "झाड"], { image: "🪷" }),
      q("m6-2", "हे काय आहे?", "मासा", ["गाय", "फूल"], { image: "🐟" }),
      q("m6-3", "हे काय आहे?", "गाय", ["कमळ", "मासा"], { image: "🐄" }),
      q("m6-4", "हे काय आहे?", "झाड", ["फूल", "गाय"], { image: "🌳" }),
      q("m6-5", "हे काय आहे?", "फूल", ["झाड", "कमळ"], { image: "🌼" }),
    ]),
    part("m7", "प्र. ७वा) क ते ण व्यंजन पूर्ण करा? (५ गुण)", "Complete क to ण",
      blanks("m7", MR_CONS.slice(0, 15), except(15, [1, 5, 8, 12, 14]), 5)),
    part("m8", "प्र. ८वा) चित्रा पाहून पहिले अक्षर लिहा? (५ गुण)", "Look at the picture: which letter does its name start with?", [
      q("m8-1", "पहिले अक्षर कोणते?", "ब", ["व", "प"], { image: "🦆", hint: "हे बदक आहे — ब" }),
      q("m8-2", "पहिले अक्षर कोणते?", "म", ["भ", "न"], { image: "🐊", hint: "ही मगर आहे — म" }),
      q("m8-3", "पहिले अक्षर कोणते?", "घ", ["ध", "ग"], { image: "🏠", hint: "हे घर आहे — घ" }),
      q("m8-4", "पहिले अक्षर कोणते?", "प", ["फ", "ब"], { image: "🪁", hint: "हा पतंग आहे — प" }),
      q("m8-5", "पहिले अक्षर कोणते?", "झ", ["ज", "छ"], { image: "🌳", hint: "हे झाड आहे — झ" }),
    ]),
    part("m9", "प्र. ९वा) अक्षर ओळखा व गोल करा? (५ गुण)", "Tap the letter that is asked (press 🔊 to hear it)", [
      q("m9-1", "'ग' ओळखा", "ग", ["म", "भ", "श"]),
      q("m9-2", "'ध' ओळखा", "ध", ["घ", "थ", "ष"]),
      q("m9-3", "'ळ' ओळखा", "ळ", ["ल", "ढ", "क"]),
      q("m9-4", "'ड' ओळखा", "ड", ["ङ", "ह", "द"]),
      q("m9-5", "'ण' ओळखा", "ण", ["प", "ष", "न"]),
    ]),
    part("m10", "प्र. १०वा) चार वर्ण वाले शब्द शोधून लिहा? (५ गुण)", "Find the word with FOUR letters", [
      fourLetters("m10-1", "अननस", ["घर", "बदक"]),
      fourLetters("m10-2", "सरबत", ["कप", "कमळ"]),
      fourLetters("m10-3", "मखमल", ["नळ", "मगर"]),
      fourLetters("m10-4", "करवत", ["वड", "सरळ"]),
      fourLetters("m10-5", "हरभरा", ["फळ", "गजर"]),
    ]),
  ],
};

/* -------------------------------------------------------------------- EVS */

const evsName = (id: string, emoji: string, answer: string, choices: string[], accept?: string[]) =>
  q(id, "What is this?", answer, choices, { image: emoji, accept, hint: `It starts with "${answer[0]}" and has ${answer.length} letters.` });

export const EVS_EXAM: Worksheet = {
  id: "eps-sem1-evs",
  title: "E.V.S — Exam practice (Sem 1)",
  subject: "EVS",
  lang: "en",
  builtIn: true,
  parts: [
    part("v1", "Q.1) Match the body parts? (8 Marks)", "Name the body part", [
      evsName("v1-1", "👁️", "Eye", ["Ear", "Nose"]),
      evsName("v1-2", "👂", "Ear", ["Eye", "Hand"]),
      evsName("v1-3", "👃", "Nose", ["Mouth", "Ear"]),
      evsName("v1-4", "👄", "Mouth", ["Nose", "Tooth"], ["Lips"]),
      evsName("v1-5", "✋", "Hand", ["Foot", "Leg"]),
      evsName("v1-6", "🦶", "Foot", ["Hand", "Eye"], ["Feet"]),
      evsName("v1-7", "🦷", "Tooth", ["Mouth", "Nose"], ["Teeth"]),
      evsName("v1-8", "🦵", "Leg", ["Hand", "Ear"]),
    ]),
    part("v2", "Q.2) Circle the vegetables? (6 Marks)", "Which one is a VEGETABLE?", [
      q("v2-1", "Which one is a vegetable?", "🥕 Carrot", ["🍎 Apple", "🍌 Banana"], { accept: ["Carrot"], hint: "Carrot grows in the ground — a vegetable." }),
      q("v2-2", "Which one is a vegetable?", "🥔 Potato", ["🍇 Grapes", "🍓 Strawberry"], { accept: ["Potato"], hint: "Potato is a vegetable." }),
      q("v2-3", "Which one is a vegetable?", "🧅 Onion", ["🥭 Mango", "🍐 Pear"], { accept: ["Onion"], hint: "Onion is a vegetable." }),
      q("v2-4", "Which one is a vegetable?", "🍆 Brinjal", ["🍑 Peach", "🍎 Apple"], { accept: ["Brinjal"], hint: "Brinjal (baingan) is a vegetable." }),
      q("v2-5", "Which one is a vegetable?", "🥬 Cabbage", ["🍌 Banana", "🍇 Grapes"], { accept: ["Cabbage"], hint: "Cabbage is a vegetable." }),
      q("v2-6", "Which one is a vegetable?", "🍅 Tomato", ["🍓 Strawberry", "🥭 Mango"], { accept: ["Tomato"], hint: "In class we keep tomato with the vegetables." }),
    ]),
    part("v3", "Q.3) Write Animals name? (12 Marks)", "The 12 animals from the teacher's sheet (30/10)",
      TEACHER_ANIMALS.map((it, i) => evsName(`v3-${i + 1}`, it.picture, it.name, others(TEACHER_ANIMALS, i)))),
    part("v4", "Q.4 )Fruits Name? (9 Marks)", "The 9 fruits from the teacher's sheet (30/10)",
      TEACHER_FRUITS.map((it, i) => evsName(`v4-${i + 1}`, it.picture, it.name, others(TEACHER_FRUITS, i)))),
    part("v5", "Q.5) Match the colours with the correct name? (5 Marks)", "The 5 colours from the teacher's sheet (30/10)",
      TEACHER_COLOURS.map((it, i) => evsName(`v5-${i + 1}`, it.picture, it.name, others(TEACHER_COLOURS, i)))),
    part("v6", "Q. 6) Join the season to cloths ? (4 Marks)", "Seasons: Summer ☀️, Rainy 🌧️, Winter ❄️", [
      q("v6-1", "When do we wear a sweater?", "Winter", ["Summer", "Rainy"], { image: "🧥", hint: "A sweater keeps us warm when it is cold ❄️." }),
      q("v6-2", "When do we wear a raincoat?", "Rainy", ["Winter", "Summer"], { image: "🧥🌧️", hint: "A raincoat keeps us dry in the rain 🌧️." }),
      q("v6-3", "When do we wear cotton clothes?", "Summer", ["Winter", "Rainy"], { image: "👕", hint: "Cotton clothes keep us cool when it is hot ☀️." }),
      q("v6-4", "When do we wear gloves and a cap?", "Winter", ["Summer", "Rainy"], { image: "🧤🧢", hint: "Gloves keep our hands warm when it is cold ❄️." }),
    ]),
    part("v7", "Q.7). Color the fruits . (6 Marks)", "Which colour do we use for this fruit?", [
      q("v7-1", "Which colour is a banana?", "Yellow", ["Red", "Blue"], { image: "🍌" }),
      q("v7-2", "Which colour is an apple?", "Red", ["Yellow", "Blue"], { image: "🍎", accept: ["Green"] }),
      q("v7-3", "Which colour is an orange?", "Orange", ["Green", "Blue"], { image: "🍊" }),
      q("v7-4", "Which colour is a strawberry?", "Red", ["Blue", "Black"], { image: "🍓" }),
      q("v7-5", "Which colour is a guava?", "Green", ["Red", "Blue"], { image: "🍈" }),
      q("v7-6", "Which colour is a pear?", "Green", ["Blue", "Black"], { image: "🍐", accept: ["Yellow"] }),
    ]),
  ],
};

/* ------------------------------------------------------------------ Maths */

const num = (n: number) => String(n);
const seq = (id: string, row: (number | "_")[], answer: number, choices: number[], prompt = "Which number is missing?") =>
  q(id, prompt, num(answer), choices.map(num), { sequence: row.map((x) => (x === "_" ? "_" : num(x))), hint: "Count one by one." });

const count = (id: string, emoji: string, n: number, choices: number[], prompt = "How many are there?") =>
  q(id, prompt, num(n), choices.map(num), { image: many(emoji, n), hint: "Touch each one and count: 1, 2, 3…" });

export const MATHS_EXAM: Worksheet = {
  id: "eps-sem1-maths",
  title: "Maths — Exam practice (Sem 1)",
  subject: "Maths",
  lang: "en",
  builtIn: true,
  parts: [
    part("n1", "Q. 1) Write the missing numbers? (5 Marks)", "Numbers in order", [
      seq("n1-1", [3, 4, "_", 6], 5, [7, 2]),
      seq("n1-2", [17, "_", 19, 20], 18, [16, 21]),
      seq("n1-3", [25, 26, "_", 28], 27, [29, 24]),
      seq("n1-4", ["_", 41, 42, 43], 40, [44, 39]),
      seq("n1-5", [56, 57, 58, "_"], 59, [55, 60]),
    ]),
    part("n2", "Q. 2) Write the before number? (5 Marks)", "Before = one less", [
      seq("n2-1", ["_", 8], 7, [9, 6], "What comes before 8?"),
      seq("n2-2", ["_", 15], 14, [16, 13], "What comes before 15?"),
      seq("n2-3", ["_", 23], 22, [24, 21], "What comes before 23?"),
      seq("n2-4", ["_", 40], 39, [41, 30], "What comes before 40?"),
      seq("n2-5", ["_", 61], 60, [62, 50], "What comes before 61?"),
    ]),
    part("n3", "Q. 3) Write the after number? (5 Marks)", "After = one more", [
      seq("n3-1", [6, "_"], 7, [5, 8], "What comes after 6?"),
      seq("n3-2", [19, "_"], 20, [18, 10], "What comes after 19?"),
      seq("n3-3", [29, "_"], 30, [28, 40], "What comes after 29?"),
      seq("n3-4", [44, "_"], 45, [43, 54], "What comes after 44?"),
      seq("n3-5", [70, "_"], 71, [69, 80], "What comes after 70?"),
    ]),
    part("n4", "Q. 4 )Write the number name. ( Spelling ) (5 Marks)", "Choose the correct spelling — or ✏️ Type it", [
      q("n4-1", "Number name of 3", "Three", ["Tree", "Thee"], { image: "3️⃣", hint: "T - H - R - E - E" }),
      q("n4-2", "Number name of 5", "Five", ["Fiv", "Fife"], { image: "5️⃣", hint: "F - I - V - E" }),
      q("n4-3", "Number name of 8", "Eight", ["Ate", "Eigt"], { image: "8️⃣", hint: "E - I - G - H - T" }),
      q("n4-4", "Number name of 2", "Two", ["Tow", "To"], { image: "2️⃣", hint: "T - W - O" }),
      q("n4-5", "Number name of 10", "Ten", ["Tan", "Tin"], { image: "🔟", hint: "T - E - N" }),
    ]),
    part("n5", "Q.5) Count the picture and their numbers? (5 Marks)", "Count the pictures", [
      count("n5-1", "🍎", 3, [2, 4]),
      count("n5-2", "⭐", 5, [4, 6]),
      count("n5-3", "🐟", 4, [3, 5]),
      count("n5-4", "🎈", 6, [5, 7]),
      count("n5-5", "🌸", 7, [6, 8]),
    ]),
    part("n6", "Q. 6 )Circle the smaller number? (5 Marks)", "Smaller = less", [
      q("n6-1", "Which number is smaller?", "4", ["9"], { hint: "4 comes before 9 when we count." }),
      q("n6-2", "Which number is smaller?", "12", ["21"], { hint: "12 comes before 21 when we count." }),
      q("n6-3", "Which number is smaller?", "13", ["30"], { hint: "13 comes before 30 when we count." }),
      q("n6-4", "Which number is smaller?", "7", ["17"], { hint: "7 comes before 17 when we count." }),
      q("n6-5", "Which number is smaller?", "15", ["50"], { hint: "15 comes before 50 when we count." }),
    ]),
    part("n7", "Q. 7) Write the between number? (5 Marks)", "The number in the middle", [
      seq("n7-1", [4, "_", 6], 5, [7, 3]),
      seq("n7-2", [9, "_", 11], 10, [12, 8]),
      seq("n7-3", [19, "_", 21], 20, [22, 18]),
      seq("n7-4", [33, "_", 35], 34, [36, 32]),
      seq("n7-5", [47, "_", 49], 48, [46, 50]),
    ]),
    part("n8", "Q. 8) Join the numbers to it's name? (5 Marks)", "Find the number for the name", [
      q("n8-1", "Which number is “Seven”?", "7", ["1", "4"]),
      q("n8-2", "Which number is “Nine”?", "9", ["6", "8"]),
      q("n8-3", "Which number is “Four”?", "4", ["7", "1"]),
      q("n8-4", "Which number is “Six”?", "6", ["9", "3"]),
      q("n8-5", "Which number is “One”?", "1", ["7", "10"]),
    ]),
    part("n9", "Q. 9)Count and circle the correct numbers? (5 Marks)", "Count and tap the number", [
      count("n9-1", "🐥", 2, [3, 1], "Count and tap the number"),
      count("n9-2", "🍌", 6, [5, 8], "Count and tap the number"),
      count("n9-3", "🚗", 3, [4, 2], "Count and tap the number"),
      count("n9-4", "🌼", 8, [7, 9], "Count and tap the number"),
      count("n9-5", "🐞", 5, [6, 4], "Count and tap the number"),
    ]),
    part("n10", "Q. 10 Write Table (5 marks)", "Table of 2 (2, 4, 6 … 20)", [
      seq("n10-1", [2, "_", 6, 8], 4, [3, 5], "Table of 2: which number is missing?"),
      seq("n10-2", [6, 8, "_", 12], 10, [9, 11], "Table of 2: which number is missing?"),
      seq("n10-3", [12, "_", 16, 18], 14, [13, 15], "Table of 2: which number is missing?"),
      seq("n10-4", [10, 12, 14, "_"], 16, [15, 17], "Table of 2: which number is missing?"),
      seq("n10-5", [14, 16, 18, "_"], 20, [19, 21], "Table of 2: which number is missing?"),
    ]),
  ],
};

export const EXAM_PRACTICE: Worksheet[] = [MARATHI_EXAM, HINDI_EXAM, ENGLISH_EXAM, EVS_EXAM, MATHS_EXAM];
