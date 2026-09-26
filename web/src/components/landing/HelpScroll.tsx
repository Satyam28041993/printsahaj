"use client";

import React, { useLayoutEffect, useRef } from "react";
import CtaButton from "./CtaButton";
import { ensureGsap, ScrollTrigger } from "@/lib/motion";
import { help } from "@content/help";

/**
 * A new wheel gesture starts after the wheel has been quiet this long. A
 * trackpad swipe keeps firing momentum events ~16ms apart for a second or
 * more; a real second flick always leaves a pause first. Measured on the
 * events' own timestamps, so a busy frame cannot fake a pause.
 */
const GESTURE_GAP_MS = 200;
/**
 * Momentum only ever slows down. A delta this much bigger than the one before
 * it means the visitor flicked again without pausing.
 */
const REACCELERATION = 1.6;
const REACCELERATION_MIN_PX = 6;
/** Wheel pixels in one gesture before it counts as intent (ignores drift). */
const WHEEL_INTENT_PX = 12;
/** Finger travel before a swipe counts as intent. */
const TOUCH_INTENT_PX = 36;

/** Seconds. Each change plays on the clock, the same every time. */
const LEAVE_DURATION = 0.55;
const ARRIVE_DURATION = 0.85;
/** The new card starts while the old one is still receding: no black gap. */
const ARRIVE_DELAY = 0.12;
/** A new gesture is accepted once the card is essentially in place. */
const LOCK_DURATION = 0.7;

/** Forward: a new card starts small, right of centre, turned away. */
const FAR = { xPercent: 42, scale: 0.3, rotateY: -28 } as const;
/** Forward: the old card moves on past the viewer. */
const NEAR = { xPercent: -6, scale: 1.2, rotateY: 0 } as const;
const SETTLED = { xPercent: 0, scale: 1, rotateY: 0, autoAlpha: 1 } as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select"));
}

/**
 * "Where we can help": a black stage that holds the page while its cards
 * change. The heading stands alone first; each service then arrives from the
 * right, small to full size; the last card offers a free consultation.
 *
 * When the section reaches the top of the screen the page is held there and
 * wheel, trackpad, touch and keyboard input are read as intent: one gesture,
 * one card — a trackpad's momentum never carries a second card with it.
 * Past the last card (or before the first) the page is released and scrolls
 * on as normal.
 *
 * The markup is the still version — every card stacked in order, readable.
 * The held sequence is layered on only when motion is allowed.
 */
export default function HelpScroll() {
  const rootRef = useRef<HTMLElement>(null);
  const { services, consult } = help;
  const total = services.length;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const gsap = ensureGsap();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.classList.add("help-scroll--staged");
        const panels = gsap.utils.toArray<HTMLElement>("[data-help-panel]", root);
        const rail = root.querySelector<HTMLElement>("[data-help-rail]");
        const counter = root.querySelector<HTMLElement>("[data-help-count]");
        const last = panels.length - 1;

        let current = 0;
        let change: gsap.core.Timeline | null = null;
        let lockedUntil = 0;
        let holdAt = 0;
        let releasing = false;

        const markCurrent = (index: number) => {
          panels.forEach((panel, i) => panel.classList.toggle("is-current", i === index));
          if (rail) rail.dataset.active = String(index);
          if (counter) {
            counter.textContent =
              index === 0 ? "" : index === last ? consult.railLabel : `${pad(index)} / ${pad(total)}`;
          }
        };

        /** Show exactly one card, instantly. Used on entry and after any interruption. */
        const place = (index: number) => {
          change?.kill();
          change = null;
          current = index;
          panels.forEach((panel, i) => {
            gsap.set(panel, i === index ? { ...SETTLED, clearProps: "transform" } : { autoAlpha: 0 });
          });
          markCurrent(index);
        };

        const goTo = (target: number) => {
          const forward = target > current;
          const outgoing = panels[current];
          const incoming = panels[target];

          // Whatever was mid-flight is finished off first, so every change
          // starts from one fully visible card and nothing is left at zero.
          if (change) place(current);

          current = target;
          markCurrent(target);
          lockedUntil = performance.now() + LOCK_DURATION * 1000;

          const tl = gsap.timeline({
            onComplete: () => {
              // The one card that should show, crisp and fully opaque.
              place(target);
            },
          });
          change = tl;

          tl.to(outgoing, { ...(forward ? NEAR : FAR), duration: LEAVE_DURATION, ease: "power2.in" }, 0);
          tl.to(outgoing, { autoAlpha: 0, duration: LEAVE_DURATION, ease: "power1.in" }, 0);
          tl.fromTo(
            incoming,
            { ...(forward ? FAR : NEAR), autoAlpha: 0 },
            { ...SETTLED, duration: ARRIVE_DURATION, ease: "expo.out" },
            ARRIVE_DELAY,
          );
        };

        let held = false;

        const release = (direction: 1 | -1) => {
          held = false;
          releasing = true;
          const top = direction > 0 ? holdAt + Math.round(window.innerHeight * 0.55) : holdAt - 2;
          window.scrollTo({ top, behavior: "smooth" });
          window.setTimeout(() => {
            releasing = false;
          }, 700);
        };

        const step = (direction: 1 | -1) => {
          const target = current + direction;
          if (target > last) return release(1);
          if (target < 0) return release(-1);
          goTo(target);
        };

        // ---- wheel & trackpad: one gesture, at most one step ----
        let lastWheelStamp = -Infinity;
        let lastWheelDelta = 0;
        let gestureTravel = 0;
        let gestureSpent = true;

        const onWheel = (event: WheelEvent) => {
          if (!held) return;
          event.preventDefault();
          const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
          const size = Math.abs(delta);
          const gap = event.timeStamp - lastWheelStamp;
          const reaccelerated =
            size > lastWheelDelta * REACCELERATION && size - lastWheelDelta > REACCELERATION_MIN_PX;
          if (gap > GESTURE_GAP_MS || reaccelerated) {
            gestureSpent = false;
            gestureTravel = 0;
          }
          lastWheelStamp = event.timeStamp;
          lastWheelDelta = size;
          if (gestureSpent) return;

          gestureTravel += delta;
          if (Math.abs(gestureTravel) < WHEEL_INTENT_PX) return;
          // Spent either way: a flick made while a card is still landing is
          // swallowed with its momentum, never saved up for later.
          gestureSpent = true;
          if (performance.now() < lockedUntil) return;
          step(gestureTravel > 0 ? 1 : -1);
        };

        // ---- touch: one swipe, at most one step ----
        let touchStartY = 0;
        let touchSpent = true;

        const onTouchStart = (event: TouchEvent) => {
          if (!held) return;
          touchStartY = event.touches[0]?.clientY ?? 0;
          touchSpent = false;
        };

        const onTouchMove = (event: TouchEvent) => {
          if (!held) return;
          event.preventDefault();
          if (touchSpent) return;
          const travel = touchStartY - (event.touches[0]?.clientY ?? touchStartY);
          if (Math.abs(travel) < TOUCH_INTENT_PX) return;
          touchSpent = true;
          if (performance.now() < lockedUntil) return;
          step(travel > 0 ? 1 : -1);
        };

        const onKey = (event: KeyboardEvent) => {
          if (!held || isInteractive(event.target)) return;
          const down = ["ArrowDown", "PageDown", " ", "Spacebar"].includes(event.key);
          const up = ["ArrowUp", "PageUp"].includes(event.key);
          if (!down && !up) return;
          event.preventDefault();
          if (performance.now() < lockedUntil) return;
          step(down ? 1 : -1);
        };

        const keepHeld = () => {
          if (!held || releasing) return;
          // A scrollbar drag or a jump link is a clear wish to leave.
          if (Math.abs(window.scrollY - holdAt) > window.innerHeight * 0.5) {
            held = false;
            return;
          }
          if (window.scrollY !== holdAt) window.scrollTo({ top: holdAt, behavior: "instant" });
        };

        /** Hold the page with the section filling the screen. */
        const hold = (index: number, start: number) => {
          if (held) return;
          holdAt = Math.round(start);
          window.scrollTo({ top: holdAt, behavior: "instant" });
          place(index);
          // The gesture that brought the visitor here must not also turn a card.
          gestureSpent = true;
          touchSpent = true;
          lockedUntil = performance.now() + 300;
          held = true;
        };

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "+=1",
          onEnter: (self) => !releasing && hold(0, self.start),
          onEnterBack: (self) => !releasing && hold(last, self.start),
        });

        const active = { passive: false } as const;
        window.addEventListener("wheel", onWheel, active);
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, active);
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", keepHeld, { passive: true });
        place(0);

        return () => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("keydown", onKey);
          window.removeEventListener("scroll", keepHeld);
          trigger.kill();
          change?.kill();
          root.classList.remove("help-scroll--staged");
          panels.forEach((panel) => panel.classList.remove("is-current"));
          if (rail) rail.dataset.active = "0";
          if (counter) counter.textContent = "";
        };
      });
    }, root);

    return () => ctx.revert();
  }, [total, consult.railLabel]);

  return (
    <section ref={rootRef} aria-labelledby="help-heading" className="help-scroll">
      <div className="help-scroll__glow" aria-hidden="true" />

      <div className="help-scroll__stage">
        <div className="help-panel help-panel--intro" data-help-panel>
          <p className="story-kicker">{help.eyebrow}</p>
          <h2 id="help-heading" className="help-3d help-3d--intro">
            {help.heading}
          </h2>
          <span className="help-scroll__cue" aria-hidden="true">
            {help.scrollCue}
            <i />
          </span>
        </div>

        {services.map((service, i) => (
          <article key={service.title} className="help-panel" data-help-panel aria-labelledby={`help-${i}`}>
            <p className="help-panel__index">
              {pad(i + 1)} <span>/ {pad(total)}</span>
            </p>
            <h3 id={`help-${i}`} className="help-3d">
              {service.title}
            </h3>
            <p className="help-panel__promise">{service.promise}</p>
            <p className="help-panel__body">{service.body}</p>
            <ul className="help-panel__points">
              {service.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}

        <article className="help-panel help-panel--consult" data-help-panel aria-labelledby="help-consult">
          <p className="story-kicker">{consult.eyebrow}</p>
          <h3 id="help-consult" className="help-3d">
            {consult.title}
          </h3>
          <p className="help-panel__promise">{consult.promise}</p>
          <p className="help-panel__body">{consult.body}</p>
          <ul className="help-panel__points">
            {consult.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="help-panel__ctas">
            <CtaButton href={consult.primaryCta.href} size="lg">
              {consult.primaryCta.label}
            </CtaButton>
            <a href={consult.callCta.href} className="ps-call inline-flex">
              <PhoneIcon />
              <span>{consult.callCta.label}</span>
            </a>
          </div>
        </article>
      </div>

      <div className="help-scroll__rail" data-help-rail data-active="0" aria-hidden="true">
        <span className="help-scroll__count" data-help-count />
        <span className="help-scroll__ticks">
          {services.map((service, i) => (
            <i key={service.title} data-tick={i + 1} />
          ))}
          <i className="help-scroll__tick-end" data-tick={total + 1} />
        </span>
      </div>
    </section>
  );
}
