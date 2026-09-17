import React from "react";
import Link from "next/link";

export interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
}

/**
 * The one button style on the page. The arrow shifts 3px on hover — the entire
 * hover vocabulary, deliberately.
 */
export default function CtaButton({
  href,
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
}: CtaButtonProps) {
  const base =
    "group inline-flex items-center gap-2 rounded-full font-medium transition-colors duration-200";
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  const skin =
    variant === "solid"
      ? "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]"
      : "border border-hairline text-primary hover:border-[var(--border-hover)] hover:bg-surface";

  return (
    <Link href={href} onClick={onClick} className={`${base} ${sizing} ${skin} ${className}`}>
      {children}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-[3px]"
      >
        <path
          d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
