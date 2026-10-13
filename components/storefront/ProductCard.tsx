"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Eye, Star } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80";
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const isNew = product.tags?.includes("NEW");
  const isOnSale = Boolean(product.sale_price && product.sale_price < product.price);
  const effectivePrice = isOnSale && product.sale_price ? product.sale_price : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let rect: { top: number; left: number; width: number; height: number } | undefined;
    if (imageRef.current) {
      const b = imageRef.current.getBoundingClientRect();
      rect = { top: b.top, left: b.left, width: b.width, height: b.height };
    }

    addItem(
      {
        product_id: product.id,
        title: product.title,
        slug: product.slug,
        price: effectivePrice,
        regular_price: product.price,
        image: primaryImage,
        quantity: 1,
        max_stock: product.stock_quantity,
        variant_info: product.variants?.[0]?.option_values
          ? product.variants[0].option_values.reduce((acc, curr) => {
              acc[curr.option_name] = curr.value;
              return acc;
            }, {} as Record<string, string>)
          : undefined,
      },
      rect
    );

    showToast({
      type: "success",
      title: "Added to Bag",
      message: `${product.title} has been added to your collection.`,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast({
      type: "info",
      title: isFavorited ? "Removed from Wishlist" : "Saved to Wishlist",
      message: `${product.title} has been ${isFavorited ? "removed from" : "added to"} your saved items.`,
    });
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl p-3 border border-black/[0.06] shadow-card hover:shadow-card-hover transition-all duration-300 select-none"
    >
      {/* Image container */}
      <div
        ref={imageRef}
        className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F7F7F7] isolate"
      >
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <motion.div
            animate={{
              scale: isHovered ? 1.05 : 1,
              opacity: isHovered && secondaryImage !== primaryImage ? 0 : 1,
            }}
            transition={{
              scale: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 320px"
              className="object-cover object-center"
            />
          </motion.div>

          {/* Secondary Lifestyle Image crossfade */}
          {secondaryImage !== primaryImage && (
            <motion.div
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{
                scale: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.4 },
              }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={secondaryImage}
                alt={`${product.title} Alternate View`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 320px"
                className="object-cover object-center"
              />
            </motion.div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span className="relative flex h-6 items-center px-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-accent text-white shadow-sm overflow-hidden">
              <span className="relative z-10">NEW</span>
              <span className="absolute inset-0 bg-white/20 animate-ping opacity-75 rounded-full" />
            </span>
          )}
          {isOnSale && (
            <span className="h-6 flex items-center px-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-destructive text-white shadow-sm">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlistClick}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-black/5 flex items-center justify-center text-foreground hover:text-destructive transition-colors cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited
                ? "fill-destructive text-destructive"
                : "text-foreground-secondary hover:text-destructive"
            }`}
          />
        </motion.button>

        {/* Quick View Button (hover reveal on desktop) */}
        {onQuickView && (
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="absolute bottom-16 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-black/5 hidden sm:flex items-center justify-center text-foreground hover:bg-white transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4 text-foreground-secondary hover:text-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        )}

        {/* Quick Add Slide Up Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
              className="absolute bottom-3 left-3 right-3 z-10"
            >
              <button
                onClick={handleQuickAdd}
                className="w-full h-10 rounded-full bg-white/95 backdrop-blur-md hover:bg-black hover:text-white text-foreground text-xs font-semibold tracking-wider uppercase border border-black/10 shadow-lg flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Details */}
      <div className="pt-3 pb-1 px-1 flex flex-col flex-1">
        {/* Rating and category */}
        <div className="flex items-center justify-between text-xs text-foreground-secondary mb-1">
          <span className="caption-label text-[11px] font-medium tracking-wider">
            {product.sku.split("-")[0] || "ATELIER"}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              {product.reviews_count && (
                <span className="text-foreground-secondary">({product.reviews_count})</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-[17px] sm:text-[19px] leading-snug text-foreground hover:text-accent transition-colors line-clamp-1 mb-1.5 font-normal"
        >
          {product.title}
        </Link>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm sm:text-base font-semibold text-foreground">
            {formatCurrency(effectivePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs text-foreground-secondary line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
