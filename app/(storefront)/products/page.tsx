"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { QuickViewModal } from "@/components/storefront/QuickViewModal";
import { initialCategories } from "@/lib/mock-data";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getStoredProducts, fetchAllProducts } from "@/lib/products";

function ProductListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Params State
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const load = async () => {
      const list = await fetchAllProducts();
      setProducts(list || getStoredProducts());
    };
    load();

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener("products_updated", handleUpdate);
    return () => window.removeEventListener("products_updated", handleUpdate);
  }, []);

  // Sync category changes to URL
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.replace(`/products?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.replace(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setMaxPrice(50000);
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery("");
    router.replace("/products");
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = initialCategories.find((c) => c.slug === selectedCategory);
        if (cat && product.category_id !== cat.id) return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTag = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Price filter
      const price = product.sale_price || product.price;
      if (price > maxPrice) return false;

      // Rating filter
      if (minRating > 0 && (product.rating || 0) < minRating) return false;

      // In stock
      if (inStockOnly && product.stock_quantity <= 0) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price || a.price;
      const priceB = b.sale_price || b.price;

      if (sortOption === "price-low") return priceA - priceB;
      if (sortOption === "price-high") return priceB - priceA;
      if (sortOption === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortOption === "best-selling") return (b.reviews_count || 0) - (a.reviews_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, selectedCategory, searchQuery, maxPrice, minRating, inStockOnly, sortOption]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (maxPrice < 50000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
      {/* PLP Header */}
      <div className="border-b border-black/5 pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="caption-label">The Archive & Collection</span>
            <h1 className="font-serif text-3xl sm:text-5xl text-foreground font-normal mt-1">
              Curated Catalog
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 max-w-lg">
              Explore automatic timepieces, Tuscan leather goods, and refined cashmere garments designed for discerning lifestyles.
            </p>
          </div>

          {/* Controls bar: Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 bg-white text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              <Filter className="w-4 h-4" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-black/10 rounded-full px-5 py-2.5 pr-10 text-xs font-semibold uppercase tracking-wider text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="best-selling">Sort: Best Selling</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="rating">Sort: Top Rated</option>
              </select>
              <ChevronDown className="w-4 h-4 text-foreground-secondary absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <span className="text-xs text-foreground-secondary">Active filters:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-black/5 text-foreground font-medium">
                Category: {initialCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => handleCategoryChange("all")} className="hover:text-accent">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-black/5 text-foreground font-medium">
                Search: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery("")} className="hover:text-accent">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {maxPrice < 1000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-black/5 text-foreground font-medium">
                Max: {formatCurrency(maxPrice)}
                <button onClick={() => setMaxPrice(1000)} className="hover:text-accent">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-black/5 text-foreground font-medium">
                Rating: {minRating}+ Stars
                <button onClick={() => setMinRating(0)} className="hover:text-accent">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-black/5 text-foreground font-medium">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} className="hover:text-accent">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs text-destructive hover:underline font-medium inline-flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main PLP Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-28 bg-white p-6 rounded-2xl border border-black/5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              Refine Archive
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-destructive hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="caption-label mb-3">Categories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-foreground-secondary hover:text-foreground hover:bg-black/5"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] opacity-60">{products.length}</span>
              </button>
              {initialCategories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-foreground-secondary hover:text-foreground hover:bg-black/5"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="caption-label">Max Price</h4>
              <span className="text-xs font-semibold text-foreground">
                {formatCurrency(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground-secondary mt-1">
              <span>$100</span>
              <span>$1,000+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="caption-label mb-3">Minimum Rating</h4>
            <div className="flex gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    minRating === r
                      ? "border-accent bg-accent text-white"
                      : "border-black/10 text-foreground-secondary hover:border-black/30"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-black/5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-black/20 text-accent focus:ring-accent"
              />
              <span className="text-xs font-medium text-foreground">In Stock Pieces Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <span className="caption-label">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-16 text-center shadow-card">
              <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4 text-foreground-secondary">
                <Filter className="w-6 h-6 opacity-40" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-foreground mb-2">
                No matching pieces found
              </h3>
              <p className="text-sm text-foreground-secondary max-w-sm mx-auto mb-6">
                Try widening your search terms, adjusting the maximum price slider, or clearing active filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-accent text-white text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-accent-hover transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid: 4 columns desktop (or 3 when sidebar is open), 2 columns mobile, gap: 24px */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredProducts.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-8 py-3 rounded-full border border-black/15 hover:border-black/40 bg-white text-xs font-semibold uppercase tracking-widest text-foreground shadow-sm hover:bg-[#FAFAFA] transition-all"
                  >
                    Load More Archive Pieces
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-6">
                  <h3 className="font-serif text-xl font-normal">Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-foreground-secondary hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Category */}
                <div className="mb-6">
                  <h4 className="caption-label mb-2">Category</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                        selectedCategory === "all" ? "bg-accent text-white font-semibold" : "text-foreground-secondary"
                      }`}
                    >
                      All
                    </button>
                    {initialCategories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCategoryChange(c.slug)}
                        className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                          selectedCategory === c.slug ? "bg-accent text-white font-semibold" : "text-foreground-secondary"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="caption-label">Max Price</span>
                    <span className="font-semibold">{formatCurrency(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="25"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="w-1/2 py-2.5 rounded-full border border-black/10 text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 rounded-full bg-accent text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-[1440px] mx-auto px-6 py-20 text-center">Loading Archive...</div>}>
      <ProductListingContent />
    </Suspense>
  );
}
