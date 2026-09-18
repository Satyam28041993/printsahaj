import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "About",
  description: printSahajSite.brand.positioning,
};

export default function AboutPage() {
  return (
    <PageIntro
      intent={["Business Solution", "Custom Project"]}
      title="About PrintSahaj"
      description={printSahajSite.brand.positioning}
    >
      <p className="mt-6 text-body-lg text-muted">{printSahajSite.brand.specialization}</p>
      <p className="mt-6 font-display text-title font-medium text-primary">
        {printSahajSite.brand.philosophy}
      </p>
      <div className="mt-12 flex flex-col gap-6 border-t border-hairline pt-8 sm:flex-row sm:items-start">
        {home.founder.photo && (
          <img
            src={home.founder.photo}
            alt={home.founder.name}
            className="h-28 w-28 shrink-0 rounded-2xl border border-hairline object-cover"
          />
        )}
        <div>
          <h2 className="font-display text-display-md font-semibold text-primary">
            {home.founder.name}
          </h2>
          <p className="mt-2 text-sm text-muted">{home.founder.role}</p>
          <p className="mt-4 text-body-lg text-muted">{home.founder.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {home.founder.focus.map((item) => (
              <li key={item} className="glow-card__tag">
                {item}
              </li>
            ))}
          </ul>
          <a
            href={home.founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="founder-linkedin mt-5 inline-flex"
          >
            Connect on LinkedIn
          </a>
        </div>
      </div>
    </PageIntro>
  );
}
