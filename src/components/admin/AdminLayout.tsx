import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  DollarSign,
  ImageIcon,
  LayoutDashboard,
  ListChecks,
  MapPin,
  MessageSquare,
  Settings,
  Sparkles,
  Star,
  Users,
  Wrench,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { safeSignOut } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    title: "Operations",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/requests", label: "Requests", icon: ListChecks },
      { to: "/admin/bookings", label: "Bookings", icon: Calendar },
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/cleaners", label: "Cleaners", icon: UserCircle2 },
    ],
  },
  {
    title: "Business",
    items: [
      { to: "/admin/pricing", label: "Pricing", icon: DollarSign },
      { to: "/admin/areas", label: "Areas Served", icon: MapPin },
      { to: "/admin/services", label: "Services", icon: Wrench },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/admin/portfolio", label: "Portfolio", icon: Star },
      { to: "/admin/reviews", label: "Reviews", icon: Sparkles },
      { to: "/admin/media", label: "Media", icon: ImageIcon },
      { to: "/admin/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "Settings",
    items: [{ to: "/admin/settings", label: "Website Settings", icon: Settings }],
  },
];

const MOBILE_QUICK = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Requests", icon: ListChecks },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const companyName = settings.company_name || "Paiva Cleaners Co.";

  const handleLogout = async () => {
    await safeSignOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-foreground text-white/85 sticky top-0 h-screen">
        <Link to="/admin" className="flex items-center gap-2 px-6 h-20 border-b border-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-none">
            <p className="font-display font-bold text-white text-base">Paiva Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">{companyName}</p>
          </div>
        </Link>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/admin/settings"
            className="block text-[11px] text-white/60 hover:text-white transition-smooth"
          >
            Account settings
          </Link>
          <Link
            to="/"
            className="block text-[11px] text-white/50 hover:text-white transition-smooth"
          >
            ← Back to public site
          </Link>
          <Button variant="outline" size="sm" className="w-full justify-center border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Briefcase className="h-4 w-4" />
              Admin Panel
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {MOBILE_QUICK.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border"
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};
