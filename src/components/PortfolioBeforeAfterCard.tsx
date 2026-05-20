import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type PortfolioBeforeAfterCardProps = {
  title: string;
  description?: string | null;
  category: string;
  room: string;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
};

const imageFallback = "https://placehold.co/1200x900?text=Portfolio";

export const PortfolioBeforeAfterCard = ({
  title,
  description,
  category,
  room,
  beforeImageUrl,
  afterImageUrl,
}: PortfolioBeforeAfterCardProps) => {
  const isMobile = useIsMobile();
  const [showAfterMobile, setShowAfterMobile] = useState(false);

  const beforeUrl = beforeImageUrl || afterImageUrl || imageFallback;
  const afterUrl = afterImageUrl || beforeImageUrl || imageFallback;

  const imageClasses = useMemo(
    () =>
      isMobile
        ? "absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
        : "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
    [isMobile]
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-card transition-all duration-300 hover:shadow-strong">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={beforeUrl}
          alt={`${title} before cleaning`}
          className={`${imageClasses} ${isMobile ? (showAfterMobile ? "opacity-0" : "opacity-100") : "opacity-100 group-hover:opacity-0"}`}
          loading="lazy"
          decoding="async"
          width={1200}
          height={900}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <img
          src={afterUrl}
          alt={`${title} after cleaning`}
          className={`${imageClasses} ${isMobile ? (showAfterMobile ? "opacity-100" : "opacity-0") : "opacity-0 group-hover:opacity-100"}`}
          loading="lazy"
          decoding="async"
          width={1200}
          height={900}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute left-0 top-0 rounded-br-lg bg-warning/90 px-3 py-2 text-xs font-semibold text-white">
          Before
        </div>
        <div
          className={`absolute right-0 top-0 rounded-bl-lg bg-success/90 px-3 py-2 text-xs font-semibold text-white ${
            isMobile
              ? showAfterMobile
                ? "opacity-100"
                : "opacity-0"
              : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          }`}
        >
          After
        </div>

        {isMobile && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 rounded-xl border border-border/70 bg-surface/95 p-1 backdrop-blur-sm">
            <Button
              type="button"
              size="sm"
              variant={showAfterMobile ? "ghost" : "secondary"}
              className="h-8 flex-1 text-xs"
              onClick={() => setShowAfterMobile(false)}
            >
              Before
            </Button>
            <Button
              type="button"
              size="sm"
              variant={showAfterMobile ? "secondary" : "ghost"}
              className="h-8 flex-1 text-xs"
              onClick={() => setShowAfterMobile(true)}
            >
              After
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
            {category}
          </span>
          <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
            {room}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description || "Professional before/after results from our cleaning team."}
        </p>
      </div>
    </article>
  );
};
