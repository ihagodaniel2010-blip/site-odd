import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starting_price: number;
  image_url: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const emptyService = (): Partial<Service> => ({
  name: "",
  slug: "",
  description: "",
  starting_price: 0,
  image_url: "",
  active: true,
  display_order: 0,
});

const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET ?? "media";

const toSlug = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AdminServices = () => {
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    }

    setRows((data as Service[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) {
      toast.error("Service name is required");
      return;
    }

    const slug = (editing.slug || toSlug(editing.name)).trim();
    if (!slug) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);

    const payload = {
      name: editing.name.trim(),
      slug,
      description: editing.description?.trim() || null,
      starting_price: Number(editing.starting_price ?? 0),
      image_url: editing.image_url?.trim() || null,
      active: editing.active ?? true,
      display_order: Number(editing.display_order ?? 0),
    };

    let error = null;
    if (editing.id) {
      ({ error } = await supabase.from("services").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("services").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editing.id ? "Service updated" : "Service created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Service deleted");
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const path = `services/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

    setUploading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
    toast.success("Image uploaded");
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-7xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Content
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Services</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage service cards shown on the site, including pricing and visibility.
              </p>
            </div>
            <Button variant="hero" onClick={() => setEditing(emptyService())}>
              <Plus className="h-4 w-4" /> Add service
            </Button>
          </header>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No services found. Add your first service.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Service</th>
                      <th className="text-left px-4 py-3 font-medium">Slug</th>
                      <th className="text-left px-4 py-3 font-medium">Starting price</th>
                      <th className="text-left px-4 py-3 font-medium">Active</th>
                      <th className="text-left px-4 py-3 font-medium">Order</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={r.image_url || "https://placehold.co/120x80?text=No+Image"}
                              alt={r.name}
                              className="h-12 w-16 rounded-md object-cover border border-border"
                            />
                            <div>
                              <p className="font-medium text-foreground">{r.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {r.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatUSD(Number(r.starting_price ?? 0))}
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={r.active}
                            onCheckedChange={async (v) => {
                              const { error } = await supabase
                                .from("services")
                                .update({ active: v })
                                .eq("id", r.id);
                              if (error) {
                                toast.error(error.message);
                                return;
                              }
                              setRows((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, active: v } : item))
                              );
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.display_order}</td>
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

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing?.id ? "Edit service" : "Add service"}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Name *" className="md:col-span-2">
                  <Input
                    value={editing.name ?? ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditing({
                        ...editing,
                        name,
                        slug: editing.slug ? editing.slug : toSlug(name),
                      });
                    }}
                  />
                </Field>
                <Field label="Slug *">
                  <Input
                    value={editing.slug ?? ""}
                    onChange={(e) => setEditing({ ...editing, slug: toSlug(e.target.value) })}
                  />
                </Field>
                <Field label="Display order">
                  <Input
                    type="number"
                    value={editing.display_order ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, display_order: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Starting price" className="md:col-span-2">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={editing.starting_price ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, starting_price: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <Textarea
                    rows={3}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field label="Image URL" className="md:col-span-2">
                  <Input
                    value={editing.image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Upload / replace image
                  </Label>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                      disabled={uploading}
                    />
                    {uploading && (
                      <Button type="button" variant="outline" disabled>
                        <Upload className="h-4 w-4" /> Uploading...
                      </Button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={editing.active ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                  />
                  <Label>Active on public site</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
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

export default AdminServices;
