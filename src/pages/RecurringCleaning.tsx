import { Calendar, Clock, RefreshCw } from "lucide-react";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import img from "@/assets/service-recurring.jpg";

const RecurringCleaning = () => (
  <ServicePageTemplate
    eyebrow="Recurring"
    title="Recurring Cleaning On Your Schedule"
    description="Weekly, bi-weekly, or monthly visits handled by the same trusted team. Keep your home consistently clean without lifting a finger."
    heroImage={img}
    included={[
      "Weekly visits",
      "Bi-weekly visits",
      "Monthly visits",
      "Same team when possible",
      "Easy rescheduling",
      "Discounted recurring rates",
      "Standard cleaning checklist",
      "Custom focus areas",
      "Pause anytime",
    ]}
    benefits={[
      { icon: RefreshCw, title: "Consistency you can count on", text: "The same checklist, same standards, every visit." },
      { icon: Calendar, title: "Flexible cadence", text: "Switch between weekly, bi-weekly, and monthly any time." },
      { icon: Clock, title: "Lower cost per visit", text: "Recurring clients enjoy reduced rates and priority scheduling." },
    ]}
    steps={[
      { title: "Choose your frequency", text: "Weekly, bi-weekly, or monthly — your call." },
      { title: "Lock in a recurring slot", text: "Pick a day and time that fits your week." },
      { title: "Enjoy a constantly clean home", text: "Pause, skip or adjust visits whenever you need." },
    ]}
    faqs={[
      { q: "Can I skip a week?", a: "Yes. You can pause or skip any visit up to 24 hours before with no charge." },
      { q: "Will I get the same cleaners every time?", a: "Whenever possible, yes. We assign a primary team to every recurring account." },
      { q: "Is there a contract?", a: "No long-term contract. Cancel or change frequency at any time." },
      { q: "What's the discount for recurring service?", a: "Recurring clients save up to 20% compared to one-time bookings." },
    ]}
  />
);
export default RecurringCleaning;
