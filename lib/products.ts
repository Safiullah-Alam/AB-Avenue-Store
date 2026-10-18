import { Product } from "@/types";

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
 * Fetch products from Server API (which queries Supabase with service role)
 * with robust local cache fallback
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products", {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        if (typeof window !== "undefined") {
          // If remote DB returned products, cache them locally
          if (data.products.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
          } else {
            // If remote DB is empty, check if we have local products
            const local = getStoredProducts();
            if (local.length > 0) {
              return local;
            }
          }
        }
        return data.products as Product[];
      }
    }
  } catch (err) {
    console.warn("Fetch products API error, fallback to local:", err);
  }

  return getStoredProducts();
}

/**
 * Save new or updated product via Server API
 */
export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const localCopy: Product = {
    id: productData.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "prod-" + Date.now()),
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

  let savedProduct = localCopy;

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...productData,
        id: localCopy.id,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.product) {
        savedProduct = json.product;
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      console.warn("Server saveProduct returned error:", errJson);
    }
  } catch (err) {
    console.warn("Network error during saveProduct, persisting locally:", err);
  }

  // Always sync to localStorage
  if (typeof window !== "undefined") {
    const existing = getStoredProducts();
    const index = existing.findIndex((p) => p.id === savedProduct.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...existing[index], ...savedProduct };
    } else {
      updated = [savedProduct, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("products_updated"));
  }

  return savedProduct;
}

/**
 * Delete product from store and remote DB
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("API delete error:", err);
  }

  if (typeof window !== "undefined") {
    const existing = getStoredProducts();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("products_updated"));
  }
}
