import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReviewItem = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  is_public: boolean;
  is_featured: boolean;
  anonymize_name: boolean;
  created_at: string;
};

export const useReviews = ({ featuredOnly = false }: { featuredOnly?: boolean } = {}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("reviews")
        .select("id,customer_name,rating,review_text,is_public,is_featured,anonymize_name,created_at")
        .eq("is_public", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!mounted) {
        return;
      }

      if (queryError) {
        setError(queryError.message);
        setReviews([]);
        setLoading(false);
        return;
      }

      const list = ((data as ReviewItem[] | null) ?? []).map((row) => ({
        ...row,
        customer_name: row.anonymize_name ? `${row.customer_name.split(" ")[0]}.` : row.customer_name,
      }));

      setReviews(featuredOnly ? list.filter((row) => row.is_featured) : list);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [featuredOnly]);

  return { reviews, loading, error };
};
