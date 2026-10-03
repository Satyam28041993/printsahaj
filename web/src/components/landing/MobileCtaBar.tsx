"use client";

import React, { useEffect, useRef, useState } from "react";
import Pill from "./Pill";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/data/contact";

/**
 * Mobile-only sticky bar: "Start a Project" plus a call button. It slides in
 * once the hero has scrolled out of view. While it is up, <html> carries
 * `has-mbar` so the footer pads itself and the bar never covers footer text.
 */
export default function MobileCtaBar() {
  const [pastHero, setPastHero] = useState(false);
  const [typing, setTyping] = useState(false);
  const [onShowcase, setOnShowcase] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      // "After the hero": it has left through the top, not merely not arrived.
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Out of the way while a field is being filled in, and over the showcase card
  // (its calculator inputs sit at the bottom of the phone screen).
  useEffect(() => {
    const isField = (node: EventTarget | null) =>
      node instanceof HTMLElement && node.matches("input, select, textarea, [contenteditable='true']");
    const onIn = (event: FocusEvent) => setTyping(isField(event.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    const panel = document.getElementById("showcase-panel");
    let observer: IntersectionObserver | undefined;
    if (panel) {
      observer = new IntersectionObserver(([entry]) => setOnShowcase(entry.isIntersecting));
      observer.observe(panel);
    }
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      observer?.disconnect();
    };
  }, []);

  const show = pastHero && !typing && !onShowcase;

  // One arrow nudge the first time the bar slides in, never again.
  const nudged = useRef(false);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (!show || nudged.current) return;
    nudged.current = true;
    setNudge(true);
  }, [show]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-mbar", show);
    return () => document.documentElement.classList.remove("has-mbar");
  }, [show]);

  return (
    <div className="mbar" data-show={show} data-nudge={nudge} inert={!show ? true : undefined}>
      <Pill href={WHATSAPP_URL}>WhatsApp</Pill>
      <Pill href={PHONE_TEL} variant="ghost" call ariaLabel={`Call ${PHONE_DISPLAY}`}>
        Call
      </Pill>
    </div>
  );
}
