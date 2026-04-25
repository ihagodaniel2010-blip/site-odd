import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";

type Area = {
  id: string;
  city: string;
  state: string;
  zone: string;
  active: boolean;
  display_order: number;
};

const ZONES = [
  { v: "regular", l: "Regular Service Area" },
  { v: "extended", l: "Extended Service Area" },
  { v: "request", l: "By Request" },
];

const ZONE_BADGE: Record<string, string> = {
  regular: "bg-success/15 text-success border-success/30",
  extended: "bg-primary/10 text-primary border-primary/30",
  request: "bg-warning/15 text-warning border-warning/30",
};

const empty = (): Partial<Area> => ({
  city: "",
  state: "MA",
  zone: "regular",
  active: true,
  display_order: 0,
});

const AdminAreas = () => {
  const [rows, setRows] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Area> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("areas_served")
      .select("*")
      .order("display_order");
    if (error) toast.error(error.message);
    setRows((data as Area[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.city?.trim()) {
      toast.error("City is required");
      return;
    }
    const payload: any = {
      city: editing.city.trim(),
      state: (editing.state || "MA").trim(),
      zone: editing.zone || "regular",
      active: editing.active ?? true,
      display_order: Number(editing.display_order ?? 0),
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("areas_served").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("areas_served").insert(payload));
    }
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing.id ? "Area updated" : "Area added");
    setEditing(null);
    load();
  };

  const toggleActive = async (a: Area) => {
    const { error } = await supabase
      .from("areas_served")
      .update({ active: !a.active })
      .eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, active: !a.active } : r)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this area?")) return;
    const { error } = await supabase.from("areas_served").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-6xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Coverage
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">
                Areas We Serve
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                These cities are shown on the public Areas page and used for instant pricing zones.
              </p>
            </div>
            <Button variant="hero" onClick={() => setEditing(empty())}>
              <Plus className="h-4 w-4" /> Add city
            </Button>
          </header>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">City</th>
                      <th className="text-left px-4 py-3 font-medium">State</th>
                      <th className="text-left px-4 py-3 font-medium">Zone</th>
                      <th className="text-left px-4 py-3 font-medium">Order</th>
                      <th className="text-left px-4 py-3 font-medium">Active</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((a) => (
                      <tr key={a.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">{a.city}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.state}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${ZONE_BADGE[a.zone]}`}
                          >
                            {ZONES.find((z) => z.v === a.zone)?.l ?? a.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.display_order}</td>
                        <td className="px-4 py-3">
                          <Switch checked={a.active} onCheckedChange={() => toggleActive(a)} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
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

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing?.id ? "Edit area" : "Add area"}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <Input
                    value={editing.city ?? ""}
                    onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input
                      maxLength={2}
                      value={editing.state ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, state: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={editing.display_order ?? 0}
                      onChange={(e) =>
                        setEditing({ ...editing, display_order: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Zone</Label>
                  <Select
                    value={editing.zone ?? "regular"}
                    onValueChange={(v) => setEditing({ ...editing, zone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((z) => (
                        <SelectItem key={z.v} value={z.v}>
                          {z.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editing.active ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                  />
                  <Label>Active (visible on public site)</Label>
                </div>
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
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminAreas;
