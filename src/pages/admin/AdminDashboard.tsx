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
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("estimate_requests")
      .select("id,full_name,city,service_type,calculated_estimate,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error && isMissingRelationError(error)) {
          setSchemaMissing(true);
          setRows([]);
          setLoading(false);
          return;
        }
        setRows((data as EstimateRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const counts = {
    new: rows.filter((r) => r.status === "new_request").length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
    completed: rows.filter((r) => r.status === "completed").length,
    revenue: rows
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + Number(r.calculated_estimate ?? 0), 0),
    pending: rows.filter((r) => ["new_request", "contacted", "estimate_sent"].includes(r.status)).length,
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
        <div className="p-6 md:p-10 space-y-8 max-w-7xl">
          <header>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Overview</p>
            <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Dashboard</h1>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="bg-surface rounded-2xl p-5 border border-border shadow-card">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <p className="font-display text-2xl font-semibold text-foreground">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">Latest Estimate Requests</h2>
              <Link
                to="/admin/estimates"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : schemaMissing ? (
              <div className="p-10 text-center space-y-2">
                <p className="font-semibold text-foreground">Dashboard data pending database migration</p>
                <p className="text-sm text-muted-foreground">
                  Apply Supabase migrations to create estimate and analytics tables.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No requests yet. Submitted estimates will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium">Client</th>
                      <th className="text-left px-5 py-3 font-medium">City</th>
                      <th className="text-left px-5 py-3 font-medium">Service</th>
                      <th className="text-left px-5 py-3 font-medium">Estimate</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 8).map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30 transition-smooth">
                        <td className="px-5 py-3 font-medium text-foreground">{r.full_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.city ?? "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.service_type}</td>
                        <td className="px-5 py-3 font-semibold text-foreground">
                          {r.calculated_estimate ? formatUSD(Number(r.calculated_estimate)) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold ${STATUS_COLORS[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
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
