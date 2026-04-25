import { Briefcase, Clock, Users } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-office.jpg";

const OfficeCleaning = () => (
  <ServicePageTemplate
    eyebrow="Office"
    title="Office Cleaning That Keeps Teams Productive"
    description="Spotless workstations, fresh break rooms, and clean restrooms — without disrupting your workday. Built for small and mid-size offices."
    heroImage={img}
    included={[
      "Workstations & desks",
      "Reception & lobby",
      "Conference rooms",
      "Break rooms & kitchens",
      "Restrooms",
      "Floors & carpets",
      "Trash & recycling",
      "Glass & windows",
      "High-touch surfaces",
    ]}
    benefits={[
      { icon: Briefcase, title: "Professional first impression", text: "A clean office signals quality to every visitor and client." },
      { icon: Users, title: "Healthier team environment", text: "Reduced germs in shared spaces means fewer sick days." },
      { icon: Clock, title: "Zero workday disruption", text: "We work after hours or during low-traffic windows." },
    ]}
    steps={[
      { title: "Office walkthrough", text: "We assess size, traffic, and shared spaces." },
      { title: "Plan your cadence", text: "Daily, weekly, or custom rotations." },
      { title: "We clean, you focus on work", text: "Quiet, consistent service — same team, every visit." },
    ]}
    faqs={[
      { q: "What size offices do you serve?", a: "From 5-person studios to 100+ employee offices across multiple floors." },
      { q: "Do you provide supplies?", a: "Yes — we bring all cleaning supplies and can restock paper goods on request." },
      { q: "Can you clean nights and weekends?", a: "Yes. Most office clients prefer after-hours service." },
      { q: "Are your teams insured?", a: "Yes — fully insured and bonded, with background-checked staff." },
    ]}
  />
);
export default OfficeCleaning;
