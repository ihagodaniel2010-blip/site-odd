import { useEffect, useMemo, useState } from "react";
import { Eye, Mail, MessageCircle, Phone, Search, Send, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatUSD } from "@/lib/pricing";
import { COMPANY_NAME } from "@/data/nav";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type EstimateStatus = string;

type EstimateBreakdown = {
  base: number;
  serviceLabel: string;
  bedroomAddon: number;
  bathroomAddon: number;
  extrasTotal: number;
  extras: { label: string; price: number }[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  distanceFee: number;
  zone: string | null;
  total: number;
  manualReview: boolean;
  minimum: number;
};

type Estimate = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  zip_code: string;
  city: string | null;
  service_type: string;
  property_type: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  frequency: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  calculated_estimate: number | null;
  estimate_breakdown: EstimateBreakdown | null;
  service_zone: string | null;
  status: string;
  admin_notes: string | null;
  contacted_via: string | null;
  created_at: string;
};

const STATUSES = [
  { v: "new_request", l: "New Request" },
  { v: "contacted", l: "Contacted" },
  { v: "estimate_sent", l: "Estimate Sent" },
  { v: "scheduled", l: "Scheduled" },
  { v: "completed", l: "Completed" },
  { v: "cancelled", l: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  new_request: "bg-info/10 text-info border-info/30",
  contacted: "bg-primary/10 text-primary border-primary/30",
  estimate_sent: "bg-warning/15 text-warning border-warning/30",
  scheduled: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const CONTACTED_VIA = [
  { v: "call", l: "Call" },
  { v: "whatsapp", l: "WhatsApp" },
  { v: "email", l: "Email" },
];

const phoneToDigits = (p: string) => p.replace(/\D/g, "");
const waLink = (p: string, msg?: string) => {
  const num = phoneToDigits(p);
  const prefixed = num.length === 10 ? `1${num}` : num;
  const m = msg ? `?text=${encodeURIComponent(msg)}` : "";
  return `https://wa.me/${prefixed}${m}`;
};

const buildDefaultMessage = (e: Estimate) => {
  const est = e.calculated_estimate
    ? formatUSD(Number(e.calculated_estimate))
    : "to be confirmed";
  return `Hi ${e.full_name.split(" ")[0]}, this is ${COMPANY_NAME}.

Thanks for your estimate request for ${e.service_type.replace("_", " ")} at ${e.address}, ${e.city ?? ""}.

Based on what you shared, your estimate is ${est}. We'd love to confirm a date that works for you.

Reply here or call us back at any time.

— The ${COMPANY_NAME} Team`;
};

const logMessage = async (
  estimate: Estimate,
  message: string,
  channel: "email" | "whatsapp" | "sms"
) => {
  const subject = `Your ${COMPANY_NAME} request`;
  const { error } = await supabase.from("messages").insert({
    estimate_request_id: estimate.id,
    full_name: estimate.full_name,
    client_name: estimate.full_name,
    email: estimate.email,
    phone: estimate.phone,
    subject,
    message,
    channel,
    status: "sent",
    sent_at: new Date().toISOString(),
  });

  if (error) {
    console.error(error);
  }
};

const AdminEstimates = () => {
  const [rows, setRows] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Estimate | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (isMissingRelationError(error)) {
        setSchemaMissing(true);
        setRows([]);
        setLoading(false);
        return;
      }
      toast.error(error.message);
    }
    setRows((data as Estimate[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.city ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateStatus = async (id: string, status: EstimateStatus) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const updateContactedVia = async (id: string, contacted_via: string) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ contacted_via })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact channel saved");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, contacted_via } : r)));
    if (selected?.id === id) setSelected({ ...selected, contacted_via });
  };

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ admin_notes: notes })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notes saved");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  };

  const openMessage = (e: Estimate) => {
    setMessageDraft(buildDefaultMessage(e));
    setSelected(e);
    setMessageOpen(true);
  };

  const sendVia = async (channel: "email" | "whatsapp" | "sms") => {
    if (!selected) return;
    const msg = messageDraft;
    const subject = `Your ${COMPANY_NAME} request`;
    if (channel === "email") {
      const encodedSubject = encodeURIComponent(subject);
      window.open(
        `mailto:${selected.email}?subject=${encodedSubject}&body=${encodeURIComponent(msg)}`,
        "_blank"
      );
      await updateContactedVia(selected.id, "email");
    } else if (channel === "whatsapp") {
      window.open(waLink(selected.phone, msg), "_blank");
      await updateContactedVia(selected.id, "whatsapp");
    } else {
      window.open(`sms:${selected.phone}?body=${encodeURIComponent(msg)}`, "_blank");
      await updateContactedVia(selected.id, "call");
    }
    await logMessage(selected, msg, channel);
    setMessageOpen(false);
  };

  const breakdownView = (raw: EstimateBreakdown | null) => {
    if (!raw || typeof raw !== "object") return null;
    return (
      <div className="text-sm space-y-1.5">
        <Row label="Base price" value={formatUSD(Number(raw.base ?? 0))} />
        {Number(raw.bedroomAddon ?? 0) > 0 && (
          <Row label="Bedrooms" value={`+${formatUSD(Number(raw.bedroomAddon))}`} />
        )}
        {Number(raw.bathroomAddon ?? 0) > 0 && (
          <Row label="Bathrooms" value={`+${formatUSD(Number(raw.bathroomAddon))}`} />
        )}
        {Array.isArray(raw.extras) &&
          raw.extras.map((extra, i) => (
            <Row key={i} label={extra.label} value={`+${formatUSD(Number(extra.price))}`} />
          ))}
        {Number(raw.discountAmount ?? 0) > 0 && (
          <Row
            label={`Frequency discount (${Math.round(Number(raw.discountPct ?? 0) * 100)}%)`}
            value={`−${formatUSD(Number(raw.discountAmount))}`}
          />
        )}
        {Number(raw.distanceFee ?? 0) > 0 && (
          <Row label="Service area fee" value={`+${formatUSD(Number(raw.distanceFee))}`} />
        )}
        <Row
          label="Final estimate"
          value={formatUSD(Number(raw.total ?? 0))}
          bold
        />
      </div>
    );
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-7xl">
          <header>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Leads
            </p>
            <h1 className="font-display text-3xl font-semibold text-foreground mt-1">
              Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Unified requests inbox backed by service_requests.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, email, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10 rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-lg w-full md:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.v} value={s.v}>
                    {s.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : schemaMissing ? (
              <div className="p-10 text-center space-y-2">
                <p className="font-semibold text-foreground">Estimate Requests module pending database migration</p>
                <p className="text-sm text-muted-foreground">
                  Apply Supabase migrations to create the public.service_requests table.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No matching requests.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Client</th>
                      <th className="text-left px-4 py-3 font-medium">Quick Actions</th>
                      <th className="text-left px-4 py-3 font-medium">City</th>
                      <th className="text-left px-4 py-3 font-medium">Service</th>
                      <th className="text-left px-4 py-3 font-medium">Estimate</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-right px-4 py-3 font-medium">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30 transition-smooth">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{r.full_name}</div>
                          <div className="text-xs text-muted-foreground">{r.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <a
                              href={`tel:${r.phone}`}
                              onClick={() => updateContactedVia(r.id, "call")}
                              title="Call"
                              className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={waLink(r.phone)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => updateContactedVia(r.id, "whatsapp")}
                              title="WhatsApp"
                              className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-success hover:bg-success hover:text-white transition-smooth"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`mailto:${r.email}`}
                              onClick={() => updateContactedVia(r.id, "email")}
                              title="Email"
                              className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-info hover:bg-info hover:text-white transition-smooth"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openMessage(r)}
                              title="Send Message"
                              className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary-strong transition-smooth"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.city ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.service_type}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {r.calculated_estimate ? formatUSD(Number(r.calculated_estimate)) : "Manual"}
                        </td>
                        <td className="px-4 py-3">
                          <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                            <SelectTrigger
                              className={`h-8 text-xs rounded-full border font-semibold w-[140px] ${STATUS_COLORS[r.status]}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s.v} value={s.v}>
                                  {s.l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                              <Trash2 className="h-4 w-4 text-error" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail dialog */}
        <Dialog open={!!selected && !messageOpen} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    {selected.full_name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  {/* Quick contact bar */}
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${selected.phone}`} onClick={() => updateContactedVia(selected.id, "call")}>
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={waLink(selected.phone)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => updateContactedVia(selected.id, "whatsapp")}
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${selected.email}`} onClick={() => updateContactedVia(selected.id, "email")}>
                        <Mail className="h-3.5 w-3.5" /> Email
                      </a>
                    </Button>
                    <Button size="sm" variant="hero" onClick={() => openMessage(selected)}>
                      <Send className="h-3.5 w-3.5" /> Send Message
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="Phone" value={selected.phone} />
                    <Info label="Email" value={selected.email} />
                    <Info label="Address" value={selected.address} />
                    <Info label="ZIP" value={selected.zip_code} />
                    <Info label="City" value={selected.city ?? "—"} />
                    <Info label="Property" value={selected.property_type ?? "—"} />
                    <Info label="Service" value={selected.service_type} />
                    <Info label="Frequency" value={selected.frequency ?? "—"} />
                    <Info label="Bedrooms" value={selected.bedrooms ?? "—"} />
                    <Info label="Bathrooms" value={selected.bathrooms ?? "—"} />
                    <Info label="Preferred date" value={selected.preferred_date ?? "—"} />
                    <Info label="Preferred time" value={selected.preferred_time ?? "—"} />
                    <Info label="Service zone" value={selected.service_zone ?? "—"} />
                    <Info
                      label="Estimate"
                      value={
                        selected.calculated_estimate
                          ? formatUSD(Number(selected.calculated_estimate))
                          : "Manual review"
                      }
                    />
                  </div>

                  {/* Contacted via */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Contacted via
                    </p>
                    <Select
                      value={selected.contacted_via ?? ""}
                      onValueChange={(v) => updateContactedVia(selected.id, v)}
                    >
                      <SelectTrigger className="h-10 rounded-lg max-w-xs">
                        <SelectValue placeholder="Not contacted yet" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACTED_VIA.map((c) => (
                          <SelectItem key={c.v} value={c.v}>
                            {c.l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selected.notes && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Customer notes
                      </p>
                      <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3">
                        {selected.notes}
                      </p>
                    </div>
                  )}

                  {selected.estimate_breakdown && (
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Estimate breakdown
                      </p>
                      {breakdownView(selected.estimate_breakdown)}
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Admin notes
                    </p>
                    <Textarea
                      defaultValue={selected.admin_notes ?? ""}
                      onBlur={(e) => updateNotes(selected.id, e.target.value)}
                      rows={3}
                      placeholder="Internal notes — saved when you click outside."
                      className="rounded-lg"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {STATUSES.map((s) => (
                      <Button
                        key={s.v}
                        size="sm"
                        variant={selected.status === s.v ? "hero" : "outline"}
                        onClick={() => updateStatus(selected.id, s.v)}
                      >
                        {s.l}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Message dialog */}
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Send Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Edit the message below, then choose how to send it. We'll open your default app.
              </p>
              <Textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                rows={10}
                className="rounded-lg text-sm"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => sendVia("sms")}>
                <Phone className="h-4 w-4" /> SMS
              </Button>
              <Button variant="outline" onClick={() => sendVia("whatsapp")}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button variant="hero" onClick={() => sendVia("email")}>
                <Mail className="h-4 w-4" /> Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
      {label}
    </p>
    <p className="text-foreground font-medium">{value}</p>
  </div>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between gap-3 ${bold ? "font-semibold text-foreground pt-2 border-t border-border mt-2" : "text-muted-foreground"}`}>
    <span>{label}</span>
    <span className={bold ? "text-primary" : "text-foreground"}>{value}</span>
  </div>
);

export default AdminEstimates;
