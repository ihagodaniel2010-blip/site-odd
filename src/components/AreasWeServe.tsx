import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "./SectionHeader";
import { useAreas } from "@/hooks/useAreas";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const ZONES = [
  { key: "regular", label: "Regular Service Area", color: "bg-success/15 text-success border-success/30" },
  { key: "extended", label: "Extended Service Area", color: "bg-primary/10 text-primary border-primary/30" },
  { key: "request", label: "By Request", color: "bg-warning/15 text-warning border-warning/30" },
] as const;

const MAP_SRC =
  "https://www.google.com/maps?q=30+3rd+Street,+Lowell,+MA&hl=en&z=11&output=embed";

export const AreasWeServe = ({ compact = false }: { compact?: boolean }) => {
  const { areas, loading } = useAreas();
  const { settings } = useSiteSettings();
  const [zip, setZip] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const companyName = settings.company_name || "Paiva Cleaners Co.";
  const addressFull = `${settings.address_line_1}, ${settings.address_line_2}`;

  const grouped = useMemo(() => {
    return {
      regular: areas.filter((a) => a.zone === "regular"),
      extended: areas.filter((a) => a.zone === "extended"),
      request: areas.filter((a) => a.zone === "request"),
    };
  }, [areas]);

  const visible = filter === "all" ? areas : areas.filter((a) => a.zone === filter);

  const handleZip = (e: React.FormEvent) => {
    e.preventDefault();
    // Forward to contact page with prefilled zip
    const url = `/contact?zip=${encodeURIComponent(zip)}`;
    window.location.href = url;
  };

  return (
    <section id="areas" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <SectionHeader
          eyebrow="Service Coverage"
          title="Areas We Serve"
          subtitle={`${companyName} proudly serves Lowell, MA and nearby communities within a flexible service radius.`}
        />

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 items-start">
          {/* Map card */}
          <div className="reveal bg-surface rounded-3xl shadow-strong border border-border overflow-hidden">
            <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-secondary/60 relative">
              <iframe
                title="Paiva Cleaners Co. service area map"
                src={MAP_SRC}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="p-6 md:p-7 space-y-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Headquartered in</p>
                  <p className="font-display text-lg font-semibold text-foreground">{addressFull}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Servicing greater Lowell, the Merrimack Valley, and parts of Southern New Hampshire.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleZip}
                className="flex flex-col sm:flex-row gap-3 bg-secondary/60 p-3 rounded-2xl border border-border"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    pattern="[0-9]{5}"
                    inputMode="numeric"
                    placeholder="Enter your ZIP code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-surface"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="h-12 rounded-xl whitespace-nowrap">
                  Check Availability <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Cities list */}
          <div className="reveal space-y-5">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-smooth",
                  filter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-foreground border-border hover:border-primary/40"
                )}
              >
                All Areas
              </button>
              {ZONES.map((z) => (
                <button
                  key={z.key}
                  onClick={() => setFilter(z.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-smooth",
                    filter === z.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-foreground border-border hover:border-primary/40"
                  )}
                >
                  {z.label}
                </button>
              ))}
            </div>

            <div className="bg-surface rounded-3xl shadow-card border border-border p-6 md:p-7">
              {loading ? (
                <div className="py-10 text-center text-muted-foreground text-sm">Loading service areas…</div>
              ) : (
                <div className="space-y-6">
                  {(filter === "all" || filter === "regular") && grouped.regular.length > 0 && (
                    <ZoneGroup title="Regular Service Area" items={grouped.regular} colorClass={ZONES[0].color} />
                  )}
                  {(filter === "all" || filter === "extended") && grouped.extended.length > 0 && (
                    <ZoneGroup title="Extended Service Area" items={grouped.extended} colorClass={ZONES[1].color} />
                  )}
                  {(filter === "all" || filter === "request") && grouped.request.length > 0 && (
                    <ZoneGroup title="By Request" items={grouped.request} colorClass={ZONES[2].color} />
                  )}
                </div>
              )}
            </div>

            {!compact && (
              <div className="text-center sm:text-left">
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Not sure? Request a quote <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const ZoneGroup = ({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: { id: string; city: string; state: string }[];
  colorClass: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <span className={cn("text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border", colorClass)}>
        {items.length} cities
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <span
          key={c.id}
          className="text-sm px-3 py-1.5 rounded-lg bg-secondary/70 border border-border text-foreground"
        >
          {c.city}, {c.state}
        </span>
      ))}
    </div>
  </div>
);
