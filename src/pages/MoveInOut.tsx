import { CheckCircle2, KeyRound, Truck } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-move.jpg";

const MoveInOut = () => (
  <ServicePageTemplate
    eyebrow="Move In / Move Out"
    title="Move In & Move Out Cleaning Services"
    description="Empty home cleans built for landlords, tenants, real estate agents, and anyone moving. Get the space spotless and ready for the next chapter."
    heroImage={img}
    included={[
      "Inside all cabinets",
      "Inside all appliances",
      "Detailed bathroom scrub",
      "Window sills & tracks",
      "Baseboards & trim",
      "Light fixtures & vents",
      "Closets & shelves",
      "Floors (vacuum & mop)",
      "Wall spot-cleaning",
    ]}
    benefits={[
      { icon: KeyRound, title: "Get your deposit back", text: "Our checklist is built around landlord and property manager standards." },
      { icon: Truck, title: "Stress-free moving day", text: "We handle the cleaning so you can focus on the move itself." },
      { icon: CheckCircle2, title: "Move-in ready", text: "Walk into a clean, fresh, ready-to-live-in space — no surprises." },
    ]}
    steps={[
      { title: "Schedule around your move", text: "Tell us your move-out or move-in date." },
      { title: "We deep clean the empty space", text: "Inside cabinets, appliances, and every detail." },
      { title: "Final walkthrough", text: "Photo checklist on request for landlords or agents." },
    ]}
    faqs={[
      { q: "When should I schedule the cleaning?", a: "Book it after your furniture is out (move-out) or before you move in (move-in) for best results." },
      { q: "Do you clean walls?", a: "We spot-clean walls. Full wall washing can be added as a custom service." },
      { q: "Can you provide a receipt for my landlord?", a: "Yes. We provide a detailed invoice and photo checklist on request." },
      { q: "How fast can you book?", a: "Most move cleans can be scheduled within 48–72 hours, depending on availability." },
    ]}
  />
);
export default MoveInOut;
