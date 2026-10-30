"use client";

import { useMemo, useState } from "react";
import type { Worksheet } from "@/lib/prisha/types";
import { Avatar, CornerPhoto, Picture, TopBar, speak } from "./ui";

/*
 * 📖 Learn: flashcards before practice. Picture, the word, its letters, and
 * buttons that say the word and spell it. Nothing is scored.
 */

type Props = {
  worksheet: Worksheet;
  photo?: string;
  onlyIds?: string[];
  onExit: () => void;
  onPractise: (ids: string[]) => void;
};

/** Letters of a word: A-Z one by one, Devanagari by syllable (क + म + ळ). */
function lettersOf(word: string): string[] {
  if (/^[A-Za-z]+$/.test(word)) return word.split("");
  return Array.from(word.matchAll(/.[ा-्ंः]*/gu), (m) => m[0]).filter((x) => x.trim());
}

/** The word a card teaches (see the spelling case below). */
function cardWord(q: { answer: string; sequence?: string[] }): string {
  const filled = q.sequence?.map((t) => (t === "_" ? q.answer : t)).filter((t) => t !== "·");
  return filled && filled.every((t) => /^[A-Za-z]$/.test(t)) ? filled.join("") : q.answer;
}

export default function Learn({ worksheet, photo, onlyIds, onExit, onPractise }: Props) {
  const cards = useMemo(() => {
    const all = worksheet.parts.flatMap((p) => p.questions.map((q) => ({ q, part: p.helper ?? p.instruction })));
    return onlyIds ? all.filter((c) => onlyIds.includes(c.q.id)) : all;
  }, [worksheet, onlyIds]);
  const [i, setI] = useState(0);
  const card = cards[i];

  if (!card) {
    return (
      <div className="ph-screen">
        <TopBar title={worksheet.title} onBack={onExit} />
        <p className="ph-empty">Nothing to learn here yet.</p>
      </div>
    );
  }

  const { q } = card;
  // A picture with a short answer (a word, a letter or a number) makes a card;
  // the filled-in sequence shows the rest (क ख ग घ).
  const filled = q.sequence?.map((t) => (t === "_" ? q.answer : t === "·" ? "" : t)).filter(Boolean);
  // "M a _ g o" spelling cards teach the whole word, not just the missing letter.
  const spelt = filled && filled.every((t) => /^[A-Za-z]$/.test(t)) ? filled.join("") : null;
  const word = spelt ?? q.answer;
  const letters = lettersOf(word);
  const isEn = worksheet.lang === "en";
  const sayWord = () => speak(word, worksheet.lang);
  const spell = () => speak(isEn ? `${letters.map((l) => l.toUpperCase()).join(", ")}. ${word}` : `${letters.join(", ")}. ${word}`, worksheet.lang);
  const go = (n: number) => {
    const next = Math.min(Math.max(n, 0), cards.length - 1);
    setI(next);
    if (next !== i) speak(cardWord(cards[next].q), worksheet.lang);
  };

  return (
    <div className="ph-screen">
      <TopBar
        title={
          <>
            {worksheet.title}
            <span className="ph-mode ph-mode-learn">📖 Learn</span>
          </>
        }
        onBack={onExit}
        right={<Avatar photo={photo} size="xs" />}
      />
      <CornerPhoto photo={photo} />
      <div className="ph-progressbar" role="progressbar" aria-valuemin={1} aria-valuemax={cards.length} aria-valuenow={i + 1}>
        <span style={{ width: `${Math.max(((i + 1) / cards.length) * 100, 4)}%` }} />
      </div>
      <p className="ph-counter">
        Card {i + 1} of {cards.length} · {card.part}
      </p>

      <section className="ph-card ph-learn" key={q.id}>
        <Picture src={q.image} />
        {filled && filled.length > 1 && !spelt && (
          <div className="ph-tiles" lang={worksheet.lang}>
            {filled.map((t, k) => (
              <span key={k} className={t === q.answer ? "ph-tile ph-tile-blank filled" : "ph-tile"}>
                {t}
              </span>
            ))}
          </div>
        )}
        <button type="button" className="ph-learn-word" lang={worksheet.lang} onClick={sayWord} aria-label={`Say ${word}`}>
          {word} <span aria-hidden="true">🔊</span>
        </button>
        {letters.length > 1 && (
          <div className="ph-learn-letters" lang={worksheet.lang} aria-label="Letters">
            {letters.map((l, k) => (
              <span key={k} className="ph-learn-letter" style={{ animationDelay: `${k * 0.08}s` }}>
                {isEn ? l.toUpperCase() : l}
              </span>
            ))}
          </div>
        )}
        <div className="ph-actions">
          <button type="button" className="ph-btn" onClick={sayWord}>
            🔊 Say it
          </button>
          {letters.length > 1 && (
            <button type="button" className="ph-btn" onClick={spell}>
              🔤 Spell it
            </button>
          )}
        </div>
        <div className="ph-actions">
          <button type="button" className="ph-btn ph-btn-ghost" onClick={() => go(i - 1)} disabled={i === 0}>
            ◀ Back
          </button>
          {i + 1 < cards.length ? (
            <button type="button" className="ph-btn ph-btn-main" onClick={() => go(i + 1)}>
              Next ▶
            </button>
          ) : (
            <button type="button" className="ph-btn ph-btn-main" onClick={() => onPractise(cards.map((c) => c.q.id))}>
              🎯 Now practise!
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
