import React from "react";
import { about } from "@content/about";

/**
 * Light A4 profile shown only when printing / saving as PDF.
 * Hidden on screen so the dark website is never what gets printed.
 */
export default function AboutPrintDocument() {
  const { company, products, founder } = about;
  const phoneHref = `tel:${founder.contact.phone.replace(/\s+/g, "")}`;

  return (
    <article className="about-print" aria-hidden="true">
      <section className="about-print__page">
        <header className="about-print__masthead">
          <p className="about-print__brand">PrintSahaj</p>
          <p>Company &amp; founder profile</p>
        </header>

        <p className="about-print__kicker">{company.eyebrow}</p>
        <h1>{company.headline}</h1>
        <p className="about-print__lede">{company.supporting}</p>
        <p className="about-print__philosophy">{company.philosophy}</p>
        <p className="about-print__process">
          {company.process.map((step) => step.label).join("  →  ")}
        </p>

        <div className="about-print__founder">
          {founder.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={founder.photo} alt="" width={140} height={140} />
          ) : null}
          <div>
            <p className="about-print__kicker">{founder.eyebrow}</p>
            <h2>{founder.name}</h2>
            <p className="about-print__role">{founder.role}</p>
            <p>{founder.summary}</p>
            <p>{founder.body}</p>
            <p className="about-print__quote">“{founder.quote}”</p>
          </div>
        </div>

        <ul className="about-print__contact">
          <li>
            Mobile: <a href={phoneHref}>{founder.contact.phone}</a>
          </li>
          <li>
            Email: <a href={`mailto:${founder.contact.email}`}>{founder.contact.email}</a>
          </li>
          <li>Address: {founder.contact.address}</li>
          <li>
            LinkedIn:{" "}
            <a href={founder.linkedin}>{founder.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</a>
          </li>
        </ul>

        <h2>What we build</h2>
        <ul className="about-print__products">
          <li>
            <strong>{products.featured.name}</strong>
            <span>{products.featured.status}</span> — {products.featured.description}
          </li>
          {products.supportingItems.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.status}</span> — {item.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="about-print__page">
        <h2>{founder.timelineHeading}</h2>
        <ol className="about-print__timeline">
          {founder.timeline.map((item) => (
            <li key={`${item.period}-${item.role}`}>
              <p className="about-print__date">{item.period}</p>
              <p>
                <strong>{item.role}</strong> · {item.org}
              </p>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>

        <h2>{founder.expertiseHeading}</h2>
        <ul className="about-print__expertise">
          {founder.expertise.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="about-print__split">
          <div>
            <h2>{founder.educationHeading}</h2>
            <ul className="about-print__cv">
              {founder.education.map((item) => (
                <li key={item.qualification}>
                  <strong>{item.qualification}</strong>
                  <p>
                    {item.period} · {item.institute}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{founder.languagesHeading}</h2>
            <ul className="about-print__cv">
              {founder.languages.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <p>{item.level}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </article>
  );
}
