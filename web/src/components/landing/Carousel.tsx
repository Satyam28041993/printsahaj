"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useInViewState, usePrefersReducedMotion } from "@/lib/useHomeMotion";
import DeviceFrame from "./DeviceFrame";
import type { ProductSlide } from "@content/productSlides";

const INTERVAL_MS = 3500;
const SWIPE_PX = 40;

/**
 * Image carousel with a bold title and one line per slide. No dependencies.
 *  - Autoplays every 3.5 s while on screen; pauses on hover, focus, a hidden tab and
 *    with the pause button; never autoplays with prefers-reduced-motion (manual only).
 *  - Dots and prev/next buttons (labelled), swipe on touch (vertical scroll stays native).
 *  - The frame has a fixed aspect ratio from the image size, so nothing shifts;
 *    slides after the first are lazy-loaded.
 */
export default function Carousel({
  slides,
  width,
  height,
  label,
  className = "",
}: {
  slides: ProductSlide[];
  width: number;
  height: number;
  label: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewState<HTMLElement>("0px");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const playing = !reduced && inView && !hover && !focus && !hidden && !userPaused;
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, index, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    go(index + (dx < 0 ? 1 : -1));
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
  };

  return (
    <section
      ref={ref}
      className={`cr ${className}`}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
      onKeyDown={onKeyDown}
    >
      <DeviceFrame aspect={width / height} crop>
      <div
        className="cr__viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (touch.current = null)}
      >
        <div className="cr__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className="cr__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              {/* Static export ships images unoptimized; next/image is not used on this site. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.title}
                width={width}
                height={height}
                loading={i === 0 ? undefined : "lazy"}
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      </DeviceFrame>

      <div className="cr__caption" aria-live={playing ? "off" : "polite"}>
        <p className="cr__title">{slides[index].title}</p>
        <p className="cr__text">{slides[index].text}</p>
      </div>

      <div className="cr__controls">
        <button type="button" className="cr__btn" onClick={() => go(index - 1)} aria-label="Previous slide">
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="cr__dots" role="group" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              className="cr__dot"
              aria-label={`Show slide ${i + 1}: ${slide.title}`}
              aria-current={i === index}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="cr__btn" onClick={() => go(index + 1)} aria-label="Next slide">
          <ChevronRight size={18} aria-hidden />
        </button>
        {!reduced ? (
          <button
            type="button"
            className="cr__btn"
            onClick={() => setUserPaused((v) => !v)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
          >
            {userPaused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
          </button>
        ) : null}
      </div>
    </section>
  );
}
