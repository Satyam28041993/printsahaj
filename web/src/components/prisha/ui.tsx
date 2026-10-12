"use client";

import type { ReactNode } from "react";

/*
 * Many computers have no Marathi voice (Windows almost never does), and the
 * browser then stays silent. So the voice is picked by hand: Marathi if
 * installed, else Hindi (reads Devanagari fine: कमळ ≈ "kamal"), else any
 * Indian voice; English prefers an Indian, then any English voice.
 */
const VOICE_ORDER: Record<string, string[]> = {
  mr: ["mr-IN", "mr", "hi-IN", "hi", "en-IN"],
  hi: ["hi-IN", "hi", "mr-IN", "mr", "en-IN"],
  en: ["en-IN", "en-GB", "en-US", "en"],
};

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const order = VOICE_ORDER[lang] ?? VOICE_ORDER.en;
  for (const want of order) {
    const matches = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(want.toLowerCase()));
    // Google's online voices sound clearer than the built-in ones.
    const best = matches.find((v) => /google/i.test(v.name)) ?? matches[0];
    if (best) return best;
  }
  return voices.find((v) => v.default) ?? voices[0];
}

/** Reads text aloud with the browser's own voice, if it has one. */
export function speak(text: string, lang: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const say = () => {
      const u = new SpeechSynthesisUtterance(text.replace(/[_?·]/g, " "));
      const voice = pickVoice(synth.getVoices(), lang);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      }
      u.rate = 0.85;
      synth.speak(u);
    };
    synth.cancel();
    // The voice list loads late on first use; wait for it once.
    if (synth.getVoices().length) setTimeout(say, 60);
    else {
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        say();
      };
      synth.addEventListener("voiceschanged", go, { once: true });
      setTimeout(go, 700);
    }
  } catch {
    /* no voice: the button simply does nothing */
  }
}

export function SpeakButton({ text, lang, label = "Listen" }: { text: string; lang: string; label?: string }) {
  return (
    <button type="button" className="ph-speak" onClick={() => speak(text, lang)} aria-label={label} title={label}>
      🔊
    </button>
  );
}

/** A picture: emoji text, or an uploaded image (data: URL). */
export function Picture({ src, size = "lg" }: { src?: string; size?: "lg" | "sm" }) {
  if (!src) return null;
  if (src.startsWith("data:image/")) {
    // eslint-disable-next-line @next/next/no-img-element -- local data URL, nothing to optimise
    return <img src={src} alt="" className={`ph-pic ph-pic-img ph-pic-${size}`} />;
  }
  return (
    <span className={`ph-pic ph-pic-${size}`} aria-hidden="true">
      {src}
    </span>
  );
}

export function TopBar({ title, onBack, right }: { title: ReactNode; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="ph-topbar">
      {onBack ? (
        <button type="button" className="ph-back" onClick={onBack} aria-label="Back">
          ⬅
        </button>
      ) : (
        <span className="ph-back-spacer" />
      )}
      <h1 className="ph-topbar-title">{title}</h1>
      <div className="ph-topbar-right">{right}</div>
    </header>
  );
}

/** Prisha in a rainbow circle with a book — or a smiling placeholder before a photo is added. */
export function Avatar({ photo, size = "lg" }: { photo?: string; size?: "lg" | "sm" | "xs" }) {
  return (
    <span className={`ph-avatar ph-avatar-${size}`}>
      <span className="ph-avatar-ring">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL from this browser
          <img src={photo} alt="Prisha" className="ph-avatar-img" />
        ) : (
          <span className="ph-avatar-blank" aria-hidden="true">
            👧
          </span>
        )}
      </span>
      <span className="ph-avatar-book" aria-hidden="true">
        📖
      </span>
      {size === "lg" && (
        <>
          <span className="ph-avatar-spark s1" aria-hidden="true">✨</span>
          <span className="ph-avatar-spark s2" aria-hidden="true">⭐</span>
        </>
      )}
    </span>
  );
}

/** On wide screens: Prisha's photo sits in the pink circle of the background
 * (top right). Narrow screens show the small one in the top bar instead. */
export function CornerPhoto({ photo }: { photo?: string }) {
  return (
    <div className="ph-corner-photo" aria-hidden="true">
      <Avatar photo={photo} />
    </div>
  );
}

export function StarCount({ n }: { n: number }) {
  return (
    <span className="ph-starcount" aria-label={`${n} stars`}>
      ⭐ {n}
    </span>
  );
}

/** 1–3 stars for a round; nobody gets zero. */
export function roundStars(correct: number, total: number) {
  if (!total) return 1;
  const r = correct / total;
  return r >= 0.9 ? 3 : r >= 0.6 ? 2 : 1;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const CHEERS = ["Shabaash! 🎉", "Super, Prisha! 🌟", "Well done! 👏", "You got it! 💪", "Wonderful! 🌈", "Khup chhan! 🌸"];
export const GENTLE = [
  "Almost! Let's look together 🤗",
  "Good try! Here's a little help 💡",
  "Nice effort! Let's learn this one 🌱",
];
export const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
