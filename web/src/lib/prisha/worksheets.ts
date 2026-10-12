import type { Question, Worksheet } from "./types";

/*
 * The two school worksheets (Eklavya Public School, Sr. KG, 09/10/2026),
 * copied question by question from the photographs.
 *
 * Read from the photo, printed on the sheet:
 *   Vowel flowers (13): अ _ इ _ / _ ऊ _ _ / ऐ _ _ अं / _
 *   Consonant boxes:    क ख _ _ ङ / च _ ज _ ञ / _ ठ ड _ ण
 *   Words:              क+म+ळ, त+ब+ला, स+का+ळ, उ+पा+शी, ऐ+र+ण
 *   Fruits (9) in order, word bank of 12; animals (12) in order, no bank.
 *
 * Worked out, not printed (see VERIFY notes below):
 *   - The 13 flowers only fit the printed letters if the row includes ऋ:
 *     अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः (ऊ is 6th, ऐ 9th, अं 12th — as printed).
 *   - Fruit 6 is read as Peach (cleft + leaf) and fruit 8 as Pear.
 *   - Animal 12 has curled horns: Sheep, and "ram" is accepted too.
 */

const VOWELS = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"];
/** Printed on the sheet; every other flower is a blank. */
const VOWELS_PRINTED = new Set([0, 2, 5, 8, 11]);

const CONSONANTS = ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण"];
const CONSONANTS_PRINTED = new Set([0, 1, 4, 5, 7, 9, 11, 12, 14]);

/** One question per blank. The tile row shows the printed letters only, so
 * the child sees the sheet as it is, with the current blank marked. */
function blanks(prefix: string, letters: string[], printed: Set<number>, rowLength: number): Question[] {
  const out: Question[] = [];
  letters.forEach((letter, i) => {
    if (printed.has(i)) return;
    const rowStart = Math.floor(i / rowLength) * rowLength;
    const row = letters.slice(rowStart, rowStart + rowLength).map((l, j) => {
      const k = rowStart + j;
      if (k === i) return "_";
      return printed.has(k) ? l : "·";
    });
    // Three wrong choices close to the answer: its neighbours in the row of letters.
    const near = [letters[i - 1], letters[i + 1], letters[i + 2], letters[i - 2]].filter(
      (l): l is string => !!l && l !== letter,
    );
    out.push({
      id: `${prefix}-${i + 1}`,
      prompt: "कोणते अक्षर येईल?",
      sequence: row,
      answer: letter,
      choices: near.slice(0, 3),
      hint: i > 0 ? `${letters[i - 1]} नंतर येणारे अक्षर (comes after ${letters[i - 1]})` : undefined,
    });
  });
  return out;
}

const word = (id: string, parts: string[], answer: string, choices: string[]): Question => ({
  id,
  prompt: `${parts.join(" + ")} = ?`,
  answer,
  choices,
  hint: `अक्षरे क्रमाने जोडा: ${parts.join(" → ")} (join them in order)`,
});

export const MARATHI_WORKSHEET: Worksheet = {
  id: "eps-2026-10-09-marathi",
  title: "Marathi worksheet — 09/10/2026",
  subject: "Marathi",
  date: "09/10/2026",
  lang: "mr",
  builtIn: true,
  parts: [
    {
      id: "vowels",
      instruction: "१) गाळलेली अक्षरे भरा. (स्वर)",
      helper: "Fill in the missing letters — vowels (flowers)",
      questions: blanks("v", VOWELS, VOWELS_PRINTED, 4),
    },
    {
      id: "consonants",
      instruction: "१) गाळलेली अक्षरे भरा. (व्यंजन)",
      helper: "Fill in the missing letters — consonants (boxes)",
      questions: blanks("c", CONSONANTS, CONSONANTS_PRINTED, 5),
    },
    {
      id: "words",
      instruction: "२) तीन वर्ण मिळून शब्द लिहा.",
      helper: "Join three letters to make a word",
      questions: [
        word("w-1", ["क", "म", "ळ"], "कमळ", ["मकळ", "कळम"]),
        word("w-2", ["त", "ब", "ला"], "तबला", ["बतला", "लातब"]),
        word("w-3", ["स", "का", "ळ"], "सकाळ", ["कासळ", "सळका"]),
        word("w-4", ["उ", "पा", "शी"], "उपाशी", ["पाउशी", "उशीपा"]),
        word("w-5", ["ऐ", "र", "ण"], "ऐरण", ["रऐण", "ऐणर"]),
      ],
    },
  ],
};

/** The word bank printed above the fruit pictures. */
export const FRUIT_BANK = [
  "Apple", "Watermelon", "Pineapple", "Banana", "Orange", "Grapes",
  "Peach", "Mango", "Pear", "Melon", "Guava", "Strawberry",
];

const fruit = (n: number, image: string, answer: string, choices: string[]): Question => ({
  id: `f-${n}`,
  prompt: "Which fruit is this?",
  image,
  answer,
  choices,
  hint: `It starts with "${answer[0]}" and has ${answer.length} letters.`,
});

const animal = (n: number, image: string, answer: string, choices: string[], accept?: string[]): Question => ({
  id: `a-${n}`,
  prompt: "Which animal is this?",
  image,
  answer,
  accept,
  choices,
  hint: `It starts with "${answer[0]}" and has ${answer.length} letters.`,
});

export const EVS_WORKSHEET: Worksheet = {
  id: "eps-2026-10-09-evs",
  title: "E.V.S worksheet — 09/10/2026",
  subject: "EVS",
  date: "09/10/2026",
  lang: "en",
  builtIn: true,
  parts: [
    {
      id: "fruits",
      instruction: "1) Write fruit name.",
      helper: `Word bank: ${FRUIT_BANK.join(", ")}`,
      questions: [
        fruit(1, "🍍", "Pineapple", ["Banana", "Mango", "Grapes"]),
        fruit(2, "🍓", "Strawberry", ["Apple", "Peach", "Orange"]),
        fruit(3, "🍌", "Banana", ["Mango", "Pear", "Guava"]),
        fruit(4, "🍉", "Watermelon", ["Melon", "Orange", "Apple"]),
        fruit(5, "🥭", "Mango", ["Pear", "Guava", "Banana"]),
        fruit(6, "🍑", "Peach", ["Orange", "Apple", "Guava"]),
        fruit(7, "🍎", "Apple", ["Peach", "Strawberry", "Orange"]),
        fruit(8, "🍐", "Pear", ["Guava", "Mango", "Apple"]),
        fruit(9, "🍇", "Grapes", ["Strawberry", "Melon", "Pineapple"]),
      ],
    },
    {
      id: "animals",
      instruction: "2) Write Animals name.",
      helper: "Look at the picture and name the animal",
      questions: [
        animal(1, "🦁", "Lion", ["Tiger", "Cat", "Bear"]),
        animal(2, "🐯", "Tiger", ["Lion", "Cat", "Zebra"]),
        animal(3, "🐄", "Cow", ["Sheep", "Pig", "Deer"]),
        animal(4, "🦌", "Deer", ["Giraffe", "Cow", "Zebra"]),
        animal(5, "🐷", "Pig", ["Cow", "Sheep", "Bear"]),
        animal(6, "🐻", "Bear", ["Lion", "Monkey", "Pig"]),
        animal(7, "🐵", "Monkey", ["Bear", "Cat", "Lion"]),
        animal(8, "🐱", "Cat", ["Tiger", "Lion", "Monkey"]),
        animal(9, "🦓", "Zebra", ["Deer", "Giraffe", "Tiger"]),
        animal(10, "🦒", "Giraffe", ["Zebra", "Deer", "Elephant"]),
        animal(11, "🐘", "Elephant", ["Giraffe", "Bear", "Cow"]),
        animal(12, "🐑", "Sheep", ["Cow", "Pig", "Deer"], ["Ram"]),
      ],
    },
  ],
};

export const BUILT_IN: Worksheet[] = [MARATHI_WORKSHEET, EVS_WORKSHEET];

export const SUBJECTS: { name: string; emoji: string; color: string }[] = [
  { name: "Marathi", emoji: "🌸", color: "#ff7a59" },
  { name: "EVS", emoji: "🌳", color: "#2fb67c" },
  { name: "English", emoji: "🔤", color: "#4f7cff" },
  { name: "Maths", emoji: "🔢", color: "#a25bff" },
  { name: "Hindi", emoji: "🪔", color: "#ffb020" },
  { name: "Drawing", emoji: "🎨", color: "#ff5fa2" },
];

export function subjectStyle(name: string) {
  return SUBJECTS.find((s) => s.name.toLowerCase() === name.toLowerCase()) ?? { name, emoji: "📘", color: "#2bb3c0" };
}
