import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export type Area = {
  id: string;
  city: string;
  state: string;
  zone: "regular" | "extended" | "request";
  display_order: number;
};

const DEFAULT_AREAS: Area[] = [
  { id: "fallback-1", city: "Lowell", state: "MA", zone: "regular", display_order: 1 },
  { id: "fallback-2", city: "Dracut", state: "MA", zone: "regular", display_order: 2 },
  { id: "fallback-3", city: "Chelmsford", state: "MA", zone: "regular", display_order: 3 },
  { id: "fallback-4", city: "Tyngsborough", state: "MA", zone: "regular", display_order: 4 },
  { id: "fallback-5", city: "Tewksbury", state: "MA", zone: "regular", display_order: 5 },
  { id: "fallback-6", city: "Billerica", state: "MA", zone: "regular", display_order: 6 },
  { id: "fallback-7", city: "Westford", state: "MA", zone: "regular", display_order: 7 },
  { id: "fallback-8", city: "Andover", state: "MA", zone: "regular", display_order: 8 },
  { id: "fallback-9", city: "North Andover", state: "MA", zone: "regular", display_order: 9 },
  { id: "fallback-10", city: "Wilmington", state: "MA", zone: "regular", display_order: 10 },
  { id: "fallback-11", city: "Reading", state: "MA", zone: "extended", display_order: 11 },
  { id: "fallback-12", city: "Wakefield", state: "MA", zone: "extended", display_order: 12 },
  { id: "fallback-13", city: "Stoneham", state: "MA", zone: "extended", display_order: 13 },
  { id: "fallback-14", city: "Woburn", state: "MA", zone: "extended", display_order: 14 },
  { id: "fallback-15", city: "Burlington", state: "MA", zone: "extended", display_order: 15 },
  { id: "fallback-16", city: "Bedford", state: "MA", zone: "extended", display_order: 16 },
  { id: "fallback-17", city: "Lexington", state: "MA", zone: "extended", display_order: 17 },
  { id: "fallback-18", city: "Concord", state: "MA", zone: "extended", display_order: 18 },
  { id: "fallback-19", city: "Acton", state: "MA", zone: "extended", display_order: 19 },
  { id: "fallback-20", city: "Littleton", state: "MA", zone: "extended", display_order: 20 },
  { id: "fallback-21", city: "Maynard", state: "MA", zone: "extended", display_order: 21 },
  { id: "fallback-22", city: "Nashua", state: "NH", zone: "request", display_order: 22 },
  { id: "fallback-23", city: "Hudson", state: "NH", zone: "request", display_order: 23 },
  { id: "fallback-24", city: "Merrimack", state: "NH", zone: "request", display_order: 24 },
  { id: "fallback-25", city: "Londonderry", state: "NH", zone: "request", display_order: 25 },
  { id: "fallback-26", city: "Derry", state: "NH", zone: "request", display_order: 26 },
  { id: "fallback-27", city: "Salem", state: "NH", zone: "request", display_order: 27 },
  { id: "fallback-28", city: "Windham", state: "NH", zone: "request", display_order: 28 },
  { id: "fallback-29", city: "Pelham", state: "NH", zone: "request", display_order: 29 },
  { id: "fallback-30", city: "Atkinson", state: "NH", zone: "request", display_order: 30 },
];

export const useAreas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("areas_served")
      .select("id,city,state,zone,display_order")
      .eq("active", true)
      .order("display_order")
      .then(({ data, error }) => {
        const dbAreas = (data as Area[]) ?? [];
        if (!error && dbAreas.length > 0) {
          setAreas(dbAreas);
        } else {
          setAreas(DEFAULT_AREAS);
        }
        setLoading(false);
      })
      .catch(() => {
        setAreas(DEFAULT_AREAS);
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

