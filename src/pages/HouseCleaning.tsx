import { Calendar, CheckCircle2, Heart, Shield, Sparkles, Star } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-house.jpg";

const HouseCleaning = () => (
  <ServicePageTemplate
    eyebrow="Residential"
    title="House Cleaning Services Built Around Your Home"
    description="Routine residential cleaning that keeps every room fresh, comfortable, and ready for life. Trained teams, consistent results, and flexible scheduling — that's it."
    heroImage={img}
    included={[
      "Kitchen cleaning",
      "Bathroom cleaning",
      "Bedroom cleaning",
      "Living areas",
      "Dusting all surfaces",
      "Floor vacuum & mop",
      "Trash removal",
      "Mirrors & glass",
      "High-touch points",
    ]}
    benefits={[
      { icon: Heart, title: "A home that always feels guest-ready", text: "Walk in to clean counters, fresh floors, and tidy rooms after every visit." },
      { icon: Shield, title: "Trained, vetted cleaners", text: "Background-checked teams that follow a consistent room-by-room standard." },
      { icon: Calendar, title: "Schedule that fits you", text: "Choose mornings, afternoons, weekly, bi-weekly or monthly visits." },
    ]}
    steps={[
      { title: "Tell us about your home", text: "Share size, frequency, and any special focus areas." },
      { title: "Approve your estimate", text: "Clear pricing — no hidden fees or surprise charges." },
      { title: "We clean. You relax.", text: "Same trusted team whenever possible, every visit." },
    ]}
    faqs={[
      { q: "Do I need to be home during the cleaning?", a: "Not at all. Most clients give us a key code or temporary access, and we lock up when we're done." },
      { q: "Do you bring your own supplies?", a: "Yes. We bring all standard supplies and equipment, including eco-friendly product options on request." },
      { q: "What if I need to reschedule?", a: "You can reschedule any time up to 24 hours before your visit at no charge." },
      { q: "Are your cleaners insured?", a: "Yes. Every team is fully insured and bonded for your peace of mind." },
    ]}
  />
);
export default HouseCleaning;
