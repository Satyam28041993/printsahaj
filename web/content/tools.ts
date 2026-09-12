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
      status: "Runs on your computer. Double-click start-tool.bat",
    },
  ],
};

export interface ArtworkToolPage {
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  note: string;
  startHeading: string;
  startSteps: string[];
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
    "This page is only a door. The tool does not live on the website. A button to 127.0.0.1 will fail until the tool is started on this same computer.",
  startHeading: "Computer par kaise chalao",
  startSteps: [
    "Folder tools/artwork-verification kholo",
    "start-tool.bat par double-click (Windows). Pehli baar Python maang sakta hai — PATH mein add karna",
    "Do second baad browser khulega: http://127.0.0.1:8765",
    "Wahan job banao, PDFs daalo, match chalao. Jo window khuli hai use band mat karna",
  ],
  backLabel: "All tools",
  backHref: "/tools",
};
