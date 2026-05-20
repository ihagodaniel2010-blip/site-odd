import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import type { Json } from "@/integrations/supabase/types";

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: Json | null;
  setting_type: string;
  category: string;
  label: string;
  sort_order: number;
};

export type SettingsMap = Record<string, string>;
type SiteSettingValueRow = Pick<SiteSetting, "setting_key" | "setting_value">;

const settingValueToString = (value: Json | null | undefined) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const DEFAULTS: SettingsMap = {
  company_name: "Paiva Cleaners Co.",
  phone: "(978) 319-8939",
  phone_href: "tel:+19783198939",
  email: "paivacleaners@gmail.com",
  address_line_1: "30 3rd Street",
  address_line_2: "Lowell, MA",
  business_hours: "Mon–Sat 8am – 6pm",
  footer_description:
    "Reliable, detail-focused house and commercial cleaning for Lowell, MA and surrounding communities.",
  footer_copyright: "© Paiva Cleaners Co. All rights reserved.",
  header_cta_text: "Get My Instant Quote",
  header_cta_link: "/contact",
  contact_title: "See Pricing In 60 Seconds",
  contact_subtitle: "Tell us about your space, get a fast estimate, and let us help you book the right cleaning plan.",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  social_linkedin: "",
  social_youtube: "",
  social_twitter: "",
  social_whatsapp: "",
};

const RETRY_COOLDOWN_MS = 60_000;
const FAILURE_STORAGE_KEY = "paiva-site-settings-failure-at";
type SiteSettingsStore = {
  cache: SettingsMap | null;
  pendingLoad: Promise<SettingsMap> | null;
  hasWarnedAboutFallback: boolean;
  lastFailureAt: number;
  subscribers: Set<(s: SettingsMap) => void>;
};

const globalSiteSettings = globalThis as typeof globalThis & {
  __paivaSiteSettingsStore?: SiteSettingsStore;
};

const store =
  globalSiteSettings.__paivaSiteSettingsStore ??
  (globalSiteSettings.__paivaSiteSettingsStore = {
    cache: null,
    pendingLoad: null,
    hasWarnedAboutFallback: false,
    lastFailureAt: 0,
    subscribers: new Set<(s: SettingsMap) => void>(),
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

const isAbortLikeError = (message: string) => message.toLowerCase().includes("abort");

const publishSettings = (settings: SettingsMap) => {
  store.cache = settings;
  store.subscribers.forEach((cb) => cb(settings));
  return settings;
};

const warnAboutFallback = (message: string) => {
  if (store.hasWarnedAboutFallback || isAbortLikeError(message)) {
    return;
  }

  store.hasWarnedAboutFallback = true;
  console.warn("[useSiteSettings] Falling back to defaults:", message);
};

const loadOnce = async (force = false): Promise<SettingsMap> => {
  const failureAt = readFailureAt();

  if (!force && store.cache) {
    return store.cache;
  }

  if (!force && failureAt > 0 && Date.now() - failureAt < RETRY_COOLDOWN_MS) {
    return publishSettings(store.cache ?? { ...DEFAULTS });
  }

  if (!force && store.pendingLoad) {
    return store.pendingLoad;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  store.pendingLoad = (async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key,setting_value")
        .abortSignal(controller.signal);

      if (error && !isMissingRelationError(error)) {
        throw error;
      }

      const map: SettingsMap = { ...DEFAULTS };
      ((data ?? []) as SiteSettingValueRow[]).forEach((r) => {
        const nextValue = settingValueToString(r.setting_value);
        if (nextValue !== null) {
          map[r.setting_key] = nextValue;
        }
      });

      store.hasWarnedAboutFallback = false;
      writeFailureAt(0);
      return publishSettings(map);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load site settings";
      writeFailureAt(Date.now());
      warnAboutFallback(message);
      return publishSettings({ ...DEFAULTS });
    } finally {
      window.clearTimeout(timeoutId);
      store.pendingLoad = null;
    }
  })();

  return store.pendingLoad;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>(store.cache ?? DEFAULTS);
  const [loading, setLoading] = useState(!store.cache);

  useEffect(() => {
    let mounted = true;
    const cb = (s: SettingsMap) => setSettings(s);
    store.subscribers.add(cb);
    if (!store.cache) {
      loadOnce().finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
      store.subscribers.delete(cb);
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadOnce(true);
    setLoading(false);
  }, []);

  return { settings, loading, refresh };
};

export const useAdminSiteSettings = () => {
  const [rows, setRows] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("category")
        .order("sort_order")
        .abortSignal(controller.signal);
      if (error && isMissingRelationError(error)) {
        setRows([]);
        setLoading(false);
        return;
      }
      if (error) {
        throw error;
      }
      setRows((data as SiteSetting[]) ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load settings";
      if (!isAbortLikeError(message)) {
        console.warn("[useAdminSiteSettings] Falling back to empty rows:", message);
      }
      setRows([]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (key: string, value: string) => {
    try {
      await supabase
        .from("site_settings")
        .update({ setting_value: value as Json })
        .eq("setting_key", key);
      await loadOnce();
    } catch (error) {
      console.warn("[useAdminSiteSettings] Save failed:", error);
    }
  };

  return { rows, loading, reload: load, save };
};
