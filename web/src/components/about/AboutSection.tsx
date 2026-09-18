import React from "react";

export default function AboutSection({
  id,
  labelledBy,
  children,
  className = "",
}: {
  id?: string;
  labelledBy?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`about-section ${className}`}>
      <div className="about-shell">{children}</div>
    </section>
  );
}
