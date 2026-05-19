import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const CATEGORIES: { key: string; title: string; description: string }[] = [
  { key: "company", title: "Company info", description: "Brand basics shown across the site." },
  { key: "header", title: "Header", description: "Top bar CTA settings." },
  { key: "footer", title: "Footer", description: "Description and copyright text." },
  { key: "contact", title: "Contact / Get in touch", description: "Headings shown on the Contact page." },
  { key: "social", title: "Social links", description: "Leave blank to hide an icon." },
];

const AdminSettings = () => {
  const { rows, loading, save } = useAdminSiteSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.setting_key] = r.setting_value ?? "";
    });
    setDraft(map);
  }, [rows]);

  const onSave = async (key: string) => {
    setSavingKey(key);
    try {
      await save(key, draft[key] ?? "");
      toast.success("Saved");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSavingKey(null);
    }
  };

  const onSaveAll = async () => {
    setSavingKey("__all__");
    try {
      for (const r of rows) {
        if ((draft[r.setting_key] ?? "") !== (r.setting_value ?? "")) {
          await save(r.setting_key, draft[r.setting_key] ?? "");
        }
      }
      toast.success("All changes saved");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-5xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Configuration
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">
                Website Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Edit company info, contact details and social links. Changes appear across the public site.
              </p>
            </div>
            <Button variant="hero" onClick={onSaveAll} disabled={savingKey !== null}>
              <Save className="h-4 w-4" /> Save all
            </Button>
          </header>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-surface rounded-2xl border border-border shadow-card">
              <p className="font-semibold text-foreground">Website Settings module pending database migration</p>
              <p className="text-sm text-muted-foreground">
                Apply Supabase migrations to create and seed the public.site_settings table.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {CATEGORIES.map((cat) => {
                const items = rows.filter((r) => r.category === cat.key);
                if (items.length === 0) return null;
                return (
                  <section
                    key={cat.key}
                    className="bg-surface rounded-2xl border border-border shadow-card p-6 md:p-8"
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {cat.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">{cat.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {items.map((r) => (
                        <div
                          key={r.id}
                          className={`space-y-1.5 ${r.setting_type === "textarea" ? "md:col-span-2" : ""}`}
                        >
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            {r.label}
                          </Label>
                          {r.setting_type === "textarea" ? (
                            <Textarea
                              rows={3}
                              value={draft[r.setting_key] ?? ""}
                              onChange={(e) =>
                                setDraft({ ...draft, [r.setting_key]: e.target.value })
                              }
                              onBlur={() => {
                                if ((draft[r.setting_key] ?? "") !== (r.setting_value ?? "")) {
                                  onSave(r.setting_key);
                                }
                              }}
                            />
                          ) : (
                            <Input
                              type={r.setting_type === "url" ? "url" : "text"}
                              value={draft[r.setting_key] ?? ""}
                              placeholder={r.setting_type === "url" ? "https://…" : ""}
                              onChange={(e) =>
                                setDraft({ ...draft, [r.setting_key]: e.target.value })
                              }
                              onBlur={() => {
                                if ((draft[r.setting_key] ?? "") !== (r.setting_value ?? "")) {
                                  onSave(r.setting_key);
                                }
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminSettings;
