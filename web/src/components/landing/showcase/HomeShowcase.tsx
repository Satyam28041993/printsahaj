"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Bot, Calculator, Factory, Globe, Pause, Play, ShieldCheck, Users } from "lucide-react";
import Pill from "../Pill";
import MiniUi, { CALC_INITIAL, type CalcState } from "./MiniUis";
import ShowcaseMedia from "../ShowcaseMedia";
import type { ShowcaseSlug } from "@/data/showcase";
import { useSlidingIndicator } from "@/lib/useSlidingIndicator";
import { useInViewState, usePrefersReducedMotion, useSpotlight } from "@/lib/useHomeMotion";
import { getMotion } from "@/lib/motion/loader";
import { homeShowcase, type ShowcaseVisualId } from "@content/homeShowcase";

const ICONS: Record<ShowcaseVisualId, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  flexora: Factory,
  crm: Users,
  websites: Globe,
  printverify: ShieldCheck,
  aivy: Bot,
  calculator: Calculator,
};

/** Which media slot (src/data/showcase.ts) belongs to which tab. The calculator is real, so it has none. */
const MEDIA_SLUG: Partial<Record<ShowcaseVisualId, ShowcaseSlug>> = {
  flexora: "flexora",
  crm: "crm",
  websites: "website",
  printverify: "printverify",
  aivy: "aivy",
};

/** Seconds each tab stays open. Also the length of the progress line. */
const CYCLE_SECONDS = 6;
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

  const stageRef = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const animateIn = useRef(false);

  const select = useCallback(
    (index: number) => {
      if (index === active) return;
      direction.current = index > active ? 1 : -1;
      const apply = () => setActive(index);
      const doc = document as TransitionDocument;
      const motion = getMotion();
      const pane = stageRef.current?.querySelector<HTMLElement>(".sc-pane");
      if (!reduced && motion && pane) {
        // Outgoing pane slides away first; the incoming one is animated in the effect below.
        animateIn.current = true;
        motion.gsap.to(pane, {
          x: -40 * direction.current,
          opacity: 0,
          duration: 0.22,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => flushSync(apply),
        });
      } else if (!reduced && typeof doc.startViewTransition === "function") {
        doc.startViewTransition(() => flushSync(apply));
      } else {
        apply();
      }
    },
    [reduced, active],
  );

  // Incoming pane: slides in from the swipe side, then the mini-UI rows pop up in turn.
  useLayoutEffect(() => {
    const motion = getMotion();
    const pane = stageRef.current?.querySelector<HTMLElement>(".sc-pane");
    if (!motion || !pane || reduced || !animateIn.current) return;
    animateIn.current = false;
    const { gsap } = motion;
    const rows = Array.from(pane.querySelectorAll<HTMLElement>(".mu-in"));
    pane.style.animation = "none";
    rows.forEach((row) => (row.style.animation = "none"));
    gsap.fromTo(
      pane,
      { x: 60 * direction.current, scale: 0.96, opacity: 0 },
      { x: 0, scale: 1, opacity: 1, duration: 0.48, ease: "expo.out", clearProps: "transform,opacity" },
    );
    if (rows.length) {
      gsap.fromTo(
        rows,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.15, ease: "back.out(1.6)", clearProps: "transform,opacity,animation" },
      );
    }
  }, [active, reduced]);

  const onStageDown = (event: React.PointerEvent) => {
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onStageUp = (event: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const last = tabs.length - 1;
    select(dx < 0 ? (active === last ? 0 : active + 1) : active === 0 ? last : active - 1);
  };

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
      id="showcase"
      aria-labelledby="showcase-heading"
      className="h-wrap mt-4 sm:mt-6"
    >
      <div
        ref={spotRef}
        className="h-panel sc"
        data-m="scrub-in"
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
          <header className="sc__head">
            <p className="h-kicker">{homeShowcase.eyebrow}</p>
            <h2 id="showcase-heading" className="h-title h-title--lg max-w-[22ch]">
              {homeShowcase.heading}
            </h2>
            <p className="h-lead max-w-[56ch]">{homeShowcase.supporting}</p>
          </header>

          <div className="sc__bar">
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
            className="sc-card"
            role="tabpanel"
            id="showcase-panel"
            aria-labelledby={`showcase-tab-${tab.id}`}
            tabIndex={0}
          >
            <div className="sc-info">
              <span className="sc-status" data-status={tab.status}>
                <span className="sr-only">{homeShowcase.statusLabel}: </span>
                {tab.statusText ?? tab.status}
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
            <div
              ref={stageRef}
              className="sc-stage"
              onPointerDown={onStageDown}
              onPointerUp={onStageUp}
              onPointerCancel={() => (swipe.current = null)}
            >
              <div className="sc-pane" key={tab.id} data-fallback={!hasTransitions && !reduced}>
                {MEDIA_SLUG[tab.id] ? (
                  <ShowcaseMedia
                    slug={MEDIA_SLUG[tab.id] as ShowcaseSlug}
                    title={tab.label}
                    collage="showcase"
                    priority={active === 0}
                    fallback={<MiniUi id={tab.id} calc={calc} onCalcChange={setCalc} />}
                  />
                ) : (
                  <MiniUi id={tab.id} calc={calc} onCalcChange={setCalc} />
                )}
              </div>
            </div>
          </div>

          <p className="sc-note">{homeShowcase.sampleNote}</p>
        </div>
      </div>
    </section>
  );
}
