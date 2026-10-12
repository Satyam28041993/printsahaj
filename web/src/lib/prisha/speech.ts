/*
 * Spoken answers. The browser turns speech into text (Chrome / Edge / Android
 * Chrome; Safari on iPhone/iPad; not Firefox). Chrome does this on Google's
 * servers, so the audio leaves the device while the mic button is on.
 *
 * Recognition is never exact for a child's voice ("kamal" may come back as
 * कमल, कमळ or "Kamal"), so the heard text is matched to the closest of the
 * answers on screen. When nothing is clearly closest, the child is asked to
 * say it again — a mishearing never counts as a wrong answer.
 */

/* ---- Devanagari → rough Latin, so "कमल", "कमळ" and "kamal" compare equal. */

const CONS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n", च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", ळ: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h",
};
const VOWELS: Record<string, string> = {
  अ: "a", आ: "aa", इ: "i", ई: "ii", उ: "u", ऊ: "uu", ऋ: "ru", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};
const SIGNS: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ii", "ु": "u", "ू": "uu", "ृ": "ru", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ॅ": "e", "ॉ": "o",
};
const VIRAMA = "्";

export function toLatin(text: string): string {
  const s = text.normalize("NFC").replace(/़/g, ""); // drop nukta
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (CONS[ch]) {
      out += CONS[ch];
      if (next === VIRAMA) i++;
      else if (next && SIGNS[next]) {
        out += SIGNS[next];
        i++;
      } else out += "a"; // inherent vowel
    } else if (VOWELS[ch]) out += VOWELS[ch];
    else if (ch === "ं" || ch === "ँ") out += "n";
    else if (ch === "ः") out += "h";
    else out += ch;
  }
  return out.toLowerCase();
}

/** A forgiving spelling: Latin letters only, long vowels and doubles folded,
 * a word-final "a" dropped (कमळ → kamala → kamal). */
function loose(text: string): string {
  return toLatin(text)
    .replace(/[^a-z]/g, "")
    .replace(/ph/g, "f")
    .replace(/aa/g, "a")
    .replace(/ee|ii|ea/g, "i")
    .replace(/oo|uu/g, "u")
    .replace(/w/g, "v")
    .replace(/(.)\1+/g, "$1")
    .replace(/(?<=[^aeiou])a$/, "");
}

/** Exact form, for single letters where आ and अ must stay apart. */
const strict = (text: string) => text.normalize("NFC").replace(/[\s.,!?।'"-]/g, "").toLowerCase();

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

export type Candidate = { value: string; forms: string[] };

/**
 * Picks the candidate the child said, or null when unsure.
 * `heard` holds the recogniser's alternatives, best first.
 */
export function matchSpoken(heard: string[], candidates: Candidate[]): string | null {
  // 1) Exact hit: the whole phrase ("water melon"), then a single word of it
  //    ("it's a mango"), best alternative first.
  for (const h of heard) {
    for (const words of [[strict(h)], h.split(/\s+/).map(strict)]) {
      const hits = candidates.filter((c) => c.forms.some((f) => words.includes(strict(f))));
      if (hits.length === 1) return hits[0].value;
    }
  }
  // 2) Closest loose spelling, only when clearly closer than the runner-up.
  let best: { value: string; score: number } | null = null;
  let second = Infinity;
  for (const c of candidates) {
    let score = Infinity;
    for (const f of c.forms) {
      const target = loose(f);
      if (!target) continue;
      for (const h of heard) {
        for (const w of [h, ...h.split(/\s+/)]) {
          const got = loose(w);
          if (!got) continue;
          score = Math.min(score, distance(got, target) / Math.max(target.length, got.length));
        }
      }
    }
    if (!best || score < best.score) {
      if (best) second = Math.min(second, best.score);
      best = { value: c.value, score };
    } else second = Math.min(second, score);
  }
  if (!best || best.score > 0.34) return null;
  if (second - best.score < 0.15) return null;
  return best.value;
}

/* ---- The browser's recogniser ---- */

type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function recognizer(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = () => recognizer() !== null;

/** Listens once. Resolves with the alternatives heard (empty = nothing heard). */
export function listenOnce(lang: string, onStart?: (stop: () => void) => void): Promise<string[]> {
  const Ctor = recognizer();
  if (!Ctor) return Promise.reject(new Error("unsupported"));
  return new Promise((resolve, reject) => {
    const r = new Ctor();
    r.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    let heard: string[] = [];
    r.onresult = (e) => {
      const res = e.results[0];
      heard = Array.from({ length: res.length }, (_, i) => res[i].transcript.trim()).filter(Boolean);
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") resolve([]);
      else reject(new Error(e.error));
    };
    r.onend = () => resolve(heard);
    r.start();
    onStart?.(() => r.abort());
  });
}
