import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { safeSignOut } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/estimates", label: "Estimate Requests", icon: ListChecks },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar },
  { to: "/admin/areas", label: "Areas We Serve", icon: MapPin },
  { to: "/admin/pricing", label: "Pricing Rules", icon: DollarSign },
  { to: "/admin/portfolio", label: "Portfolio", icon: Star },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/media", label: "Media Manager", icon: ImageIcon },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
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

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
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
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
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

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};
