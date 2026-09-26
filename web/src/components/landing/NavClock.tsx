"use client";

import React, { useEffect, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MS_PER_SECOND = 1000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Spelled out by hand rather than with Intl: some browsers now write "Sept",
 * and the header should read the same everywhere.
 */
function formatDate(now: Date): string {
  return `${DAYS[now.getDay()]}, ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function formatTime(now: Date): { clock: string; meridiem: string } {
  const hours = now.getHours();
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return {
    clock: `${pad(twelve)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    meridiem: hours < 12 ? "AM" : "PM",
  };
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Live date and time in the visitor's own zone. Nothing renders until the
 * browser has the time, so the server and client never disagree on a second.
 */
export default function NavClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // Wake just after each whole second so no second is ever skipped.
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(tick, MS_PER_SECOND - current.getMilliseconds() + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const time = now ? formatTime(now) : null;

  return (
    <div className="ps-nav__clock" aria-label="Current date and time" role="timer">
      <span className="ps-nav__clock-icon">
        <CalendarIcon />
      </span>
      <span className="ps-nav__clock-text">
        <span className="ps-nav__clock-date">{now ? formatDate(now) : " "}</span>
        <span className="ps-nav__clock-time">
          {time ? time.clock : "--:--:--"}
          <span className="ps-nav__clock-ampm">{time ? time.meridiem : ""}</span>
        </span>
      </span>
    </div>
  );
}
