import { Building2, Clock, Shield } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-commercial.jpg";

const CommercialCleaning = () => (
  <ServicePageTemplate
    eyebrow="Commercial"
    title="Commercial Cleaning Services For Modern Workplaces"
    description="Offices, clinics, pet shops, and retail. We deliver consistent commercial cleaning that protects your brand and keeps staff and visitors comfortable."
    heroImage={img}
    included={[
      "Reception areas",
      "Bathrooms",
      "Floors (vacuum & mop)",
      "Break rooms",
      "Workstations",
      "High-touch surfaces",
      "Glass & mirrors",
      "Trash & recycling",
      "Restocking supplies",
    ]}
    benefits={[
      { icon: Building2, title: "Tailored to your space", text: "Plans built for office floorplans, clinics, retail and shared workspaces." },
      { icon: Clock, title: "After-hours friendly", text: "Cleanings scheduled around your business so we never disrupt operations." },
      { icon: Shield, title: "Insured, vetted teams", text: "Background-checked, insured staff that respect your space and your data." },
    ]}
    steps={[
      { title: "Walkthrough & quote", text: "We assess your space and propose a custom cleaning plan." },
      { title: "Schedule & onboard", text: "Set the cadence, define access, and align on standards." },
      { title: "Recurring service", text: "Reliable visits with QA reviews and easy reporting." },
    ]}
    faqs={[
      { q: "Do you sign NDAs and confidentiality agreements?", a: "Yes. For clinics, law firms and other sensitive spaces, we're happy to sign NDAs and follow strict access protocols." },
      { q: "Can you clean after business hours?", a: "Absolutely. Most of our commercial clients prefer evening, early morning, or weekend cleans." },
      { q: "Do you handle clinics and medical spaces?", a: "Yes. We follow surface-disinfection protocols suitable for clinical, dental, and veterinary environments." },
      { q: "How are quality issues handled?", a: "Every account has a dedicated point of contact and a 24-hour re-clean guarantee." },
    ]}
  />
);
export default CommercialCleaning;
