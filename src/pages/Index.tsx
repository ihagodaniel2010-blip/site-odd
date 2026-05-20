import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
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
import { PortfolioBeforeAfterCard } from "@/components/PortfolioBeforeAfterCard";
import { Seo } from "@/components/Seo";
import { SectionHeader } from "@/components/SectionHeader";
import { AreasWeServe } from "@/components/AreasWeServe";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";
import { usePricingRules } from "@/hooks/usePricingRules";
import { useReviews } from "@/hooks/useReviews";
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
  {
    quote:
      "Very professional and easy to schedule. The house looked amazing after the first visit. We've been on a bi-weekly plan ever since.",
    name: "Marina C.",
    city: "Lowell, MA",
    rating: 5,
    featured: true,
  },
  {
    quote:
      "Our office finally feels truly clean. The team is consistent, quiet during work hours, and pays attention to the small details.",
    name: "Daniel R.",
    city: "Chelmsford, MA",
    rating: 5,
    featured: false,
  },
  {
    quote:
      "I booked a move-out clean and got my full deposit back. Fast booking, clear pricing, no surprises.",
    name: "Priya S.",
    city: "Dracut, MA",
    rating: 5,
    featured: true,
  },
];

const HOME_SEO_KEYWORDS = [
  "house cleaning lowell ma",
  "cleaners chelmsford ma",
  "cleaning service dracut ma",
  "book house cleaning lowell",
  "instant cleaning quote",
];

const HOME_SEO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Paiva Cleaners Co.",
  description: "House and commercial cleaning in Lowell, MA and nearby communities.",
  telephone: "(978) 319-8939",
  areaServed: ["Lowell", "Chelmsford", "Dracut", "Tewksbury", "Billerica", "Westford"],
};

const Home = () => {
  const navigate = useNavigate();
  const { pricing } = usePricingRules();
  const { items: featuredPortfolioItems } = usePortfolioItems({ featuredOnly: true });
  const { reviews: publicReviews } = useReviews({ featuredOnly: true });
  const mobileTestimonialsRef = useRef<HTMLDivElement | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [quickQuote, setQuickQuote] = useState({
    zip: "",
    service: "standard",
    size: "1",
    frequency: "one_time",
  });

  const onQuickQuoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = new URLSearchParams();
    if (quickQuote.zip.trim()) query.set("zip", quickQuote.zip.trim());
    if (quickQuote.service) query.set("service", quickQuote.service);
    if (quickQuote.size) query.set("size", quickQuote.size);
    if (quickQuote.frequency) query.set("frequency", quickQuote.frequency);

    navigate(`/contact?${query.toString()}`);
  };

  const testimonialItems =
    publicReviews.length > 0
      ? publicReviews.slice(0, 3).map((review) => ({
          quote: review.review_text,
          name: review.customer_name,
          city: "Lowell, MA",
          rating: Math.max(1, Math.min(5, review.rating || 5)),
          featured: review.is_featured,
        }))
      : testimonials;

  const transformationItems =
    featuredPortfolioItems.length > 0
      ? featuredPortfolioItems.slice(0, 3)
      : [
          {
            id: "fallback-living-room",
            title: "Living Room",
            description: "Professional detail cleaning for high-traffic living areas.",
            category: "Standard Cleaning",
            room: "Living Room",
            before_image_url: null,
            after_image_url: null,
          },
          {
            id: "fallback-kitchen",
            title: "Kitchen",
            description: "Degreasing and surface restoration for a cleaner kitchen.",
            category: "Deep Cleaning",
            room: "Kitchen",
            before_image_url: null,
            after_image_url: null,
          },
          {
            id: "fallback-bathroom",
            title: "Bathroom",
            description: "Soap-scum and buildup removal with polished finishing.",
            category: "Residential",
            room: "Bathroom",
            before_image_url: null,
            after_image_url: null,
          },
        ];

  useEffect(() => {
    const node = mobileTestimonialsRef.current;
    if (!node) return;

    const onScroll = () => {
      const cardWidth = node.clientWidth;
      if (!cardWidth) return;
      const nextIndex = Math.round(node.scrollLeft / cardWidth);
      setActiveTestimonial(Math.max(0, Math.min(testimonialItems.length - 1, nextIndex)));
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      node.removeEventListener("scroll", onScroll);
    };
  }, [testimonialItems.length]);

  const scrollToTestimonial = (index: number) => {
    const node = mobileTestimonialsRef.current;
    if (!node) return;
    node.scrollTo({ left: node.clientWidth * index, behavior: "smooth" });
  };

  return (
    <Layout>
      <Seo
        title="House Cleaning Lowell MA | Instant Quotes, Local Trust, Fast Booking"
        description="Paiva Cleaners Co. helps Lowell-area homeowners book trusted house cleaning fast. See pricing in 60 seconds, call now, or request recurring cleaning online."
        canonicalPath="/"
        keywords={HOME_SEO_KEYWORDS}
        schema={HOME_SEO_SCHEMA}
      />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-soft" />
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl -z-10" aria-hidden />
        <div className="container py-16 md:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-8 md:gap-12 items-center">
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
                <Link to="/contact">Get My Instant Quote <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/services">View Services</Link>
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
              <img
                src={heroKitchen}
                alt="Bright clean modern kitchen"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                width={1200}
                height={1500}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
            </div>

            <div className="absolute left-2 sm:left-4 lg:-left-8 top-[20%] md:top-1/4 bg-surface rounded-2xl shadow-float p-4 sm:p-5 max-w-[200px] md:max-w-[230px] animate-float hidden sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white shrink-0">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Easy</p>
                  <p className="font-semibold text-sm text-foreground leading-tight">See pricing in 60 seconds</p>
                </div>
              </div>
            </div>

            <div className="absolute right-2 sm:right-4 lg:-right-6 bottom-4 md:bottom-8 bg-surface rounded-2xl shadow-float p-4 max-w-[180px] md:max-w-[210px] animate-float hidden sm:block" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">Trusted By Local</p>
              <p className="text-xs text-muted-foreground">1,200+ happy clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ESTIMATE FORM */}
      <section className="container -mt-4 md:-mt-12 mb-20 relative z-10">
        <form
          onSubmit={onQuickQuoteSubmit}
          className="reveal bg-surface rounded-2xl shadow-strong border border-border p-5 sm:p-6 md:p-8"
        >
          <div className="mb-5 sm:mb-6 text-center md:text-left">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              See Pricing In 60 Seconds
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">No card required. Fill in your details and see an estimated price right away.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3">
            <Input
              placeholder="ZIP Code"
              className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl"
              value={quickQuote.zip}
              onChange={(event) =>
                setQuickQuote((previous) => ({ ...previous, zip: event.target.value }))
              }
            />
            <Select
              value={quickQuote.service}
              onValueChange={(value) =>
                setQuickQuote((previous) => ({ ...previous, service: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl"><SelectValue placeholder="Service Type" /></SelectTrigger>
              <SelectContent>
                {pricing.services.map((service) => (
                  <SelectItem key={service.key} value={service.key}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={quickQuote.size}
              onValueChange={(value) =>
                setQuickQuote((previous) => ({ ...previous, size: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl"><SelectValue placeholder="Home Size" /></SelectTrigger>
              <SelectContent>
                {pricing.bedrooms.map((size) => (
                  <SelectItem key={size.key} value={size.key}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={quickQuote.frequency}
              onValueChange={(value) =>
                setQuickQuote((previous) => ({ ...previous, frequency: value }))
              }
            >
              <SelectTrigger className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl"><SelectValue placeholder="Frequency" /></SelectTrigger>
              <SelectContent>
                {pricing.frequencies.map((frequency) => (
                  <SelectItem key={frequency.key} value={frequency.key}>
                    {frequency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="hero" size="lg" className="h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl w-full md:w-auto">
              <span className="hidden sm:inline">See Pricing In 60 Seconds</span>
              <span className="sm:hidden">See Pricing</span>
              <ArrowRight className="h-4 w-4" />
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
      <section className="bg-secondary/40 py-16 md:py-20">
        <div className="container">
          <SectionHeader
            eyebrow="Services"
            title="Cleaning Services Built Around Your Needs"
            subtitle="From a one-time deep clean to ongoing weekly visits, choose the right service for your space."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {services.map((s) => (
              <Link
                to={s.to}
                key={s.title}
                className="reveal group bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-strong hover:-translate-y-1 border border-border/60 flex flex-col transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary/30">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    width={1024}
                    height={768}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <span className="grid h-10 md:h-11 w-10 md:w-11 place-items-center rounded-lg md:rounded-xl bg-secondary text-primary -mt-10 md:-mt-12 relative shadow-soft mb-3 md:mb-4">
                    <s.icon className="h-4 md:h-5 w-4 md:w-5" />
                  </span>
                  <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 leading-tight">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 md:mb-5 flex-1">{s.text}</p>
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                    Learn More <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16 md:py-20">
        <SectionHeader eyebrow="How It Works" title="Three Steps To A Cleaner Space" subtitle="Our streamlined process gets your space sparkling in no time." />
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-px border-t-2 border-dashed border-border/40" aria-hidden />
          {[
            { title: "Request an estimate", text: "Share a few quick details about your space and schedule.", icon: ClipboardList },
            { title: "Choose your cleaning schedule", text: "Pick a date, frequency, and any special requests.", icon: Calendar },
            { title: "Enjoy a cleaner space", text: "Our trained team arrives on time and gets to work.", icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={s.title} className="reveal relative bg-surface rounded-xl md:rounded-2xl p-5 md:p-7 text-center shadow-card hover:shadow-strong hover:-translate-y-0.5 border border-border/60 transition-all duration-300">
              <span className="relative z-10 mx-auto grid h-16 md:h-20 w-16 md:w-20 place-items-center rounded-full gradient-primary text-white text-xl md:text-2xl font-display font-bold shadow-float mb-4 md:mb-5">
                {i + 1}
              </span>
              <h3 className="font-display text-base md:text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-secondary/40 py-16 md:py-20">
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
      <section className="container py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-left order-2 lg:order-1 relative">
            <div className="rounded-3xl overflow-hidden shadow-strong aspect-[4/5]">
              <img
                src={imgPremium}
                alt="Bright clean bedroom"
                loading="lazy"
                decoding="async"
                width={1200}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="w-full h-full object-cover"
              />
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
              <Link to="/contact">Book a Cleaning Today <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-16 md:py-20">
        <div className="container">
          <SectionHeader 
            eyebrow="Client Testimonials" 
            title="Trusted By Local Homeowners" 
            subtitle="See why over 1,200+ customers choose Paiva Cleaners for their homes and businesses."
          />
          <div className="hidden md:grid md:grid-cols-3 gap-5 md:gap-6">
            {testimonialItems.map((t) => (
              <div key={t.name} className="reveal group bg-surface rounded-xl md:rounded-2xl p-6 md:p-7 shadow-card hover:shadow-strong hover:border-primary/20 border border-border/60 transition-all duration-300 flex flex-col">
                <div className="flex gap-0.5 mb-3 md:mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed mb-5 md:mb-6 flex-1 italic">"{t.quote}"</p>
                <div className="pt-4 md:pt-5 border-t border-border group-hover:border-primary/20 transition-colors duration-300">
                  {t.featured && (
                    <span className="mb-2 inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      Featured
                    </span>
                  )}
                  <p className="font-semibold text-foreground text-sm md:text-base">{t.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t.city}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden">
            <div
              ref={mobileTestimonialsRef}
              className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonialItems.map((t) => (
                <div key={`mobile-${t.name}`} className="w-full shrink-0 snap-start pr-3 last:pr-0">
                  <div className="h-full rounded-xl border border-border/60 bg-surface p-5 shadow-card">
                    <div className="mb-3 flex gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    {t.featured && (
                      <span className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Featured
                      </span>
                    )}
                    <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {testimonialItems.map((item, index) => (
                <button
                  key={`dot-${item.name}-${index}`}
                  type="button"
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={activeTestimonial === index}
                  onClick={() => scrollToTestimonial(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeTestimonial === index ? "w-6 bg-primary" : "w-2.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="container py-14 md:py-20">
        <SectionHeader
          eyebrow="The Difference We Make"
          title="Transformations That Speak For Themselves"
          subtitle="See how our detailed cleaning process restores homes and offices to pristine condition."
        />
        <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
          {transformationItems.map((item) => (
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
      </section>

      <AreasWeServe />
      <CtaBanner />
    </Layout>
  );
};

export default Home;
