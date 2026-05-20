import { useEffect, useState } from "react";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  category: string;
  room: string;
  before_image_url: string | null;
  after_image_url: string | null;
  is_featured: boolean;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type MediaAsset = {
  id: string;
  file_name: string;
  file_url: string;
  section: string;
};

const categoryOptions = [
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Move In/Out",
  "Standard Cleaning",
];

const roomOptions = [
  "Kitchen",
  "Bathroom",
  "Living Room",
  "Bedroom",
  "Office",
  "Basement",
  "Other",
];

const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET ?? "media";

const emptyItem = (): Partial<PortfolioItem> => ({
  title: "",
  description: "",
  category: "Standard Cleaning",
  room: "Other",
  before_image_url: "",
  after_image_url: "",
  is_featured: false,
  is_public: true,
  display_order: 0,
});

const normalize = (row: Record<string, unknown>): PortfolioItem => ({
  id: (row.id as string) ?? "",
  title: (row.title as string) ?? "Untitled",
  description: (row.description as string | null) ?? null,
  category: (row.category as string) ?? "Standard Cleaning",
  room: ((row.room as string | null) ?? (row.location as string | null) ?? "Other") as string,
  before_image_url:
    ((row.before_image_url as string | null) ?? (row.image_url as string | null) ?? null) as string | null,
  after_image_url:
    ((row.after_image_url as string | null) ?? (row.image_url as string | null) ?? null) as string | null,
  is_featured: ((row.is_featured as boolean | undefined) ?? (row.featured as boolean | undefined) ?? false) as boolean,
  is_public: ((row.is_public as boolean | undefined) ?? (row.active as boolean | undefined) ?? true) as boolean,
  display_order: (typeof row.display_order === "number" ? row.display_order : 0) as number,
  created_at: (row.created_at as string) ?? new Date(0).toISOString(),
  updated_at: (row.updated_at as string) ?? new Date(0).toISOString(),
});

const AdminPortfolio = () => {
  const [rows, setRows] = useState<PortfolioItem[]>([]);
  const [mediaRows, setMediaRows] = useState<MediaAsset[]>([]);
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

    const normalized = ((data as Record<string, unknown>[] | null) ?? []).map(normalize);
    setRows(normalized);

    const { data: media } = await supabase
      .from("media_assets")
      .select("id,file_name,file_url,section")
      .eq("section", "portfolio")
      .order("created_at", { ascending: false });
    setMediaRows((media as MediaAsset[]) ?? []);
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
      category: editing.category?.trim() || "Standard Cleaning",
      room: editing.room?.trim() || "Other",
      before_image_url: editing.before_image_url?.trim() || null,
      after_image_url: editing.after_image_url?.trim() || null,
      is_featured: editing.is_featured ?? false,
      is_public: editing.is_public ?? true,
      display_order: Number(editing.display_order ?? 0),
      location: editing.room?.trim() || "Other",
      image_url: editing.after_image_url?.trim() || editing.before_image_url?.trim() || null,
      featured: editing.is_featured ?? false,
      active: editing.is_public ?? true,
    };

    let error = null;
    if (editing.id) {
      ({ error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("portfolio_items").insert(payload));
    }

    setSaving(false);

    if (error) {
      const fallbackPayload = {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        location: payload.location,
        image_url: payload.image_url,
        featured: payload.featured,
        active: payload.active,
        display_order: payload.display_order,
      };

      if (editing.id) {
        ({ error } = await supabase.from("portfolio_items").update(fallbackPayload).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("portfolio_items").insert(fallbackPayload));
      }

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
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

  const uploadImage = async (file: File, target: "before_image_url" | "after_image_url") => {
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
    setEditing({ ...editing, [target]: data.publicUrl });
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
                Manage public portfolio transformations with before/after images, categories and room filters.
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
                      <th className="text-left px-4 py-3 font-medium">Room</th>
                      <th className="text-left px-4 py-3 font-medium">Featured</th>
                      <th className="text-left px-4 py-3 font-medium">Public</th>
                      <th className="text-left px-4 py-3 font-medium">Order</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <img
                                src={r.before_image_url || r.after_image_url || "https://placehold.co/120x80?text=Before"}
                                alt={`${r.title} before`}
                                className="h-12 w-16 rounded-md object-cover border border-border"
                              />
                              <img
                                src={r.after_image_url || r.before_image_url || "https://placehold.co/120x80?text=After"}
                                alt={`${r.title} after`}
                                className="h-12 w-16 rounded-md object-cover border border-border"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{r.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {r.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.category || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.room || "-"}</td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={r.is_featured}
                            onCheckedChange={async (v) => {
                              const { error } = await supabase
                                .from("portfolio_items")
                                .update({ is_featured: v, featured: v })
                                .eq("id", r.id);
                              if (error) {
                                toast.error(error.message);
                                return;
                              }
                              setRows((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, is_featured: v } : item))
                              );
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={r.is_public}
                            onCheckedChange={async (v) => {
                              const { error } = await supabase
                                .from("portfolio_items")
                                .update({ is_public: v, active: v })
                                .eq("id", r.id);
                              if (error) {
                                toast.error(error.message);
                                return;
                              }
                              setRows((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, is_public: v } : item))
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
                  <Select
                    value={editing.category ?? "Standard Cleaning"}
                    onValueChange={(value) => setEditing({ ...editing, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Room">
                  <Select
                    value={editing.room ?? "Other"}
                    onValueChange={(value) => setEditing({ ...editing, room: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Before Image URL" className="md:col-span-2">
                  <Input
                    value={editing.before_image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, before_image_url: e.target.value })}
                  />
                </Field>

                <Field label="After Image URL" className="md:col-span-2">
                  <Input
                    value={editing.after_image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, after_image_url: e.target.value })}
                  />
                </Field>

                <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                  <Field label="Choose existing media (before)">
                    <Select
                      value=""
                      onValueChange={(url) => setEditing({ ...editing, before_image_url: url })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select from Media Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediaRows.map((asset) => (
                          <SelectItem key={`before-${asset.id}`} value={asset.file_url}>
                            {asset.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Choose existing media (after)">
                    <Select
                      value=""
                      onValueChange={(url) => setEditing({ ...editing, after_image_url: url })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select from Media Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediaRows.map((asset) => (
                          <SelectItem key={`after-${asset.id}`} value={asset.file_url}>
                            {asset.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Upload images</Label>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Before</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file, "before_image_url");
                        }}
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">After</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file, "after_image_url");
                        }}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  {uploading && (
                    <Button type="button" variant="outline" disabled className="mt-3">
                      <Upload className="h-4 w-4" /> Uploading...
                    </Button>
                  )}
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

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={editing.is_featured ?? false}
                      onCheckedChange={(value) => setEditing({ ...editing, is_featured: Boolean(value) })}
                    />
                    <Label>Featured on Home</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={editing.is_public ?? true}
                      onCheckedChange={(value) => setEditing({ ...editing, is_public: Boolean(value) })}
                    />
                    <Label>Publicly visible</Label>
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
