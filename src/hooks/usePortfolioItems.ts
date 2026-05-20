import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PORTFOLIO_CATEGORIES = [
  "Residential",
  "Commercial",
  "Deep Cleaning",
  "Move In/Out",
  "Standard Cleaning",
] as const;

export const PORTFOLIO_ROOMS = [
  "Kitchen",
  "Bathroom",
  "Living Room",
  "Bedroom",
  "Office",
  "Basement",
  "Other",
] as const;

export type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  room: string;
  before_image_url: string | null;
  after_image_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const toStringOrNull = (value: unknown) => (typeof value === "string" ? value : null);

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  return fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return fallback;
};

const normalizePortfolioItem = (row: Record<string, unknown>): PortfolioItem => {
  const title = toStringOrNull(row.title) ?? "Untitled Project";
  const category = toStringOrNull(row.category) ?? "Standard Cleaning";
  const room = toStringOrNull(row.room) ?? toStringOrNull(row.location) ?? "Other";
  const beforeImage = toStringOrNull(row.before_image_url) ?? toStringOrNull(row.image_url);
  const afterImage = toStringOrNull(row.after_image_url) ?? toStringOrNull(row.image_url);

  return {
    id: toStringOrNull(row.id) ?? `${title}-${Date.now()}`,
    title,
    description: toStringOrNull(row.description),
    category,
    room,
    before_image_url: beforeImage,
    after_image_url: afterImage,
    is_public: toBoolean(row.is_public, toBoolean(row.active, true)),
    is_featured: toBoolean(row.is_featured, toBoolean(row.featured, false)),
    display_order: toNumber(row.display_order, 0),
    created_at: toStringOrNull(row.created_at) ?? new Date(0).toISOString(),
    updated_at: toStringOrNull(row.updated_at) ?? new Date(0).toISOString(),
  };
};

const sortItems = (items: PortfolioItem[]) =>
  [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

export const usePortfolioItems = ({ featuredOnly = false }: { featuredOnly?: boolean } = {}) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!mounted) {
        return;
      }

      if (queryError) {
        setError(queryError.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const normalized = ((data as Record<string, unknown>[] | null) ?? []).map(normalizePortfolioItem);
      const publicItems = normalized.filter((item) => item.is_public);
      const filtered = featuredOnly ? publicItems.filter((item) => item.is_featured) : publicItems;

      setItems(sortItems(filtered));
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [featuredOnly]);

  return { items, loading, error };
};
