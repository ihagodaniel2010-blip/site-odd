import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export const CtaBanner = ({
  title = "Ready For A Cleaner Space?",
  subtitle = "Request your estimate today and let us build a cleaning plan around your needs.",
  cta = "Book a Cleaning Today",
  to = "/contact",
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  to?: string;
}) => (
  <section className="container py-20 md:py-28">
    <div className="reveal relative overflow-hidden rounded-2xl gradient-primary p-10 md:p-16 text-center shadow-strong">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" aria-hidden />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-white text-balance">
          {title}
        </h2>
        <p className="text-white/80 text-lg leading-relaxed">{subtitle}</p>
        <Button asChild variant="invert" size="xl">
          <Link to={to}>
            {cta} <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);
