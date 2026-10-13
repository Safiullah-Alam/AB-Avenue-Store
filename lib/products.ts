import { Product } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "ab_store_products";

/**
 * Read locally cached products
 */
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading stored products:", e);
  }
  return [];
}

/**
 * Fetch products from Supabase if configured, otherwise fallback to local store
 */
export async function fetchAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data as Product[];
      }
    } catch (err) {
      console.warn("Supabase fetch products error, fallback to local:", err);
    }
  }
  return getStoredProducts();
}

/**
 * Save new or updated product
 */
export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: productData.id || "prod-" + Date.now(),
    title: productData.title || "Untitled Product",
    slug: productData.slug || "product-" + Date.now(),
    description: productData.description || "",
    category_id: productData.category_id || null,
    price: Number(productData.price) || 0,
    sale_price: productData.sale_price ? Number(productData.sale_price) : null,
    sku: productData.sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
    stock_quantity: Number(productData.stock_quantity) || 0,
    track_inventory: productData.track_inventory ?? true,
    allow_backorders: productData.allow_backorders ?? false,
    status: productData.status || "active",
    tags: productData.tags || [],
    images: productData.images || [],
    variants: productData.variants || [],
    meta_title: productData.meta_title || productData.title || "",
    meta_description: productData.meta_description || productData.description || "",
    rating: 5,
    reviews_count: 0,
    created_at: productData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If Supabase is connected, persist to remote database
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("products").upsert({
        id: newProduct.id,
        title: newProduct.title,
        slug: newProduct.slug,
        description: newProduct.description,
        category_id: newProduct.category_id,
        price: newProduct.price,
        sale_price: newProduct.sale_price,
        sku: newProduct.sku,
        stock_quantity: newProduct.stock_quantity,
        track_inventory: newProduct.track_inventory,
        allow_backorders: newProduct.allow_backorders,
        status: newProduct.status,
        tags: newProduct.tags,
        meta_title: newProduct.meta_title,
        meta_description: newProduct.meta_description,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Supabase upsert product error:", error);
      }
    } catch (err) {
      console.warn("Supabase upsert error:", err);
    }
  }

  // Always sync to localStorage
  if (typeof window !== "undefined") {
    const existing = getStoredProducts();
    const index = existing.findIndex((p) => p.id === newProduct.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...existing[index], ...newProduct };
    } else {
      updated = [newProduct, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("products_updated"));
  }

  return newProduct;
}

/**
 * Delete product from store and remote DB
 */
export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const existing = getStoredProducts();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("products_updated"));
  }
}
