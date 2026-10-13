"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  Copy,
  CheckCircle2,
  Wallet,
  Banknote,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types";
import { saveOrder } from "@/lib/orders";
import { EASYPAISA_CONFIG } from "@/lib/easypaisa";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, appliedCoupon } = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Shipping Form State (Pakistani addresses)
  const [shippingData, setShippingData] = useState({
    fullName: profile?.full_name || "",
    email: user?.email || profile?.email || "",
    phone: profile?.phone || "",
    address1: "",
    address2: "",
    city: "Karachi",
    state: "Sindh",
    zip: "75600",
    country: "Pakistan",
  });

  // Shipping Methods in Pakistan
  const shippingMethods = [
    { id: "std", name: "Standard Courier Delivery (TCS / Trax)", time: "2–4 Business Days", cost: 200 },
    { id: "exp", name: "Karachi Same-Day / Express Courier", time: "24 Hours", cost: 350 },
  ];
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(shippingMethods[0]);

  // Payment Form State (EasyPaisa & COD)
  const [paymentMethod, setPaymentMethod] = useState<"easypaisa" | "cod">("easypaisa");
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  // Totals calculations
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (subtotal * appliedCoupon.discountPercent) / 100
      : appliedCoupon.discountFixed || 0
    : 0;

  // Free shipping on orders over Rs. 3000
  const isFreeShipping = subtotal >= 3000;
  const shippingCost = isFreeShipping ? 0 : selectedShippingMethod.cost;
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingCost;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast({
      type: "success",
      title: "Copied!",
      message: `${field} copied to clipboard.`,
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.email || !shippingData.address1 || !shippingData.city) {
      showToast({ type: "error", title: "Incomplete Address", message: "Please complete all required fields." });
      return;
    }
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "easypaisa" && (!trxId.trim() || !senderPhone.trim())) {
      showToast({
        type: "error",
        title: "Missing Transaction Details",
        message: "Please enter your EasyPaisa Transaction ID (TRX ID) and Sender Mobile number.",
      });
      return;
    }
    setCurrentStep("review");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderNumber = "ORD-" + Math.floor(10000 + Math.random() * 90000);
      const newOrder: Order = {
        id: "order-" + Date.now(),
        order_number: orderNumber,
        user_id: user?.id || null,
        email: shippingData.email,
        shipping_address: {
          full_name: shippingData.fullName,
          phone: shippingData.phone,
          address_line1: shippingData.address1,
          address_line2: shippingData.address2,
          city: shippingData.city,
          state: shippingData.state,
          zip: shippingData.zip,
          country: shippingData.country,
        },
        billing_address: {
          full_name: shippingData.fullName,
          phone: shippingData.phone,
          address_line1: shippingData.address1,
          address_line2: shippingData.address2,
          city: shippingData.city,
          state: shippingData.state,
          zip: shippingData.zip,
          country: shippingData.country,
        },
        shipping_method: selectedShippingMethod.name,
        shipping_cost: shippingCost,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: 0,
        total: finalTotal,
        coupon_code: appliedCoupon?.code || null,
        payment_status: paymentMethod === "easypaisa" ? "pending" : "pending",
        fulfillment_status: "processing",
        easypaisa_transaction_id: paymentMethod === "easypaisa" ? trxId.trim() : null,
        payment_method: paymentMethod === "easypaisa" ? "easypaisa_wallet" : "cod",
        tracking_number: null,
        tracking_carrier: "TCS Courier",
        notes:
          paymentMethod === "easypaisa"
            ? `EasyPaisa transfer to 03238048183 (Safiullah). Sender phone: ${senderPhone.trim()}, TRX: ${trxId.trim()}`
            : "Cash on Delivery Order",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: items.map((i) => ({
          id: "item-" + Math.random().toString(36).substring(2, 9),
          order_id: orderNumber,
          product_id: i.product_id,
          variant_id: i.variant_id,
          title: i.title,
          quantity: i.quantity,
          unit_price: i.price,
          line_total: i.price * i.quantity,
          image_url: i.image,
          variant_info: i.variant_info,
        })),
        timeline: [
          {
            id: "tl-" + Date.now(),
            order_id: orderNumber,
            status: "Order Placed",
            note:
              paymentMethod === "easypaisa"
                ? `Paid via EasyPaisa (TRX ID: ${trxId.trim()}) to Safiullah.`
                : "Order confirmed with Cash on Delivery.",
            created_at: new Date().toISOString(),
          },
        ],
      };

      // Save order to persistent store & Supabase
      await saveOrder(newOrder);

      clearCart();
      showToast({
        type: "success",
        title: "Order Placed Successfully",
        message: `Order ${orderNumber} is confirmed!`,
      });

      router.push(`/checkout/confirmation?orderId=${orderNumber}`);
    } catch (err) {
      console.error("Order processing error:", err);
      showToast({
        type: "error",
        title: "Order Failed",
        message: "Failed to place order. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && currentStep === "shipping") {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-foreground-secondary mb-8">
          Explore our collection to add items before checking out.
        </p>
        <Link href="/products">
          <Button size="lg" shimmer>
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-20">
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-black/10 -z-0" />

          {/* Stepper Node 1 */}
          <div className="flex flex-col items-center gap-2 relative z-10 bg-background px-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                currentStep === "shipping"
                  ? "bg-accent text-white shadow-sm ring-4 ring-accent/20"
                  : "bg-success text-white"
              }`}
            >
              {currentStep !== "shipping" ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className="caption-label text-[10px]">Shipping</span>
          </div>

          {/* Stepper Node 2 */}
          <div className="flex flex-col items-center gap-2 relative z-10 bg-background px-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                currentStep === "payment"
                  ? "bg-accent text-white shadow-sm ring-4 ring-accent/20"
                  : currentStep === "review"
                  ? "bg-success text-white"
                  : "bg-black/5 text-foreground-secondary"
              }`}
            >
              {currentStep === "review" ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span className="caption-label text-[10px]">Payment</span>
          </div>

          {/* Stepper Node 3 */}
          <div className="flex flex-col items-center gap-2 relative z-10 bg-background px-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                currentStep === "review"
                  ? "bg-accent text-white shadow-sm ring-4 ring-accent/20"
                  : "bg-black/5 text-foreground-secondary"
              }`}
            >
              3
            </div>
            <span className="caption-label text-[10px]">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Interactive Flow (7 Cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {/* Step 1: Shipping Details */}
            {currentStep === "shipping" && (
              <motion.form
                key="step-shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleShippingSubmit}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-1">
                    Delivery Destination
                  </h2>
                  <p className="text-xs text-foreground-secondary">
                    Please provide your delivery destination across Pakistan.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      placeholder="e.g. Safiullah Khan"
                      required
                    />
                    <Input
                      label="Mobile Contact (WhatsApp)"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      placeholder="03xx xxxxxxx"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address (For receipts)"
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                  />

                  <Input
                    label="Complete Street Address / House / Flat"
                    value={shippingData.address1}
                    onChange={(e) => setShippingData({ ...shippingData, address1: e.target.value })}
                    placeholder="House 12, Street 4, Block 5"
                    required
                  />

                  <Input
                    label="Apartment, Landmark, Suite (Optional)"
                    value={shippingData.address2}
                    onChange={(e) => setShippingData({ ...shippingData, address2: e.target.value })}
                    placeholder="Near Dolmen Mall / Clifton"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      placeholder="Karachi, Lahore, Islamabad"
                      required
                    />
                    <Input
                      label="Province / State"
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      placeholder="Sindh"
                      required
                    />
                    <Input
                      label="Postal Code"
                      value={shippingData.zip}
                      onChange={(e) => setShippingData({ ...shippingData, zip: e.target.value })}
                      placeholder="75600"
                    />
                  </div>
                </div>

                {/* Delivery Option Selector */}
                <div className="pt-4 space-y-3">
                  <h3 className="caption-label text-foreground">Delivery Service</h3>
                  <div className="space-y-2">
                    {shippingMethods.map((m) => {
                      const cost = isFreeShipping ? 0 : m.cost;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                            selectedShippingMethod.id === m.id
                              ? "border-accent bg-accent/5 ring-1 ring-accent"
                              : "border-black/10 hover:border-black/20 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={selectedShippingMethod.id === m.id}
                              onChange={() => setSelectedShippingMethod(m)}
                              className="text-accent focus:ring-accent"
                            />
                            <div>
                              <p className="text-xs font-semibold text-foreground">{m.name}</p>
                              <p className="text-[11px] text-foreground-secondary">{m.time}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {cost === 0 ? "FREE" : formatCurrency(cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" shimmer className="gap-2 w-full sm:w-auto">
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Payment via EasyPaisa & COD */}
            {currentStep === "payment" && (
              <motion.form
                key="step-payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePaymentSubmit}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-1">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-foreground-secondary">
                    Secure checkout supported via EasyPaisa Direct Transfer or Cash on Delivery.
                  </p>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("easypaisa")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === "easypaisa"
                        ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">EasyPaisa Account</span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">Fast</span>
                      </div>
                      <p className="text-[11px] text-foreground-secondary mt-0.5">
                        Direct transfer to Safiullah (03238048183)
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === "cod"
                        ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">Cash on Delivery</span>
                      <p className="text-[11px] text-foreground-secondary mt-0.5">
                        Pay cash at doorstep upon delivery
                      </p>
                    </div>
                  </button>
                </div>

                {/* EasyPaisa Transfer Instructions & Inputs */}
                {paymentMethod === "easypaisa" ? (
                  <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        EasyPaisa Official Beneficiary
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Total: {formatCurrency(finalTotal)}
                      </span>
                    </div>

                    {/* Beneficiary Details Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-emerald-200/80 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                          Account Title
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-sm text-foreground">
                            {EASYPAISA_CONFIG.accountTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(EASYPAISA_CONFIG.accountTitle, "Account Title")}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Copy Title"
                          >
                            {copiedField === "Account Title" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                          EasyPaisa Mobile Number
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold text-sm text-emerald-900 tracking-wider">
                            {EASYPAISA_CONFIG.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(EASYPAISA_CONFIG.accountNumber, "Account Number")}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Copy Number"
                          >
                            {copiedField === "Account Number" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* How to Pay */}
                    <div className="text-[11px] text-emerald-900 space-y-1">
                      <p className="font-semibold text-xs">Easy Transfer Steps:</p>
                      <p>1. Open EasyPaisa app on your phone (or dial *786#).</p>
                      <p>2. Tap <strong>Send Money</strong> → <strong>EasyPaisa Mobile Account</strong>.</p>
                      <p>3. Enter Mobile Number: <strong className="font-mono">03238048183</strong> (Title: <strong>Safiullah</strong>).</p>
                      <p>4. Send exact order total: <strong>{formatCurrency(finalTotal)}</strong>.</p>
                      <p>5. Enter the 11-digit Transaction ID (TRX ID) from your SMS/app receipt below:</p>
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-3 pt-1">
                      <Input
                        label="EasyPaisa Transaction ID (TRX ID)"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="e.g. 10293847561"
                        required
                      />
                      <Input
                        label="Your EasyPaisa / Sender Mobile Number"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="e.g. 0321 1234567"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                      <Banknote className="w-5 h-5 text-accent" />
                      <span>Cash on Delivery (COD) Selected</span>
                    </div>
                    <p className="text-[#6B7280] leading-relaxed">
                      You will pay the rider in cash when your order reaches your address. Please ensure you have exact cash ({formatCurrency(finalTotal)}) ready upon delivery.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("shipping")}
                    className="w-1/3 justify-center"
                  >
                    Back
                  </Button>
                  <Button type="submit" shimmer size="lg" className="w-2/3 justify-center gap-2">
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Review & Authorize */}
            {currentStep === "review" && (
              <motion.div
                key="step-review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-1">
                    Order Verification
                  </h2>
                  <p className="text-xs text-foreground-secondary">
                    Review your destination details and authorize your order.
                  </p>
                </div>

                {/* Summaries */}
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/5 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold uppercase tracking-wider text-foreground mb-1 text-[11px]">
                        Shipping Destination
                      </h4>
                      <p className="text-foreground font-medium">{shippingData.fullName}</p>
                      <p className="text-foreground-secondary">
                        {shippingData.address1} {shippingData.address2}
                      </p>
                      <p className="text-foreground-secondary">
                        {shippingData.city}, {shippingData.state} {shippingData.zip},{" "}
                        {shippingData.country}
                      </p>
                      <p className="text-foreground-secondary mt-1">Phone: {shippingData.phone}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("shipping")}
                      className="text-accent underline text-xs font-semibold"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/5 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold uppercase tracking-wider text-foreground mb-1 text-[11px]">
                        Payment Details
                      </h4>
                      {paymentMethod === "easypaisa" ? (
                        <div>
                          <p className="text-foreground font-semibold text-emerald-800">
                            EasyPaisa Transfer to Safiullah (03238048183)
                          </p>
                          <p className="text-foreground-secondary font-mono">
                            TRX ID: {trxId} • Sender: {senderPhone}
                          </p>
                        </div>
                      ) : (
                        <p className="text-foreground font-medium">Cash on Delivery (COD)</p>
                      )}
                      <p className="text-foreground-secondary mt-1">{selectedShippingMethod.name}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="text-accent underline text-xs font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Trust badge */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex items-center gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    Your order details are verified. You will receive an instant order receipt and tracking updates.
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("payment")}
                    className="w-1/3 justify-center"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    shimmer
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-2/3 justify-center gap-2"
                  >
                    <span>{isProcessing ? "Processing Order..." : "Confirm & Place Order"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sticky Order Summary (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#FAFAFA] rounded-3xl p-6 sm:p-8 border border-black/5 sticky top-28 space-y-6">
            <h3 className="font-serif text-xl text-foreground font-normal">
              Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
            </h3>

            {/* Items mini list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-black/5 pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.title}</p>
                    {item.variant_info && (
                      <p className="text-[10px] text-foreground-secondary">
                        {Object.values(item.variant_info).join(" / ")}
                      </p>
                    )}
                    <p className="text-[11px] text-foreground-secondary">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-black/5 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-foreground-secondary">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Delivery
                </span>
                <span>{shippingCost === 0 ? "FREE" : formatCurrency(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold text-foreground pt-4 border-t border-black/5">
                <span>Total Amount</span>
                <span className="text-accent">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
