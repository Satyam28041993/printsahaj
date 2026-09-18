import type { Metadata } from "next";
import CareerTimeline from "@/components/landing/CareerTimeline";
import FounderPhoto from "@/components/landing/FounderPhoto";
import PrintButton from "@/components/landing/PrintButton";
import { home } from "@content/home";
import { printSahajSite } from "@content/site";

export const metadata: Metadata = {
  title: "About",
  description: home.founder.description,
};

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1v3.6c0 .6-.5 1-1 1C10.6 21.2 2.8 13.4 2.8 3.2c0-.6.5-1 1-1H7.4c.6 0 1 .5 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export default function AboutPage() {
  const f = home.founder;

  return (
    <>
      {/* Company framing stays plain and short — the profile below is the point. */}
      <div className="mx-auto w-full max-w-3xl px-5 pt-16 sm:px-8 sm:pt-24">
        <p className="hero-eyebrow">About PrintSahaj</p>
        <p className="mt-5 text-body-lg text-muted">{printSahajSite.brand.positioning}</p>
        <p className="mt-3 text-body-lg text-muted">{printSahajSite.brand.specialization}</p>
        <p className="mt-6 font-display text-title font-medium text-primary">
          {printSahajSite.brand.philosophy}
        </p>
      </div>

      <section aria-labelledby="resume-heading" className="dots-section mt-16">
        <div className="star-field star-field--far" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl px-5 py-[clamp(56px,7vw,96px)] sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="hero-eyebrow">Founder profile</p>
              <h1 id="resume-heading" className="mt-5 font-display text-display-lg font-bold text-primary">
                {f.name}
              </h1>
              <p className="mt-2 text-sm text-muted">{f.role}</p>
            </div>
            <PrintButton />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]">
            <div>
              <FounderPhoto photo={f.photo} name={f.name} />
              <div className="mt-7 flex flex-col items-start gap-3">
                <a href={`tel:${f.contact.phone.replace(/\s+/g, "")}`} className="resume-contact">
                  <PhoneIcon />
                  {f.contact.phone}
                </a>
                <a href={`mailto:${f.contact.email}`} className="resume-contact">
                  <MailIcon />
                  {f.contact.email}
                </a>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-contact"
                >
                  <LinkedInIcon />
                  LinkedIn
                </a>
              </div>
            </div>

            <div>
              <p className="text-body-lg text-muted">{f.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {f.focus.map((item) => (
                  <li key={item} className="glow-card__tag">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-hairline pt-14">
            <CareerTimeline items={f.timeline} heading="Career history" />
            <p className="mt-8 max-w-2xl text-sm text-faint">{f.note}</p>
          </div>

          <div className="mt-16 grid gap-12 border-t border-hairline pt-14 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-display-sm font-bold text-primary">Education</h3>
              <ul className="mt-6 space-y-4">
                {f.education.map((item) => (
                  <li key={item.qualification} className="resume-edu-card timeline-item__card">
                    <p className="timeline-item__period">{item.period}</p>
                    <p className="mt-1.5 font-display font-bold text-primary">
                      {item.qualification}
                    </p>
                    <p className="text-sm text-muted">{item.institute}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-display-sm font-bold text-primary">Languages</h3>
              <ul className="mt-6 space-y-4">
                {f.languages.map((item) => (
                  <li key={item.name} className="resume-edu-card timeline-item__card">
                    <p className="font-display font-bold text-primary">{item.name}</p>
                    <p className="text-sm text-muted">{item.level}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
