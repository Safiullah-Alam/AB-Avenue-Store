"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Clock } from "lucide-react";
import { Product } from "@/types";
import { initialProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { getStoredProducts } from "@/lib/products";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atelier_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(-1);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const pool = getStoredProducts().length > 0 ? getStoredProducts() : initialProducts;
      const filtered = pool.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q)
      );
      setResults(filtered);
      setSelectedIndex(-1);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("atelier_recent_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        saveRecentSearch(query);
        router.push(`/products/${results[selectedIndex].slug}`);
        onClose();
      } else if (query.trim()) {
        saveRecentSearch(query);
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full bg-white shadow-2xl border-b border-black/10 px-6 sm:px-12 py-8 max-h-[85vh] overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4 focus-within:border-accent transition-colors">
                <Search className="w-6 h-6 text-foreground-secondary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search timepieces, leather goods, tailored knitwear..."
                  className="w-full font-serif text-xl sm:text-2xl text-foreground placeholder:text-foreground-secondary/40 focus:outline-none bg-transparent"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-foreground-secondary hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors ml-2"
                >
                  ESC
                </button>
              </div>

              {/* Instant Results */}
              {query.trim() && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="caption-label">
                      {results.length} {results.length === 1 ? "Result" : "Results"} Found
                    </span>
                    {results.length > 0 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(query.trim())}`}
                        onClick={onClose}
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                      >
                        View all results <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {results.length === 0 ? (
                    <div className="py-12 text-center text-foreground-secondary">
                      <p className="text-base font-serif">No products found matching &ldquo;{query}&rdquo;</p>
                      <p className="text-xs mt-1">Try searching for &ldquo;Chronos&rdquo;, &ldquo;Leather&rdquo;, or &ldquo;Cashmere&rdquo;.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.map((product, idx) => {
                        const isSelected = selectedIndex === idx;
                        const img = product.images?.[0]?.image_url || "";
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              saveRecentSearch(query);
                              onClose();
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isSelected
                                ? "border-accent bg-accent/5 ring-1 ring-accent"
                                : "border-black/5 hover:border-black/20 bg-[#FAFAFA]"
                            }`}
                          >
                            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-black/5">
                              {img && <Image src={img} alt="" fill className="object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-serif text-sm font-normal text-foreground truncate">
                                {product.title}
                              </h4>
                              <p className="text-xs text-foreground-secondary mt-0.5">
                                {product.sku}
                              </p>
                              <p className="text-xs font-semibold text-foreground mt-1">
                                {formatCurrency(product.sale_price || product.price)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Recent & Suggested Searches */}
              {!query.trim() && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="caption-label mb-3">Recent Searches</h4>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(term)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#FAFAFA] border border-black/5 hover:border-black/20 text-foreground transition-all"
                          >
                            <Clock className="w-3 h-3 text-foreground-secondary" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="caption-label mb-3">Popular Collections</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Automatic Timepieces", "Tuscan Leather", "Cashmere Knitwear", "Extrait Perfumes"].map(
                        (col, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuery(col.split(" ")[0])}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/5 hover:bg-black/10 text-foreground transition-colors"
                          >
                            {col}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
