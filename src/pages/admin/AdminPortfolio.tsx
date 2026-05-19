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
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET ?? "media";

const emptyItem = (): Partial<PortfolioItem> => ({
  title: "",
  description: "",
  category: "",
  location: "",
  image_url: "",
  featured: false,
  active: true,
  display_order: 0,
});

const AdminPortfolio = () => {
  const [rows, setRows] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PortfolioItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true })
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

    setRows((data as PortfolioItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      title: editing.title.trim(),
      description: editing.description?.trim() || null,
      category: editing.category?.trim() || null,
      location: editing.location?.trim() || null,
      image_url: editing.image_url?.trim() || null,
      featured: editing.featured ?? false,
      active: editing.active ?? true,
      display_order: Number(editing.display_order ?? 0),
    };

    let error = null;
    if (editing.id) {
      ({ error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("portfolio_items").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editing.id ? "Portfolio item updated" : "Portfolio item created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;

    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Portfolio item deleted");
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const path = `portfolio/${Date.now()}-${safeName}`;

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
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Portfolio</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage public portfolio items, featured highlights and visibility.
              </p>
            </div>
            <Button variant="hero" onClick={() => setEditing(emptyItem())}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </header>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : schemaMissing ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-semibold text-foreground">Portfolio module pending database migration</p>
                <p className="text-sm text-muted-foreground">
                  Apply Supabase migrations to create the public.portfolio_items table.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No portfolio items yet. Add your first project.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Item</th>
                      <th className="text-left px-4 py-3 font-medium">Category</th>
                      <th className="text-left px-4 py-3 font-medium">Location</th>
                      <th className="text-left px-4 py-3 font-medium">Featured</th>
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
                              alt={r.title}
                              className="h-12 w-16 rounded-md object-cover border border-border"
                            />
                            <div>
                              <p className="font-medium text-foreground">{r.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {r.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.category || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.location || "-"}</td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={r.featured}
                            onCheckedChange={async (v) => {
                              const { error } = await supabase
                                .from("portfolio_items")
                                .update({ featured: v })
                                .eq("id", r.id);
                              if (error) {
                                toast.error(error.message);
                                return;
                              }
                              setRows((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, featured: v } : item))
                              );
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={r.active}
                            onCheckedChange={async (v) => {
                              const { error } = await supabase
                                .from("portfolio_items")
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
                {editing?.id ? "Edit portfolio item" : "Add portfolio item"}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Title *" className="md:col-span-2">
                  <Input
                    value={editing.title ?? ""}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <Textarea
                    rows={3}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field label="Category">
                  <Input
                    value={editing.category ?? ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={editing.location ?? ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
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
                <Field label="Display order">
                  <Input
                    type="number"
                    value={editing.display_order ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, display_order: Number(e.target.value) })
                    }
                  />
                </Field>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editing.featured ?? false}
                      onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
                    />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editing.active ?? true}
                      onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                    />
                    <Label>Active</Label>
                  </div>
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

export default AdminPortfolio;
