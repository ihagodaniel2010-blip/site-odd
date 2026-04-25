import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Home as HomeIcon,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CtaBanner } from "@/components/CtaBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { AreasWeServe } from "@/components/AreasWeServe";
import heroKitchen from "@/assets/hero-kitchen.jpg";
import imgHouse from "@/assets/service-house.jpg";
import imgDeep from "@/assets/service-deep.jpg";
import imgMove from "@/assets/service-move.jpg";
import imgCommercial from "@/assets/service-commercial.jpg";
import imgOffice from "@/assets/service-office.jpg";
import imgRecurring from "@/assets/service-recurring.jpg";
import imgPremium from "@/assets/premium-spaces.jpg";

const trustBadges = [
  { icon: Shield, label: "Trained Cleaners" },
  { icon: Calendar, label: "Flexible Scheduling" },
  { icon: Heart, label: "Satisfaction Focused" },
];

const services = [
  { title: "House Cleaning", text: "Routine residential cleans that keep every room fresh.", icon: HomeIcon, img: imgHouse, to: "/house-cleaning" },
  { title: "Deep Cleaning", text: "A heavy-duty top-to-bottom reset for your home.", icon: Sparkles, img: imgDeep, to: "/deep-cleaning" },
  { title: "Move In / Move Out", text: "Empty home cleans built for landlords and tenants.", icon: Truck, img: imgMove, to: "/move-in-move-out" },
  { title: "Commercial Cleaning", text: "Offices, clinics, retail, and pet shops.", icon: Wrench, img: imgCommercial, to: "/commercial-cleaning" },
  { title: "Office Cleaning", text: "Workspaces that look and feel professional.", icon: Users, img: imgOffice, to: "/office-cleaning" },
  { title: "Recurring Cleaning", text: "Weekly, bi-weekly, or monthly — on your schedule.", icon: RefreshCw, img: imgRecurring, to: "/recurring-cleaning" },
];

const benefits = [
  { icon: Clock, title: "More time for family", text: "Get hours of your week back. We handle the cleaning so you don't have to." },
  { icon: Heart, title: "A cleaner, healthier space", text: "Detailed dusting and surface care that actually makes your home feel better." },
  { icon: RefreshCw, title: "Reliable recurring service", text: "Same trusted teams, every visit. Easy to reschedule whenever life happens." },
];

const whyUs = [
  { icon: Shield, title: "Trained and reliable cleaners", text: "Every team member is background-checked and trained to our 60-point standard." },
  { icon: Calendar, title: "Flexible scheduling", text: "Mornings, afternoons, weekends — pick what fits your week." },
  { icon: Sparkles, title: "Supplies and equipment handled", text: "We bring everything we need, including eco-friendly product options." },
  { icon: HomeIcon, title: "Residential and commercial", text: "From small apartments to multi-floor offices, one trusted team." },
  { icon: Users, title: "Clear communication", text: "Live updates, easy rescheduling, and a real human you can call." },
  { icon: CheckCircle2, title: "Quality-focused cleaning", text: "Every visit ends with a checklist review to ensure nothing is missed." },
];

const testimonials = [
  { quote: "Very professional and easy to schedule. The house looked amazing after the first visit. We've been on a bi-weekly plan ever since.", name: "Marina C.", city: "Austin, TX" },
  { quote: "Our office finally feels truly clean. The team is consistent, quiet during work hours, and pays attention to the small details.", name: "Daniel R.", city: "Round Rock, TX" },
  { quote: "I booked a move-out clean and got my full deposit back. Fast booking, clear pricing, no surprises.", name: "Priya S.", city: "Cedar Park, TX" },
];

const Home = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-soft" />
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl -z-10" aria-hidden />
        <div className="container py-12 md:py-20 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div className="space-y-7 animate-fade-up">
            <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1.5 rounded-full bg-surface shadow-soft">
              Trusted Cleaning Services
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-[1.02] text-balance">
              Professional Cleaning Services For A{" "}
              <span className="bg-gradient-to-r from-primary to-primary-strong bg-clip-text text-transparent">
                Healthier Home
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Spend less time cleaning and more time enjoying your home. Reliable residential and commercial cleaning designed around your schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact">Get An Estimate <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/house-cleaning">View Services</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-left">
            <div className="relative rounded-3xl overflow-hidden shadow-strong aspect-[4/5] sm:aspect-[5/6]">
              <img src={heroKitchen} alt="Bright clean modern kitchen" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-3 sm:-left-8 top-1/4 bg-surface rounded-2xl shadow-float p-4 sm:p-5 max-w-[230px] animate-float">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Easy</p>
                  <p className="font-semibold text-sm text-foreground leading-tight">Request an estimate in minutes</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 sm:-right-6 bottom-8 bg-surface rounded-2xl shadow-float p-4 max-w-[210px] animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">Residential &amp; Commercial</p>
              <p className="text-xs text-muted-foreground">Trusted by 1,200+ clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ESTIMATE FORM */}
      <section className="container -mt-4 md:-mt-12 mb-20 relative z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "/contact";
          }}
          className="reveal bg-surface rounded-2xl shadow-strong border border-border p-6 md:p-8"
        >
          <div className="mb-6 text-center md:text-left">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
              Get Your Free Cleaning Estimate
            </h2>
            <p className="text-muted-foreground mt-1">Takes less than a minute. No card required.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input placeholder="ZIP Code" className="h-12 rounded-xl" />
            <Select>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Service Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House Cleaning</SelectItem>
                <SelectItem value="deep">Deep Cleaning</SelectItem>
                <SelectItem value="move">Move In / Move Out</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Home Size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1-2">1–2 Bedrooms</SelectItem>
                <SelectItem value="3-4">3–4 Bedrooms</SelectItem>
                <SelectItem value="5+">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one">One-Time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="hero" size="lg" className="h-12 rounded-xl">
              Start Estimate <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </section>

      {/* EMOTIONAL BENEFIT */}
      <section className="container py-12 md:py-20">
        <SectionHeader
          eyebrow="Why It Matters"
          title="More Free Time. Less Cleaning Stress."
          subtitle="Your home should feel fresh, calm, and ready for your life. Our cleaning services help you save time while keeping every room looking its best."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="reveal bg-surface rounded-2xl p-7 shadow-card hover-lift border border-border/60">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary mb-5">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <SectionHeader
            eyebrow="Services"
            title="Cleaning Services Built Around Your Needs"
            subtitle="From a one-time deep clean to ongoing weekly visits, choose the right service for your space."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Link
                to={s.to}
                key={s.title}
                className="reveal group bg-surface rounded-2xl overflow-hidden shadow-card hover-lift border border-border/60 flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary -mt-12 relative shadow-soft mb-4">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{s.text}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20">
        <SectionHeader eyebrow="How It Works" title="Three Steps To A Cleaner Space" />
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px border-t-2 border-dashed border-border" aria-hidden />
          {[
            { title: "Request an estimate", text: "Share a few quick details about your space and schedule." },
            { title: "Choose your cleaning schedule", text: "Pick a date, frequency, and any special requests." },
            { title: "Enjoy a cleaner space", text: "Our trained team arrives on time and gets to work." },
          ].map((s, i) => (
            <div key={s.title} className="reveal relative bg-surface rounded-2xl p-7 text-center shadow-card hover-lift border border-border/60">
              <span className="relative z-10 mx-auto grid h-20 w-20 place-items-center rounded-full gradient-primary text-white text-2xl font-display font-bold shadow-float mb-5">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <SectionHeader eyebrow="Difference" title="Why Customers Choose Us" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((w) => (
              <div key={w.title} className="reveal bg-surface rounded-2xl p-6 shadow-card hover-lift border border-border/60 flex gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                  <w.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM SPLIT */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-left order-2 lg:order-1 relative">
            <div className="rounded-3xl overflow-hidden shadow-strong aspect-[4/5]">
              <img src={imgPremium} alt="Bright clean bedroom" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-6 -right-4 bg-surface rounded-2xl shadow-float p-5 animate-float">
              <p className="font-display text-3xl font-semibold text-primary">98%</p>
              <p className="text-xs text-muted-foreground">Client satisfaction</p>
            </div>
          </div>
          <div className="reveal-right order-1 lg:order-2 space-y-6">
            <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-secondary">
              Spaces We Serve
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground text-balance">
              Designed For Homes, Apartments, Offices And Clinics
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              From cozy studios to multi-floor commercial spaces, our cleaning protocols adapt to the size, traffic, and standards of your space.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-2">
              {["Apartments", "Single-family homes", "Small offices", "Clinics", "Pet shops", "Retail spaces"].map((it) => (
                <li key={it} className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border shadow-card">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-foreground">{it}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Get An Estimate <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <SectionHeader eyebrow="Testimonials" title="What Customers Are Saying" />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="reveal bg-surface rounded-2xl p-7 shadow-card hover-lift border border-border/60 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AreasWeServe />
      <CtaBanner />
    </Layout>
  );
};

export default Home;
