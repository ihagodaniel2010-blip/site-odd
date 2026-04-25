import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingRule, resolvePricing, ResolvedPricing } from "@/lib/pricing";

export const usePricingRules = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<ResolvedPricing>(resolvePricing([]));

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricing_rules")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (!error && data) {
      const list = data as unknown as PricingRule[];
      setRules(list);
      setPricing(resolvePricing(list));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rules, pricing, loading, reload: load };
};
