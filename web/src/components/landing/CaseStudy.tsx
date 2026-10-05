import React from "react";
import Link from "next/link";
import { Hash, Layers, ScanSearch } from "lucide-react";
import CtaButton from "./CtaButton";
import DeviceFrame, { CroppedImage } from "./DeviceFrame";
import { caseStudies, caseStudiesIntro, caseStudyHome } from "@content/caseStudies";
import { PRINTVERIFY_SLIDES, SLIDE_SCREEN_RATIO, SLIDE_SIZE } from "@content/productSlides";

const ICONS = { layers: Layers, hash: Hash, scan: ScanSearch } as const;

/** The job's screens: the vendor-plate job and the missing-plate separations. */
const JOB_SLIDES = ["/showcase/hd/printverify-1-job.webp", "/showcase/hd/printverify-4-separations.webp"]
  .map((src) => PRINTVERIFY_SLIDES.find((slide) => slide.src === src))
  .filter((slide) => slide !== undefined);

/**
 * PrintVerify case study: a hook, a question the visitor answers for themselves,
 * what PrintVerify checks, then the real varnish-plate job with its screens and
 * the engine's result. Two smaller cases follow.
 */
export default function CaseStudy() {
  const copy = caseStudyHome;
  const cards = copy.cards.map((card) => ({
    ...card,
    errorClass: caseStudies.find((study) => study.slug === card.slug)?.errorClass,
  }));

  return (
    <section aria-labelledby="case-heading" className="band-sunken relative px-5 py-[clamp(72px,9vw,140px)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
          <div>
            <p data-m="reveal" className="story-kicker">
              {copy.eyebrow}
            </p>
            <h2
              data-m="lines"
              id="case-heading"
              className="mt-5 max-w-3xl font-display text-display-lg font-bold text-primary text-balance"
            >
              {copy.headline}
            </h2>
            <p data-m="reveal" className="mt-5 max-w-2xl text-body-lg text-muted">
              {copy.sub}
            </p>
          </div>

          <div data-m="reveal" className="cs-question">
            <p className="font-display text-title font-semibold text-primary text-balance">{copy.question.text}</p>
            <p className="cs-question__answer">{copy.question.answer}</p>
          </div>
        </div>

        <ul data-m="reveal" className="mt-14 grid gap-4 md:grid-cols-3">
          {copy.points.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <li key={point.title} data-m-child className="cs-point">
                <span className="cs-point__icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-primary">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
              </li>
            );
          })}
        </ul>

        <div data-m="reveal" className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <CtaButton href={copy.cta.href}>{copy.cta.label}</CtaButton>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{copy.status}</span>
        </div>

        <div className="evidence-sheet mt-16 grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12">
          <div data-m="reveal">
            <h3 data-m-child className="font-display text-display-md font-semibold text-primary text-balance">
              {copy.job.heading}
            </h3>
            {copy.job.body.map((line) => (
              <p key={line} data-m-child className="mt-4 text-body-lg text-muted">
                {line}
              </p>
            ))}
            <p data-m-child className="cs-result" role="note" aria-label="PrintVerify result">
              <span aria-hidden="true" className="cs-result__prompt">
                {"›"}
              </span>
              {copy.job.result}
            </p>
            <p data-m-child className="mt-4 text-sm text-faint">
              {copy.job.note}
            </p>
          </div>

          <figure className="m-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {JOB_SLIDES.map((slide) => (
                <DeviceFrame key={slide.src} variant="browser" ratio={SLIDE_SCREEN_RATIO} tilt={false} className="dvf--compact">
                  <CroppedImage
                    src={slide.src}
                    alt={slide.title}
                    width={SLIDE_SIZE.width}
                    height={SLIDE_SIZE.height}
                    crop={slide.crop}
                    fit={slide.fit}
                    radius={slide.radius}
                    ratio={SLIDE_SCREEN_RATIO}
                    loading="lazy"
                  />
                </DeviceFrame>
              ))}
            </div>
            <figcaption className="media-caption">{copy.job.imagesNote}</figcaption>
          </figure>
        </div>

        {cards.length > 0 ? (
          <>
            <h3 data-m="reveal" className="mt-16 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              {copy.moreHeading}
            </h3>
            <ol data-m="reveal" className="mt-6 grid gap-8 lg:grid-cols-2">
              {cards.map((study) => (
                <li key={study.slug} data-m-child data-m-card className="border-t border-hairline pt-6">
                  <Link href={`${caseStudiesIntro.cta.href}#${study.slug}`} className="group block">
                    {study.errorClass ? (
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{study.errorClass}</p>
                    ) : null}
                    <h4 className="mt-3 font-display text-title font-semibold text-primary">{study.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{study.teaser}</p>
                    <p className="mt-4 text-sm text-faint">
                      Read it
                      <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        {" →"}
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        <div data-m="reveal" className="mt-10">
          <CtaButton href={caseStudiesIntro.cta.href} variant="ghost">
            {caseStudiesIntro.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
