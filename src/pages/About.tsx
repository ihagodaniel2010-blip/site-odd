import { Award, Heart, Shield, Sparkles, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CtaBanner } from "@/components/CtaBanner";
import { SectionHeader } from "@/components/SectionHeader";
import img from "@/assets/premium-spaces.jpg";

const stats = [
  { v: "1,200+", l: "Happy clients" },
  { v: "98%", l: "Satisfaction rate" },
  { v: "12 yrs", l: "Of experience" },
  { v: "60-pt", l: "Cleaning checklist" },
];

const values = [
  { icon: Heart, title: "Care", text: "We treat every home and office like our own." },
  { icon: Shield, title: "Trust", text: "Vetted teams, insured service, transparent pricing." },
  { icon: Sparkles, title: "Quality", text: "Detail-focused work measured against a real checklist." },
  { icon: Users, title: "Consistency", text: "Same team, same standards — every single visit." },
];

const About = () => (
  <Layout>
    <section className="container py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div className="reveal-left space-y-6">
        <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-secondary">
          About Us
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground text-balance leading-[1.05]">
          A cleaning company built on care, trust, and consistency.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Paiva Cleaners Co. started with a simple idea: cleaning should feel personal, dependable, and stress-free. Today, our trained teams help families and businesses across the region reclaim hours of their week — without sacrificing quality.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {stats.map((s) => (
            <div key={s.l} className="bg-surface rounded-xl p-4 border border-border shadow-card">
              <p className="font-display text-2xl font-bold text-primary">{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="reveal-right">
        <div className="rounded-3xl overflow-hidden shadow-strong aspect-[4/5]">
          <img src={img} alt="Clean modern bedroom" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>

    <section className="bg-secondary/40 py-20">
      <div className="container">
        <SectionHeader eyebrow="Our Values" title="What Drives Every Visit" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="reveal bg-surface rounded-2xl p-7 shadow-card hover-lift border border-border/60">
              <span className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white mb-5">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="container py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="reveal-left space-y-5">
          <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-secondary">
            Our Story
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground">
            More than a cleaning service.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            We've spent over a decade refining how a great cleaning visit should feel. Our cleaners are trained to a 60-point standard, paid fairly, and supported by managers who care. The result is a service families and businesses actually look forward to.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From small apartments to multi-floor offices, we bring the same attention to detail to every space we clean.
          </p>
        </div>
        <div className="reveal-right grid gap-4">
          {[
            { icon: Award, title: "Trained to a 60-point standard", text: "Every cleaner completes our hands-on training program before the first visit." },
            { icon: Shield, title: "Fully insured and bonded", text: "Your space, your stuff, and your peace of mind are protected." },
            { icon: Heart, title: "Built on long-term relationships", text: "Most of our clients have been with us for 2+ years." },
          ].map((b) => (
            <div key={b.title} className="bg-surface rounded-2xl p-6 border border-border shadow-card flex gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                <b.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CtaBanner />
  </Layout>
);

export default About;
