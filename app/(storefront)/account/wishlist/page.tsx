"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { initialProducts } from "@/lib/mock-data";
import { getStoredProducts } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();

  const pool = getStoredProducts().length > 0 ? getStoredProducts() : initialProducts;
  const wishlistedProducts = pool.filter((p) =>
    wishlistIds.includes(p.id)
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
      <div className="border-b border-black/5 pb-6 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/account"
            className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
          </Link>
          <span className="caption-label">Private Collection</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-foreground mt-1">
            Curated Wishlist ({wishlistedProducts.length})
          </h1>
        </div>

        <Link href="/products">
          <Button variant="outline" size="sm">
            Browse More Pieces
          </Button>
        </Link>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-black/5 shadow-card max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4 text-foreground-secondary">
            <Heart className="w-7 h-7 opacity-30" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-foreground mb-2">
            No Saved Items Yet
          </h3>
          <p className="text-sm text-foreground-secondary leading-relaxed mb-6 font-light">
            Click the heart icon on any archival timepiece, leather good, or knitwear to save it to your private list.
          </p>
          <Link href="/products">
            <Button shimmer size="md">
              Explore The Archive
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
