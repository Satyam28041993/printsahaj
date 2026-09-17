"use client";

import { useEffect, useRef, useState } from "react";

interface ActivateOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Adds an in-view flag without hiding content. Used for glow/activation, not
 * entrance opacity — so a failed JS load still shows a complete page.
 */
export function useActivateOnView<T extends HTMLElement>(options: ActivateOptions = {}) {
  const { threshold = 0.4, rootMargin = "0px 0px -12% 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          if (once) observer.disconnect();
          return;
        }
        if (!once) setActive(false);
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, active };
}
