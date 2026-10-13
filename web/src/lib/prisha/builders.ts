import type { Question } from "./types";

/** One question per blank. The tile row shows the printed letters only, so
 * the child sees the sheet as it is, with the current blank marked. */
export function blanks(
  prefix: string,
  letters: string[],
  printed: Set<number>,
  rowLength: number,
  lang: "mr" | "hi" = "mr",
): Question[] {
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
      prompt: lang === "hi" ? "कौन सा अक्षर आएगा?" : "कोणते अक्षर येईल?",
      sequence: row,
      answer: letter,
      choices: near.slice(0, 3),
      hint:
        i > 0
          ? lang === "hi"
            ? `${letters[i - 1]} के बाद आने वाला अक्षर (comes after ${letters[i - 1]})`
            : `${letters[i - 1]} नंतर येणारे अक्षर (comes after ${letters[i - 1]})`
          : undefined,
    });
  });
  return out;
}

export const word = (id: string, parts: string[], answer: string, choices: string[]): Question => ({
  id,
  prompt: `${parts.join(" + ")} = ?`,
  answer,
  choices,
  hint: `अक्षरे क्रमाने जोडा: ${parts.join(" → ")} (join them in order)`,
});
