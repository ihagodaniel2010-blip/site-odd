import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingRule, resolvePricing, ResolvedPricing } from "@/lib/pricing";

export const usePricingRules = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<ResolvedPricing>(resolvePricing([]));

  const load = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("pricing_rules")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
        .abortSignal(controller.signal);

      window.clearTimeout(timeoutId);

      if (queryError) {
        console.warn("[usePricingRules] Query error:", queryError.message);
        setError(queryError.message);
        setRules([]);
        setPricing(resolvePricing([])); // Use fallback defaults
      } else if (data) {
        const list = data as unknown as PricingRule[];
        setRules(list);
        setPricing(resolvePricing(list));
        setError(null);
      } else {
        console.warn("[usePricingRules] No data returned");
        setRules([]);
        setPricing(resolvePricing([]));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load pricing rules";
      if (message.toLowerCase().includes("abort")) {
        console.warn("[usePricingRules] Request aborted");
      } else {
        console.error("[usePricingRules] Error:", err);
      }
      setError(message);
      setRules([]);
      setPricing(resolvePricing([])); // Use fallback defaults
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rules, pricing, loading, error, reload: load };
};
