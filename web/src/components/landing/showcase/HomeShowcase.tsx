"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Bot, Calculator, Factory, Globe, Pause, Play, ShieldCheck, Users } from "lucide-react";
import Pill from "../Pill";
import MiniUi, { CALC_INITIAL, type CalcState } from "./MiniUis";
import { useSlidingIndicator } from "@/lib/useSlidingIndicator";
import { useInViewState, usePrefersReducedMotion, useRevealOnView, useSpotlight } from "@/lib/useHomeMotion";
import { homeShowcase, type ShowcaseVisualId } from "@content/homeShowcase";

const ICONS: Record<ShowcaseVisualId, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  flexora: Factory,
  crm: Users,
  websites: Globe,
  printverify: ShieldCheck,
  aivy: Bot,
  calculator: Calculator,
};

/** Seconds each tab stays open. Also the length of the progress line. */
const CYCLE_SECONDS = 7;
/** After a touch, auto-play stays paused this long unless the visitor resumes it. */
const TOUCH_HOLD_MS = 12000;

type TransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

/**
 * S1b — the showcase. Auto-cycling icon tabs with a progress line on the
 * active tab; the line is the timer (a CSS animation whose end opens the next
 * tab), so pausing it pauses everything.
 *
 * Auto-play pauses on hover, focus, touch and off-screen, has a visible
 * pause/play button (WCAG 2.2.2), and never runs with reduced motion. There is
 * no aria-live: a tab that changes by itself is not announced.
 */
export default function HomeShowcase() {
  const { tabs } = homeShowcase;
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchHold, setTouchHold] = useState(false);
  const [calc, setCalc] = useState<CalcState>(CALC_INITIAL);
  const [hasTransitions, setHasTransitions] = useState(false);

  const reduced = usePrefersReducedMotion();
  const { ref: viewRef, inView } = useInViewState<HTMLDivElement>();
  const spotRef = useSpotlight<HTMLDivElement>();
  const revealRef = useRevealOnView<HTMLElement>();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useSlidingIndicator(tabsRowRef, tabRefs, active);

  const auto = !reduced;
  const running = auto && inView && !userPaused && !hover && !focused && !touchHold;

  useEffect(() => {
    // Feature-detect after mount so the server and first client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasTransitions(typeof (document as TransitionDocument).startViewTransition === "function");
    return () => clearTimeout(touchTimer.current);
  }, []);

  const select = useCallback(
    (index: number) => {
      const apply = () => setActive(index);
      const doc = document as TransitionDocument;
      if (!reduced && typeof doc.startViewTransition === "function") {
        doc.startViewTransition(() => flushSync(apply));
      } else {
        apply();
      }
    },
    [reduced],
  );

  // Keep the active tab in view inside the scrolling row, without moving the page.
  useEffect(() => {
    const row = tabsRowRef.current;
    const tab = tabRefs.current[active];
    if (!row || !tab) return;
    const target = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = tabs.length - 1;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const onLineEnd = (event: React.AnimationEvent) => {
    if (event.animationName !== "sc-progress" || !running) return;
    select(active === tabs.length - 1 ? 0 : active + 1);
  };

  const onTouchStart = () => {
    setTouchHold(true);
    clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setTouchHold(false), TOUCH_HOLD_MS);
  };

  const tab = tabs[active];

  return (
    <section
      ref={revealRef}
      id="showcase"
      aria-labelledby="showcase-heading"
      className="h-wrap mt-4 sm:mt-6"
    >
      <div
        ref={spotRef}
        className="h-panel sc"
        style={{ "--cycle": `${CYCLE_SECONDS}s` } as React.CSSProperties}
        data-play={running ? "running" : "paused"}
        data-auto={auto ? "on" : "off"}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onTouchStart={onTouchStart}
      >
        <div ref={viewRef}>
          <header className="sc__head h-reveal">
            <p className="h-kicker">{homeShowcase.eyebrow}</p>
            <h2 id="showcase-heading" className="h-title h-title--lg max-w-[22ch]">
              {homeShowcase.heading}
            </h2>
            <p className="h-lead max-w-[56ch]">{homeShowcase.supporting}</p>
          </header>

          <div className="sc__bar h-reveal" style={{ "--i": 1 } as React.CSSProperties}>
            <div
              ref={tabsRowRef}
              className="sc-tabs m-tabs"
              role="tablist"
              aria-label={homeShowcase.tablistLabel}
              onKeyDown={onKeyDown}
            >
              <span className="m-indicator" aria-hidden="true" />
              {tabs.map((item, i) => {
                const Icon = ICONS[item.id];
                const selected = i === active;
                return (
                  <button
                    key={item.id}
                    ref={(node) => {
                      tabRefs.current[i] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`showcase-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="showcase-panel"
                    tabIndex={selected ? 0 : -1}
                    className="sc-tab"
                    onClick={() => select(i)}
                    onAnimationEnd={selected ? onLineEnd : undefined}
                  >
                    <span className="sc-tab__icon">
                      <Icon size={15} aria-hidden />
                    </span>
                    {item.label}
                    <span className="sc-tab__line" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            {auto ? (
              <button
                type="button"
                className="sc-toggle"
                onClick={() => setUserPaused((value) => !value)}
                aria-label={userPaused ? homeShowcase.playLabel : homeShowcase.pauseLabel}
                title={userPaused ? homeShowcase.playLabel : homeShowcase.pauseLabel}
              >
                {userPaused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
              </button>
            ) : null}
          </div>

          <div
            className="sc-card h-reveal"
            style={{ "--i": 2 } as React.CSSProperties}
            role="tabpanel"
            id="showcase-panel"
            aria-labelledby={`showcase-tab-${tab.id}`}
            tabIndex={0}
          >
            <div className="sc-info">
              <span className="sc-status" data-status={tab.status}>
                <span className="sr-only">{homeShowcase.statusLabel}: </span>
                {tab.status}
              </span>
              <h3 className="h-title text-[clamp(1.75rem,1.2rem+1.6vw,2.6rem)]">{tab.label}</h3>
              <p className="h-lead">{tab.promise}</p>
              <ul className="sc-chips" aria-label={tab.label}>
                {tab.chips.map((chip) => (
                  <li key={chip} className="sc-chip">
                    {chip}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Pill href={tab.cta.href}>{tab.cta.label}</Pill>
              </div>
            </div>
            <div className="sc-stage">
              <div className="sc-pane" key={tab.id} data-fallback={!hasTransitions && !reduced}>
                <MiniUi id={tab.id} calc={calc} onCalcChange={setCalc} />
              </div>
            </div>
          </div>

          <p className="sc-note">{homeShowcase.sampleNote}</p>
        </div>
      </div>
    </section>
  );
}
