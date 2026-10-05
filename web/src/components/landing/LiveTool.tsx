import Link from "next/link";
import { home } from "@content/home";

/**
 * The label-rate formula already runs in the showcase. This block only points
 * at the tools, so the homepage does not ask for the same numbers twice.
 */
export default function LiveTool() {
  const { toolsTeaser, ecosystem } = home;

  return (
    <section aria-labelledby="live-tool-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p data-m="reveal" className="story-kicker">Tools</p>
        <h2 id="live-tool-heading" data-m="lines" className="mt-5 max-w-xl font-display text-display-lg font-bold text-primary text-balance">
          {toolsTeaser.heading}
        </h2>
        <div data-m="reveal">
          <p data-m-child className="mt-5 max-w-xl text-body-lg text-muted">{toolsTeaser.supporting}</p>
          <Link data-m-child href={toolsTeaser.cta.href} className="founder-linkedin mt-8">
            {toolsTeaser.cta.label}
          </Link>
        </div>
        <ul data-m="reveal" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ecosystem.tools.map((tool) => (
            <li key={tool.href} data-m-child>
              <Link href={tool.href} data-m-card className="tool-directory">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{tool.tag}</span>
                <span className="mt-2 block font-display text-base font-semibold text-primary">{tool.name}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted">{tool.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
