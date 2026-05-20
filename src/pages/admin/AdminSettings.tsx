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

const TAB_DEFS = [
  {
    key: "business",
    title: "Business Info",
    description: "Business identity and contact details.",
    match: (settingKey: string) =>
      ["company_name", "phone", "email", "address", "business_hours"].some((k) =>
        settingKey.includes(k)
      ),
  },
  {
    key: "branding",
    title: "Branding",
    description: "Logo, brand visuals, and header style settings.",
    match: (settingKey: string) =>
      ["logo", "brand", "color", "header"].some((k) => settingKey.includes(k)),
  },
  {
    key: "social",
    title: "Social Links",
    description: "Public social profile links.",
    match: (settingKey: string) => settingKey.startsWith("social_"),
  },
  {
    key: "lead",
    title: "Lead Settings",
    description: "Lead capture, notifications, and quote routing.",
    match: (settingKey: string) =>
      ["whatsapp", "quote", "notification", "contact", "lead"].some((k) =>
        settingKey.includes(k)
      ),
  },
] as const;

const AdminSettings = () => {
  const { rows, loading, save } = useAdminSiteSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TAB_DEFS)[number]["key"]>("business");

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

  const tabItems = TAB_DEFS.find((tab) => tab.key === activeTab)
    ? rows.filter((row) => TAB_DEFS.find((tab) => tab.key === activeTab)?.match(row.setting_key))
    : [];

  const unassignedRows = rows.filter(
    (row) => !TAB_DEFS.some((tab) => tab.match(row.setting_key))
  );

  const visibleRows = activeTab === "business" ? [...tabItems, ...unassignedRows] : tabItems;

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
              <div className="bg-surface rounded-2xl border border-border shadow-card p-2 flex flex-wrap gap-2">
                {TAB_DEFS.map((tab) => (
                  <Button
                    key={tab.key}
                    type="button"
                    variant={activeTab === tab.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.title}
                  </Button>
                ))}
              </div>

              <section className="bg-surface rounded-2xl border border-border shadow-card p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {TAB_DEFS.find((tab) => tab.key === activeTab)?.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {TAB_DEFS.find((tab) => tab.key === activeTab)?.description}
                </p>

                {visibleRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No settings in this section yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {visibleRows.map((r) => (
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
                )}
              </section>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminSettings;
