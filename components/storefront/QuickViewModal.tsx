"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Star, ArrowRight, Minus, Plus } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.image_url)
    : ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"];

  const isOnSale = Boolean(product.sale_price && product.sale_price < product.price);
  const effectivePrice = isOnSale && product.sale_price ? product.sale_price : product.price;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    addItem(
      {
        product_id: product.id,
        title: product.title,
        slug: product.slug,
        price: effectivePrice,
        regular_price: product.price,
        image: images[0],
        quantity,
        max_stock: product.stock_quantity,
        variant_info: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      },
      {
        top: btnRect.top,
        left: btnRect.left,
        width: btnRect.width,
        height: btnRect.height,
      }
    );

    showToast({
      type: "success",
      title: "Added to Bag",
      message: `${quantity} × ${product.title} added to your cart.`,
    });
    onClose();
  };

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F6F6F6] border border-black/5">
            <Image
              src={images[selectedImageIdx] || images[0]}
              alt={product.title}
              fill
              className="object-cover transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImageIdx === idx
                      ? "border-accent ring-1 ring-accent"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-between h-full pt-1">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground-secondary mb-2">
              <span className="caption-label">{product.sku}</span>
              {product.rating && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.rating} ({product.reviews_count} reviews)
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal leading-tight mb-3">
              {product.title}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-foreground">
                {formatCurrency(effectivePrice)}
              </span>
              {isOnSale && (
                <span className="text-base text-foreground-secondary line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-foreground-secondary leading-relaxed mb-6 line-clamp-3">
              {product.description.replace(/<[^>]*>?/gm, "")}
            </p>

            {/* Options / Variants */}
            {product.options &&
              product.options.map((opt) => (
                <div key={opt.id} className="mb-4">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-foreground-secondary mb-2">
                    {opt.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values?.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val.value;
                      return (
                        <button
                          key={val.id}
                          onClick={() => handleOptionSelect(opt.name, val.value)}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${
                            isSelected
                              ? "border-accent bg-accent text-white shadow-sm"
                              : "border-black/15 hover:border-black/40 text-foreground bg-white"
                          }`}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider font-semibold text-foreground-secondary mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-black/15 rounded-full p-1 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
            <Button
              onClick={handleAddToCart}
              shimmer
              size="lg"
              className="w-full justify-center"
            >
              Add to Bag • {formatCurrency(effectivePrice * quantity)}
            </Button>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-foreground-secondary hover:text-accent transition-colors py-2"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
