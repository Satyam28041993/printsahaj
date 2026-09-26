import React from "react";

/**
 * Hero banner visual: the PrintSahaj ecosystem artwork cut into a circle with
 * a wavy rim, small colour lights blinking around it, and a slow float.
 * Everything is drawn in one 100×100 SVG so it scales with its column.
 */

const CENTER = 50;
const BASE_RADIUS = 45.5;
const WAVE_AMPLITUDE = 1.4;
const WAVES = 14;

function wavyCircle(radius: number, amplitude: number, waves: number): string {
  const steps = 360;
  const points: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius + amplitude * Math.sin(angle * waves);
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
}

const RIM_PATH = wavyCircle(BASE_RADIUS, WAVE_AMPLITUDE, WAVES);
const OUTER_PATH = wavyCircle(BASE_RADIUS + 2.2, WAVE_AMPLITUDE * 0.8, WAVES);

/** Brand CMYK plus the artwork's green and violet. */
const LIGHT_COLOURS = ["#22d3ee", "#f0abfc", "#facc15", "#4ade80", "#a78bfa", "#fb7185"];
const LIGHT_COUNT = 36;

const LIGHTS = Array.from({ length: LIGHT_COUNT }, (_, i) => {
  const angle = (i / LIGHT_COUNT) * Math.PI * 2;
  // Alternate two orbits so the lights sit loosely in the wave band.
  const r = BASE_RADIUS + 3.4 + (i % 2 === 0 ? 0 : 1.3) + Math.sin(i * 1.7) * 0.5;
  return {
    cx: (CENTER + r * Math.cos(angle)).toFixed(2),
    cy: (CENTER + r * Math.sin(angle)).toFixed(2),
    r: i % 3 === 0 ? 0.55 : 0.38,
    colour: LIGHT_COLOURS[i % LIGHT_COLOURS.length],
    duration: `${2.2 + ((i * 7) % 10) * 0.28}s`,
    delay: `${((i * 13) % 17) * 0.23}s`,
  };
});

export default function HeroOrb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="hero-orb">
      <div className="hero-orb__float">
        <svg viewBox="0 0 100 100" className="hero-orb__svg" role="img" aria-label={alt}>
          <defs>
            <clipPath id="hero-orb-clip">
              <path d={RIM_PATH} />
            </clipPath>
            <linearGradient id="hero-orb-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="35%" stopColor="#a78bfa" />
              <stop offset="65%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <filter id="hero-orb-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={OUTER_PATH} className="hero-orb__halo" stroke="url(#hero-orb-rim)" />

          <path d={RIM_PATH} className="hero-orb__backdrop" />

          <image
            href={src}
            x="7.5"
            y="7.5"
            width="85"
            height="85"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#hero-orb-clip)"
          />

          <path d={RIM_PATH} className="hero-orb__rim" stroke="url(#hero-orb-rim)" filter="url(#hero-orb-glow)" />

          <g className="hero-orb__lights" aria-hidden="true">
            {LIGHTS.map((light, i) => (
              <circle
                key={i}
                cx={light.cx}
                cy={light.cy}
                r={light.r}
                fill={light.colour}
                style={
                  {
                    "--light-colour": light.colour,
                    animationDuration: light.duration,
                    animationDelay: light.delay,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
