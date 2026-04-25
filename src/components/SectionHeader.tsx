import { ReactNode } from "react";

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  children?: ReactNode;
}) => (
  <div
    className={`reveal max-w-3xl ${
      align === "center" ? "mx-auto text-center" : "text-left"
    } space-y-4 mb-12 md:mb-16`}
  >
    {eyebrow && (
      <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-secondary">
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground text-balance">
      {title}
    </h2>
    {subtitle && <p className="text-muted-foreground text-lg leading-relaxed">{subtitle}</p>}
    {children}
  </div>
);
