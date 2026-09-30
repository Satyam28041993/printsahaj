"use client";

import { useEffect } from "react";

/**
 * Renders nothing. Watches its parent <footer> and sets data-inview so the
 * footer's infinite animations (see motion.css) pause while it is off-screen.
 */
export default function FooterMotionGate() {
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        footer.dataset.inview = String(entry.isIntersecting);
      },
      { rootMargin: "80px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return null;
}
