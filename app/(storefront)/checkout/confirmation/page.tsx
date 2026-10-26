"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Package, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-10001";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atelier_last_order");
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const isCOD = order?.payment_method === "cod";

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-black/5 p-8 sm:p-14 shadow-card text-center">
        {/* Animated Checkmark (SVG path draw animation) */}
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 text-success">
          <svg className="w-10 h-10" viewBox="0 0 52 52">
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="#16A34A"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.path
              fill="none"
              stroke="#16A34A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l8 8 16-16"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            />
          </svg>
        </div>

        <span className="caption-label text-success">Order Successfully Placed</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-2 mb-3">
          Shukriya for shopping with AB Avenue!
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed mb-6 font-light max-w-md mx-auto">
          Your order <strong className="text-foreground font-mono font-medium">{orderId}</strong> has been received by Safiullah. We will verify and pack your parcel promptly.
        </p>

        {/* Order Brief Box */}
        <div className="bg-[#FAFAFA] rounded-2xl p-6 text-left border border-black/5 mb-8 space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-black/5">
            <span className="text-foreground-secondary">Estimated Delivery</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-accent" />
              2–4 Business Days (TCS / Trax Courier)
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-black/5">
            <span className="text-foreground-secondary">Delivery Charges</span>
            <span className="font-semibold text-accent">
              Rs. 100 – Rs. 300 (Quoted on WhatsApp)
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-black/5">
            <span className="text-foreground-secondary">Payment Mode</span>
            <span className="font-semibold text-foreground">
              {isCOD ? "Cash on Delivery (COD)" : "EasyPaisa Mobile Account"}
            </span>
          </div>

          {order?.easypaisa_transaction_id && (
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <span className="text-foreground-secondary">EasyPaisa TRX ID</span>
              <span className="font-mono font-semibold text-emerald-700">
                {order.easypaisa_transaction_id}
              </span>
            </div>
          )}

          {order && (
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary">Items Subtotal</span>
              <span className="font-semibold text-accent text-sm">
                {formatCurrency(order.total)}
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp Confirmation Box */}
        <div className="mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-emerald-950 text-sm">
              Confirm Your Order via WhatsApp
            </p>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              We will contact you on WhatsApp to confirm your items and quote the exact delivery charges <strong>(Rs. 100 to Rs. 300)</strong> based on your location. You can also tap below to message us immediately!
            </p>
          </div>
          <a
            href={`https://wa.me/923238048183?text=Salam%20Safiullah,%20I%20have%20placed%20order%20${orderId}%20on%20AB%20Avenue.%20Please%20confirm%20my%20order%20and%20quote%20delivery%20charges.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors self-stretch sm:self-auto justify-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirm on WhatsApp</span>
          </a>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/account" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              <Package className="w-4 h-4" />
              <span>Track in Account</span>
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" shimmer className="w-full sm:w-auto gap-2">
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
