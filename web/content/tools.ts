/** Tools hub — the website lists tools; each tool lives in its own folder. */

export interface ToolCard {
  name: string;
  href: string;
  summary: string;
  status: string;
}

export interface ToolsContent {
  heading: string;
  intro: string;
  items: ToolCard[];
}

export const tools: ToolsContent = {
  heading: "Tools",
  intro:
    "PrintSahaj is the website. The tools sit on it. Each tool has its own home, so a new one can be added without mixing into the others.",
  items: [
    {
      name: "Artwork Verification",
      href: "/tools/artwork-verification",
      summary:
        "Compares the job sheet, the approved artwork, and the plate files, and shows where they disagree.",
      status: "Open the tool — it lives apart from this website.",
    },
  ],
};

export interface ArtworkToolPage {
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  note: string;
  openLabel: string;
  openHref: string;
  backLabel: string;
  backHref: string;
}

export const artworkTool: ArtworkToolPage = {
  name: "Artwork Verification",
  kicker: "A tool on PrintSahaj — not the website itself",
  summary:
    "This tool holds the job sheet, the approved artwork, and the plate files together and shows a person where they do not match. It does not say approved or rejected. That decision stays with the person who signs.",
  points: [
    "How many plates the job sheet asked for, versus how many plate pages arrived",
    "Colour names that do not match across the papers",
    "Text that is on the artwork but on no plate — or the other way around",
  ],
  note:
    "The tool runs on your computer, not inside this website. Start it, then open the button below. After print, add the machine photo and write a remark — the tool does not automatically grade the photo.",
  openLabel: "Open Artwork Verification",
  openHref: "http://127.0.0.1:8765",
  backLabel: "All tools",
  backHref: "/tools",
};
