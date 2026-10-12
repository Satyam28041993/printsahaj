import type { Attempt, Progress, Question, Worksheet } from "./types";

/*
 * Everything lives in this browser's localStorage: custom worksheets and
 * progress. Nothing is uploaded. Clearing browser data (or a private window)
 * loses it — hence the backup download on the parent page.
 */

const WS_KEY = "prisha.worksheets.v1";
const PROGRESS_KEY = "prisha.progress.v1";
const PHOTO_KEY = "prisha.photo.v1";

/** Case, extra spaces and Unicode form never make an answer wrong. */
export function normalize(s: string): string {
  return s.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function isCorrect(q: Question, given: string): boolean {
  const g = normalize(given);
  if (!g) return false;
  return [q.answer, ...(q.accept ?? [])].some((a) => normalize(a) === g);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the browser refused (storage full or blocked). */
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadCustom(): Worksheet[] {
  const list = read<Worksheet[]>(WS_KEY, []);
  return Array.isArray(list) ? list.filter(isWorksheet) : [];
}

export function saveCustom(list: Worksheet[]): boolean {
  return write(WS_KEY, list);
}

/** Prisha's photo for the home screen: a small JPEG data URL, this browser only. */
export function loadPhoto(): string {
  const p = read<string>(PHOTO_KEY, "");
  return typeof p === "string" && p.startsWith("data:image/") ? p : "";
}

export function savePhoto(dataUrl: string): boolean {
  if (!dataUrl) {
    try {
      localStorage.removeItem(PHOTO_KEY);
    } catch {
      /* fine */
    }
    return true;
  }
  return write(PHOTO_KEY, dataUrl);
}

export const emptyProgress = (): Progress => ({ attempts: [], stats: {}, stars: 0 });

export function loadProgress(): Progress {
  const p = read<Progress>(PROGRESS_KEY, emptyProgress());
  return {
    attempts: Array.isArray(p.attempts) ? p.attempts : [],
    stats: p.stats && typeof p.stats === "object" ? p.stats : {},
    stars: typeof p.stars === "number" ? p.stars : 0,
  };
}

export function saveProgress(p: Progress): boolean {
  return write(PROGRESS_KEY, p);
}

/** Records one finished round; first-try results only. */
export function recordAttempt(p: Progress, a: Attempt, results: Record<string, boolean>): Progress {
  const stats = { ...p.stats };
  for (const [qid, ok] of Object.entries(results)) {
    const key = `${a.worksheetId}/${qid}`;
    const s = stats[key] ?? { right: 0, wrong: 0 };
    stats[key] = ok ? { ...s, right: s.right + 1 } : { ...s, wrong: s.wrong + 1 };
  }
  return {
    attempts: [a, ...p.attempts].slice(0, 200),
    stats,
    stars: p.stars + a.correct,
  };
}

export function isWorksheet(x: unknown): x is Worksheet {
  const w = x as Worksheet;
  return (
    !!w &&
    typeof w.id === "string" &&
    typeof w.title === "string" &&
    typeof w.subject === "string" &&
    Array.isArray(w.parts) &&
    w.parts.every(
      (p) =>
        p &&
        typeof p.instruction === "string" &&
        Array.isArray(p.questions) &&
        p.questions.every((q) => q && typeof q.id === "string" && typeof q.prompt === "string" && typeof q.answer === "string"),
    )
  );
}

export type Backup = {
  app: "prisha-learning-hub";
  version: 1;
  exportedAt: string;
  worksheets: Worksheet[];
  progress: Progress;
  photo?: string;
};

export function makeBackup(worksheets: Worksheet[], progress: Progress, photo?: string): Backup {
  return { app: "prisha-learning-hub", version: 1, exportedAt: new Date().toISOString(), worksheets, progress, ...(photo ? { photo } : {}) };
}

/** Parses a backup file; throws a readable message when it is not one. */
export function parseBackup(text: string): Backup {
  let data: Backup;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not a Learning Hub backup.");
  }
  if (!data || data.app !== "prisha-learning-hub" || !Array.isArray(data.worksheets)) {
    throw new Error("This file is not a Learning Hub backup.");
  }
  const photo = typeof data.photo === "string" && data.photo.startsWith("data:image/") ? data.photo : undefined;
  return { ...data, photo, worksheets: data.worksheets.filter(isWorksheet).map((w) => ({ ...w, builtIn: false })) };
}

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
