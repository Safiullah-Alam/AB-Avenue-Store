import { Product } from "@/types";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Server-only helper to fetch products directly during SSR / ISR.
 * Enables instant HTML streaming with LCP image discovery and 0 CLS.
 */
export async function getServerInitialProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("getServerInitialProducts DB warning:", error?.message);
      return [];
    }

    const enriched = (data as Product[]).map((p: Product) => {
      if (!p.options || p.options.length === 0) {
        const optMap: Record<string, Set<string>> = {};
        p.variants?.forEach((v) => {
          v.option_values?.forEach((ov) => {
            if (!optMap[ov.option_name]) optMap[ov.option_name] = new Set();
            optMap[ov.option_name].add(ov.value);
          });
        });
        const genOpts = Object.entries(optMap).map(([name, set], idx) => ({
          id: `opt-${idx + 1}`,
          product_id: p.id,
          name,
          sort_order: idx + 1,
          values: Array.from(set).map((val, vIdx) => ({
            id: `opt-val-${idx + 1}-${vIdx + 1}`,
            option_id: `opt-${idx + 1}`,
            value: val,
            sort_order: vIdx + 1,
          })),
        }));
        if (genOpts.length > 0) {
          return { ...p, options: genOpts };
        }
      }
      return p;
    });

    return enriched;
  } catch (err) {
    console.error("getServerInitialProducts exception:", err);
    return [];
  }
}
