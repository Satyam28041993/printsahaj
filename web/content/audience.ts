/** Section 6 — who inside the converter this is for. */

export interface AudienceCard {
  role: string;
  benefit: string;
}

export interface AudienceContent {
  heading: string;
  cards: AudienceCard[];
}

export const audience: AudienceContent = {
  heading: "Who it is for",
  cards: [
    {
      role: "Pre-press",
      benefit:
        "See the specification, the artwork and the separations in one place before releasing plates.",
    },
    {
      role: "QC department",
      benefit:
        "A written record of what was compared, on every job, in the same format each time.",
    },
    {
      role: "Production managers",
      benefit:
        "Catch a plate shortfall at the vendor stage instead of at the press with the reel loaded.",
    },
    {
      role: "Owners",
      benefit:
        "Fewer rejected runs, and an audit trail you can put in front of a customer.",
    },
  ],
};
