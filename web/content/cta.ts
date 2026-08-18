/** Section 8 — closing call to action and email capture. */

export interface CtaContent {
  heading: string;
  sub: string;
  form: {
    label: string;
    placeholder: string;
    submitLabel: string;
    /** Shown after a successful submit. */
    successMessage: string;
    /** Shown when the address does not look valid. */
    errorMessage: string;
    note: string;
  };
}

export const cta: CtaContent = {
  heading: "Printing industry ka kaam sahaj.",
  sub: "Leave your email and we will get in touch when early access opens. Or message us directly — we answer faster on WhatsApp.",
  form: {
    label: "Work email",
    placeholder: "you@yourcompany.com",
    submitLabel: "Request early access",
    successMessage: "Thank you. We will be in touch.",
    errorMessage: "Please enter a valid email address.",
    note: "We will only write to you about early access. No marketing lists.",
  },
};
