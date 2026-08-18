/** Section 7 — frequently asked questions. */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  heading: string;
  items: FaqItem[];
}

export const faq: FaqContent = {
  heading: "Frequently asked questions",
  items: [
    {
      question: "Does my customer's artwork leave my premises?",
      answer:
        "That is the question every converter asks first, and it is the right one. PrintSahaj is being built so a job can be processed on a machine you control, inside your own network. Your customer's artwork is commercially sensitive and it stays yours.",
    },
    {
      question: "Does this replace my QC person?",
      answer:
        "No. It gives them a second pair of eyes on the things eyes are bad at — counting plates, matching colour names across three documents, reading a check digit. Judgement, colour and design still need the person who has been doing this for fifteen years.",
    },
    {
      question: "Will it work with my plate vendor's files?",
      answer:
        "It reads the separation PDFs your plate vendor already sends you. There is nothing for the vendor to install and nothing for them to change. If their files are unusual, send us a set and we will tell you honestly whether we can read them.",
    },
    {
      question: "Can I check jobs I have already printed?",
      answer:
        "Yes. Running past jobs is the fastest way to see whether this is worth anything to you. Take a job that went wrong, and one that went fine, and compare what comes back.",
    },
    {
      question: "What does it cost?",
      answer:
        "Pricing starts from ₹2,500 per month for unlimited jobs. Early access users help shape what gets built first, and the price is held for them.",
    },
  ],
};
