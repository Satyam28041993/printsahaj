"use client";

import React, { useEffect, useState } from "react";
import { PhoneGlyph } from "./Pill";
import Pill from "./Pill";
import { printSahajSite } from "@content/site";

/**
 * Mobile-only sticky bar: "Start a Project" plus a call button. It slides in
 * once the hero has scrolled out of view. While it is up, <html> carries
 * `has-mbar` so the footer pads itself and the bar never covers footer text.
 */
export default function MobileCtaBar() {
  const [show, setShow] = useState(false);
  const { primary } = printSahajSite.ctas;
  const { callCta } = printSahajSite.nav;

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      // "After the hero": it has left through the top, not merely not arrived.
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("has-mbar", show);
    return () => document.documentElement.classList.remove("has-mbar");
  }, [show]);

  return (
    <div className="mbar" data-show={show} inert={!show ? true : undefined}>
      <Pill href={primary.href}>{primary.label}</Pill>
      <a href={callCta.href} className="mbar__call" aria-label={`${callCta.label}: ${callCta.number}`}>
        <PhoneGlyph size={20} />
      </a>
    </div>
  );
}
