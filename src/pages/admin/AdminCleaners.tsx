import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

type Cleaner = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  availability: string | null;
  notes: string | null;
};

const AdminCleaners = () => {
  const [rows, setRows] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    status: "active",
    availability: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("cleaners").select("*").order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) {
        setSchemaMissing(true);
        setRows([]);
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    setSchemaMissing(false);
    setRows((data as Cleaner[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      status: form.status,
      availability: form.availability || null,
      notes: form.notes || null,
    };

    const { error } = editingId
      ? await supabase.from("cleaners").update(payload).eq("id", editingId)
      : await supabase.from("cleaners").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Cleaner updated" : "Cleaner added");
    setEditingId(null);
    setForm({ full_name: "", email: "", phone: "", status: "active", availability: "", notes: "" });
    load();
  };

  const edit = (row: Cleaner) => {
    setEditingId(row.id);
    setForm({
      full_name: row.full_name,
      email: row.email || "",
      phone: row.phone || "",
      status: row.status,
      availability: row.availability || "",
      notes: row.notes || "",
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this cleaner?")) return;
    const { error } = await supabase.from("cleaners").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = rows.filter((row) => {
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      row.full_name.toLowerCase().includes(q) ||
      (row.email ?? "").toLowerCase().includes(q) ||
      (row.phone ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Team</p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Cleaners</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage cleaner availability and status.</p>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </header>

          <form onSubmit={save} className="bg-surface rounded-2xl border border-border shadow-card p-5 grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Input value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <div className="flex gap-2">
                <Button type="submit" variant="hero">{editingId ? "Update cleaner" : "Add cleaner"}</Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ full_name: "", email: "", phone: "", status: "active", availability: "", notes: "" });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search cleaner by name, email or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : schemaMissing ? (
              <div className="p-12 text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-semibold text-foreground">Cleaners table not available yet</p>
                <p className="text-sm text-muted-foreground">Apply the latest Supabase migrations.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No cleaners added.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Contact</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Availability</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-foreground">{r.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.email || r.phone || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground capitalize">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.availability || "-"}</td>
                        <td className="px-4 py-3 space-x-2">
                          <Button variant="outline" size="sm" onClick={() => edit(r)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => remove(r.id)}>Delete</Button>
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

export default AdminCleaners;
