import { useEffect, useState } from "react";
import { Copy, Image as ImageIcon, Trash2, Upload } from "lucide-react";
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
import { toast } from "sonner";

type MediaAsset = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  section: string;
  alt_text: string | null;
  created_at: string;
};

const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET ?? "media";

const SECTIONS = [
  "hero",
  "portfolio",
  "services",
  "about",
  "contact",
  "testimonials",
  "other",
];

const AdminMedia = () => {
  const [rows, setRows] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState("other");
  const [altText, setAltText] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    }

    setRows((data as MediaAsset[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    const clean = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const path = `${section}/${Date.now()}-${clean}`;

    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message);
      return;
    }

    const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    const { error: insertError } = await supabase.from("media_assets").insert({
      file_name: file.name,
      file_url: publicData.publicUrl,
      file_type: file.type || "image/*",
      section,
      alt_text: altText.trim() || null,
    });

    setUploading(false);

    if (insertError) {
      toast.error(insertError.message);
      return;
    }

    toast.success("Image uploaded");
    setAltText("");
    load();
  };

  const remove = async (asset: MediaAsset) => {
    if (!confirm("Delete this media file?")) return;

    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const idx = asset.file_url.indexOf(marker);
    const storagePath = idx >= 0 ? asset.file_url.slice(idx + marker.length) : null;

    if (storagePath) {
      await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    }

    const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Media deleted");
    load();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-7xl">
          <header>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Assets
            </p>
            <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Media Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload images to Supabase Storage, copy URLs and manage media sections.
            </p>
          </header>

          <div className="bg-surface rounded-2xl border border-border shadow-card p-5 space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Section
                </Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Alt text
                </Label>
                <Input
                  className="mt-1"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                }}
              />
              {uploading && (
                <Button type="button" variant="outline" disabled>
                  <Upload className="h-4 w-4" /> Uploading...
                </Button>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No media uploaded yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                {rows.map((asset) => (
                  <div key={asset.id} className="border border-border rounded-xl overflow-hidden bg-background">
                    <div className="aspect-[4/3] bg-secondary/30 grid place-items-center overflow-hidden">
                      <img
                        src={asset.file_url}
                        alt={asset.alt_text || asset.file_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-2 text-sm">
                      <p className="font-medium text-foreground truncate">{asset.file_name}</p>
                      <p className="text-xs text-muted-foreground">{asset.section}</p>
                      <p className="text-xs text-muted-foreground truncate">{asset.file_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(asset.created_at).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => copyUrl(asset.file_url)}
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(asset.file_url, "_blank")}
                        >
                          <ImageIcon className="h-3.5 w-3.5" /> Preview
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(asset)}>
                          <Trash2 className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminMedia;
