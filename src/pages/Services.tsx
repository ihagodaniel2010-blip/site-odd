import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { COMPANY_NAME } from "@/data/nav";
import { LOCAL_HOUSE_CLEANING_PAGES } from "@/data/localSeo";

const SERVICES = [
  { to: "/house-cleaning", title: "Standard House Cleaning", desc: "Routine top-to-bottom cleaning for the home you love." },
  { to: "/deep-cleaning", title: "Deep Cleaning", desc: "An intensive reset for kitchens, bathrooms and overlooked corners." },
  { to: "/move-in-move-out", title: "Move In / Move Out", desc: "Empty-home detail cleaning that hands the keys over spotless." },
  { to: "/recurring-cleaning", title: "Recurring Cleaning", desc: "Weekly, bi-weekly or monthly visits with a dedicated team." },
  { to: "/office-cleaning", title: "Office Cleaning", desc: "Quiet, after-hours cleaning that keeps your team productive." },
  { to: "/commercial-cleaning", title: "Commercial Cleaning", desc: "Clinics, retail and post-construction — built for higher standards." },
];

const Services = () => (
  <Layout>
    <Seo
      title="Cleaning Services in Lowell, MA | House, Deep, Recurring & Commercial"
      description="Compare house cleaning, deep cleaning, recurring cleaning, office cleaning, and commercial cleaning from Paiva Cleaners Co. across Lowell and nearby cities."
      canonicalPath="/services"
      keywords={[
        "cleaning services lowell ma",
        "deep cleaning lowell",
        "commercial cleaning lowell ma",
        "recurring cleaning chelmsford ma",
      ]}
    />
    <section className="bg-gradient-to-b from-secondary/60 to-background">
      <div className="container py-16 md:py-24 text-center max-w-3xl mx-auto space-y-5">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-surface shadow-soft">
          <Sparkles className="h-3.5 w-3.5" /> All Services
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-[1.05]">
          Cleaning, refined for every space.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          From cozy apartments to busy clinics, {COMPANY_NAME} crafts a cleaning plan around the way your space is actually used.
        </p>
      </div>
    </section>

    <section className="container py-12 md:py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group bg-surface rounded-2xl p-7 border border-border shadow-card hover:shadow-strong hover:-translate-y-0.5 transition-all"
          >
            <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
              {s.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-5">
              Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button asChild variant="hero" size="lg">
          <Link to="/contact">Book a Cleaning Today</Link>
        </Button>
      </div>

      <div className="mt-16 rounded-3xl border border-border bg-secondary/30 p-6 md:p-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Popular City Pages</p>
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-4xl">Explore local service pages for nearby cities</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            These pages help local visitors find the right cleaning service faster and give Google stronger city-specific relevance.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LOCAL_HOUSE_CLEANING_PAGES.map((page) => (
            <Link key={page.path} to={page.path} className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-strong">
              <h3 className="font-display text-lg font-semibold text-foreground">House Cleaning {page.city}, MA</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{page.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Services;
