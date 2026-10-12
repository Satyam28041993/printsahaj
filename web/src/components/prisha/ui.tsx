"use client";

import type { ReactNode } from "react";

/** Reads text aloud with the browser's own voice, if it has one. */
export function speak(text: string, lang: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[_?·]/g, " "));
    u.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.85;
    synth.speak(u);
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
