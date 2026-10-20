"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, CheckCircle2, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { initialCoupons } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
    isDrawerOpen,
    closeDrawer,
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

  const [deliveryArea, setDeliveryArea] = useState<"north" | "karachi">("north");

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (subtotal * appliedCoupon.discountPercent) / 100
      : appliedCoupon.discountFixed || 0
    : 0;

  const freeThreshold = deliveryArea === "north" ? 3000 : 5000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : deliveryArea === "north" ? 100 : 200;
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="relative z-10 flex flex-col h-full w-full max-w-md bg-white shadow-drawer text-foreground"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-[#FAFAFA]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-xl font-normal text-foreground">
                  Shopping Bag
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/5 text-foreground-secondary">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-black/5 text-foreground-secondary hover:text-foreground transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center mb-4 text-foreground-secondary">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <h4 className="font-serif text-xl font-normal mb-2 text-foreground">
                    Your bag is empty
                  </h4>
                  <p className="text-sm text-foreground-secondary max-w-xs mb-6">
                    Items added to your collection will appear here. Enjoy complimentary insured delivery on all orders over $250.
                  </p>
                  <Button
                    onClick={closeDrawer}
                    variant="secondary"
                    className="rounded-full px-6"
                  >
                    Continue Browsing
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  className="space-y-4"
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, x: 50 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 p-3.5 rounded-xl border border-black/5 bg-[#FAFAFA]/60 relative overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-white border border-black/5 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeDrawer}
                              className="font-serif text-sm font-medium text-foreground hover:text-accent transition-colors line-clamp-1"
                            >
                              {item.title}
                            </Link>

                            {item.variant_info && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.variant_info).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[11px] text-foreground-secondary bg-white px-2 py-0.5 rounded border border-black/5"
                                  >
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-1 text-sm font-semibold text-foreground">
                              {formatCurrency(item.price)}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                            <div className="inline-flex items-center border border-black/10 rounded-full bg-white px-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-foreground-secondary hover:text-foreground"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-foreground-secondary hover:text-foreground"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-foreground-secondary hover:text-destructive p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-[#FAFAFA] space-y-4">
                {/* Promo Code Form */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-success/10 border border-success/20 text-xs">
                    <div className="flex items-center gap-2 text-success font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Coupon <strong>{appliedCoupon.code}</strong> applied (
                        {appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}% off` : `$${appliedCoupon.discountFixed} off`}
                        )
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-foreground-secondary hover:text-destructive text-xs font-semibold underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-foreground-secondary" />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. WELCOME15)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-full border border-black/10 bg-white focus:outline-none focus:border-accent uppercase tracking-wider font-medium"
                      />
                    </div>
                    <Button variant="outline" size="sm" type="submit">
                      Apply
                    </Button>
                  </form>
                )}
                {couponError && (
                  <p className="text-xs text-destructive font-medium">{couponError}</p>
                )}

                {/* Delivery Location Selector */}
                <div className="p-3 rounded-2xl bg-[#F8F8F8] border border-black/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-accent" />
                      Delivery Destination:
                    </span>
                    <span className="text-[11px] font-bold text-accent">
                      {isFreeDelivery ? "FREE" : formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea("north")}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        deliveryArea === "north"
                          ? "border-accent bg-accent/10 font-semibold text-foreground"
                          : "border-black/5 bg-white text-foreground-secondary hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>North Karachi</span>
                        <span className="text-[10px] font-bold">Rs. 100</span>
                      </div>
                      <span className="text-[10px] text-foreground-secondary block">
                        Free on Rs. 3,000+
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea("karachi")}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        deliveryArea === "karachi"
                          ? "border-accent bg-accent/10 font-semibold text-foreground"
                          : "border-black/5 bg-white text-foreground-secondary hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>All Karachi</span>
                        <span className="text-[10px] font-bold">Rs. 200</span>
                      </div>
                      <span className="text-[10px] text-foreground-secondary block">
                        Free on Rs. 5,000+
                      </span>
                    </button>
                  </div>

                  {/* Free delivery prompt */}
                  {items.length > 0 && (
                    <div className="pt-1">
                      {isFreeDelivery ? (
                        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          🎉 You have unlocked FREE Delivery!
                        </p>
                      ) : (
                        <p className="text-[11px] text-foreground-secondary">
                          Add <strong>{formatCurrency(amountNeededForFree)}</strong> more for <strong>FREE Delivery</strong> in {deliveryArea === "north" ? "North Karachi" : "Karachi"}!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Subtotals breakdown */}
                <div className="space-y-1.5 text-xs text-foreground-secondary">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Promotional Discount</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charges ({deliveryArea === "north" ? "North Karachi" : "All Karachi"})</span>
                    <span className="font-semibold text-foreground">
                      {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-foreground pt-2 border-t border-black/5">
                    <span>Estimated Total</span>
                    <span className="text-base text-accent">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full block"
                >
                  <Button shimmer size="lg" className="w-full gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="text-center">
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="text-xs font-medium text-foreground-secondary hover:text-foreground underline"
                  >
                    View Full Shopping Cart Page
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
