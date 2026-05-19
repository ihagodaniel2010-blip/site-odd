import { Link } from "react-router-dom";
import { Calculator, MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const toDigits = (value: string) => value.replace(/\D/g, "");

export const MobileLeadBar = () => {
  const { settings } = useSiteSettings();
  const phone = settings.phone || "(978) 319-8939";
  const phoneHref = settings.phone_href || `tel:${phone}`;
  const phoneDigits = toDigits(phoneHref || phone);
  const whatsappHref =
    settings.social_whatsapp?.trim() || `https://wa.me/${phoneDigits}?text=${encodeURIComponent("Hi, I would like a fast quote for cleaning service.")}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-border bg-surface/95 backdrop-blur-md shadow-strong md:hidden">
      <div className="grid grid-cols-3 gap-2 p-2">
        <a
          href={phoneHref}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
        >
          <Phone className="h-4 w-4 text-primary" />
          Call Now
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          SMS / WhatsApp
        </a>
        <Link
          to="/contact"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl gradient-primary px-3 text-xs font-semibold text-white shadow-soft"
        >
          <Calculator className="h-4 w-4" />
          Instant Quote
        </Link>
      </div>
    </div>
  );
};