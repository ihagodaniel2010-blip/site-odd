import { useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PortfolioBeforeAfterCard } from "@/components/PortfolioBeforeAfterCard";
import { Button } from "@/components/ui/button";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";

const categoryFilters = [
  "All",
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Move In/Out",
  "Standard Cleaning",
] as const;

const roomFilters = [
  "All Rooms",
  "Kitchen",
  "Bathroom",
  "Living Room",
  "Bedroom",
  "Office",
  "Basement",
  "Other",
] as const;

const Portfolio = () => {
  const { items, loading, error } = usePortfolioItems();
  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryFilters)[number]>("All");
  const [roomFilter, setRoomFilter] = useState<(typeof roomFilters)[number]>("All Rooms");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = categoryFilter === "All" || item.category === categoryFilter;
      const roomMatch = roomFilter === "All Rooms" || item.room === roomFilter;
      return categoryMatch && roomMatch;
    });
  }, [items, categoryFilter, roomFilter]);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-secondary/60 to-background">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto space-y-5">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-surface shadow-soft">
            <Camera className="h-3.5 w-3.5" /> Portfolio
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-[1.05]">
            Our Cleaning Portfolio
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Real before-and-after transformations from homes and commercial spaces cleaned by our team.
          </p>
        </div>
      </section>

      <section className="container py-10 md:py-14 space-y-6 md:space-y-8">
        <div className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 md:flex-wrap">
              {categoryFilters.map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={categoryFilter === value ? "secondary" : "outline"}
                  className="whitespace-nowrap"
                  onClick={() => setCategoryFilter(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 md:flex-wrap">
              {roomFilters.map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={roomFilter === value ? "secondary" : "outline"}
                  className="whitespace-nowrap"
                  onClick={() => setRoomFilter(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Loading portfolio...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Could not load portfolio right now.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No portfolio items found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {filteredItems.map((item) => (
              <PortfolioBeforeAfterCard
                key={item.id}
                title={item.title}
                description={item.description}
                category={item.category}
                room={item.room}
                beforeImageUrl={item.before_image_url}
                afterImageUrl={item.after_image_url}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Portfolio;
