"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Tag, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { initialCoupons } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { showToast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const matched = initialCoupons.find((c) => c.code === code && c.is_active);
    if (!matched) {
      setCouponError("Invalid or expired promotional code.");
      return;
    }

    if (matched.min_order_amount && subtotal < matched.min_order_amount) {
      setCouponError(`Minimum order amount of ${formatCurrency(matched.min_order_amount)} required.`);
      return;
    }

    if (matched.type === "percentage") {
      applyCoupon({ code: matched.code, discountPercent: matched.value });
    } else {
      applyCoupon({ code: matched.code, discountFixed: matched.value });
    }

    showToast({
      type: "success",
      title: "Coupon Applied",
      message: `Code ${matched.code} has been applied to your order.`,
    });
    setCouponCode("");
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (subtotal * appliedCoupon.discountPercent) / 100
      : appliedCoupon.discountFixed || 0
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-24 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-12 border border-black/5 shadow-card">
          <div className="w-20 h-20 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto mb-6 text-foreground-secondary">
            <ShoppingBag className="w-10 h-10 opacity-30" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-foreground mb-3">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-foreground-secondary leading-relaxed mb-8 font-light">
            No pieces have been placed in your archival collection yet. Explore our curated timepieces, Tuscan leather, and bespoke apparel.
          </p>
          <Link href="/products">
            <Button shimmer size="lg" className="rounded-full px-8">
              Explore The Archive
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
      <div className="border-b border-black/5 pb-6 mb-10">
        <span className="caption-label">Collector Cart</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-foreground mt-1">
          Shopping Bag ({itemCount})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, x: 50 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white border border-black/5 shadow-card"
              >
                {/* Image */}
                <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-[#F7F7F7] border border-black/5 flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-serif text-lg font-medium text-foreground hover:text-accent transition-colors"
                        >
                          {item.title}
                        </Link>
                        {item.variant_info && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.variant_info).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-xs text-foreground-secondary bg-[#FAFAFA] px-2 py-0.5 rounded border border-black/5"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-serif text-lg font-semibold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Unit Price: {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5">
                    <div className="inline-flex items-center border border-black/10 rounded-full bg-white p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-foreground-secondary hover:text-destructive text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-card space-y-6">
            <h3 className="font-serif text-xl font-normal text-foreground pb-4 border-b border-black/5">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20 text-xs">
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Code <strong>{appliedCoupon.code}</strong> applied
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-foreground-secondary hover:text-destructive text-xs font-semibold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-foreground-secondary" />
                    <input
                      type="text"
                      placeholder="Promotional Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-3 rounded-full border border-black/10 bg-[#FAFAFA] uppercase tracking-wider font-medium focus:outline-none focus:border-accent"
                    />
                  </div>
                  <Button variant="outline" size="sm" type="submit" className="px-5">
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive font-medium pl-1">{couponError}</p>
                )}
              </form>
            )}

            {/* Delivery Destination Notice */}
            <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-accent/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-accent" />
                  Delivery Charges:
                </span>
                <span className="text-xs font-bold text-accent">
                  Rs. 100 – Rs. 300
                </span>
              </div>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Subject to location. Delivery charges will be quoted at the time of order confirmation through WhatsApp once your order is placed.
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs text-foreground-secondary pt-2">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promotional Privilege</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="font-semibold text-accent">
                  Rs. 100 – Rs. 300 (Quoted on WhatsApp)
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground pt-3 border-t border-black/5">
                <span>Order Subtotal</span>
                <span className="text-xl text-accent">{formatCurrency(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-foreground-secondary text-right">
                + Delivery fee (Rs. 100 – Rs. 300) quoted on WhatsApp
              </p>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button shimmer size="lg" className="w-full justify-center gap-2">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="pt-4 border-t border-black/5 space-y-2 text-[11px] text-foreground-secondary">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                <span>Delivery Rs. 100 to Rs. 300 quoted on WhatsApp confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Safe payments with Cash on Delivery & EasyPaisa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
