/** Section 5 — what the product deliberately does not do. A differentiator, not a disclaimer. */

export interface LimitsContent {
  heading: string;
  paragraphs: string[];
}

export const limits: LimitsContent = {
  heading: "What PrintSahaj does not do",
  paragraphs: [
    'PrintSahaj never says "approved". It reports findings and tells you where to look. The decision stays with the person who signs off — and now there is a record that they did.',
    "It does not check colour accuracy, trap or overprint intent, or design quality. Those need a human with experience. It checks the things a human cannot reliably check by reading.",
  ],
};
