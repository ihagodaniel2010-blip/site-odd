import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Calendar,
  LogOut,
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
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAdminSession } from "@/hooks/useAdminSession";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/estimates", label: "Service Requests", icon: ListChecks },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/calendar", label: "Bookings & Schedule", icon: Calendar },
  { to: "/admin/cleaners", label: "Cleaners", icon: Users },
  { to: "/admin/areas", label: "Areas We Serve", icon: MapPin },
  { to: "/admin/pricing", label: "Pricing Rules", icon: DollarSign },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/portfolio", label: "Portfolio", icon: Star },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/media", label: "Media Manager", icon: ImageIcon },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { settings } = useSiteSettings();
  const { signOut } = useAdminSession();
  const companyName = settings.company_name || "Paiva Cleaners Co.";

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
            Back to public site
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[11px] text-white/40 hover:text-white leading-relaxed inline-flex items-center gap-1"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
        <nav className="px-3 py-2 flex items-center gap-2 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-smooth",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-foreground border-border"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => signOut()}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-border inline-flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </nav>
      </div>
    </div>
  );
};
