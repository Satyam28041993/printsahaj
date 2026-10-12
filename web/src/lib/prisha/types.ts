/** Data shapes for Prisha's Learning Hub. Everything is stored in this
 * browser only (localStorage); nothing is sent anywhere. */

export type Question = {
  id: string;
  /** What is asked, e.g. "क + म + ळ = ?" or "Which fruit is this?". */
  prompt: string;
  /** An emoji ("🍎") or a small image (data: URL from the parent's upload). */
  image?: string;
  /** A row of tiles with one "_" blank, e.g. ["क", "ख", "_", "घ"]. */
  sequence?: string[];
  /** The correct answer, shown after a wrong try. */
  answer: string;
  /** Other answers that also count as right (e.g. "ram" for sheep). */
  accept?: string[];
  /** Wrong choices shown next to the answer. Empty = typing only. */
  choices?: string[];
  hint?: string;
};

export type Part = {
  id: string;
  /** The instruction, as printed on the worksheet. */
  instruction: string;
  /** English help line for the parent / child, optional. */
  helper?: string;
  questions: Question[];
};

export type Worksheet = {
  id: string;
  title: string;
  subject: string;
  /** Date printed on the school sheet, optional (free text). */
  date?: string;
  /** Language of the answers: "mr" Marathi, "en" English, … (for fonts/speech). */
  lang: string;
  /** Built-in sheets ship with the app; they can be copied, not edited. */
  builtIn?: boolean;
  parts: Part[];
  updatedAt?: number;
};

export type Mode = "practice" | "test";

export type Attempt = {
  at: number;
  worksheetId: string;
  title: string;
  subject: string;
  mode: Mode;
  total: number;
  correct: number;
  /** Question ids answered wrong on the first try. */
  wrong: string[];
};

export type Progress = {
  attempts: Attempt[];
  /** Per question ("<worksheet>/<question>") counts of first-try results. */
  stats: Record<string, { right: number; wrong: number }>;
  stars: number;
};
