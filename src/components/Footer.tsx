import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Logo } from "./Logo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const socialIcons = [
  { key: "social_instagram", Icon: Instagram, label: "Instagram" },
  { key: "social_facebook", Icon: Facebook, label: "Facebook" },
  { key: "social_linkedin", Icon: Linkedin, label: "LinkedIn" },
  { key: "social_tiktok", Icon: Music2, label: "TikTok" },
  { key: "social_youtube", Icon: Youtube, label: "YouTube" },
  { key: "social_twitter", Icon: Twitter, label: "X (Twitter)" },
  { key: "social_whatsapp", Icon: MessageCircle, label: "WhatsApp" },
];

export const Footer = () => {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const copyright = (settings.footer_copyright || `© ${settings.company_name} All rights reserved.`)
    .replace(/©\s*/, `© ${year} `);

  const activeSocials = socialIcons.filter(({ key }) => (settings[key] ?? "").trim().length > 0);

  return (
    <footer className="bg-foreground text-white/80">
      <div className="container py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo inverted />
          <p className="text-sm leading-relaxed text-white/65 max-w-xs">
            {settings.footer_description}
          </p>
          {activeSocials.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {activeSocials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-primary transition-smooth hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            {[
              ["Home", "/"],
              ["Services", "/services"],
              ["Portfolio", "/portfolio"],
              ["Areas We Serve", "/areas-we-serve"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-smooth story-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Services</h4>
          <ul className="space-y-3 text-sm">
            {[
              ["House Cleaning", "/house-cleaning"],
              ["Deep Cleaning", "/deep-cleaning"],
              ["Move In / Move Out", "/move-in-move-out"],
              ["Recurring Cleaning", "/recurring-cleaning"],
              ["Commercial Cleaning", "/commercial-cleaning"],
              ["Office Cleaning", "/office-cleaning"],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-smooth story-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">
            Get in Touch
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-primary-glow shrink-0" />
              <a
                href={settings.phone_href || `tel:${settings.phone}`}
                className="hover:text-white transition-smooth"
              >
                {settings.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-primary-glow shrink-0" />
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-white transition-smooth"
              >
                {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-primary-glow shrink-0" />
              <span>
                {settings.address_line_1}
                <br />
                {settings.address_line_2}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>{copyright}</p>
          <div className="flex gap-5 items-center">
            <a href="#" className="hover:text-white transition-smooth">Privacy</a>
            <a href="#" className="hover:text-white transition-smooth">Terms</a>
            <a href="#" className="hover:text-white transition-smooth">Cookies</a>
            <Link
              to="/admin"
              className="text-white/30 hover:text-white/80 transition-smooth"
              aria-label="Admin access"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
