export type LocalHouseCleaningPage = {
  city: string;
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  localAngle: string;
  zipCodes: string[];
  nearbyCities: string[];
  neighborhoods: string[];
  faqs: { q: string; a: string }[];
};

export const LOCAL_HOUSE_CLEANING_PAGES: LocalHouseCleaningPage[] = [
  {
    city: "Lowell",
    slug: "lowell",
    path: "/house-cleaning-lowell-ma",
    metaTitle: "House Cleaning Lowell MA | Paiva Cleaners Co.",
    metaDescription: "Need house cleaning in Lowell, MA? Get an instant quote, fast response, insured cleaners, and recurring or one-time cleaning built around your schedule.",
    heading: "House Cleaning in Lowell, MA That Fits Real Life",
    intro: "Paiva Cleaners Co. helps Lowell homeowners keep kitchens, bathrooms, bedrooms, and high-traffic living spaces consistently clean without giving up their weekends.",
    localAngle: "From Downtown Lowell condos to family homes near Belvidere and Pawtucketville, we tailor each visit to the way your home is actually used.",
    zipCodes: ["01850", "01851", "01852", "01854"],
    nearbyCities: ["Chelmsford", "Dracut", "Tewksbury"],
    neighborhoods: ["Belvidere", "Pawtucketville", "Downtown Lowell", "Highlands"],
    faqs: [
      { q: "Do you clean apartments and condos in Lowell?", a: "Yes. We clean apartments, condos, single-family homes, and multi-level residences throughout Lowell." },
      { q: "Can I book recurring house cleaning in Lowell, MA?", a: "Yes. Weekly, bi-weekly, and monthly cleaning plans are available based on your schedule and the level of upkeep you want." },
    ],
  },
  {
    city: "Chelmsford",
    slug: "chelmsford",
    path: "/house-cleaning-chelmsford-ma",
    metaTitle: "House Cleaning Chelmsford MA | Instant Quotes & Recurring Service",
    metaDescription: "Professional house cleaning in Chelmsford, MA with insured cleaners, fast quotes, and flexible weekly, bi-weekly, or deep cleaning service.",
    heading: "Trusted House Cleaning in Chelmsford, MA",
    intro: "We provide detail-focused house cleaning for busy Chelmsford households that want reliable help, clear pricing, and a cleaner home every week.",
    localAngle: "Whether you are near South Chelmsford, Westlands, or North Chelmsford, our team builds a cleaning plan around your layout, traffic, and preferred schedule.",
    zipCodes: ["01824", "01863"],
    nearbyCities: ["Lowell", "Westford", "Billerica"],
    neighborhoods: ["South Chelmsford", "North Chelmsford", "Westlands", "Center Village"],
    faqs: [
      { q: "Do you offer deep cleaning in Chelmsford?", a: "Yes. We handle both recurring maintenance cleaning and one-time deep cleaning for move-ins, move-outs, and seasonal resets." },
      { q: "How fast can I get a quote in Chelmsford?", a: "Most quote requests are reviewed quickly, and we make it easy to see pricing in under a minute online." },
    ],
  },
  {
    city: "Dracut",
    slug: "dracut",
    path: "/house-cleaning-dracut-ma",
    metaTitle: "House Cleaning Dracut MA | Paiva Cleaners Co.",
    metaDescription: "Book reliable house cleaning in Dracut, MA. Instant online quotes, insured cleaners, and flexible recurring cleaning for local homeowners.",
    heading: "Reliable House Cleaning in Dracut, MA",
    intro: "Our Dracut house cleaning service is designed for homeowners who want consistent results, easy scheduling, and a team that respects the details of each home.",
    localAngle: "We frequently clean family homes and multi-bedroom properties across Dracut where keeping up with dust, bathrooms, and floors takes real time each week.",
    zipCodes: ["01826"],
    nearbyCities: ["Lowell", "Tyngsborough", "Methuen"],
    neighborhoods: ["East Dracut", "Collinsville", "Navy Yard", "Mammoth Road"],
    faqs: [
      { q: "Do you bring supplies for Dracut cleanings?", a: "Yes. We bring our own supplies and equipment unless you prefer we use a specific product in your home." },
      { q: "Is your Dracut house cleaning service insured?", a: "Yes. Our teams are insured and background-checked for added peace of mind." },
    ],
  },
  {
    city: "Tewksbury",
    slug: "tewksbury",
    path: "/house-cleaning-tewksbury-ma",
    metaTitle: "House Cleaning Tewksbury MA | Local Cleaning Quotes in 60 Seconds",
    metaDescription: "Need house cleaning in Tewksbury, MA? Get pricing in 60 seconds, book recurring visits, and work with insured cleaners you can trust.",
    heading: "Tewksbury House Cleaning With Fast Quotes and Flexible Scheduling",
    intro: "We help Tewksbury homeowners stay ahead of the weekly mess with dependable house cleaning and clear communication from first quote to final walkthrough.",
    localAngle: "From newer subdivisions to long-standing family homes, we adapt the cleaning scope to traffic patterns, pets, children, and your preferred frequency.",
    zipCodes: ["01876"],
    nearbyCities: ["Lowell", "Chelmsford", "Billerica"],
    neighborhoods: ["South Tewksbury", "North Tewksbury", "Shawsheen", "Livingston Street area"],
    faqs: [
      { q: "Can I book bi-weekly cleaning in Tewksbury?", a: "Yes. Bi-weekly service is one of the most common plans we provide for Tewksbury homes." },
      { q: "What rooms are included in a standard cleaning?", a: "Most visits include kitchens, bathrooms, bedrooms, living areas, floors, dusting, mirrors, and high-touch surfaces." },
    ],
  },
  {
    city: "Billerica",
    slug: "billerica",
    path: "/house-cleaning-billerica-ma",
    metaTitle: "House Cleaning Billerica MA | Recurring & Deep Cleaning",
    metaDescription: "Professional house cleaning in Billerica, MA for busy households. Instant estimates, deep cleaning, recurring service, and trusted local cleaners.",
    heading: "Professional House Cleaning in Billerica, MA",
    intro: "Paiva Cleaners Co. serves Billerica homeowners who want their home cleaned thoroughly, professionally, and without wasting time chasing unreliable cleaners.",
    localAngle: "We frequently support Billerica families who need recurring help keeping up with kitchens, bathrooms, floors, and all the little details that build up fast.",
    zipCodes: ["01821", "01822", "01862"],
    nearbyCities: ["Chelmsford", "Tewksbury", "Westford"],
    neighborhoods: ["North Billerica", "South Billerica", "Pinehurst", "East Billerica"],
    faqs: [
      { q: "Do you clean homes with pets in Billerica?", a: "Yes. Many of our Billerica clients have pets, and we can account for extra hair, odors, and high-traffic pet areas." },
      { q: "Can I request a first-time deep clean before recurring service?", a: "Absolutely. Many homeowners start with a detailed deep clean, then move into a weekly or bi-weekly plan." },
    ],
  },
  {
    city: "Westford",
    slug: "westford",
    path: "/house-cleaning-westford-ma",
    metaTitle: "House Cleaning Westford MA | Premium Cleaning for Busy Homes",
    metaDescription: "Premium house cleaning in Westford, MA with easy online quotes, insured cleaners, and dependable recurring cleaning service for local homeowners.",
    heading: "Premium House Cleaning in Westford, MA",
    intro: "Our Westford house cleaning service is built for homeowners who want a reliable team, polished results, and a process that feels simple from day one.",
    localAngle: "From commuter households to large family homes, we help Westford residents maintain clean, calm spaces without losing their evenings or weekends.",
    zipCodes: ["01886"],
    nearbyCities: ["Chelmsford", "Billerica", "Lowell"],
    neighborhoods: ["Forge Village", "Nabnasset", "Graniteville", "Westford Center"],
    faqs: [
      { q: "Do you offer one-time deep cleaning in Westford?", a: "Yes. One-time and first-time deep cleaning appointments are available for seasonal resets or special occasions." },
      { q: "How do I get a quote for Westford house cleaning?", a: "Use our online quote form to see pricing in 60 seconds, then we can confirm details and scheduling with you." },
    ],
  },
];

const PATH_BY_CITY = new Map(
  LOCAL_HOUSE_CLEANING_PAGES.map((page) => [page.city.toLowerCase(), page.path])
);

export const getHouseCleaningCityPath = (city: string) => PATH_BY_CITY.get(city.toLowerCase()) || null;