import { Award, Sparkles, Wrench } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-deep.jpg";

const DeepCleaning = () => (
  <ServicePageTemplate
    eyebrow="Deep Clean"
    title="Deep Cleaning Services That Reset Your Home"
    description="A full top-to-bottom reset for spaces that need extra attention. Ideal for first-time cleans, seasonal resets, or after long stretches without service."
    heroImage={img}
    included={[
      "Baseboards",
      "Inside appliances",
      "Detailed bathroom cleaning",
      "Detailed kitchen cleaning",
      "Hard-to-reach areas",
      "Extra dust removal",
      "Cabinets exterior",
      "Vents & fixtures",
      "Door frames & trim",
    ]}
    benefits={[
      { icon: Sparkles, title: "Visibly cleaner, instantly", text: "Surfaces, edges, and hidden corners restored to a like-new shine." },
      { icon: Wrench, title: "Detail-driven process", text: "A thorough checklist that leaves nothing skipped or rushed." },
      { icon: Award, title: "Perfect first-clean", text: "Most recurring clients start here, then move to weekly or bi-weekly visits." },
    ]}
    steps={[
      { title: "Book your deep clean", text: "Tell us your size, condition, and ideal date." },
      { title: "We arrive prepared", text: "Specialty supplies and tools for deeper cleaning." },
      { title: "Walk through your space", text: "We finish with a checklist review before we leave." },
    ]}
    faqs={[
      { q: "How long does a deep clean take?", a: "Most homes take 4–8 hours depending on size and condition. We'll give you a clear estimate up front." },
      { q: "Should I get a deep clean or standard clean?", a: "If it's been more than 4 weeks since a professional clean, we recommend starting with a deep clean." },
      { q: "Do you clean inside the oven and fridge?", a: "Yes — interior appliance cleaning is included in our deep clean checklist." },
      { q: "Is this a one-time service?", a: "It can be. Many clients use it as a reset, then transition to recurring service." },
    ]}
  />
);
export default DeepCleaning;
