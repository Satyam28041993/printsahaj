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
      name: "PrintVerify",
      href: "/tools/artwork-verification",
      summary:
        "Compares the job sheet, the approved artwork, and the plate files, and shows where they disagree.",
      status: "Open it online with a sign-in, or run it on your own computer",
    },
  ],
};

export interface ArtworkToolPage {
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  openLabel: string;
  openHref: string;
  openNote: string;
  note: string;
  startHeading: string;
  startSteps: string[];
  backLabel: string;
  backHref: string;
}

export const artworkTool: ArtworkToolPage = {
  name: "PrintVerify",
  kicker: "A tool on PrintSahaj — not the website itself",
  summary:
    "This tool holds the job sheet, the approved artwork, and the plate files together and shows a person where they do not match. It does not say approved or rejected. That decision stays with the person who signs.",
  points: [
    "How many plates the job sheet asked for, versus how many plate pages arrived",
    "Colour names that do not match across the papers",
    "Text that is on the artwork but on no plate — or the other way around",
  ],
  openLabel: "Open PrintVerify",
  openHref: "https://tool.printsahaj.com",
  openNote:
    "Opens the online desk in a new tab. It asks you to sign in, and only cleared addresses get in.",
  note:
    "Computer par chalane ka tarika neeche hai. Chrome ka “This site can’t be reached / refused to connect” isliye aata hai kyunki 127.0.0.1 is computer hai, website nahi. Website tool start nahi karti. Pehle start-artwork-verification.bat chalao, kali window khuli rakho — tabhi woh address khulega.",
  startHeading: "Ya apne computer par chalao",
  startSteps: [
    "Python 3.11+ install karo. Install ke time Add python.exe to PATH tick karo, phir computer restart karo",
    "Repo root par start-artwork-verification.bat double-click (ya tools/artwork-verification/start-tool.bat)",
    "Kali window khuli rehne do. Server ready hone ke baad browser khulega: http://127.0.0.1:8765",
    "Wahan job banao, PDFs daalo, match chalao. Window band ki to Chrome phir se refused to connect dikhayega",
  ],
  backLabel: "All tools",
  backHref: "/tools",
};
