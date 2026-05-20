import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, DollarSign, Inbox } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/pricing";
import { isMissingRelationError } from "@/lib/supabaseErrors";

type EstimateRow = {
  id: string;
  full_name: string;
  city: string | null;
  service_type: string;
  calculated_estimate: number | null;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new_request: "New Request",
  contacted: "Contacted",
  estimate_sent: "Estimate Sent",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  new_request: "bg-info/10 text-info border-info/30",
  contacted: "bg-primary/10 text-primary border-primary/30",
  estimate_sent: "bg-warning/15 text-warning border-warning/30",
  scheduled: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const Dashboard = () => {
  const [rows, setRows] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const { data, error: queryError } = await supabase
          .from("service_requests")
          .select("id,full_name,city,service_type,calculated_estimate,status,created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        clearTimeout(timeoutId);

        if (queryError) {
          if (isMissingRelationError(queryError)) {
            setSchemaMissing(true);
            setRows([]);
          } else {
            console.warn("[Dashboard] Query error:", queryError.message);
            setError(queryError.message);
            setRows([]);
          }
          setLoading(false);
          return;
        }
        
        setRows((data as EstimateRow[]) ?? []);
        setSchemaMissing(false);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("[Dashboard] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        setRows([]);
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const counts = {
    new: rows.filter((r) => ["new", "new_request"].includes(r.status)).length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
    completed: rows.filter((r) => r.status === "completed").length,
    revenue: rows
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + Number(r.calculated_estimate ?? 0), 0),
    pending: rows.filter((r) => ["new", "new_request", "contacted", "estimate_sent"].includes(r.status)).length,
  };

  const cards = [
    { label: "New Requests", value: counts.new, icon: Inbox, color: "text-info" },
    { label: "Scheduled", value: counts.scheduled, icon: CalendarCheck, color: "text-success" },
    { label: "Completed Jobs", value: counts.completed, icon: CheckCircle2, color: "text-success" },
    { label: "Pending Estimates", value: counts.pending, icon: ClipboardList, color: "text-warning" },
    { label: "Total Revenue", value: formatUSD(counts.revenue), icon: DollarSign, color: "text-primary" },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-7xl">
          <header className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Overview</p>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mt-1">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-2">Real-time overview of your cleaning operations</p>
            </div>
            <span className="text-xs text-success font-medium bg-success/10 px-3 py-1 rounded-full border border-success/20">
              ● Live
            </span>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {cards.map((c, i) => (
              <div key={c.label} className="bg-surface rounded-xl md:rounded-2xl p-4 md:p-5 border border-border shadow-card hover:shadow-strong hover:border-border/80 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-0.5 flex-1">
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-bold">{c.label}</p>
                  </div>
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-secondary text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <c.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <p className="font-display text-xl md:text-2xl font-bold text-foreground">{c.value}</p>
                {i === 0 && counts.new > 0 && <p className="text-[10px] mt-2 text-warning font-medium">⚡ Needs attention</p>}
                {i === 1 && counts.scheduled > 0 && <p className="text-[10px] mt-2 text-success font-medium">✓ On track</p>}
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl md:rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 border-b border-border bg-secondary/20">
              <div>
                <h2 className="font-display text-base md:text-lg font-bold text-foreground">Latest Requests</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Last 8 estimate submissions</p>
              </div>
              <Link
                to="/admin/estimates"
                className="text-xs md:text-sm text-primary font-semibold hover:text-primary-strong transition-colors duration-200 inline-flex items-center gap-1 mt-2 sm:mt-0"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="p-10 text-center space-y-2">
                <div className="inline-block animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : error ? (
              <div className="p-10 text-center space-y-2">
                <p className="font-semibold text-foreground">Unable to load dashboard</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : schemaMissing ? (
              <div className="p-10 text-center space-y-2">
                <p className="font-semibold text-foreground">Dashboard data pending database migration</p>
                <p className="text-sm text-muted-foreground">
                  Apply Supabase migrations to create estimate and analytics tables.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-secondary/50 mb-4">
                  <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">No requests yet</p>
                <p className="text-sm text-muted-foreground">Submitted estimates will appear here in real-time</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                    <tr>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">Client</th>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">City</th>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">Service</th>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">Estimate</th>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">Status</th>
                      <th className="text-left px-4 md:px-5 py-3 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 8).map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/20 transition-colors duration-150 group">
                        <td className="px-4 md:px-5 py-3 font-semibold text-foreground group-hover:text-primary transition-colors duration-150">{r.full_name}</td>
                        <td className="px-4 md:px-5 py-3 text-muted-foreground text-sm">{r.city ?? "—"}</td>
                        <td className="px-4 md:px-5 py-3 text-muted-foreground text-sm">{r.service_type}</td>
                        <td className="px-4 md:px-5 py-3 font-bold text-foreground">
                          {r.calculated_estimate ? formatUSD(Number(r.calculated_estimate)) : "—"}
                        </td>
                        <td className="px-4 md:px-5 py-3">
                          <span className={`text-[10px] md:text-xs px-2 md:px-2.5 py-1 md:py-1.5 rounded-full border font-semibold transition-colors duration-150 ${STATUS_COLORS[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-4 md:px-5 py-3 text-muted-foreground text-sm">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Dashboard;
