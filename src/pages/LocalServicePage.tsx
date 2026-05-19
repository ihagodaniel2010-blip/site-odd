import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { CtaBanner } from "@/components/CtaBanner";
import { FaqSection } from "@/components/FaqSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";
import type { LocalHouseCleaningPage } from "@/data/localSeo";
import { getHouseCleaningCityPath } from "@/data/localSeo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroImage from "@/assets/service-house.jpg";

const trustPoints = [
  { icon: ShieldCheck, title: "Insured & bonded", text: "Professional teams with a consistent checklist and careful in-home workflow." },
  { icon: Clock3, title: "Fast response times", text: "Quote requests are reviewed quickly so you can move from ad click to booking without friction." },
  { icon: BadgeCheck, title: "Satisfaction guarantee", text: "If something is missed, we make it right so your home feels truly finished." },
];

export const LocalServicePage = ({ page }: { page: LocalHouseCleaningPage }) => {
  const { settings } = useSiteSettings();
  const companyName = settings.company_name || "Paiva Cleaners Co.";
  const phone = settings.phone || "(978) 319-8939";
  const phoneHref = settings.phone_href || `tel:${phone}`;
  const phoneDigits = phone.replace(/\D/g, "");
  const whatsappHref =
    settings.social_whatsapp?.trim() || `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hi, I would like a quote for house cleaning in ${page.city}, MA.`)}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address_line_1 || "30 3rd Street"}, ${page.city}, MA`)}`;
  const nearbyLinks = page.nearbyCities
    .map((city) => ({ city, path: getHouseCleaningCityPath(city) }))
    .filter((item): item is { city: string; path: string } => Boolean(item.path));

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: companyName,
      description: page.metaDescription,
      telephone: phone,
      priceRange: "$$",
      image: heroImage,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address_line_1 || "30 3rd Street",
        addressLocality: "Lowell",
        addressRegion: "MA",
        postalCode: "01852",
        addressCountry: "US",
      },
      areaServed: [page.city, ...page.nearbyCities].map((city) => ({ "@type": "City", name: city })),
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
      },
      sameAs: [settings.social_facebook, settings.social_instagram, settings.social_whatsapp].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: `House Cleaning in ${page.city}, MA`,
      provider: {
        "@type": "LocalBusiness",
        name: companyName,
      },
      areaServed: {
        "@type": "City",
        name: page.city,
      },
      description: page.metaDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: "House Cleaning", item: "/house-cleaning" },
        { "@type": "ListItem", position: 3, name: `${page.city}, MA`, item: page.path },
      ],
    },
  ];

  return (
    <Layout>
      <Seo
        title={page.metaTitle}
        description={page.metaDescription}
        canonicalPath={page.path}
        keywords={[
          `house cleaning ${page.city.toLowerCase()} ma`,
          `${page.city.toLowerCase()} ma cleaners`,
          `home cleaning ${page.city.toLowerCase()}`,
          `maid service ${page.city.toLowerCase()} ma`,
          "cleaning quote in 60 seconds",
        ]}
        schema={schema}
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background">
        <div className="container py-16 md:py-24 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-soft">
              <MapPin className="h-3.5 w-3.5" />
              {page.city}, Massachusetts
            </span>
            <h1 className="font-display text-4xl font-semibold leading-[1.04] text-foreground md:text-6xl">
              {page.heading}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {page.intro} {page.localAngle}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Trusted by local homeowners",
                "Insured & bonded",
                "Fast response times",
                "Satisfaction guarantee",
              ].map((item) => (
                <span key={item} className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-soft">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact">
                  Get My Instant Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href={phoneHref}>Call Now</a>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  SMS / WhatsApp <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Local response</p>
                <p className="mt-1 font-semibold text-foreground">Quotes reviewed quickly</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Trust signal</p>
                <p className="mt-1 font-semibold text-foreground">Insured crews, clear pricing</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Ad-ready CTA</p>
                <p className="mt-1 font-semibold text-foreground">See pricing in 60 seconds</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-strong aspect-[4/3] bg-secondary/30">
              <img
                src={heroImage}
                alt={`House cleaning service in ${page.city}, MA`}
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>
            <div className="absolute bottom-4 left-4 max-w-[240px] rounded-2xl border border-border bg-surface/95 p-4 shadow-float backdrop-blur-sm">
              <div className="mb-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="font-semibold text-foreground">5-star rated local cleaning service</p>
              <p className="mt-1 text-xs text-muted-foreground">Prepared for Google reviews, maps, and local ad traffic.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <SectionHeader
          eyebrow={`Why ${page.city} Homeowners Choose Us`}
          title={`A better house cleaning experience for ${page.city}, MA`}
          subtitle="Built for busy schedules, real homes, and homeowners who want less friction from first click to completed clean."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                <point.icon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16 md:py-20">
        <div className="container grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="space-y-5">
            <SectionHeader
              eyebrow="Local Coverage"
              title={`House cleaning built for ${page.city} homes`}
              subtitle={`We commonly serve homes near ${page.neighborhoods.slice(0, 2).join(" and ")}, with flexible recurring plans and one-time deep cleaning options.`}
            />
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h3 className="font-display text-xl font-semibold text-foreground">Neighborhoods and nearby areas</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.neighborhoods.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground">
                    {item}
                  </span>
                ))}
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-foreground">ZIP codes we commonly cover</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.zipCodes.map((zip) => (
                  <span key={zip} className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-primary">
                    {zip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h2 className="font-display text-2xl font-semibold text-foreground">Ready for Google Maps and local trust signals</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This landing page is structured for local SEO, city-specific ad traffic, and smoother conversion from Google Business, Maps, and Facebook Ads.
              </p>
              <div className="mt-5 space-y-3">
                <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">
                  View on Google Maps
                  <ArrowRight className="h-4 w-4 text-primary" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">
                  Message us now
                  <MessageCircle className="h-4 w-4 text-primary" />
                </a>
                <a href={phoneHref} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">
                  Call {phone}
                  <Phone className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h2 className="font-display text-2xl font-semibold text-foreground">Nearby city pages</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {nearbyLinks.map((item) => (
                  <Link key={item.city} to={item.path} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary">
                    House Cleaning {item.city}, MA
                  </Link>
                ))}
                <Link to="/house-cleaning" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary">
                  Main House Cleaning Service Page
                </Link>
                <Link to="/areas-we-serve" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary">
                  Areas We Serve
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={page.faqs} />
      <CtaBanner
        title={`Book house cleaning in ${page.city}, MA today`}
        subtitle="Need a fast quote for Google or Facebook Ad traffic? Start with pricing in 60 seconds, then confirm the details with our team."
        cta="Book a Cleaning Today"
      />
    </Layout>
  );
};