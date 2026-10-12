"use client";

import { useRef, useState } from "react";
import {
  emptyProgress,
  loadCustom,
  loadPhoto,
  loadProgress,
  makeBackup,
  parseBackup,
  recordAttempt,
  saveCustom,
  savePhoto,
  saveProgress,
} from "@/lib/prisha/store";
import type { Mode, Progress, Worksheet } from "@/lib/prisha/types";
import { BUILT_IN, SUBJECTS, subjectStyle } from "@/lib/prisha/worksheets";
import Editor, { cropPortrait } from "./Editor";
import Runner, { type RoundResult } from "./Runner";
import { Avatar, StarCount, TopBar } from "./ui";

type View =
  | { name: "home" }
  | { name: "pick"; mode: Mode; subject?: string }
  | { name: "run"; worksheetId: string; mode: Mode; onlyIds?: string[]; round: number }
  | { name: "progress" }
  | { name: "parent" }
  | { name: "edit"; worksheet?: Worksheet };

/** Rendered on the client only (see ClientOnly), so storage can be read up front. */
export default function PrishaApp() {
  const [custom, setCustom] = useState<Worksheet[]>(loadCustom);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [photo, setPhoto] = useState<string>(loadPhoto);
  const [view, setView] = useState<View>({ name: "home" });
  const [parentOk, setParentOk] = useState(false);
  const [notice, setNotice] = useState("");
  const roundRef = useRef(0);

  const all = [...BUILT_IN, ...custom];
  const byId = (id: string) => all.find((w) => w.id === id);
  const subjects = Array.from(new Set([...SUBJECTS.slice(0, 2).map((s) => s.name), ...all.map((w) => w.subject)]));

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };
  const run = (worksheetId: string, mode: Mode, onlyIds?: string[]) =>
    go({ name: "run", worksheetId, mode, onlyIds, round: ++roundRef.current });

  const updateCustom = (list: Worksheet[]) => {
    const ok = saveCustom(list);
    if (ok) setCustom(list);
    return ok;
  };

  function saveRound(ws: Worksheet, mode: Mode, onlyIds: string[] | undefined, r: RoundResult) {
    const allIds = ws.parts.flatMap((p) => p.questions.map((q) => q.id));
    const asked = onlyIds ? allIds.filter((id) => onlyIds.includes(id)) : allIds;
    const next = recordAttempt(
      progress,
      {
        at: new Date().getTime(),
        worksheetId: ws.id,
        title: onlyIds ? `${ws.title} (practice again)` : ws.title,
        subject: ws.subject,
        mode,
        total: r.total,
        correct: r.correct,
        // Wrong on the first try, or skipped.
        wrong: asked.filter((id) => !r.results[id]),
      },
      r.results,
    );
    setProgress(next);
    saveProgress(next);
  }

  if (view.name === "run") {
    const ws = byId(view.worksheetId);
    if (!ws) return renderHome();
    return (
      <Runner
        key={view.round}
        worksheet={ws}
        photo={photo}
        mode={view.mode}
        onlyIds={view.onlyIds}
        onExit={() => go({ name: "home" })}
        onPracticeIds={(ids) => run(ws.id, "practice", ids)}
        onFinish={(r) => saveRound(ws, view.mode, view.onlyIds, r)}
      />
    );
  }

  if (view.name === "pick") {
    const list = all.filter((w) => !view.subject || w.subject === view.subject);
    const style = view.subject ? subjectStyle(view.subject) : null;
    return (
      <div className="ph-screen">
        <TopBar
          title={style ? `${style.emoji} ${style.name}` : view.mode === "test" ? "📝 Take a test" : "🎯 Practice"}
          onBack={() => go({ name: "home" })}
        />
        {view.subject && (
          <div className="ph-modeswitch" role="group" aria-label="Mode">
            <button type="button" className={view.mode === "practice" ? "on" : ""} onClick={() => go({ ...view, mode: "practice" })}>
              🎯 Practice
            </button>
            <button type="button" className={view.mode === "test" ? "on" : ""} onClick={() => go({ ...view, mode: "test" })}>
              📝 Test
            </button>
          </div>
        )}
        <p className="ph-lead">{view.mode === "test" ? "Do your best! You'll see your score at the end." : "Take your time — you can try again and again."}</p>
        {list.length === 0 && <p className="ph-empty">No worksheets here yet. Ask Papa or Mumma to add one! 📄</p>}
        <div className="ph-wslist">
          {list.map((w) => {
            const s = subjectStyle(w.subject);
            const count = w.parts.reduce((n, p) => n + p.questions.length, 0);
            const last = progress.attempts.find((a) => a.worksheetId === w.id);
            return (
              <button key={w.id} type="button" className="ph-wscard" style={{ "--c": s.color } as React.CSSProperties} onClick={() => run(w.id, view.mode)}>
                <span className="ph-wscard-emoji">{s.emoji}</span>
                <span className="ph-wscard-body">
                  <span className="ph-wscard-title">{w.title}</span>
                  <span className="ph-wscard-meta">
                    {s.name} · {count} questions
                    {last ? ` · last: ${last.correct}/${last.total}` : ""}
                  </span>
                </span>
                <span className="ph-wscard-go">{view.mode === "test" ? "📝" : "▶"}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view.name === "progress") return renderProgress();

  if (view.name === "parent") {
    if (!parentOk) return <ParentGate onPass={() => setParentOk(true)} onBack={() => go({ name: "home" })} />;
    return renderParent();
  }

  if (view.name === "edit") {
    return (
      <Editor
        initial={view.worksheet}
        knownSubjects={all.map((w) => w.subject)}
        onCancel={() => go({ name: "parent" })}
        onSave={(w) => {
          const exists = custom.some((c) => c.id === w.id);
          const ok = updateCustom(exists ? custom.map((c) => (c.id === w.id ? w : c)) : [...custom, w]);
          if (ok) {
            setNotice(`Saved “${w.title}”.`);
            go({ name: "parent" });
          }
          return ok;
        }}
      />
    );
  }

  return renderHome();

  function renderHome() {
    return (
      <div className="ph-screen ph-home">
        <header className="ph-hero">
          <Avatar photo={photo} />
          <h1 className="ph-title">Prisha&apos;s Learning Hub</h1>
          <p className="ph-subtitle">Hello Prisha! What shall we learn today? 🌞</p>
          <StarCount n={progress.stars} />
        </header>

        <section aria-label="Subjects" className="ph-subjects">
          {subjects.map((name) => {
            const s = subjectStyle(name);
            const count = all.filter((w) => w.subject === name).length;
            return (
              <button
                key={name}
                type="button"
                className="ph-subject"
                style={{ "--c": s.color } as React.CSSProperties}
                onClick={() => go({ name: "pick", mode: "practice", subject: name })}
              >
                <span className="ph-subject-emoji">{s.emoji}</span>
                <span className="ph-subject-name">{name === "Marathi" ? "Marathi मराठी" : name}</span>
                <span className="ph-subject-count">
                  {count} worksheet{count === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
          <div className="ph-subject ph-subject-soon" aria-label="More subjects coming">
            <span className="ph-subject-emoji">✨</span>
            <span className="ph-subject-name">More soon</span>
          </div>
        </section>

        <nav className="ph-mainnav" aria-label="Main">
          <button type="button" className="ph-navbtn ph-nav-practice" onClick={() => go({ name: "pick", mode: "practice" })}>
            <span>🎯</span>Practice
          </button>
          <button type="button" className="ph-navbtn ph-nav-test" onClick={() => go({ name: "pick", mode: "test" })}>
            <span>📝</span>Take Test
          </button>
          <button type="button" className="ph-navbtn ph-nav-progress" onClick={() => go({ name: "progress" })}>
            <span>🏆</span>My Progress
          </button>
        </nav>

        <button type="button" className="ph-parentlink" onClick={() => go({ name: "parent" })}>
          👨‍👩‍👧 Parent corner — add new worksheets
        </button>
      </div>
    );
  }

  function renderProgress() {
    const attempts = progress.attempts;
    const total = attempts.reduce((n, a) => n + a.total, 0);
    const correct = attempts.reduce((n, a) => n + a.correct, 0);
    const bySubject = new Map<string, { total: number; correct: number }>();
    for (const a of attempts) {
      const s = bySubject.get(a.subject) ?? { total: 0, correct: 0 };
      bySubject.set(a.subject, { total: s.total + a.total, correct: s.correct + a.correct });
    }
    return (
      <div className="ph-screen">
        <TopBar title="🏆 My Progress" onBack={() => go({ name: "home" })} right={<StarCount n={progress.stars} />} />
        <section className="ph-stats">
          <div className="ph-stat">
            <b>{total}</b>
            <span>questions tried</span>
          </div>
          <div className="ph-stat ph-stat-good">
            <b>{correct}</b>
            <span>correct ✅</span>
          </div>
          <div className="ph-stat ph-stat-soft">
            <b>{total - correct}</b>
            <span>to practise 🌱</span>
          </div>
        </section>

        <section className="ph-card">
          <h2 className="ph-h2">Subjects</h2>
          {bySubject.size === 0 && <p className="ph-empty">Finish a worksheet to see your scores here.</p>}
          {[...bySubject.entries()].map(([name, s]) => {
            const st = subjectStyle(name);
            const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div className="ph-subjectbar" key={name} style={{ "--c": st.color } as React.CSSProperties}>
                <span className="ph-subjectbar-name">
                  {st.emoji} {name}
                </span>
                <span className="ph-subjectbar-track">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="ph-subjectbar-pct">
                  {pct}% <small>({s.correct}/{s.total})</small>
                </span>
              </div>
            );
          })}
        </section>

        <section className="ph-card">
          <h2 className="ph-h2">Recent results</h2>
          {attempts.length === 0 && <p className="ph-empty">No results yet — let&apos;s start! 🚀</p>}
          <ul className="ph-recent">
            {attempts.slice(0, 12).map((a, i) => (
              <li key={a.at + "-" + i}>
                <span className="ph-recent-mode">{a.mode === "test" ? "📝" : "🎯"}</span>
                <span className="ph-recent-body">
                  <span className="ph-recent-title">{a.title}</span>
                  <span className="ph-recent-meta">
                    {new Date(a.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </span>
                </span>
                <span className="ph-recent-score">
                  {a.correct}/{a.total}
                </span>
                {a.wrong.length > 0 && byId(a.worksheetId) && (
                  <button type="button" className="ph-btn ph-btn-sm" onClick={() => run(a.worksheetId, "practice", a.wrong)}>
                    🔁 Practise {a.wrong.length}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  function renderParent() {
    const download = () => {
      const blob = new Blob([JSON.stringify(makeBackup(custom, progress, photo), null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `prisha-learning-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    const restore = async (file: File) => {
      try {
        const b = parseBackup(await file.text());
        const merged = [...custom.filter((c) => !b.worksheets.some((w) => w.id === c.id)), ...b.worksheets];
        const withProgress = b.progress && confirm("Also restore progress and stars from this backup? (OK = yes, Cancel = keep current progress)");
        if (!updateCustom(merged)) throw new Error("The browser's storage is full.");
        if (b.photo && !photo && savePhoto(b.photo)) setPhoto(b.photo);
        if (withProgress) {
          const p = { ...emptyProgress(), ...b.progress };
          setProgress(p);
          saveProgress(p);
        }
        setNotice(`Restored ${b.worksheets.length} worksheet(s)${withProgress ? " and progress" : ""}.`);
      } catch (e) {
        setNotice((e as Error).message);
      }
    };

    return (
      <div className="ph-screen">
        <TopBar title="👨‍👩‍👧 Parent corner" onBack={() => go({ name: "home" })} />
        {notice && (
          <p className="ph-notice" role="status">
            {notice}
          </p>
        )}

        <section className="ph-card">
          <div className="ph-part-head">
            <h2 className="ph-h2">Worksheets</h2>
            <button type="button" className="ph-btn ph-btn-main" onClick={() => go({ name: "edit" })}>
              ➕ Add new worksheet
            </button>
          </div>
          <ul className="ph-manage">
            {all.map((w) => (
              <li key={w.id}>
                <span className="ph-manage-title">
                  {subjectStyle(w.subject).emoji} {w.title}
                  <small>
                    {w.subject} · {w.parts.reduce((n, p) => n + p.questions.length, 0)} questions{w.builtIn ? " · from school sheet" : ""}
                  </small>
                </span>
                <span className="ph-manage-actions">
                  {w.builtIn ? (
                    <button
                      type="button"
                      className="ph-btn ph-btn-sm"
                      onClick={() => go({ name: "edit", worksheet: { ...w, title: `${w.title} (copy)` } })}
                    >
                      📄 Copy &amp; edit
                    </button>
                  ) : (
                    <>
                      <button type="button" className="ph-btn ph-btn-sm" onClick={() => go({ name: "edit", worksheet: w })}>
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="ph-btn ph-btn-ghost ph-btn-sm"
                        onClick={() => {
                          if (confirm(`Delete “${w.title}”? This cannot be undone.`)) {
                            updateCustom(custom.filter((c) => c.id !== w.id));
                            setNotice(`Deleted “${w.title}”.`);
                          }
                        }}
                      >
                        🗑 Delete
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ph-card">
          <h2 className="ph-h2">Prisha&apos;s photo</h2>
          <div className="ph-photo-row">
            <Avatar photo={photo} size="sm" />
            <div className="ph-actions ph-actions-left">
              <label className="ph-btn">
                📷 {photo ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const url = await cropPortrait(f);
                      if (!savePhoto(url)) throw new Error("The browser's storage is full.");
                      setPhoto(url);
                      setNotice("Photo added — see the home screen! 😊");
                    } catch (err) {
                      setNotice((err as Error).message);
                    }
                  }}
                />
              </label>
              {photo && (
                <button
                  type="button"
                  className="ph-btn ph-btn-ghost"
                  onClick={() => {
                    savePhoto("");
                    setPhoto("");
                    setNotice("Photo removed.");
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="ph-text">
            The photo stays <strong>only in this browser on this device</strong> — it is not uploaded to the website. Add it again on
            another phone or laptop (or restore a backup there).
          </p>
        </section>

        <section className="ph-card">
          <h2 className="ph-h2">Backup</h2>
          <p className="ph-text">
            Worksheets you add and Prisha&apos;s progress are saved <strong>only in this browser on this device</strong>. They are not
            sent anywhere. Clearing browser data, using a private window, or a different phone/laptop will not have them. Download a
            backup now and then, and restore it on another device.
          </p>
          <div className="ph-actions">
            <button type="button" className="ph-btn" onClick={download}>
              ⬇ Download backup
            </button>
            <label className="ph-btn">
              ⬆ Restore backup
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) restore(f);
                }}
              />
            </label>
          </div>
        </section>

        <section className="ph-card">
          <h2 className="ph-h2">Progress</h2>
          <p className="ph-text">
            {progress.attempts.length} rounds played · ⭐ {progress.stars} stars
          </p>
          <button
            type="button"
            className="ph-btn ph-btn-ghost"
            onClick={() => {
              if (confirm("Reset all progress and stars? Worksheets stay.")) {
                const p = emptyProgress();
                setProgress(p);
                saveProgress(p);
                setNotice("Progress reset.");
              }
            }}
          >
            ↺ Reset progress
          </button>
        </section>
      </div>
    );
  }
}

/** Keeps little fingers out of the editor: a sum only a grown-up will bother with. */
function ParentGate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const [[a, b]] = useState(() => [6 + Math.floor(Math.random() * 7), 5 + Math.floor(Math.random() * 8)]);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  return (
    <div className="ph-screen">
      <TopBar title="👨‍👩‍👧 Parent corner" onBack={onBack} />
      <form
        className="ph-card ph-gate"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(value) === a * b) onPass();
          else setWrong(true);
        }}
      >
        <p className="ph-text">For grown-ups: what is {a} × {b}?</p>
        <input className="ph-typeinput" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Answer" autoFocus />
        {wrong && <p className="ph-hint">That&apos;s not it — ask Papa or Mumma 🙂</p>}
        <button type="submit" className="ph-btn ph-btn-main">
          Open
        </button>
      </form>
    </div>
  );
}
