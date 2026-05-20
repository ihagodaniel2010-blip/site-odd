import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starting_price: number;
  image_url: string | null;
  active: boolean;
  display_order: number;
};

export const useServices = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("services")
        .select("id,name,slug,description,starting_price,image_url,active,display_order")
        .eq("active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!mounted) {
        return;
      }

      if (queryError) {
        setError(queryError.message);
        setServices([]);
        setLoading(false);
        return;
      }

      setServices((data as ServiceItem[] | null) ?? []);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return { services, loading, error };
};
