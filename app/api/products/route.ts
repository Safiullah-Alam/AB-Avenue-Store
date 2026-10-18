import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Product, ProductImage, ProductVariant } from "@/types";
import crypto from "crypto";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensureUUID(id?: string | null): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, products: [] });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("API GET products error:", error);
      return NextResponse.json({ success: false, error: error.message, products: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API GET products exception:", err);
    return NextResponse.json({ success: false, error: message, products: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id: rawId,
      title,
      slug,
      description,
      category_id: rawCategoryId,
      price,
      sale_price,
      sku,
      stock_quantity,
      track_inventory,
      allow_backorders,
      status,
      tags,
      meta_title,
      meta_description,
      images,
      variants,
    } = body;

    if (!title || price === undefined || price === null || !sku) {
      return NextResponse.json(
        { success: false, error: "Title, Price, and SKU are required fields." },
        { status: 400 }
      );
    }

    const productId = ensureUUID(rawId);
    const categoryId = rawCategoryId && UUID_REGEX.test(rawCategoryId) ? rawCategoryId : null;
    const cleanSlug = slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!isSupabaseConfigured()) {
      // Offline / unconfigured fallback product object
      const fallbackProduct: Product = {
        id: productId,
        title: title.trim(),
        slug: cleanSlug,
        description: description || "",
        category_id: categoryId,
        price: Number(price) || 0,
        sale_price: sale_price ? Number(sale_price) : null,
        sku: sku.trim(),
        stock_quantity: Number(stock_quantity) || 0,
        track_inventory: track_inventory ?? true,
        allow_backorders: allow_backorders ?? false,
        status: status || "active",
        tags: Array.isArray(tags) ? tags : [],
        meta_title: meta_title || title,
        meta_description: meta_description || description || "",
        images: Array.isArray(images) ? images : [],
        variants: Array.isArray(variants) ? variants : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, product: fallbackProduct });
    }

    const supabase = getServiceSupabase();

    // 1. Upsert product
    const { error: prodError } = await supabase.from("products").upsert({
      id: productId,
      title: title.trim(),
      slug: cleanSlug,
      description: description || "",
      category_id: categoryId,
      price: Number(price) || 0,
      sale_price: sale_price ? Number(sale_price) : null,
      sku: sku.trim(),
      stock_quantity: Number(stock_quantity) || 0,
      track_inventory: track_inventory ?? true,
      allow_backorders: allow_backorders ?? false,
      status: status || "active",
      tags: Array.isArray(tags) ? tags : [],
      meta_title: meta_title || title,
      meta_description: meta_description || description || "",
      updated_at: new Date().toISOString(),
    });

    if (prodError) {
      console.error("Supabase upsert error:", prodError);
      return NextResponse.json({ success: false, error: prodError.message }, { status: 500 });
    }

    // 2. Sync images if provided
    if (Array.isArray(images) && images.length > 0) {
      // Remove old images
      await supabase.from("product_images").delete().eq("product_id", productId);

      const formattedImages = images.map((img: ProductImage | string, idx: number) => {
        const url = typeof img === "string" ? img : img.image_url;
        return {
          id: crypto.randomUUID(),
          product_id: productId,
          image_url: url,
          sort_order: idx,
        };
      });

      const { error: imgError } = await supabase.from("product_images").insert(formattedImages);
      if (imgError) {
        console.warn("Error inserting product images:", imgError);
      }
    }

    // 3. Sync variants if provided
    if (Array.isArray(variants) && variants.length > 0) {
      await supabase.from("product_variants").delete().eq("product_id", productId);

      const formattedVariants = variants.map((v: ProductVariant, idx: number) => ({
        id: crypto.randomUUID(),
        product_id: productId,
        sku: v.sku || `${sku}-${idx + 1}`,
        price: v.price ? Number(v.price) : Number(price) || 0,
        stock_quantity: v.stock_quantity !== undefined ? Number(v.stock_quantity) : 10,
        option_values: v.option_values || [],
      }));

      const { error: varError } = await supabase.from("product_variants").insert(formattedVariants);
      if (varError) {
        console.warn("Error inserting product variants:", varError);
      }
    }

    // 4. Fetch full saved product with relations
    const { data: fullProduct, error: fetchErr } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .eq("id", productId)
      .single();

    if (fetchErr || !fullProduct) {
      console.warn("Could not refetch saved product:", fetchErr);
      return NextResponse.json({
        success: true,
        product: {
          id: productId,
          title,
          slug: cleanSlug,
          price: Number(price),
          sku,
          status,
          images: images || [],
        },
      });
    }

    return NextResponse.json({ success: true, product: fullProduct });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API POST products exception:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("API DELETE product error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
