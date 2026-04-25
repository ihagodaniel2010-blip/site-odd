import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type Area = {
  id: string;
  city: string;
  state: string;
  zone: "regular" | "extended" | "request";
  display_order: number;
};

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("areas_served")
      .select("id,city,state,zone,display_order")
      .eq("active", true)
      .order("display_order")
      .then(({ data }) => {
        setAreas((data as Area[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { areas, loading };
};

export const findZoneForCity = (areas: Area[], cityName: string) => {
  if (!cityName) return null;
  const norm = cityName.trim().toLowerCase();
  const match = areas.find((a) => a.city.toLowerCase() === norm);
  return match?.zone ?? null;
};
