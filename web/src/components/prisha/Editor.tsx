"use client";

import { useState } from "react";
import { newId } from "@/lib/prisha/store";
import type { Part, Question, Worksheet } from "@/lib/prisha/types";
import { SUBJECTS } from "@/lib/prisha/worksheets";
import { Picture, TopBar } from "./ui";

/*
 * The parent's form for a worksheet. Lists are typed as comma-separated text
 * ("Mango, Pear") so no one has to learn a data format.
 */

type QDraft = {
  id: string;
  prompt: string;
  image: string;
  sequence: string;
  answer: string;
  accept: string;
  choices: string;
  hint: string;
};
type PDraft = { id: string; instruction: string; helper: string; questions: QDraft[] };

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const toQDraft = (q: Question): QDraft => ({
  id: q.id,
  prompt: q.prompt,
  image: q.image ?? "",
  sequence: q.sequence?.join(", ") ?? "",
  answer: q.answer,
  accept: q.accept?.join(", ") ?? "",
  choices: q.choices?.join(", ") ?? "",
  hint: q.hint ?? "",
});

const blankQ = (): QDraft => ({ id: newId("q"), prompt: "", image: "", sequence: "", answer: "", accept: "", choices: "", hint: "" });
const blankPart = (): PDraft => ({ id: newId("p"), instruction: "", helper: "", questions: [blankQ()] });

/** Shrinks a photo (default 320px) so many fit in the browser's storage. */
export function resizeImage(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the picture."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("This file is not a picture."));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not read the picture."));
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** A square close-up for the round photo: from a portrait the face sits in
 * the upper middle, so take a square starting a little below the top. */
export function cropPortrait(file: File, size = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file is not a picture."));
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const portrait = img.height > img.width;
      const side = portrait ? Math.min(img.width, img.height * 0.62) : Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = portrait ? Math.min(img.height * 0.1, img.height - side) : (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not read the picture."));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = url;
  });
}

type Props = {
  initial?: Worksheet;
  knownSubjects: string[];
  onSave: (w: Worksheet) => boolean;
  onCancel: () => void;
};

export default function Editor({ initial, knownSubjects, onSave, onCancel }: Props) {
  const subjects = Array.from(new Set([...SUBJECTS.map((s) => s.name), ...knownSubjects, ...(initial ? [initial.subject] : [])]));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "Marathi");
  const [otherSubject, setOtherSubject] = useState("");
  const [lang, setLang] = useState(initial?.lang ?? "en");
  const [date, setDate] = useState(initial?.date ?? "");
  const [parts, setParts] = useState<PDraft[]>(
    initial
      ? initial.parts.map((p) => ({ id: p.id, instruction: p.instruction, helper: p.helper ?? "", questions: p.questions.map(toQDraft) }))
      : [blankPart()],
  );
  const [errors, setErrors] = useState<string[]>([]);

  const setPart = (pi: number, patch: Partial<PDraft>) => setParts(parts.map((p, i) => (i === pi ? { ...p, ...patch } : p)));
  const setQ = (pi: number, qi: number, patch: Partial<QDraft>) =>
    setPart(pi, { questions: parts[pi].questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) });

  function save() {
    const errs: string[] = [];
    const subj = subject === "__other" ? otherSubject.trim() : subject;
    if (!title.trim()) errs.push("Give the worksheet a title.");
    if (!subj) errs.push("Choose or type a subject.");
    const built: Part[] = [];
    parts.forEach((p, pi) => {
      const qs: Question[] = [];
      p.questions.forEach((q, qi) => {
        const empty = !q.prompt.trim() && !q.answer.trim() && !q.image && !q.sequence.trim();
        if (empty) return;
        if (!q.answer.trim()) errs.push(`Part ${pi + 1}, question ${qi + 1}: type the correct answer.`);
        const seq = splitList(q.sequence);
        if (seq.length && !seq.includes("_")) errs.push(`Part ${pi + 1}, question ${qi + 1}: the letter row needs one _ for the blank.`);
        qs.push({
          id: q.id,
          prompt: q.prompt.trim() || "?",
          image: q.image || undefined,
          sequence: seq.length ? seq : undefined,
          answer: q.answer.trim(),
          accept: splitList(q.accept),
          choices: splitList(q.choices).filter((c) => c !== q.answer.trim()),
          hint: q.hint.trim() || undefined,
        });
      });
      if (qs.length) built.push({ id: p.id, instruction: p.instruction.trim() || `Part ${pi + 1}`, helper: p.helper.trim() || undefined, questions: qs });
    });
    if (!built.length) errs.push("Add at least one question.");
    setErrors(errs);
    if (errs.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const ok = onSave({
      id: initial && !initial.builtIn ? initial.id : newId("ws"),
      title: title.trim(),
      subject: subj,
      lang,
      date: date.trim() || undefined,
      parts: built,
      updatedAt: Date.now(),
    });
    if (!ok) setErrors(["The browser's storage is full. Remove some pictures or old worksheets, then save again."]);
  }

  return (
    <div className="ph-screen ph-editor">
      <TopBar title={initial && !initial.builtIn ? "Edit worksheet" : "Add new worksheet"} onBack={onCancel} />

      {errors.length > 0 && (
        <div className="ph-card ph-errors" role="alert">
          {errors.map((e) => (
            <p key={e}>⚠ {e}</p>
          ))}
        </div>
      )}

      <section className="ph-card ph-form">
        <label className="ph-field">
          <span>Worksheet title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Marathi worksheet — 16/10/2026" />
        </label>
        <div className="ph-field-row">
          <label className="ph-field">
            <span>Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__other">New subject…</option>
            </select>
          </label>
          {subject === "__other" && (
            <label className="ph-field">
              <span>New subject name</span>
              <input value={otherSubject} onChange={(e) => setOtherSubject(e.target.value)} placeholder="e.g. Rhymes" />
            </label>
          )}
          <label className="ph-field">
            <span>Answers are in</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="mr">Marathi (मराठी)</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </label>
          <label className="ph-field">
            <span>Date (optional)</span>
            <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="16/10/2026" />
          </label>
        </div>
      </section>

      {parts.map((p, pi) => (
        <section className="ph-card ph-form ph-part" key={p.id}>
          <div className="ph-part-head">
            <h2>Part {pi + 1}</h2>
            {parts.length > 1 && (
              <button
                type="button"
                className="ph-btn ph-btn-ghost ph-btn-sm"
                onClick={() => confirm("Remove this part and its questions?") && setParts(parts.filter((_, i) => i !== pi))}
              >
                🗑 Remove part
              </button>
            )}
          </div>
          <label className="ph-field">
            <span>Instruction (as printed on the sheet)</span>
            <input value={p.instruction} onChange={(e) => setPart(pi, { instruction: e.target.value })} placeholder="e.g. 1) Write fruit name." />
          </label>
          <label className="ph-field">
            <span>Help line (optional)</span>
            <input value={p.helper} onChange={(e) => setPart(pi, { helper: e.target.value })} placeholder="e.g. Word bank: Apple, Mango, Pear" />
          </label>

          {p.questions.map((q, qi) => (
            <div className="ph-qedit" key={q.id}>
              <div className="ph-part-head">
                <h3>Question {qi + 1}</h3>
                <button
                  type="button"
                  className="ph-btn ph-btn-ghost ph-btn-sm"
                  onClick={() => setPart(pi, { questions: p.questions.filter((_, i) => i !== qi) })}
                  aria-label={`Delete question ${qi + 1}`}
                >
                  🗑
                </button>
              </div>
              <label className="ph-field">
                <span>Question</span>
                <input value={q.prompt} onChange={(e) => setQ(pi, qi, { prompt: e.target.value })} placeholder="e.g. Which fruit is this?  or  क + म + ळ = ?" />
              </label>
              <div className="ph-field-row">
                <label className="ph-field">
                  <span>Correct answer</span>
                  <input value={q.answer} onChange={(e) => setQ(pi, qi, { answer: e.target.value })} placeholder="e.g. Mango" />
                </label>
                <label className="ph-field">
                  <span>Wrong choices (comma between)</span>
                  <input value={q.choices} onChange={(e) => setQ(pi, qi, { choices: e.target.value })} placeholder="e.g. Pear, Apple, Guava" />
                </label>
              </div>
              <div className="ph-picrow">
                <span className="ph-field-label">Picture</span>
                {q.image && <Picture src={q.image} size="sm" />}
                <input
                  className="ph-emoji-input"
                  value={q.image.startsWith("data:") ? "" : q.image}
                  onChange={(e) => setQ(pi, qi, { image: e.target.value })}
                  placeholder="emoji 🍎"
                  aria-label="Picture as an emoji"
                />
                <label className="ph-btn ph-btn-sm">
                  📷 Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      try {
                        setQ(pi, qi, { image: await resizeImage(f) });
                      } catch (err) {
                        alert((err as Error).message);
                      }
                    }}
                  />
                </label>
                {q.image && (
                  <button type="button" className="ph-btn ph-btn-ghost ph-btn-sm" onClick={() => setQ(pi, qi, { image: "" })}>
                    Remove
                  </button>
                )}
              </div>
              <details className="ph-more">
                <summary>More (hint, other answers, letter row)</summary>
                <label className="ph-field">
                  <span>Hint (shown after a wrong try)</span>
                  <input value={q.hint} onChange={(e) => setQ(pi, qi, { hint: e.target.value })} placeholder="e.g. It is yellow and sweet" />
                </label>
                <label className="ph-field">
                  <span>Other answers that are also right (comma between)</span>
                  <input value={q.accept} onChange={(e) => setQ(pi, qi, { accept: e.target.value })} placeholder="e.g. Ram" />
                </label>
                <label className="ph-field">
                  <span>Letter row with a blank _ (for &quot;fill the missing letter&quot;)</span>
                  <input value={q.sequence} onChange={(e) => setQ(pi, qi, { sequence: e.target.value })} placeholder="e.g. क, ख, _, घ" />
                </label>
              </details>
            </div>
          ))}

          <button type="button" className="ph-btn" onClick={() => setPart(pi, { questions: [...p.questions, blankQ()] })}>
            ➕ Add question
          </button>
        </section>
      ))}

      <div className="ph-actions ph-actions-sticky">
        <button type="button" className="ph-btn" onClick={() => setParts([...parts, blankPart()])}>
          ➕ Add part
        </button>
        <button type="button" className="ph-btn ph-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="ph-btn ph-btn-main" onClick={save}>
          💾 Save worksheet
        </button>
      </div>
    </div>
  );
}
