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

export default function CtaButton({
  href,
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
}: CtaButtonProps) {
  const base =
    "group relative inline-flex min-h-11 items-center justify-center gap-3 overflow-hidden rounded-[14px] font-semibold transition-[transform,box-shadow,background-color,border-color] duration-300";
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  const skin = variant === "solid" ? "cta-shine cta-solid" : "cta-ghost";

  return (
    <Link href={href} onClick={onClick} className={`${base} ${sizing} ${skin} ${className}`}>
      {children}
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/10">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-[3px]"
        >
          <path
            d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
