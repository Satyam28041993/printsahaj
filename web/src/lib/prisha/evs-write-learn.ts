import { COLOURS, TEACHER_ANIMALS, TEACHER_COLOURS, TEACHER_FRUITS, others, type Item } from "./teacher-lists";
import type { Question, Worksheet } from "./types";

/*
 * The teacher's "write and learn" sheets of 30/10/2026 (EVS, Sr. KG-A) as
 * practice: name it, then spell it, then colours. Use 📖 Learn first.
 */

const spelledOut = (w: string) => w.toUpperCase().split("").join(" - ");

function nameIt(prefix: string, list: Item[], firstLetter: boolean): Question[] {
  return list.map((it, i) => ({
    id: `${prefix}-${i + 1}`,
    prompt: firstLetter ? `${it.name[0]} _ _ _ …  What is this?` : "What is this?",
    image: it.picture,
    answer: it.name,
    choices: others(list, i),
    hint: `${it.name}: ${spelledOut(it.name)}`,
  }));
}

/** One missing letter in the middle of the word, e.g. Ma_go. */
function spellIt(prefix: string, list: Item[]): Question[] {
  const pool = ["a", "e", "i", "o", "u", "r", "n", "t", "p", "g"];
  return list.map((it, i) => {
    const letters = it.name.split("");
    const at = Math.max(1, Math.floor(letters.length / 2));
    const answer = letters[at].toLowerCase();
    const wrong = pool.filter((l) => l !== answer).slice(i % 5, (i % 5) + 2);
    return {
      id: `${prefix}-${i + 1}`,
      prompt: "Which letter is missing?",
      image: it.picture,
      sequence: letters.map((l, k) => (k === at ? "_" : l)),
      answer,
      choices: wrong,
      hint: `${it.name}: ${spelledOut(it.name)}`,
    };
  });
}

export const EVS_WRITE_LEARN: Worksheet = {
  id: "eps-2026-10-30-evs",
  title: "EVS — Write and learn (30/10/2026)",
  subject: "EVS",
  date: "30/10/2026",
  lang: "en",
  builtIn: true,
  parts: [
    {
      id: "fruits",
      instruction: "Write and learn fruit's name",
      helper: "Fruit names (first letter given)",
      questions: nameIt("wf", TEACHER_FRUITS, true),
    },
    {
      id: "animals",
      instruction: "Write and learn animals name",
      helper: "Animal names",
      questions: nameIt("wa", TEACHER_ANIMALS, false),
    },
    {
      id: "spell-fruits",
      instruction: "Spell the fruit's name",
      helper: "Fruit spelling: find the missing letter",
      questions: spellIt("sf", TEACHER_FRUITS),
    },
    {
      id: "spell-animals",
      instruction: "Spell the animal's name",
      helper: "Animal spelling: find the missing letter",
      questions: spellIt("sa", TEACHER_ANIMALS),
    },
    {
      id: "match-colours",
      instruction: "Match the colours with the correct name",
      helper: "Colours: Brown, Green, Blue, Yellow, Red",
      questions: TEACHER_COLOURS.map((it, i) => ({
        id: `mc-${i + 1}`,
        prompt: "Which colour is this?",
        image: it.picture,
        answer: it.name,
        choices: others(TEACHER_COLOURS, i, 3),
        hint: `${it.name}: ${spelledOut(it.name)}`,
      })),
    },
    {
      id: "colours",
      instruction: "Write and learn colour name",
      helper: "Colour names",
      questions: nameIt("wc", COLOURS, false).map((q) => ({ ...q, prompt: "Which colour is this?" })),
    },
  ],
};
