"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./Section";
import { useReveal } from "@/lib/useReveal";
import { cta } from "@content/cta";
import { site } from "@content/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Early-access capture.
 *
 * There is no backend yet, so a valid address opens a pre-filled mail draft to
 * the team address rather than pretending to have stored it. Swap this handler
 * for a POST to a real endpoint when one exists.
 */
export default function FinalCta() {
  const ref = useReveal<HTMLDivElement>();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "sent">("idle");

  const whatsappHref = `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(
    site.contact.whatsappMessage,
  )}`;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setState("error");
      return;
    }
    const subject = encodeURIComponent("PrintSahaj early access");
    const body = encodeURIComponent(
      `Please add me to the PrintSahaj early access list.\n\nEmail: ${email.trim()}\nCompany: \nRole: \n`,
    );
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
    setState("sent");
  }

  return (
    <Section id="early-access" labelledBy="cta-heading" width="narrow" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <div ref={ref} className="relative text-center">
        <h2
          data-reveal
          id="cta-heading"
          className="font-display text-display-lg font-bold text-primary"
        >
          {cta.heading}
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-body-lg text-muted">
          {cta.sub}
        </p>

        <form
          data-reveal
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="early-access-email" className="sr-only">
            {cta.form.label}
          </label>
          <input
            id="early-access-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder={cta.form.placeholder}
            aria-invalid={state === "error"}
            aria-describedby={state === "error" ? "email-error" : "email-note"}
            className="min-w-0 flex-1 rounded-full border border-hairline bg-elevated px-5 py-3 text-primary placeholder:text-faint transition-colors duration-200 focus:border-[var(--accent-line)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 font-medium text-[var(--accent-contrast)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            {cta.form.submitLabel}
          </button>
        </form>

        <div className="mt-4 min-h-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {state === "error" && (
              <motion.p
                key="error"
                id="email-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-[var(--magenta)]"
              >
                {cta.form.errorMessage}
              </motion.p>
            )}
            {state === "sent" && (
              <motion.p
                key="sent"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-[var(--accent)]"
              >
                {cta.form.successMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p id="email-note" data-reveal className="mt-2 text-sm text-faint">
          {cta.form.note}
        </p>

        <p data-reveal className="mt-8">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm text-muted transition-colors duration-200 hover:border-[var(--border-hover)] hover:text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
              <path d="M8 0a8 8 0 00-6.9 12L0 16l4.1-1.1A8 8 0 108 0zm0 1.5a6.5 6.5 0 11-3.3 12.1l-.3-.2-2.4.6.6-2.3-.2-.3A6.5 6.5 0 018 1.5zm3.7 8.2c-.2-.1-1.2-.6-1.4-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.1-.4 0a5.3 5.3 0 01-2.6-2.3c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.3-.3-.3-.4-.3h-.4a.8.8 0 00-.6.3 2.3 2.3 0 00-.7 1.7 4 4 0 00.8 2.1 9 9 0 003.5 3c1.6.7 1.7.5 2 .4a2 2 0 001.3-.9c.2-.4.2-.8.1-.9z" />
            </svg>
            {site.contact.whatsappLabel}
          </a>
        </p>
      </div>
    </Section>
  );
}
