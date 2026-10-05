import React from "react";
import DeviceFrame, { CroppedImage, type CropBox } from "./DeviceFrame";

/** One screen in a collage: a crop of an existing (already blurred) screenshot in a device frame. */
export type CollageLayer = {
  /** "/showcase/…webp" */
  src: string;
  /** Intrinsic size of src. */
  width: number;
  height: number;
  /** [x, y, w, h] in source pixels; the whole image when left out. */
  crop?: CropBox;
  fit?: "fill" | "card";
  /** Card corner radius in source pixels (card fit only). */
  radius?: number;
  variant: "laptop" | "browser" | "tablet" | "card" | "phone";
  /** Screen aspect (w / h) of this layer's frame. */
  ratio: number;
  /** Only the main (back) layer gets a meaningful alt; the others are decorative (""). */
  alt: string;
  /** Front layer only: "callout" is a wide zoom of a thin strip, bottom-right (bottom-centre on phones). */
  place?: "callout";
  /**
   * Back layer only: src is a full-page capture (width x height, much taller than the
   * screen). The screen shows its first screen at `ratio`; with motion allowed it slowly
   * scrolls down the whole page and back. Reduced motion: the first screen, still.
   */
  scroll?: boolean;
  /** Text in the browser bar's URL pill (back browser only). Defaults to the generic "app.printsahaj". */
  url?: string;
};

export type CollageLayout = "stack-right" | "stack-left" | "fan" | "site";

export type CollageSpec = {
  /** 0 = back (main), 1 = front, 2 = accent. */
  layers: readonly [CollageLayer, CollageLayer?, CollageLayer?];
  layout?: CollageLayout;
};

const ROLES = ["back", "front", "accent"] as const;

/**
 * A full-page capture in a screen of aspect `ratio`: the top (first screen) shows,
 * and the CSS animation in home.css (.dvf-scroll, motion allowed only) travels to
 * the bottom of the page and back. Transform-only, so it never shifts layout.
 */
function ScrollingPage({ layer, alt, eager }: { layer: CollageLayer; alt: string; eager: boolean }) {
  // translateY(%) is relative to the image's own height: travel = 1 - screenH / imgH.
  const travel = Math.max(0, 1 - layer.width / layer.ratio / layer.height) * 100;
  return (
    <span className="dvf-scroll" style={{ "--travel": `-${+travel.toFixed(3)}%` } as React.CSSProperties}>
      {/* Static export ships images unoptimized; next/image is not used on this site. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={layer.src}
        alt={alt}
        width={layer.width}
        height={layer.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        sizes="(min-width:1024px) 600px, 100vw"
      />
    </span>
  );
}

/**
 * Two or three screens layered into one mock-up: a large frame at the back, an
 * overlapping tablet / card / browser in front and an optional accent. The stage
 * has a fixed aspect-ratio and every layer is absolutely placed in it, so its
 * height is known before any image loads (no layout shift). Each layer's width
 * is capped by the stage height (home.css, .dvc__layer), so nothing pokes out.
 * The tilt is CSS-only at >= 1024px without reduced motion; flat everywhere else.
 */
export default function DeviceCollage({
  layers,
  label,
  caption,
  priority = false,
  layout = "stack-right",
}: CollageSpec & {
  /** figure aria-label */
  label: string;
  caption?: string;
  /** Eager-load the back image (first visible tab only). */
  priority?: boolean;
}) {
  return (
    <figure className="media-figure dvc-figure" aria-label={label}>
      <div className={`dvc dvc--${layout}`}>
        <div className="dvc__stage">
          {layers.map((layer, i) => {
            if (!layer) return null;
            const role = ROLES[i];
            const main = i === 0;
            return (
              <div
                key={role}
                className={`dvc__layer dvc__layer--${role} dvc__layer--${layer.variant}${layer.place ? ` dvc__layer--${layer.place}` : ""}`}
                style={{ "--r": layer.ratio } as React.CSSProperties}
                aria-hidden={main ? undefined : true}
              >
                <DeviceFrame variant={layer.variant} ratio={layer.ratio} tilt={false} url={layer.url}>
                  {layer.scroll ? (
                    <ScrollingPage layer={layer} alt={main ? layer.alt : ""} eager={main && priority} />
                  ) : (
                  <CroppedImage
                    src={layer.src}
                    alt={main ? layer.alt : ""}
                    width={layer.width}
                    height={layer.height}
                    crop={layer.crop}
                    ratio={layer.ratio}
                    fit={layer.fit}
                    radius={layer.radius}
                    loading={main && priority ? "eager" : "lazy"}
                    sizes={main ? "(min-width:1024px) 560px, 100vw" : undefined}
                  />
                  )}
                </DeviceFrame>
              </div>
            );
          })}
        </div>
      </div>
      {caption ? <figcaption className="media-caption">{caption}</figcaption> : null}
    </figure>
  );
}
