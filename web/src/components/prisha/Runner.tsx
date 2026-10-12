"use client";

import { useMemo, useState } from "react";
import { isCorrect } from "@/lib/prisha/store";
import type { Mode, Question, Worksheet } from "@/lib/prisha/types";
import { CHEERS, GENTLE, Picture, SpeakButton, TopBar, pick, roundStars, shuffle } from "./ui";

type Item = { q: Question; instruction: string; helper?: string };

export type RoundResult = {
  total: number;
  correct: number;
  /** First-try result per question id. */
  results: Record<string, boolean>;
};

type Props = {
  worksheet: Worksheet;
  mode: Mode;
  /** Only these questions (practising mistakes). */
  onlyIds?: string[];
  onFinish: (r: RoundResult) => void;
  onExit: () => void;
  onPracticeIds: (ids: string[]) => void;
};

const INPUT_PREF = "prisha.input.v1";

export default function Runner({ worksheet, mode, onlyIds, onFinish, onExit, onPracticeIds }: Props) {
  const items: Item[] = useMemo(() => {
    const all = worksheet.parts.flatMap((p) =>
      p.questions.map((q) => ({ q, instruction: p.instruction, helper: p.helper })),
    );
    return onlyIds ? all.filter((i) => onlyIds.includes(i.q.id)) : all;
  }, [worksheet, onlyIds]);

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [given, setGiven] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"asking" | "right" | "wrong">("asking");
  const [message, setMessage] = useState("");
  const [typed, setTyped] = useState("");
  const [last, setLast] = useState("");
  const [finished, setFinished] = useState<RoundResult | null>(null);
  const [typing, setTyping] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INPUT_PREF) === "type";
    } catch {
      return false;
    }
  });

  const item = items[index];
  const q = item?.q;
  const hasChoices = !!q?.choices?.length;
  const useTyping = typing || !hasChoices;

  const options = useMemo(
    () => (q?.choices?.length ? shuffle([q.answer, ...q.choices.filter((c) => c !== q.answer)]) : []),
    // A fresh order for every question (and every new round).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, index],
  );

  const setTypingPref = (on: boolean) => {
    setTyping(on);
    try {
      localStorage.setItem(INPUT_PREF, on ? "type" : "choose");
    } catch {
      /* fine */
    }
  };

  if (!items.length) {
    return (
      <div className="ph-screen">
        <TopBar title={worksheet.title} onBack={onExit} />
        <p className="ph-empty">This worksheet has no questions yet.</p>
      </div>
    );
  }

  function finish(res: Record<string, boolean>) {
    const correct = Object.values(res).filter(Boolean).length;
    const r = { total: items.length, correct, results: res };
    setFinished(r);
    onFinish(r);
  }

  function next(res = results) {
    setTyped("");
    setStatus("asking");
    setMessage("");
    if (index + 1 >= items.length) finish(res);
    else setIndex(index + 1);
  }

  function answer(value: string) {
    if (!q || status === "right") return;
    if (!value.trim()) return;
    const ok = isCorrect(q, value);
    setLast(value);
    const first = !(q.id in results);
    const res = first ? { ...results, [q.id]: ok } : results;
    if (first) {
      setResults(res);
      setGiven({ ...given, [q.id]: value });
    }
    if (mode === "test") {
      next(res);
      return;
    }
    if (ok) {
      setStatus("right");
      setMessage(pick(CHEERS));
    } else {
      setStatus("wrong");
      setMessage(pick(GENTLE));
    }
  }

  if (finished) {
    const wrongIds = items.filter((i) => !finished.results[i.q.id]).map((i) => i.q.id);
    const stars = roundStars(finished.correct, finished.total);
    return (
      <div className="ph-screen">
        <TopBar title={worksheet.title} onBack={onExit} />
        <section className="ph-card ph-result" aria-live="polite">
          <div className="ph-result-stars" aria-label={`${stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= stars ? "ph-bigstar on" : "ph-bigstar"} style={{ animationDelay: `${n * 0.18}s` }}>
                ⭐
              </span>
            ))}
          </div>
          <h2 className="ph-result-title">
            {stars === 3 ? "Superstar, Prisha! 🏆" : stars === 2 ? "Great work, Prisha! 🎉" : "Good effort, Prisha! 🌱"}
          </h2>
          <p className="ph-result-score">
            {finished.correct} / {finished.total} right
          </p>
          <div className="ph-result-split">
            <span className="ph-pill ph-pill-good">✅ {finished.correct} correct</span>
            <span className="ph-pill ph-pill-soft">🌱 {finished.total - finished.correct} to practise</span>
          </div>

          {wrongIds.length > 0 && (
            <div className="ph-review">
              <h3>Let&apos;s learn these 💡</h3>
              <ul>
                {items
                  .filter((i) => wrongIds.includes(i.q.id))
                  .map((i) => (
                    <li key={i.q.id} lang={worksheet.lang}>
                      <Picture src={i.q.image} size="sm" />
                      <span className="ph-review-q">{i.q.sequence ? i.q.sequence.map((t) => (t === "_" ? "?" : t === "·" ? "○" : t)).join(" ") : i.q.prompt}</span>
                      {given[i.q.id] && <span className="ph-review-given">{given[i.q.id]}</span>}
                      <span className="ph-review-a">✔ {i.q.answer}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="ph-actions">
            {wrongIds.length > 0 && (
              <button type="button" className="ph-btn ph-btn-main" onClick={() => onPracticeIds(wrongIds)}>
                🔁 Practise these again
              </button>
            )}
            <button
              type="button"
              className="ph-btn"
              onClick={() => {
                setIndex(0);
                setResults({});
                setGiven({});
                setFinished(null);
                setStatus("asking");
                setTyped("");
              }}
            >
              ▶ Play again
            </button>
            <button type="button" className="ph-btn ph-btn-ghost" onClick={onExit}>
              🏠 Home
            </button>
          </div>
        </section>
      </div>
    );
  }

  const percent = Math.round((index / items.length) * 100);
  const isMarathi = worksheet.lang === "mr";

  return (
    <div className="ph-screen">
      <TopBar
        title={
          <>
            {worksheet.title}
            <span className={`ph-mode ph-mode-${mode}`}>{mode === "test" ? "📝 Test" : "🎯 Practice"}</span>
          </>
        }
        onBack={onExit}
      />

      <div className="ph-progressbar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index + 1}>
        <span style={{ width: `${Math.max(percent, 4)}%` }} />
      </div>
      <p className="ph-counter">
        Question {index + 1} of {items.length}
      </p>

      <section className="ph-card ph-question" key={q.id}>
        <div className="ph-instruction" lang={isMarathi ? "mr" : undefined}>
          <span>{item.instruction}</span>
          <SpeakButton text={item.instruction} lang={worksheet.lang} />
        </div>
        {item.helper && <p className="ph-helper">{item.helper}</p>}

        <Picture src={q.image} />

        {q.sequence && (
          <div className="ph-tiles" lang={worksheet.lang}>
            {q.sequence.map((t, i) => (
              <span
                key={i}
                className={t === "_" ? `ph-tile ph-tile-blank${status === "right" ? " filled" : ""}` : t === "·" ? "ph-tile ph-tile-dot" : "ph-tile"}
              >
                {t === "_" ? (status === "right" ? q.answer : "?") : t === "·" ? "" : t}
              </span>
            ))}
          </div>
        )}

        <p className="ph-prompt" lang={worksheet.lang}>
          {q.prompt}
        </p>

        {hasChoices && (
          <div className="ph-inputswitch" role="group" aria-label="How to answer">
            <button type="button" className={!typing ? "on" : ""} onClick={() => setTypingPref(false)}>
              👆 Choose
            </button>
            <button type="button" className={typing ? "on" : ""} onClick={() => setTypingPref(true)}>
              ✏️ Type
            </button>
          </div>
        )}

        {useTyping ? (
          <form
            className="ph-typeform"
            onSubmit={(e) => {
              e.preventDefault();
              answer(typed);
            }}
          >
            <input
              className="ph-typeinput"
              lang={worksheet.lang}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={isMarathi ? "इथे लिहा" : "Type here"}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={status === "right"}
              aria-label="Your answer"
            />
            <button type="submit" className="ph-btn ph-btn-main" disabled={status === "right" || !typed.trim()}>
              ✔ Check
            </button>
          </form>
        ) : (
          <div className="ph-choices" lang={worksheet.lang}>
            {options.map((o) => {
              const chosen = status !== "asking" && o === last;
              const showRight = status === "right" && o === q.answer;
              return (
                <button
                  key={o}
                  type="button"
                  className={`ph-choice${showRight ? " right" : ""}${status === "wrong" && chosen ? " soft" : ""}`}
                  onClick={() => answer(o)}
                  disabled={status === "right"}
                >
                  {o}
                </button>
              );
            })}
          </div>
        )}

        {status === "right" && (
          <div className="ph-feedback ph-feedback-good" role="status">
            <span className="ph-tick">✔</span>
            <span className="ph-feedback-msg">{message}</span>
            <span className="ph-starpop" aria-hidden="true">
              ⭐
            </span>
          </div>
        )}
        {status === "wrong" && (
          <div className="ph-feedback ph-feedback-soft" role="status">
            <p className="ph-feedback-msg">{message}</p>
            {q.hint && <p className="ph-hint">💡 {q.hint}</p>}
            <p className="ph-correct" lang={worksheet.lang}>
              The answer is <strong>{q.answer}</strong>
            </p>
          </div>
        )}

        <div className="ph-actions">
          {status === "wrong" && (
            <button
              type="button"
              className="ph-btn"
              onClick={() => {
                setStatus("asking");
                setTyped("");
              }}
            >
              🔁 Try again
            </button>
          )}
          {(status !== "asking" || mode === "practice") && (
            <button type="button" className={status === "asking" ? "ph-btn ph-btn-ghost" : "ph-btn ph-btn-main"} onClick={() => next()}>
              {status === "asking" ? "Skip ➜" : index + 1 >= items.length ? "Finish 🏁" : "Next ➜"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
