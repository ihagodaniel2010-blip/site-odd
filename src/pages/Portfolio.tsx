import { Link } from "react-router-dom";
import { Camera, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { COMPANY_NAME } from "@/data/nav";

const Portfolio = () => (
  <Layout>
    <section className="bg-gradient-to-b from-secondary/60 to-background">
      <div className="container py-16 md:py-24 text-center max-w-3xl mx-auto space-y-5">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-surface shadow-soft">
          <Camera className="h-3.5 w-3.5" /> Portfolio
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-[1.05]">
          Recent transformations, room by room.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A growing gallery of before-and-after work from the {COMPANY_NAME} team. New galleries land here as we publish them.
        </p>
      </div>
    </section>

    <section className="container py-12 md:py-20">
      <div className="bg-surface rounded-3xl border border-border shadow-card p-12 md:p-20 text-center max-w-3xl mx-auto space-y-6">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
          Galleries coming soon
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          We're putting the finishing touches on our project gallery. In the meantime, request an estimate and we'll happily share recent work that matches your space.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild variant="hero" size="lg">
            <Link to="/contact">Get Estimate</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/areas-we-serve">See Areas We Serve</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Portfolio;
