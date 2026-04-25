import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { NAV } from "@/data/nav";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const location = useLocation();
  const closeTimer = useRef<number | null>(null);
  const { settings } = useSiteSettings();
  const PHONE = settings.phone;
  const PHONE_HREF = settings.phone_href || `tel:${settings.phone}`;
  const CTA_TEXT = settings.header_cta_text || "Get Estimate";
  const CTA_LINK = settings.header_cta_link || "/contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMobileGroup(null);
    setOpenDesktopGroup(null);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const openGroup = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenDesktopGroup(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDesktopGroup(null), 120);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-surface/95 backdrop-blur-md shadow-soft border-b border-border"
            : "bg-surface/70 backdrop-blur-sm"
        )}
      >
        <div className="container flex h-16 md:h-20 items-center justify-between gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const hasChildren = "children" in item && item.children;
              const isOpen = openDesktopGroup === item.label;

              if (!hasChildren) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium rounded-md transition-smooth",
                        isActive ? "text-primary" : "text-foreground hover:text-primary"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openGroup(item.label)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDesktopGroup(isOpen ? null : item.label)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth",
                      isOpen ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                    aria-expanded={isOpen}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-180")}
                    />
                  </button>

                  <div
                    className={cn(
                      "absolute left-0 top-full pt-3 z-[110] transition-all duration-200",
                      isOpen
                        ? "opacity-100 visible translate-y-0 pointer-events-auto"
                        : "opacity-0 invisible -translate-y-1 pointer-events-none"
                    )}
                  >
                    <div className="min-w-[260px] rounded-xl bg-surface shadow-strong border border-border p-2">
                      {item.children!.map((c) => (
                        <Link
                          key={c.label}
                          to={c.to}
                          onClick={() => setOpenDesktopGroup(null)}
                          className="block px-3 py-2.5 text-sm rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-smooth"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={PHONE_HREF}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                <Phone className="h-4 w-4" />
              </span>
              <span className="hidden xl:inline">{PHONE}</span>
            </a>
            <Button asChild variant="hero" size="default" className="hidden sm:inline-flex">
              <Link to={CTA_LINK}>{CTA_TEXT}</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden grid h-11 w-11 place-items-center rounded-lg text-foreground hover:bg-secondary active:bg-secondary/80 transition-smooth border border-transparent hover:border-border"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay (click outside to close) */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 z-[90] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Mobile drawer (slides from right) */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 right-0 bottom-0 w-[88vw] max-w-sm z-[120] bg-surface shadow-strong transform transition-transform duration-300 ease-out flex flex-col",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-secondary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {NAV.map((item) => {
            const hasChildren = "children" in item && item.children;
            const isOpen = openMobileGroup === item.label;
            return (
              <div key={item.label} className="border-b border-border/60">
                <div className="flex items-center justify-between">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => setOpenMobileGroup(isOpen ? null : item.label)}
                      className="flex-1 py-4 text-left text-base font-medium text-foreground hover:text-primary transition-smooth"
                      aria-expanded={isOpen}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-4 text-base font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      {item.label}
                    </Link>
                  )}
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => setOpenMobileGroup(isOpen ? null : item.label)}
                      className="grid h-11 w-11 place-items-center text-muted-foreground rounded-md hover:bg-secondary"
                      aria-label="Toggle submenu"
                      aria-expanded={isOpen}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && isOpen && (
                  <div className="pb-3 pl-3 space-y-1">
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-sm text-foreground hover:text-primary transition-smooth font-medium"
                    >
                      View {item.label}
                    </Link>
                    {item.children!.map((c) => (
                      <Link
                        key={c.label}
                        to={c.to}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-sm text-muted-foreground hover:text-primary transition-smooth"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-5 border-t border-border space-y-3 shrink-0 bg-secondary/30">
          <a
            href={PHONE_HREF}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-foreground"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary shadow-soft">
              <Phone className="h-4 w-4" />
            </span>
            <span className="font-medium">{PHONE}</span>
          </a>
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to={CTA_LINK} onClick={() => setMobileOpen(false)}>
              {CTA_TEXT}
            </Link>
          </Button>
        </div>
      </aside>
    </>
  );
};
