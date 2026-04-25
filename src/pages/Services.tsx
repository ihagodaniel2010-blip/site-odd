import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { COMPANY_NAME } from "@/data/nav";

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
          <Link to="/contact">Get Estimate</Link>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Services;
