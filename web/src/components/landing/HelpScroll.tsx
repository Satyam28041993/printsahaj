"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Cog,
  CheckCircle2,
  ClipboardList,
  Factory,
  Filter,
  Inbox,
  Megaphone,
  MousePointerClick,
  Pause,
  Play,
  Repeat,
  Send,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Pill from "./Pill";
import { useInViewState, usePrefersReducedMotion, useRevealOnView, useSpotlight } from "@/lib/useHomeMotion";
import { help } from "@content/help";

type Icon = React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;

/** One icon per stop of each service's flow, in the order of `flow`. */
const FLOW_ICONS: [Icon, Icon, Icon][] = [
  [MousePointerClick, Send, CalendarCheck],
  [Inbox, Users, CalendarCheck],
  [ClipboardList, Factory, Truck],
  [Repeat, Cog, CheckCircle2],
  [Megaphone, Filter, UserCheck],
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Where we can help you". Segmented pill tabs for the five services; below
 * them a two-pane card — a points accordion with a vertical progress line on
 * the left, a small flow demo on the right — and the free-consultation card.
 *
 * Nothing here holds or steals the page scroll: no wheel, touch or key
 * listeners. The progress line advances on its own (CSS animation; its end
 * opens the next point, then the next service), and stops on hover, focus,
 * touch, off-screen, the pause button, and reduced motion.
 */
export default function HelpScroll() {
  const { services, consult } = help;
  const [service, setService] = useState(0);
  const [step, setStep] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchHold, setTouchHold] = useState(false);

  const reduced = usePrefersReducedMotion();
  const { ref: viewRef, inView } = useInViewState<HTMLDivElement>();
  const spotRef = useSpotlight<HTMLDivElement>();
  const revealRef = useRevealOnView<HTMLElement>();
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pillsRowRef = useRef<HTMLDivElement>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const auto = !reduced;
  const running = auto && inView && !userPaused && !hover && !focused && !touchHold;
  const current = services[service];
  const Icons = FLOW_ICONS[service];

  useEffect(() => () => clearTimeout(touchTimer.current), []);

  const pick = useCallback((index: number) => {
    setService(index);
    setStep(0);
  }, []);

  // Keep the chosen pill visible inside its scrolling row; the page never moves.
  useEffect(() => {
    const row = pillsRowRef.current;
    const pill = pillRefs.current[service];
    if (!row || !pill) return;
    const target = pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });
  }, [service, reduced]);

  const advance = useCallback(() => {
    if (step < current.points.length - 1) setStep(step + 1);
    else pick(service === services.length - 1 ? 0 : service + 1);
  }, [step, current.points.length, pick, service, services.length]);

  const onFillEnd = (event: React.AnimationEvent) => {
    if ((event.animationName !== "hp-fill" && event.animationName !== "hp-fill-x") || !running) return;
    advance();
  };

  const onPillKeyDown = (event: React.KeyboardEvent) => {
    const last = services.length - 1;
    let next = -1;
    if (event.key === "ArrowRight") next = service === last ? 0 : service + 1;
    else if (event.key === "ArrowLeft") next = service === 0 ? last : service - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    pick(next);
    pillRefs.current[next]?.focus();
  };

  const onTouchStart = () => {
    setTouchHold(true);
    clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setTouchHold(false), 12000);
  };

  return (
    <section ref={revealRef} aria-labelledby="help-heading" className="h-wrap mt-4 sm:mt-6">
      <div
        ref={spotRef}
        className="h-panel hp"
        data-play={running ? "running" : "paused"}
        data-auto={auto ? "on" : "off"}
        data-inview={inView}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onTouchStart={onTouchStart}
      >
        <div ref={viewRef}>
          <header className="hp__head h-reveal">
            <div>
              <p className="h-kicker">{help.eyebrow}</p>
              <h2 id="help-heading" className="h-title h-title--lg mt-3">
                {help.heading}
              </h2>
            </div>
            {auto ? (
              <button
                type="button"
                className="sc-toggle"
                onClick={() => setUserPaused((value) => !value)}
                aria-label={userPaused ? help.playLabel : help.pauseLabel}
                title={userPaused ? help.playLabel : help.pauseLabel}
              >
                {userPaused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
              </button>
            ) : null}
          </header>

          <div
            ref={pillsRowRef}
            className="hp-pills h-reveal"
            style={{ "--i": 1 } as React.CSSProperties}
            role="tablist"
            aria-label={help.tablistLabel}
            onKeyDown={onPillKeyDown}
          >
            {services.map((item, i) => (
              <button
                key={item.title}
                ref={(node) => {
                  pillRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`help-tab-${i}`}
                aria-selected={i === service}
                aria-controls="help-panel"
                tabIndex={i === service ? 0 : -1}
                className="hp-pill"
                onClick={() => pick(i)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div
            className="hp-card h-reveal"
            style={{ "--i": 2 } as React.CSSProperties}
            role="tabpanel"
            id="help-panel"
            aria-labelledby={`help-tab-${service}`}
            tabIndex={0}
          >
            <div className="hp-info">
              <p className="hp-index">
                {pad(service + 1)} / {pad(services.length)}
              </p>
              <h3 className="h-title mt-3 text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)]">{current.title}</h3>
              <p className="h-lead mt-3 font-medium !text-primary">{current.promise}</p>
              <p className="mt-3 text-muted">{current.body}</p>

              <ol className="hp-steps" key={current.title}>
                {current.points.map((point, i) => {
                  const state = i < step ? "done" : i === step ? "active" : "todo";
                  return (
                    <li key={point.title} className="hp-step" data-state={state}>
                      <button
                        type="button"
                        className="hp-step__btn"
                        aria-expanded={state === "active"}
                        aria-controls={`help-step-${i}`}
                        onClick={() => setStep(i)}
                      >
                        {point.title}
                      </button>
                      <div id={`help-step-${i}`} className="hp-step__more" role="region" aria-label={point.title}>
                        <div>
                          <p>{point.detail}</p>
                          <p className="hp-step__flow">{`${help.flowLabel} ${current.flow[i]}`}</p>
                        </div>
                      </div>
                      <span className="hp-step__seg" aria-hidden="true">
                        <i onAnimationEnd={state === "active" ? onFillEnd : undefined} />
                      </span>
                      <span className="hp-step__tail" aria-hidden="true">
                        <i onAnimationEnd={state === "active" ? onFillEnd : undefined} />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="hp-demo" aria-hidden="true">
              <div className="flow" key={current.title}>
                {current.flow.map((label, i) => {
                  const Node = Icons[i];
                  return (
                    <React.Fragment key={label}>
                      <div className="flow__node" data-on={step === i}>
                        <span className="flow__icon">
                          <Node size={24} aria-hidden />
                        </span>
                        {label}
                      </div>
                      {i < 2 ? <span className="flow__wire" style={{ "--d": `${i * 0.5}s` } as React.CSSProperties} /> : null}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <section
            className="hp-consult h-ring h-reveal"
            style={{ "--i": 3 } as React.CSSProperties}
            data-inview={inView}
            aria-labelledby="help-consult"
          >
            <div>
              <p className="h-kicker">{consult.eyebrow}</p>
              <h3 id="help-consult" className="h-title mt-3 text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)]">
                {consult.title}
              </h3>
              <p className="h-lead mt-3 font-medium !text-primary">{consult.promise}</p>
              <p className="mt-3 max-w-[60ch] text-muted">{consult.body}</p>
              <ul className="hp-consult__points">
                {consult.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="hp-consult__ctas">
              <Pill href={consult.primaryCta.href}>{consult.primaryCta.label}</Pill>
              <Pill href={consult.callCta.href} variant="ghost" call>
                {consult.callCta.label}
              </Pill>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
