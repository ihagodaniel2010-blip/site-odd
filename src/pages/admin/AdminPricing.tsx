import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { PricingRule, DEFAULT_PRICING_SEED } from "@/lib/pricing";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { title: string; subtitle: string; suffix?: string }> = {
  service: { title: "Services — Base Price", subtitle: "Starting price for each service type.", suffix: "$" },
  bedroom: { title: "Bedrooms", subtitle: "Add-on price per bedroom count.", suffix: "$" },
  bathroom: { title: "Bathrooms", subtitle: "Add-on price per bathroom count.", suffix: "$" },
  frequency: { title: "Frequency Discounts", subtitle: "Percentage discount applied to subtotal.", suffix: "%" },
  zone: { title: "Service Area Fees", subtitle: "Distance fee per service zone.", suffix: "$" },
  extra: { title: "Extras / Add-ons", subtitle: "Optional add-ons the customer can pick.", suffix: "$" },
  setting: { title: "Global Settings", subtitle: "Minimum price and other site-wide values.", suffix: "$" },
};

const CATEGORY_ORDER = ["service", "bedroom", "bathroom", "frequency", "zone", "extra", "setting"];

const AdminPricing = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricing_rules")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) {
      if (isMissingRelationError(error)) {
        setSchemaMissing(true);
        setRules([]);
        setLoading(false);
        return;
      }
      toast.error(error.message);
    }
    setRules((data as unknown as PricingRule[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const m: Record<string, PricingRule[]> = {};
    for (const r of rules) {
      (m[r.category] ??= []).push(r);
    }
    return m;
  }, [rules]);

  const updateRule = (id: string, patch: Partial<PricingRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const r of rules) {
      if (Number.isNaN(Number(r.value)) || r.value === ("" as any) || r.value === null) {
        errs[r.id] = "Value cannot be empty";
        continue;
      }
      const v = Number(r.value);
      if (v < 0) errs[r.id] = "Value cannot be negative";
      if (r.value_type === "percentage" && v > 100) errs[r.id] = "Percentage cannot exceed 100";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveAll = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }
    setSaving(true);
    const updates = rules.map((r) =>
      supabase
        .from("pricing_rules")
        .update({ value: Number(r.value), active: r.active, label: r.label })
        .eq("id", r.id)
    );
    const results = await Promise.all(updates);
    setSaving(false);
    const failed = results.filter((res) => res.error);
    if (failed.length) {
      toast.error(`Failed to save ${failed.length} rule(s).`);
      console.error(failed);
      return;
    }
    toast.success("Pricing rules saved successfully.");
    load();
  };

  const resetToDefaults = async () => {
    if (!confirm("Reset ALL prices to the original defaults? This cannot be undone.")) return;
    setSaving(true);
    const updates = DEFAULT_PRICING_SEED.map((seed) =>
      supabase
        .from("pricing_rules")
        .update({ value: seed.value, active: true, label: seed.label, value_type: seed.value_type })
        .eq("category", seed.category)
        .eq("name", seed.name)
    );
    const results = await Promise.all(updates);
    setSaving(false);
    if (results.some((r) => r.error)) {
      toast.error("Some rules could not be reset.");
      return;
    }
    toast.success("Prices reset to defaults.");
    load();
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-6xl">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Configuration</p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Pricing Rules</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Edit every value used by the public Instant Estimate. Changes apply immediately after saving.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefaults} disabled={saving || loading}>
                <RotateCcw className="h-4 w-4" /> Reset to Defaults
              </Button>
              <Button variant="hero" onClick={saveAll} disabled={saving || loading}>
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </header>

          {loading ? (
            <div className="bg-surface rounded-2xl border border-border shadow-card p-10 text-center text-sm text-muted-foreground">
              Loading pricing rules…
            </div>
          ) : schemaMissing ? (
            <div className="bg-surface rounded-2xl border border-border shadow-card p-10 text-center space-y-2">
              <p className="font-semibold text-foreground">Pricing module pending database migration</p>
              <p className="text-sm text-muted-foreground">
                Apply Supabase migrations to create the public.pricing_rules table.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <section key={cat} className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
                    <header className="px-6 py-4 border-b border-border bg-secondary/30">
                      <h2 className="font-display text-lg font-semibold text-foreground">{meta.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
                    </header>
                    <div className="divide-y divide-border">
                      {grouped[cat].map((r) => (
                        <div
                          key={r.id}
                          className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4"
                        >
                          <div>
                            <p className="font-medium text-foreground text-sm">{r.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <span className="font-mono">{r.name}</span>
                              {" • "}
                              {r.value_type.replace("_", " ")}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-4">
                              {meta.suffix === "%" ? "" : "$"}
                            </span>
                            <Input
                              type="number"
                              step={r.value_type === "percentage" ? "0.5" : "1"}
                              min={0}
                              max={r.value_type === "percentage" ? 100 : undefined}
                              value={r.value}
                              onChange={(e) => updateRule(r.id, { value: e.target.value as any })}
                              className={`w-28 h-10 rounded-lg ${errors[r.id] ? "border-error" : ""}`}
                            />
                            <span className="text-sm text-muted-foreground w-4">
                              {meta.suffix === "%" ? "%" : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Label htmlFor={`active-${r.id}`} className="text-xs text-muted-foreground">
                              Active
                            </Label>
                            <Switch
                              id={`active-${r.id}`}
                              checked={r.active}
                              onCheckedChange={(v) => updateRule(r.id, { active: v })}
                            />
                          </div>

                          {errors[r.id] && (
                            <p className="md:col-span-3 text-xs text-error">{errors[r.id]}</p>
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

export default AdminPricing;
