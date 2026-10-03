"use client";

import React, { useRef, useState } from "react";
import { PHONE_DISPLAY, whatsappUrl } from "@/data/contact";

const TOPICS = ["Website", "CRM", "ERP", "Automation", "Marketing", "Other"] as const;

interface Errors {
  name?: string;
  phone?: string;
  topic?: string;
}

/**
 * A short enquiry form with no backend: on submit it opens WhatsApp with the
 * details already typed into the message. Name, phone and topic are required.
 */
export default function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const name = get("name");
    const phone = get("phone");
    const company = get("company");
    const topic = get("topic");
    const message = get("message");

    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your name.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) next.phone = "Please enter a phone number with 10 digits.";
    if (!topic) next.topic = "Please choose what you want to improve.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const lines = [
      "Hi Satyam, I'd like a free consultation.",
      `Name: ${name}`,
      `Phone: ${phone}`,
      company ? `Business: ${company}` : null,
      `Want to improve: ${topic}`,
      message ? `Message: ${message}` : null,
    ].filter(Boolean);
    window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <form ref={formRef} className="enq" onSubmit={onSubmit} noValidate aria-label="Enquiry">
      <div className="enq__grid">
        <label className="enq__field">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "enq-name-err" : undefined} />
          {errors.name ? <em id="enq-name-err" role="alert">{errors.name}</em> : null}
        </label>
        <label className="enq__field">
          <span>Phone</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "enq-phone-err" : undefined} />
          {errors.phone ? <em id="enq-phone-err" role="alert">{errors.phone}</em> : null}
        </label>
        <label className="enq__field">
          <span>Business / Company</span>
          <input name="company" type="text" autoComplete="organization" />
        </label>
        <label className="enq__field">
          <span>What do you want to improve?</span>
          <select name="topic" defaultValue="" required aria-invalid={!!errors.topic} aria-describedby={errors.topic ? "enq-topic-err" : undefined}>
            <option value="" disabled>
              Choose one
            </option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic ? <em id="enq-topic-err" role="alert">{errors.topic}</em> : null}
        </label>
        <label className="enq__field enq__field--wide">
          <span>Message</span>
          <textarea name="message" rows={3} />
        </label>
      </div>
      <button type="submit" className="pill pill--dark enq__submit">
        Send on WhatsApp
      </button>
      <p className="enq__hint">Opens WhatsApp with your details filled in. Prefer a call? {PHONE_DISPLAY}</p>
    </form>
  );
}
