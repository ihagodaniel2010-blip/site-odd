import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ inverted = false }: { inverted?: boolean }) => (
  <Link to="/" className="flex items-center gap-2 group">
    <span
      className={`grid h-10 w-10 place-items-center rounded-xl transition-smooth ${
        inverted ? "bg-white text-primary" : "gradient-primary text-primary-foreground"
      } group-hover:scale-105 shadow-soft`}
    >
      <Sparkles className="h-5 w-5" strokeWidth={2.2} />
    </span>
    <div className="flex flex-col leading-none">
      <span className={`font-display text-xl font-bold ${inverted ? "text-white" : "text-foreground"}`}>
        Paiva<span className="text-primary">.</span>
      </span>
      <span className={`text-[10px] uppercase tracking-[0.18em] ${inverted ? "text-white/70" : "text-muted-foreground"}`}>
        Cleaners Co.
      </span>
    </div>
  </Link>
);
