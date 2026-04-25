import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { isMissingRelationError } from "@/lib/supabaseErrors";

export type SiteSetting = {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  label: string;
  sort_order: number;
};

export type SettingsMap = Record<string, string>;

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
  header_cta_text: "Get Estimate",
  header_cta_link: "/contact",
  contact_title: "Get Your Free Cleaning Estimate",
  contact_subtitle: "Tell us about your space and see your estimated price instantly.",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  social_linkedin: "",
  social_youtube: "",
  social_twitter: "",
  social_whatsapp: "",
};

let cache: SettingsMap | null = null;
const subscribers = new Set<(s: SettingsMap) => void>();

const loadOnce = async (): Promise<SettingsMap> => {
  const { data, error } = await supabase.from("site_settings").select("setting_key,setting_value");
  if (error && !isMissingRelationError(error)) {
    throw error;
  }
  const map: SettingsMap = { ...DEFAULTS };
  (data ?? []).forEach((r: any) => {
    if (r.setting_value !== null && r.setting_value !== undefined) {
      map[r.setting_key] = r.setting_value;
    }
  });
  cache = map;
  subscribers.forEach((cb) => cb(map));
  return map;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>(cache ?? DEFAULTS);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const cb = (s: SettingsMap) => setSettings(s);
    subscribers.add(cb);
    if (!cache) {
      loadOnce().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadOnce();
    setLoading(false);
  }, []);

  return { settings, loading, refresh };
};

export const useAdminSiteSettings = () => {
  const [rows, setRows] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error && isMissingRelationError(error)) {
      setRows([]);
      setLoading(false);
      return;
    }
    setRows((data as SiteSetting[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (key: string, value: string) => {
    await supabase
      .from("site_settings")
      .update({ setting_value: value })
      .eq("setting_key", key);
    await loadOnce();
  };

  return { rows, loading, reload: load, save };
};

