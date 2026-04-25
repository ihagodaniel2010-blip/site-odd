import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/pricing";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  notes: string | null;
  last_service_date: string | null;
  total_spent: number;
  status: string;
  created_at: string;
};

const empty = (): Partial<Customer> => ({
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  zip_code: "",
  notes: "",
  status: "active",
});

const AdminCustomers = () => {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Partial<Customer> | null>(null);
  const [historyOf, setHistoryOf] = useState<Customer | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Customer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const cities = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.city).filter(Boolean))) as string[],
    [rows]
  );

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (cityFilter !== "all" && r.city !== cityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload: any = {
      name: editing.name.trim(),
      phone: editing.phone || null,
      email: editing.email || null,
      address: editing.address || null,
      city: editing.city || null,
      zip_code: editing.zip_code || null,
      notes: editing.notes || null,
      status: editing.status || "active",
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("customers").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("customers").insert(payload));
    }
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing.id ? "Customer updated" : "Customer created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  };

  const openHistory = async (c: Customer) => {
    setHistoryOf(c);
    const { data } = await supabase
      .from("estimate_requests")
      .select("id,service_type,status,calculated_estimate,preferred_date,created_at")
      .or(
        `email.eq.${c.email ?? "__none__"},phone.eq.${c.phone ?? "__none__"}`
      )
      .order("created_at", { ascending: false });
    setHistory(data ?? []);
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-7xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                CRM
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">
                Customers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Promoted automatically from estimates marked as Scheduled or Completed.
              </p>
            </div>
            <Button variant="hero" onClick={() => setEditing(empty())}>
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </header>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10 rounded-lg"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-11 rounded-lg w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-lg w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-secondary grid place-items-center text-muted-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No customers yet. They'll appear here once you mark an estimate as Scheduled or Completed,
                  or click <strong>Add Customer</strong>.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Contact</th>
                      <th className="text-left px-4 py-3 font-medium">City</th>
                      <th className="text-left px-4 py-3 font-medium">Last service</th>
                      <th className="text-left px-4 py-3 font-medium">Total spent</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30 transition-smooth">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="font-medium text-foreground hover:text-primary"
                            onClick={() => openHistory(r)}
                          >
                            {r.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground space-y-0.5">
                          {r.phone && <div>{r.phone}</div>}
                          {r.email && <div>{r.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.city ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {r.last_service_date
                            ? new Date(r.last_service_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatUSD(Number(r.total_spent ?? 0))}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground capitalize">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                              <Edit className="h-4 w-4" />
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

        {/* Edit dialog */}
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing?.id ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Name *">
                  <Input
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={editing.phone ?? ""}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  />
                </Field>
                <Field label="Email" className="md:col-span-2">
                  <Input
                    type="email"
                    value={editing.email ?? ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  />
                </Field>
                <Field label="Address" className="md:col-span-2">
                  <Input
                    value={editing.address ?? ""}
                    onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={editing.city ?? ""}
                    onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  />
                </Field>
                <Field label="ZIP code">
                  <Input
                    value={editing.zip_code ?? ""}
                    onChange={(e) => setEditing({ ...editing, zip_code: e.target.value })}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={editing.status ?? "active"}
                    onValueChange={(v) => setEditing({ ...editing, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Notes" className="md:col-span-2">
                  <Textarea
                    rows={3}
                    value={editing.notes ?? ""}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  />
                </Field>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={save}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History dialog */}
        <Dialog open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
          <DialogContent className="max-w-2xl">
            {historyOf && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">{historyOf.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {historyOf.phone && (
                      <Info icon={<Phone className="h-3.5 w-3.5" />} text={historyOf.phone} />
                    )}
                    {historyOf.email && (
                      <Info icon={<Mail className="h-3.5 w-3.5" />} text={historyOf.email} />
                    )}
                    {(historyOf.address || historyOf.city) && (
                      <Info
                        icon={<MapPin className="h-3.5 w-3.5" />}
                        text={`${historyOf.address ?? ""} ${historyOf.city ?? ""}`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      Service history
                    </p>
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No linked estimates.</p>
                    ) : (
                      <div className="border border-border rounded-lg divide-y divide-border">
                        {history.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-3 text-sm"
                          >
                            <div>
                              <p className="font-medium">{h.service_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(h.created_at).toLocaleDateString()} · {h.status}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {h.calculated_estimate
                                ? formatUSD(Number(h.calculated_estimate))
                                : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
      {label}
    </Label>
    {children}
  </div>
);

const Info = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <span className="text-primary">{icon}</span>
    <span>{text}</span>
  </div>
);

export default AdminCustomers;
