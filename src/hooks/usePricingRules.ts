import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingRule, resolvePricing, ResolvedPricing } from "@/lib/pricing";

const RETRY_COOLDOWN_MS = 60_000;
const FAILURE_STORAGE_KEY = "paiva-pricing-rules-failure-at";

type PricingPayload = {
  rules: PricingRule[];
  pricing: ResolvedPricing;
};

type PricingRulesStore = {
  cache: PricingPayload | null;
  pendingLoad: Promise<PricingPayload> | null;
  hasWarnedAboutFallback: boolean;
  lastFailureAt: number;
  subscribers: Set<(payload: PricingPayload) => void>;
};

const globalPricingRules = globalThis as typeof globalThis & {
  __paivaPricingRulesStore?: PricingRulesStore;
};

const store =
  globalPricingRules.__paivaPricingRulesStore ??
  (globalPricingRules.__paivaPricingRulesStore = {
    cache: null,
    pendingLoad: null,
    hasWarnedAboutFallback: false,
    lastFailureAt: 0,
    subscribers: new Set<(payload: PricingPayload) => void>(),
  });

const fallbackPayload = (): PricingPayload => ({ rules: [], pricing: resolvePricing([]) });

const isAbortLikeError = (message: string) => message.toLowerCase().includes("abort");

const readFailureAt = () => {
  if (typeof window === "undefined") {
    return store.lastFailureAt;
  }

  const storedValue = window.sessionStorage.getItem(FAILURE_STORAGE_KEY);
  return storedValue ? Number(storedValue) || 0 : store.lastFailureAt;
};

const writeFailureAt = (value: number) => {
  store.lastFailureAt = value;
  if (typeof window !== "undefined") {
    if (value > 0) {
      window.sessionStorage.setItem(FAILURE_STORAGE_KEY, String(value));
    } else {
      window.sessionStorage.removeItem(FAILURE_STORAGE_KEY);
    }
  }
};

const publishPricing = (payload: PricingPayload) => {
  store.cache = payload;
  store.subscribers.forEach((callback) => callback(payload));
  return payload;
};

const warnAboutFallback = (message: string) => {
  if (store.hasWarnedAboutFallback || isAbortLikeError(message)) {
    return;
  }

  store.hasWarnedAboutFallback = true;
  console.warn("[usePricingRules] Falling back to local defaults:", message);
};

const loadPricingRulesOnce = async (force = false): Promise<PricingPayload> => {
  const failureAt = readFailureAt();

  if (!force && store.cache) {
    return store.cache;
  }

  if (!force && failureAt > 0 && Date.now() - failureAt < RETRY_COOLDOWN_MS) {
    return publishPricing(store.cache ?? fallbackPayload());
  }

  if (!force && store.pendingLoad) {
    return store.pendingLoad;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  store.pendingLoad = (async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
        .abortSignal(controller.signal);

      if (error) {
        throw error;
      }

      const list = (data as PricingRule[]) ?? [];
      const payload = { rules: list, pricing: resolvePricing(list) };
      store.hasWarnedAboutFallback = false;
      writeFailureAt(0);
      return publishPricing(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load pricing rules";
      writeFailureAt(Date.now());
      warnAboutFallback(message);
      return publishPricing(fallbackPayload());
    } finally {
      window.clearTimeout(timeoutId);
      store.pendingLoad = null;
    }
  })();

  return store.pendingLoad;
};

export const usePricingRules = () => {
  const [rules, setRules] = useState<PricingRule[]>(store.cache?.rules ?? []);
  const [pricing, setPricing] = useState<ResolvedPricing>(store.cache?.pricing ?? resolvePricing([]));
  const [loading, setLoading] = useState(!store.cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handlePricingUpdate = (payload: PricingPayload) => {
      if (!mounted) {
        return;
      }

      setRules(payload.rules);
      setPricing(payload.pricing);
      setError(null);
    };

    store.subscribers.add(handlePricingUpdate);

    void loadPricingRulesOnce()
      .then((payload) => {
        if (!mounted) {
          return;
        }

        setRules(payload.rules);
        setPricing(payload.pricing);
        setError(null);
      })
      .catch((loadError) => {
        if (!mounted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Failed to load pricing rules";
        setError(message);
        const fallback = fallbackPayload();
        setRules(fallback.rules);
        setPricing(fallback.pricing);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      store.subscribers.delete(handlePricingUpdate);
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await loadPricingRulesOnce(true);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to reload pricing rules";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rules, pricing, loading, error, reload };
};
