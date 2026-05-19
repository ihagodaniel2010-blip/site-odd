import { Layout } from "@/components/Layout";
import { AreasWeServe } from "@/components/AreasWeServe";
import { CtaBanner } from "@/components/CtaBanner";
import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { LOCAL_HOUSE_CLEANING_PAGES } from "@/data/localSeo";

const AreasWeServePage = () => (
  <Layout>
    <Seo
      title="Areas We Serve | House Cleaning in Lowell, Chelmsford, Dracut & Nearby"
      description="Explore Paiva Cleaners service areas across Lowell, Chelmsford, Dracut, Tewksbury, Billerica, Westford, and nearby communities in Massachusetts."
      canonicalPath="/areas-we-serve"
      keywords={[
        "cleaners lowell ma",
        "house cleaning chelmsford ma",
        "maid service dracut ma",
        "cleaning service tewksbury ma",
      ]}
    />
    <AreasWeServe />
    <section className="container py-16 md:py-20">
      <div className="mb-8 max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Popular Local Pages</p>
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-5xl">
          House cleaning landing pages built for local intent
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Browse city-specific service pages designed for Google local search, Maps discovery, and high-intent ad traffic.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOCAL_HOUSE_CLEANING_PAGES.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-strong"
          >
            <h2 className="font-display text-xl font-semibold text-foreground">House Cleaning {page.city}, MA</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{page.metaDescription}</p>
          </Link>
        ))}
      </div>
    </section>
    <CtaBanner />
  </Layout>
);

export default AreasWeServePage;
