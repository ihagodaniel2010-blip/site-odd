import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type Area = {
  id: string;
  city: string;
  state: string;
  zone: "regular" | "extended" | "request";
  display_order: number;
};

const FALLBACK_AREAS: Area[] = [
  { id: "fallback-lowell", city: "Lowell", state: "MA", zone: "regular", display_order: 1 },
  { id: "fallback-chelmsford", city: "Chelmsford", state: "MA", zone: "regular", display_order: 2 },
  { id: "fallback-dracut", city: "Dracut", state: "MA", zone: "regular", display_order: 3 },
  { id: "fallback-tewksbury", city: "Tewksbury", state: "MA", zone: "extended", display_order: 4 },
  { id: "fallback-billerica", city: "Billerica", state: "MA", zone: "extended", display_order: 5 },
  { id: "fallback-westford", city: "Westford", state: "MA", zone: "request", display_order: 6 },
];

const RETRY_COOLDOWN_MS = 60_000;
const FAILURE_STORAGE_KEY = "paiva-areas-failure-at";
type AreasStore = {
  cache: Area[] | null;
  pendingLoad: Promise<Area[]> | null;
  hasWarnedAboutFallback: boolean;
  lastFailureAt: number;
  subscribers: Set<(areas: Area[]) => void>;
};

const globalAreasState = globalThis as typeof globalThis & {
  __paivaAreasStore?: AreasStore;
};

const store =
  globalAreasState.__paivaAreasStore ??
  (globalAreasState.__paivaAreasStore = {
    cache: null,
    pendingLoad: null,
    hasWarnedAboutFallback: false,
    lastFailureAt: 0,
    subscribers: new Set<(areas: Area[]) => void>(),
  });

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

const publishAreas = (nextAreas: Area[]) => {
  store.cache = nextAreas;
  store.subscribers.forEach((callback) => callback(nextAreas));
  return nextAreas;
};

const warnAboutFallback = (message: string) => {
  if (store.hasWarnedAboutFallback || message.toLowerCase().includes("abort")) {
    return;
  }

  store.hasWarnedAboutFallback = true;
  console.warn("[useAreas] Falling back to local service areas:", message);
};

const loadAreasOnce = async (): Promise<Area[]> => {
  const failureAt = readFailureAt();

  if (store.cache) {
    return store.cache;
  }

  if (failureAt > 0 && Date.now() - failureAt < RETRY_COOLDOWN_MS) {
    return publishAreas(store.cache ?? FALLBACK_AREAS);
  }

  if (store.pendingLoad) {
    return store.pendingLoad;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  store.pendingLoad = (async () => {
    try {
      const { data, error } = await supabase
        .from("areas_served")
        .select("id,city,state,zone,display_order")
        .eq("active", true)
        .order("display_order")
        .abortSignal(controller.signal);

      if (error) {
        throw error;
      }

      const nextAreas = ((data as Area[]) ?? []).length > 0 ? (data as Area[]) : FALLBACK_AREAS;
      store.hasWarnedAboutFallback = false;
      writeFailureAt(0);
      return publishAreas(nextAreas);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load areas";
      writeFailureAt(Date.now());
      warnAboutFallback(message);
      return publishAreas(FALLBACK_AREAS);
    } finally {
      window.clearTimeout(timeoutId);
      store.pendingLoad = null;
    }
  })();

  return store.pendingLoad;
};

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>(store.cache ?? FALLBACK_AREAS);
  const [loading, setLoading] = useState(!store.cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleAreas = (nextAreas: Area[]) => {
      if (!mounted) {
        return;
      }

      setAreas(nextAreas);
      setError(null);
    };

    store.subscribers.add(handleAreas);

    void loadAreasOnce()
      .then((nextAreas) => {
        if (!mounted) {
          return;
        }

        setAreas(nextAreas);
        setError(null);
      })
      .catch((loadError) => {
        if (!mounted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Failed to load areas";
        setError(message);
        setAreas(FALLBACK_AREAS);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      store.subscribers.delete(handleAreas);
    };
  }, []);

  return { areas, loading, error };
};

export const findZoneForCity = (areas: Area[], cityName: string) => {
  if (!cityName) return null;
  const norm = cityName.trim().toLowerCase();
  const match = areas.find((a) => a.city.toLowerCase() === norm);
  return match?.zone ?? null;
};
