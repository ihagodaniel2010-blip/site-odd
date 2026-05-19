import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Layout } from "./Layout";
import { Button } from "./ui/button";
import { CtaBanner } from "./CtaBanner";
import { FaqSection } from "./FaqSection";
import { SectionHeader } from "./SectionHeader";

export type ServicePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  included: string[];
  benefits: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
};

export const ServicePageTemplate = (p: ServicePageProps) => (
  <Layout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background">
      <div className="container py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="reveal-left space-y-6">
          <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-surface shadow-soft">
            {p.eyebrow}
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground text-balance leading-[1.05]">
            {p.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">{p.description}</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Insured & bonded",
              "Trusted by local homeowners",
              "Fast response times",
            ].map((item) => (
              <span key={item} className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-soft">
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Book a Cleaning Today <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/house-cleaning">View All Services</Link>
            </Button>
          </div>
        </div>
        <div className="reveal-right relative">
          <div className="relative rounded-2xl overflow-hidden shadow-strong aspect-[4/3]">
            <img
              src={p.heroImage}
              alt={p.title}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              width={1400}
              height={1050}
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 md:-left-8 bg-surface rounded-2xl shadow-float p-5 max-w-[240px] animate-float">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Trusted</p>
            <p className="font-semibold text-foreground">Insured & background-checked teams</p>
          </div>
        </div>
      </div>
    </section>

    {/* Included */}
    <section className="container py-20">
      <SectionHeader eyebrow="What's Included" title="Every Detail, Covered" subtitle="Each visit follows a clear, room-by-room checklist so nothing gets missed." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {p.included.map((item) => (
          <div key={item} className="reveal flex items-start gap-3 bg-surface rounded-xl p-5 border border-border shadow-card hover-lift">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-primary shrink-0">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="font-medium text-foreground pt-1">{item}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Benefits */}
    <section className="bg-secondary/40 py-20">
      <div className="container">
        <SectionHeader eyebrow="Benefits" title="Why This Service Works" />
        <div className="grid md:grid-cols-3 gap-6">
          {p.benefits.map((b) => (
            <div key={b.title} className="reveal bg-surface rounded-2xl p-7 shadow-card hover-lift">
              <span className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white mb-5">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Process */}
    <section className="container py-20">
      <SectionHeader eyebrow="Process" title="Simple, From Start To Finish" />
      <div className="grid md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-border" aria-hidden />
        {p.steps.map((s, i) => (
          <div key={s.title} className="reveal relative bg-surface rounded-2xl p-7 text-center shadow-card hover-lift">
            <span className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-full gradient-primary text-white text-xl font-display font-bold shadow-float mb-5">
              {i + 1}
            </span>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>

    <FaqSection items={p.faqs} />
    <CtaBanner />
  </Layout>
);
