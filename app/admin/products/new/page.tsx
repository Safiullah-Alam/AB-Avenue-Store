"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { initialCategories } from "@/lib/mock-data";
import { slugify } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { ProductVariant } from "@/types";
import { saveProduct, getStoredProducts } from "@/lib/products";

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { showToast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || "");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("15");
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);
  const [tags, setTags] = useState("Kids, Cotton, Summer");
  const [metaTitle, setMetaTitle] = useState("");

  // Media
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1000&q=85",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Dynamic variants
  const COMMON_SIZES = [
    "1-2 Years",
    "2-3 Years",
    "3-4 Years",
    "4-5 Years",
    "5-6 Years",
    "6-7 Years",
    "7-8 Years",
    "9-10 Years",
  ];
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [optionName, setOptionName] = useState("Size");
  const [optionValue, setOptionValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      const existing = getStoredProducts().find((p) => p.id === editId);
      if (existing) {
        setIsEditMode(true);
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description);
        setCategoryId(existing.category_id || initialCategories[0]?.id || "");
        setRegularPrice(String(existing.price));
        setSalePrice(existing.sale_price ? String(existing.sale_price) : "");
        setSku(existing.sku);
        setStock(String(existing.stock_quantity));
        setTrackInventory(existing.track_inventory);
        setTags(existing.tags.join(", "));
        if (existing.images && existing.images.length > 0) {
          setImages(existing.images.map((i) => i.image_url));
        }
        if (existing.variants && existing.variants.length > 0) {
          setVariants(existing.variants);
          const firstVal = existing.variants[0]?.option_values?.[0];
          if (firstVal) {
            setOptionName(firstVal.option_name || "Size");
          }
        }
      }
    } else {
      // Auto-generate SKU for convenience
      setSku("AB-" + Math.floor(1000 + Math.random() * 9000));
    }
  }, [editId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode) {
      setSlug(slugify(val));
      setMetaTitle(`${val} | AB Avenue`);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const val = optionValue.trim();
    if (!val) return;
    const name = optionName.trim() || "Size";

    const existingIdx = variants.findIndex((v) =>
      v.option_values?.some((o) => o.value.toLowerCase() === val.toLowerCase())
    );
    if (existingIdx >= 0) {
      showToast({
        type: "info",
        title: "Size Already Added",
        message: `"${val}" is already included in product options.`,
      });
      return;
    }

    const v: ProductVariant = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "var-" + Date.now(),
      product_id: editId || "",
      sku: `${sku || "SKU"}-${val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}`,
      price: regularPrice ? Number(regularPrice) : 0,
      stock_quantity: Number(stock) || 10,
      option_values: [{ option_name: name, value: val }],
    };
    setVariants((prev) => [...prev, v]);
    setOptionValue("");
  };

  const togglePresetSize = (sizeStr: string) => {
    const name = optionName.trim() || "Size";
    const existingIdx = variants.findIndex((v) =>
      v.option_values?.some((o) => o.value.toLowerCase() === sizeStr.toLowerCase())
    );
    if (existingIdx >= 0) {
      setVariants((prev) => prev.filter((_, i) => i !== existingIdx));
    } else {
      const v: ProductVariant = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "var-" + Date.now(),
        product_id: editId || "",
        sku: `${sku || "SKU"}-${sizeStr.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}`,
        price: regularPrice ? Number(regularPrice) : 0,
        stock_quantity: Number(stock) || 10,
        option_values: [{ option_name: name, value: sizeStr }],
      };
      setVariants((prev) => [...prev, v]);
    }
  };

  const handleUpdateVariantValue = (id: string, newVal: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            sku: `${sku || "SKU"}-${newVal.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}`,
            option_values: v.option_values.map((ov) => ({ ...ov, value: newVal })),
          };
        }
        return v;
      })
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSave = async (publishStatus: "active" | "draft") => {
    if (!title.trim() || !regularPrice || !sku.trim()) {
      showToast({
        type: "error",
        title: "Missing Fields",
        message: "Please specify product title, price, and SKU.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Auto-commit optionValue if typed and not yet in variants
      let finalVariants = [...variants];
      const val = optionValue.trim();
      if (val) {
        const name = optionName.trim() || "Size";
        const alreadyExists = finalVariants.some((v) =>
          v.option_values?.some((ov) => ov.value.toLowerCase() === val.toLowerCase())
        );
        if (!alreadyExists) {
          finalVariants.push({
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "var-" + Date.now(),
            product_id: editId || "",
            sku: `${sku || "SKU"}-${val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}`,
            price: regularPrice ? Number(regularPrice) : 0,
            stock_quantity: Number(stock) || 10,
            option_values: [{ option_name: name, value: val }],
          });
        }
      }

      const savedItem = await saveProduct({
        id: editId || undefined,
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim(),
        category_id: categoryId || null,
        price: Number(regularPrice),
        sale_price: salePrice ? Number(salePrice) : null,
        sku: sku.trim(),
        stock_quantity: Number(stock) || 0,
        track_inventory: trackInventory,
        allow_backorders: allowBackorders,
        status: publishStatus,
        tags: parsedTags,
        meta_title: metaTitle.trim() || title.trim(),
        meta_description: description.trim(),
        images: images.map((url, idx) => ({
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "",
          product_id: editId || "",
          image_url: url,
          sort_order: idx,
        })),
        variants: finalVariants,
      });

      showToast({
        type: "success",
        title: isEditMode ? "Product Updated" : "Product Published",
        message: `${savedItem.title} is now ${publishStatus === "active" ? "live on your storefront" : "saved as draft"}.`,
      });

      router.push("/admin/products");
    } catch (err) {
      console.error("Save product error:", err);
      showToast({
        type: "error",
        title: "Error Saving Product",
        message: "Failed to persist product. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-[#6B7280] hover:text-foreground flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave("draft")}
          >
            Save as Draft
          </Button>
          <Button
            shimmer
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave("active")}
          >
            {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Publish to Storefront"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              Product Overview
            </h3>

            <Input
              label="Product Title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Baby Girls Pink Floral Frock"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="URL Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="baby-girls-pink-frock"
                required
              />
              <Input
                label="SKU Code"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="AB-1001"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                Product Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Details regarding fabric, stitching, care instructions, and sizing..."
                className="w-full px-4 py-3 rounded-2xl border border-black/10 text-xs focus:outline-none focus:border-accent bg-[#FAFAFA]"
              />
            </div>
          </div>

          {/* Card 2: Media Management */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              Product Images
            </h3>
            <p className="text-xs text-[#6B7280]">
              Add image URLs for this product. You can use Unsplash photos, your image CDN, or Supabase Storage links.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-black/10 group bg-slate-50"
                >
                  <Image
                    src={url}
                    alt={`Product image ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Image URL (https://...)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-accent bg-[#FAFAFA]"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
              >
                Add Image
              </Button>
            </div>
          </div>

          {/* Card 3: Variants */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#111827]">
                Product Sizes & Options
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Add the age groups or sizes available for this item. Customers can select them when purchasing.
              </p>
            </div>

            {/* Quick Age Presets */}
            <div>
              <label className="block text-xs font-semibold text-foreground-secondary mb-2">
                Quick Select Popular Age Groups:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((sz) => {
                  const isSelected = variants.some((v) =>
                    v.option_values?.some((o) => o.value.toLowerCase() === sz.toLowerCase())
                  );
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => togglePresetSize(sz)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-accent bg-accent text-white shadow-sm font-semibold"
                          : "border-black/10 bg-[#FAFAFA] hover:border-black/30 text-foreground"
                      }`}
                    >
                      {isSelected ? `✓ ${sz}` : `+ ${sz}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-black/5">
              <label className="block text-xs font-semibold text-foreground-secondary mb-2">
                Or Type Custom Option:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <Input
                    label="Option Type"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Size, Age, Color"
                  />
                </div>
                <div className="sm:col-span-5">
                  <Input
                    label="Option Value"
                    value={optionValue}
                    onChange={(e) => setOptionValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddVariant();
                      }
                    }}
                    placeholder="e.g. 3-4 Years, 6-12 Months"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    variant="outline"
                    size="md"
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Variants List */}
            {variants.length > 0 ? (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-foreground-secondary mb-2">
                  Active Variants ({variants.length}):
                </label>
                <div className="divide-y divide-black/5 border border-black/10 rounded-2xl overflow-hidden bg-[#FAFAFA]">
                  {variants.map((v) => {
                    const currentVal = v.option_values?.[0]?.value || "";
                    const optType = v.option_values?.[0]?.option_name || "Size";
                    return (
                      <div key={v.id} className="py-2.5 px-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] min-w-[45px]">
                            {optType}:
                          </span>
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) => handleUpdateVariantValue(v.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-black/15 bg-white text-xs font-semibold text-foreground focus:outline-none focus:border-accent max-w-[140px]"
                          />
                          <span className="text-[#6B7280] font-mono text-[11px] hidden sm:inline">
                            ({v.sku})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                💡 Tip: Tap any age group above or type a size to add it to your product.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 4: Pricing in PKR */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              Pricing & Inventory
            </h3>

            <Input
              label="Price (PKR)"
              type="number"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              placeholder="e.g. 2500"
              required
            />

            <Input
              label="Sale / Discount Price (Optional)"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 1999"
            />

            <Input
              label="Stock Available (Units)"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="15"
              required
            />

            <div className="space-y-2 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <span className="text-[#4B5563]">Track Inventory Count</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowBackorders}
                  onChange={(e) => setAllowBackorders(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <span className="text-[#4B5563]">Allow Backorders</span>
              </label>
            </div>
          </div>

          {/* Card 5: Category & Tags */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              Organization
            </h3>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-xs bg-white focus:outline-none focus:border-accent"
              >
                {initialCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Tags (Comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Girls, Party Wear, Frock"
            />
          </div>

          {/* Action CTAs */}
          <div className="space-y-2">
            <Button
              shimmer
              size="lg"
              className="w-full justify-center"
              disabled={isSaving}
              onClick={() => handleSave("active")}
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Publish to Storefront"}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              disabled={isSaving}
              onClick={() => handleSave("draft")}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#6B7280]">
          Loading product editor...
        </div>
      }
    >
      <ProductFormContent />
    </Suspense>
  );
}
