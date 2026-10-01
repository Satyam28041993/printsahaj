/**
 * The GSAP motion engine. Server components opt in with data attributes; this
 * file reads them once GSAP has loaded and builds the animations.
 *
 *   data-m="reveal"    rise + scale + fade once; children marked data-m-child stagger
 *   data-m="pop"       scale-in pop (chips, badges); data-m-child stagger
 *   data-m="lines"     headline lines slide up out of a mask (SplitText)
 *   data-m="words"     quote words light up with scroll (SplitText, scrubbed)
 *   data-m="scrub-in"  panel grows into place with scroll (scale, y, clip-path)
 *   data-m="clip"      card un-clips with scroll
 *   data-m="parallax"  data-m-speed="-12..12", yPercent drift with scroll
 *   data-m="counter"   numbers count up to the server-rendered value
 *   data-m="scrub-out" hero panel shrinks and rounds as it scrolls away
 *   data-m="stack"     mobile sticky card stack (children data-m-stack-card)
 *   data-m="flip"      final CTA background/text flip
 *   data-m="letters"   footer wordmark letters rise with scroll
 *   data-m="marquee"   velocity-driven marquee
 *   data-m="progress"  scroll progress bar
 *   data-m-card        "active card" lift on touch, tilt on fine pointers
 *
 * Only transform, opacity and clip-path animate (plus the two pieces the brief
 * asks for: the hero's border-radius variable and the footer's per-letter
 * offset). Nothing here listens to scroll directly: ScrollTrigger drives it.
 */

import type { MotionLibs } from "./loader";
import { DUR, EASE_OUT, MEDIA, RISE, SCRUB, STAGGER } from "./tokens";

type Cleanup = () => void;

const q = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/** Elements for a hook, minus those restricted (data-m-only) to the other breakpoint. */
const byM = (name: string, c?: { mobile: boolean; desktop: boolean }) =>
  q(`[data-m="${name}"]`).filter((el) => {
    const only = el.dataset.mOnly;
    return !only || !c || (only === "mobile" ? c.mobile : only === "desktop" ? c.desktop : true);
  });

function num(el: HTMLElement, key: string, fallback: number): number {
  const raw = el.dataset[key];
  if (raw === undefined || raw === "") return fallback;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

const kidsOf = (el: HTMLElement) => q("[data-m-child]", el);

/** Marks targets as settled so the CSS pre-state (motion.css) stops applying. */
const settle = (targets: HTMLElement[]) => targets.forEach((t) => t.classList.add("m-done"));

interface Ctx {
  libs: MotionLibs;
  mobile: boolean;
  desktop: boolean;
  fine: boolean;
  scrub: number;
  cleanups: Cleanup[];
  /** One IntersectionObserver per start line, shared by every one-shot entrance. */
  once: Map<number, IntersectionObserver>;
  onceRun: WeakMap<Element, () => void>;
  /** Entrances not yet run, so a fast fling past them can be caught (see sweepOnce). */
  pending: Set<HTMLElement>;
  /** Heights read once up front, so entrances never force a layout each. */
  heights: Map<HTMLElement, number>;
  alive: boolean;
}

/**
 * Runs `run` once, the first time `el`'s top crosses `startPct` of the viewport
 * height (88 = ScrollTrigger's "top 88%"), or straight away if it is already
 * above that line (a reload mid-page). One-shot entrances use this instead of a
 * ScrollTrigger each: the page has ~50 of them and the budget is 40 triggers.
 */
function onceInView(c: Ctx, el: HTMLElement, startPct: number, run: () => void) {
  let io = c.once.get(startPct);
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const above = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
          if (!entry.isIntersecting && !above) return;
          fireOnce(c, entry.target as HTMLElement);
        });
      },
      { rootMargin: `0px 0px ${startPct - 100}% 0px` },
    );
    c.once.set(startPct, io);
  }
  c.onceRun.set(el, run);
  c.pending.add(el);
  io.observe(el);
}

function fireOnce(c: Ctx, el: HTMLElement) {
  const fn = c.onceRun.get(el);
  if (!fn) return;
  c.onceRun.delete(el);
  c.pending.delete(el);
  c.once.forEach((io) => io.unobserve(el));
  fn();
}

/**
 * An IntersectionObserver only reports a change of state. A short element that a
 * fast fling carries from below the viewport to above it between two frames
 * never "intersects", so it would stay hidden. After scrolling stops (ScrollTrigger's
 * scrollEnd) anything pending that is now above the viewport is run.
 */
function sweepOnce(c: Ctx) {
  c.pending.forEach((el) => {
    if (el.getBoundingClientRect().bottom < 0) fireOnce(c, el);
  });
}

/* ---------------------------------------------------------------- reveals */

function reveal(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const kids = kidsOf(el);
  const targets = kids.length ? kids : [el];
  const rise = num(el, "mY", c.mobile ? RISE.mobile : RISE.desktop);
  const blur = c.desktop && (c.heights.get(el) ?? el.offsetHeight) < 600 && !el.hasAttribute("data-m-no-blur");
  const from: gsap.TweenVars = {
    y: rise,
    opacity: 0,
    scale: num(el, "mScale", 0.96),
    rotate: num(el, "mRotate", 0),
    willChange: "transform, opacity",
  };
  const to: gsap.TweenVars = { y: 0, opacity: 1, scale: 1, rotate: 0 };
  if (blur) {
    from.filter = "blur(8px)";
    to.filter = "blur(0px)";
  }
  const tween = gsap.fromTo(targets, from, {
    ...to,
    paused: true,
    duration: num(el, "mDur", DUR.slow),
    ease: el.dataset.mEase || EASE_OUT,
    delay: num(el, "mDelay", 0),
    stagger: STAGGER,
    onComplete() {
      settle(targets);
      gsap.set(targets, { clearProps: "transform,opacity,filter,willChange" });
    },
  });
  onceInView(c, el, 88, () => tween.play());
}

function pop(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const kids = kidsOf(el);
  const targets = kids.length ? kids : [el];
  const tween = gsap.fromTo(
    targets,
    { scale: num(el, "mScale", 0.6), opacity: 0, willChange: "transform, opacity" },
    {
      scale: 1,
      opacity: 1,
      paused: true,
      duration: 0.38,
      ease: el.dataset.mEase || "back.out(1.8)",
      stagger: 0.06,
      onComplete() {
        settle(targets);
        gsap.set(targets, { clearProps: "transform,opacity,willChange" });
      },
    },
  );
  onceInView(c, el, 90, () => tween.play());
}

function lines(c: Ctx, el: HTMLElement) {
  // Splitting measures layout, so it waits until the heading is within a screen
  // of the viewport (startPct 200 = one viewport below it) instead of running
  // for every heading at load. Sharing onceInView also gets the fast-fling sweep.
  onceInView(c, el, 200, () => splitLines(c, el));
}

function splitLines(c: Ctx, el: HTMLElement) {
  const { gsap, SplitText } = c.libs;
  let current: gsap.core.Tween | undefined;
  let revealed = false;
  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      current?.kill();
      current = gsap.fromTo(
        self.lines,
        { yPercent: 110 },
        { yPercent: 0, paused: true, duration: 0.95, stagger: 0.08, ease: EASE_OUT },
      );
      // A re-split after resize must not replay an entrance that already happened.
      if (revealed) current.progress(1);
      el.classList.add("m-split");
    },
  });
  onceInView(c, el, 88, () => {
    revealed = true;
    current?.play();
  });
  c.cleanups.push(() => {
    current?.kill();
    split.revert();
  });
}

function words(c: Ctx, el: HTMLElement) {
  const { gsap, SplitText } = c.libs;
  const split = SplitText.create(el, {
    type: "words",
    autoSplit: true,
    onSplit(self) {
      return gsap.fromTo(
        self.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          duration: 0.3,
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "top 40%", scrub: c.scrub },
        },
      );
    },
  });
  c.cleanups.push(() => split.revert());
}

/* --------------------------------------------------------- scrubbed panels */

/**
 * Shared by scrub-in and clip: values run on scroll progress. At the end the
 * inline transform and clip-path are removed (a clip-path would crop the card's
 * shadow) and `m-done` takes over from the CSS pre-state.
 */
function scrubbed(
  c: Ctx,
  el: HTMLElement,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
  start: string,
  end: string,
) {
  const { gsap } = c.libs;
  let settled = false;
  gsap.fromTo(el, from, {
    ...to,
    ease: "none",
    scrollTrigger: {
      // The untransformed parent: measuring the element itself would include its own offset.
      trigger: el.parentElement ?? el,
      start,
      end,
      scrub: c.scrub,
      onUpdate(self) {
        const done = self.progress >= 1;
        if (done === settled) return;
        settled = done;
        el.classList.toggle("m-done", done);
        if (done) gsap.set(el, { clearProps: "transform,clipPath,willChange" });
      },
    },
  });
}

const radiusOf = (el: HTMLElement) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 28;

function scrubIn(c: Ctx, el: HTMLElement) {
  scrubbed(
    c,
    el,
    {
      scale: 0.86,
      y: c.mobile ? 80 : 120,
      clipPath: "inset(0 6% round 60px)",
      transformOrigin: "50% 0%",
      willChange: "transform, clip-path",
    },
    { scale: 1, y: 0, clipPath: `inset(0 0% round ${radiusOf(el)}px)` },
    // On a phone the panel's top already peeks into the first viewport, so the
    // range starts there: at scroll 0 it sits near scale .90 / y 57 / inset 4%
    // and is fully in place once its top reaches 40% of the screen.
    c.mobile ? "top 87%" : "top 100%",
    c.mobile ? "top 40%" : "top 45%",
  );
}

function clip(c: Ctx, el: HTMLElement) {
  scrubbed(
    c,
    el,
    { clipPath: "inset(12% 8% round 40px)", willChange: "clip-path" },
    { clipPath: `inset(0% 0% round ${radiusOf(el)}px)` },
    "top 90%",
    "top 55%",
  );
}

function parallax(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const speed = num(el, "mSpeed", 8);
  const zoom = num(el, "mZoom", 1);
  if (zoom !== 1) gsap.set(el, { scale: zoom });
  gsap.fromTo(
    el,
    { yPercent: speed },
    {
      yPercent: -speed,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: c.scrub,
      },
    },
  );
}

function heroOut(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const panel = el.querySelector<HTMLElement>("[data-m-panel]");
  const content = el.querySelector<HTMLElement>("[data-m-content]");
  if (!panel) return;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: c.scrub },
  });
  tl.to(panel, { scale: 0.92, y: -60, "--h-radius": "44px", transformOrigin: "50% 100%" }, 0);
  if (content) {
    // The text recedes, the buttons never do: "Start a Project" must not look disabled.
    const fading = Array.from(content.children).filter((child) => !child.matches(".pill") && !child.querySelector(".pill"));
    tl.to(fading, { opacity: 0.35 }, 0);
  }
}

/* ---------------------------------------------------------------- counters */

const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

function counter(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  // The server-rendered final value stays in place until the element is on
  // screen, so nothing (a reader, the bottom edge of the screen) ever sees "0".
  const finalText = node.nodeValue ?? "";
  const tokens = Array.from(finalText.matchAll(NUMBER)).map((m) => {
    const raw = m[0];
    const plain = raw.replace(/,/g, "");
    const decimals = plain.includes(".") ? plain.length - plain.indexOf(".") - 1 : 0;
    return {
      index: m.index ?? 0,
      raw,
      value: parseFloat(plain),
      decimals,
      grouped: raw.includes(","),
      pad: /^0\d/.test(raw) ? raw.length : 0,
    };
  });
  if (!tokens.length) return;

  let lastWritten = finalText;
  let spoken: HTMLElement | null = null;
  const write = (p: number) => {
    let out = "";
    let cursor = 0;
    for (const t of tokens) {
      out += finalText.slice(cursor, t.index);
      const v = t.value * p;
      let text = t.grouped
        ? v.toLocaleString("en-IN", { minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals })
        : v.toFixed(t.decimals);
      if (t.pad) text = text.padStart(t.pad, "0");
      out += text;
      cursor = t.index + t.raw.length;
    }
    out += finalText.slice(cursor);
    lastWritten = out;
    node.nodeValue = out;
  };
  /** While counting: the animated number is hidden from assistive tech and a visually-hidden copy of the final text stands in. */
  const speak = (on: boolean) => {
    if (on && !spoken) {
      spoken = document.createElement("span");
      spoken.className = "sr-only";
      spoken.textContent = finalText;
      el.setAttribute("aria-hidden", "true");
      el.after(spoken);
    } else if (!on && spoken) {
      spoken.remove();
      spoken = null;
      el.removeAttribute("aria-hidden");
    }
  };
  const finish = () => {
    // React may have re-rendered a new value meanwhile: only restore our own text.
    if (node.nodeValue === lastWritten) node.nodeValue = finalText;
    speak(false);
  };

  const state = { p: 0 };
  const tween = gsap.to(state, {
    p: 1,
    paused: true,
    duration: DUR.xslow,
    ease: "power2.out",
    onStart: () => speak(true),
    onUpdate: () => write(state.p),
    onComplete: finish,
  });
  onceInView(c, el, 85, () => {
    speak(true);
    write(0);
    tween.play();
  });
  c.cleanups.push(() => {
    tween.kill();
    finish();
  });
}

/* ------------------------------------------------------------- case study */

function plateChips(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const chips = q(".plate-chip", el);
  const missing = chips.find((chip) => chip.classList.contains("is-missing"));
  gsap.set(chips, { transformPerspective: 600 });
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => gsap.set(chips, { clearProps: "transform,opacity,willChange" }),
  });
  tl.fromTo(
    chips,
    { rotationX: 70, opacity: 0, willChange: "transform, opacity" },
    { rotationX: 0, opacity: 1, duration: 0.52, stagger: 0.05, ease: EASE_OUT },
  );
  if (missing) {
    tl.to(missing, { keyframes: { x: [-6, 6, -4, 4, 0] }, duration: 0.36, ease: "power1.inOut" }, ">0.1");
    tl.add(() => missing.classList.add("is-flagged"), "<");
  }
  onceInView(c, el, 80, () => tl.play());
}

/* ------------------------------------------------------------ final CTA etc */

function flip(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const bg = el.querySelector<HTMLElement>("[data-m-flip-bg]");
  if (!bg) return;
  gsap.fromTo(
    bg,
    { opacity: 0 },
    {
      opacity: 1,
      // Front-loaded: the dark panel arrives quickly (about half opaque at 30% of
      // the range), and the text flips right there, where both colours have the
      // same contrast. That removes the long grey-on-grey middle.
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "top 30%",
        scrub: c.scrub,
        onUpdate: (self) => el.setAttribute("data-flip", String(self.progress >= 0.3)),
      },
    },
  );
}

function letters(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const glyphs = q<HTMLElement>("[data-m-letter]", el) as unknown as SVGTSpanElement[];
  if (!glyphs.length) return;
  const drop = num(el, "mDrop", 100);
  const offsets = glyphs.map(() => ({ v: drop }));
  const apply = () => {
    glyphs.forEach((glyph, i) => {
      // dy is relative to the previous glyph, which keeps one text chunk (centering stays intact).
      glyph.setAttribute("dy", String(offsets[i].v - (i ? offsets[i - 1].v : 0)));
    });
  };
  apply();
  gsap.to(offsets.map((o) => o), {
    v: 0,
    ease: "none",
    stagger: 0.04,
    duration: 0.4,
    onUpdate: apply,
    scrollTrigger: { trigger: el.closest("footer") ?? el, start: "top 100%", end: "bottom 100%", scrub: c.scrub },
  });
  c.cleanups.push(() => glyphs.forEach((g) => g.removeAttribute("dy")));
}

function progress(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  gsap.to(el, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: true },
  });
}

/** Mobile "Where we can help": cards stick, then each is pushed back by the next. */
function stack(c: Ctx, el: HTMLElement) {
  const { gsap } = c.libs;
  const cards = q("[data-m-stack-card]", el);
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    const veil = card.querySelector<HTMLElement>("[data-m-veil]");
    // The header is hidden while scrolling down, which is when this scrubs: cards stick at 16px + 14px each.
    const trigger = { trigger: next, start: "top 85%", end: `top ${16 + (i + 1) * 14}px`, scrub: c.scrub };
    gsap.to(card, { scale: 0.92, y: -12, ease: "none", transformOrigin: "50% 0%", scrollTrigger: trigger });
    if (veil) gsap.to(veil, { opacity: 0.16, ease: "none", scrollTrigger: trigger });
  });
}

/* ----------------------------------------------------------------- header */

function header(c: Ctx) {
  const { ScrollTrigger } = c.libs;
  const bar = document.querySelector<HTMLElement>(".ps-header");
  if (!bar) return;
  let lastY = 0;
  let up = 0;
  const set = (hidden: boolean) => {
    if (bar.dataset.hide !== String(hidden)) bar.dataset.hide = String(hidden);
  };
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const y = self.scroll();
      const busy = bar.querySelector('[aria-expanded="true"]') || bar.contains(document.activeElement);
      if (self.direction === 1) {
        up = 0;
        if (y > 120 && !busy) set(true);
      } else {
        up += lastY - y;
        if (up > 8 || y <= 120) set(false);
      }
      lastY = y;
    },
  });
  c.cleanups.push(() => delete bar.dataset.hide);
}

/* ---------------------------------------------------------------- marquee */

function marquee(c: Ctx, el: HTMLElement) {
  const { gsap, ScrollTrigger } = c.libs;
  const track = el.querySelector<HTMLElement>(".h-marquee__track");
  if (!track) return;
  const baseline = track.getAnimations()[0];
  const elapsed = baseline ? Number(baseline.currentTime ?? 0) / 1000 : 0;
  const duration = 32;
  track.style.animation = "none";
  const tween = gsap.to(track, { xPercent: -50, duration, ease: "none", repeat: -1 });
  tween.time(elapsed % duration);

  let sign = 1;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const next = self.direction === 1 ? 1 : -1;
      if (next < 0 && sign > 0 && tween.totalTime() < duration * 2) {
        tween.totalTime(duration * 100 + (tween.totalTime() % duration));
      }
      sign = next;
      const boost = 1 + Math.min(3, Math.abs(self.getVelocity()) / 800);
      gsap.killTweensOf(tween, "timeScale");
      tween.timeScale(sign * boost);
      gsap.to(tween, { timeScale: sign, duration: 0.6, ease: "power2.out", delay: 0.05 });
    },
  });
  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
  });
  c.cleanups.push(() => {
    tween.kill();
    track.style.animation = "";
    gsap.set(track, { clearProps: "transform" });
  });
}

/* ------------------------------------------------------- touch: active card */

function activeCards(c: Ctx) {
  const cards = q("[data-m-card]");
  if (!cards.length) return;
  const inside = new Set<HTMLElement>();
  let active: HTMLElement | null = null;
  const pick = () => {
    const mid = window.innerHeight / 2;
    let best: HTMLElement | null = null;
    let bestDist = Infinity;
    inside.forEach((card) => {
      const r = card.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = card;
      }
    });
    if (best === active) return;
    active?.removeAttribute("data-active");
    (best as HTMLElement | null)?.setAttribute("data-active", "true");
    active = best;
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? inside.add(e.target as HTMLElement) : inside.delete(e.target as HTMLElement)));
      pick();
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  cards.forEach((card) => io.observe(card));
  c.cleanups.push(() => {
    io.disconnect();
    active?.removeAttribute("data-active");
  });
}

/* -------------------------------------------------------- idle CTA shine */

function idleShine(c: Ctx) {
  const buttons = q(".pill--dark, .cta-shine, .h-sweep");
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => ((e.target as HTMLElement).dataset.shine = e.isIntersecting ? "on" : "off")),
  );
  buttons.forEach((b) => io.observe(b));
  c.cleanups.push(() => {
    io.disconnect();
    buttons.forEach((b) => delete b.dataset.shine);
  });
}

/* ------------------------------------------------------ press and ripple */

const PRESSABLE = ".pill, .cta-solid, .cta-ghost, .sc-tab, .hp-pill, .sc-toggle, .founder-linkedin, .mbar__call, .m-lift";

/**
 * One delegated, passive pointerdown. Press scales down in 90ms and springs back
 * on release; buttons also get a ripple from the touch point. The handler only
 * writes: geometry for the ripple is read in the next frame.
 */
function press(c: Ctx) {
  const { gsap } = c.libs;
  const root = document.documentElement;
  root.classList.add("m-press");

  const onDown = (event: PointerEvent) => {
    if (event.button > 0 || !(event.target instanceof Element)) return;
    const el = event.target.closest<HTMLElement>(PRESSABLE);
    if (!el) return;
    const card = el.classList.contains("m-lift");
    gsap.to(el, { scale: card ? 0.97 : 0.94, duration: 0.09, ease: "power2.out", overwrite: "auto" });

    const release = () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      gsap.to(el, { scale: 1, duration: 0.42, ease: "back.out(2.2)", clearProps: "scale", overwrite: "auto" });
    };
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });

    if (card) return;
    const { clientX, clientY } = event;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "m-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${clientX - rect.left - size / 2}px;top:${clientY - rect.top - size / 2}px`;
      if (el.classList.contains("pill--ghost") || el.classList.contains("cta-ghost")) ripple.dataset.tone = "ghost";
      el.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0.2, opacity: 0.6 },
        { scale: 2.4, opacity: 0, duration: 0.55, ease: "power2.out", onComplete: () => ripple.remove() },
      );
    });
  };

  document.addEventListener("pointerdown", onDown, { passive: true });
  c.cleanups.push(() => {
    document.removeEventListener("pointerdown", onDown);
    root.classList.remove("m-press");
    q(".m-ripple").forEach((r) => r.remove());
  });
}

/* ------------------------------------------------------- desktop extras */

function magnet(c: Ctx) {
  const { gsap } = c.libs;
  q(".pill--dark").filter((b) => !b.closest(".mbar")).forEach((btn) => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(gsap.utils.clamp(-8, 8, dx * 0.2));
      yTo(gsap.utils.clamp(-8, 8, dy * 0.3));
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    btn.addEventListener("pointermove", move, { passive: true });
    btn.addEventListener("pointerleave", leave);
    c.cleanups.push(() => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
      gsap.set(btn, { clearProps: "x,y" });
    });
  });
}

function tilt(c: Ctx) {
  const { gsap } = c.libs;
  q("[data-m-card]").forEach((card) => {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3.out" });
    const enter = () => gsap.set(card, { transformPerspective: 900 });
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(gsap.utils.clamp(-6, 6, px * 12));
      rx(gsap.utils.clamp(-6, 6, -py * 12));
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    card.addEventListener("pointerenter", enter, { passive: true });
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    c.cleanups.push(() => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      gsap.set(card, { clearProps: "transform" });
    });
  });
}

/* ------------------------------------------------------------------- build */

/**
 * Builds everything. `reduce` visitors never reach this: they get no motion
 * contexts at all, so content simply sits at its final state.
 */
export function buildMotion(libs: MotionLibs, opts: { entrances?: boolean } = {}): Cleanup {
  // When the page has already been shown (failsafe `motion-off`), entrance
  // builders must not run: they would hide content again.
  const entrances = opts.entrances !== false;
  const { gsap, ScrollTrigger } = libs;
  const mm = gsap.matchMedia();

  mm.add(MEDIA, (context) => {
    const cond = (context.conditions ?? {}) as Record<keyof typeof MEDIA, boolean>;
    if (cond.reduce) {
      // Live switch to reduced motion: drop the hidden pre-states.
      document.documentElement.classList.remove("js-motion");
      return;
    }
    const c: Ctx = {
      libs,
      mobile: !!cond.mobile,
      desktop: !!cond.desktop,
      fine: !!cond.fine,
      scrub: cond.mobile ? SCRUB.mobile : SCRUB.desktop,
      cleanups: [],
      once: new Map(),
      onceRun: new WeakMap(),
      pending: new Set(),
      heights: new Map(),
      alive: true,
    };
    c.cleanups.push(() => c.once.forEach((io) => io.disconnect()));
    const onScrollEnd = () => sweepOnce(c);
    ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
    c.cleanups.push(() => ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd));

    // Every builder is queued as its own small unit and run in time slices
    // (~6ms, then yield to the browser), so no long task ever blocks input.
    // `context.add` keeps the late work inside this context, so a breakpoint
    // change still reverts all of it.
    const queue: Array<() => void> = [];
    const each = (name: string, fn: (c: Ctx, el: HTMLElement) => void) =>
      byM(name, c).forEach((el) => queue.push(() => fn(c, el)));

    each("progress", progress);
    queue.push(() => header(c));
    each("scrub-out", heroOut);
    each("scrub-in", scrubIn);
    each("clip", clip);
    if (c.mobile) each("stack", stack);
    each("parallax", parallax);
    if (entrances) each("words", words);
    each("flip", flip);
    each("letters", letters);
    // Reads first, then writes: heights are measured once, before any entrance styles change.
    if (entrances) {
      queue.push(() => byM("reveal", c).forEach((el) => c.heights.set(el, el.offsetHeight)));
      each("reveal", reveal);
      each("pop", pop);
      each("plates", plateChips);
      each("counter", counter);
      each("lines", lines);
    }
    each("marquee", marquee);
    queue.push(
      () => press(c),
      () => idleShine(c),
      () => {
        if (c.fine) {
          magnet(c);
          tilt(c);
        } else {
          activeCards(c);
        }
      },
    );

    void (async () => {
      for (let i = 0; i < queue.length; ) {
        const t0 = performance.now();
        while (i < queue.length && performance.now() - t0 < 6) context.add(queue[i++]);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (!c.alive) return;
      }
      // No explicit ScrollTrigger.refresh(): every trigger above was created after
      // fonts settled and measures itself on creation, and a full refresh here was
      // the single longest task (~45ms). Resize and window load still refresh as usual.
      // Read by the proof script (web/scripts/motion-proof.mjs); harmless otherwise.
      document.documentElement.dataset.mTriggers = String(ScrollTrigger.getAll().length);
    })();

    return () => {
      c.alive = false;
      c.cleanups.splice(0).forEach((fn) => fn());
    };
  });

  return () => mm.revert();
}
