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
  /** Front layer only: "center" sits bottom-centre, "wide" keeps the layout's spot; both are wider (thin strips). */
  place?: "center" | "wide";
};

export type CollageLayout = "stack-right" | "stack-left" | "fan";

export type CollageSpec = {
  /** 0 = back (main), 1 = front, 2 = accent. */
  layers: readonly [CollageLayer, CollageLayer?, CollageLayer?];
  layout?: CollageLayout;
};

const ROLES = ["back", "front", "accent"] as const;

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
                <DeviceFrame variant={layer.variant} ratio={layer.ratio} tilt={false}>
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
