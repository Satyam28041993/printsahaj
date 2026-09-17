import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { home } from "@content/home";

export const metadata: Metadata = {
  title: "Work",
  description: home.selectedWork.supporting,
};

export default function WorkPage() {
  const items = home.selectedWork.items.filter((item) => item.public);

  return (
    <PageIntro
      intent={["Product", "Custom Project"]}
      title="Work"
      description={home.selectedWork.supporting}
    >
      <ul className="mt-10 space-y-4">
        {items.map((item) => {
          const body = (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {item.category}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-title font-semibold text-primary">{item.name}</h2>
                {item.status ? (
                  <span className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {item.status}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
              ) : null}
            </>
          );

          return (
            <li key={item.name}>
              {item.url ? (
                <Link href={item.url} className="surface-card block rounded-2xl p-6">
                  {body}
                </Link>
              ) : (
                <div className="surface-card rounded-2xl p-6">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </PageIntro>
  );
}
