import { Link } from "react-router-dom";
import logo from "@/assets/logo.png.png";
import logoWhite from "@/assets/logo-white.png.png";

export const Logo = ({ inverted = false }: { inverted?: boolean }) => (
  <Link to="/" className="inline-flex items-center group">
    <img
      src={inverted ? logoWhite : logo}
      alt="Paiva Cleaners Co."
      className="h-11 md:h-12 lg:h-14 w-auto max-w-none object-contain transition-smooth group-hover:opacity-95"
      loading="eager"
      decoding="async"
    />
  </Link>
);
