"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  ChevronDown,
  Minus,
  Plus,
  Check,
  Share2,
  ArrowRight,
} from "lucide-react";
import { initialProducts, initialReviews } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { Review } from "@/types";
import { getStoredProducts } from "@/lib/products";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const allProducts = getStoredProducts();
  const product = allProducts.find((p) => p.slug === slug) || initialProducts.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.options?.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        defaults[opt.name] = opt.values[0].value;
      }
    });
    return defaults;
  });

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    specifications: false,
    shipping: false,
    reviews: true,
  });

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    return initialReviews.filter((r) => r.product_id === product.id);
  });
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewBody, setNewReviewBody] = useState("");
  const [newReviewName, setNewReviewName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Zoom hover state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const mainImageContainerRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0
    ? product.images.map((i) => i.image_url)
    : ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=85"];

  const isOnSale = Boolean(product.sale_price && product.sale_price < product.price);
  const effectivePrice = isOnSale && product.sale_price ? product.sale_price : product.price;
  const isFavorited = isInWishlist(product.id);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageContainerRef.current) return;
    const { left, top, width, height } = mainImageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomCoords({ x, y });
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
      message: `${quantity} × ${product.title} has been added to your shopping bag.`,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle.trim() || !newReviewBody.trim() || !newReviewName.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      const created: Review = {
        id: "rev-" + Date.now(),
        product_id: product.id,
        user_name: newReviewName,
        rating: newRating,
        title: newReviewTitle,
        body: newReviewBody,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
      setReviewsList((prev) => [created, ...prev]);
      setNewReviewTitle("");
      setNewReviewBody("");
      setNewReviewName("");
      setIsSubmittingReview(false);
      showToast({
        type: "success",
        title: "Review Published",
        message: "Thank you for contributing your perspective to the archive.",
      });
    }, 400);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-14">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-foreground-secondary mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">
          Archive
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main PDP Content Grid: Left Image Gallery, Right Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 sm:w-24 flex-shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 sm:w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    activeImageIdx === idx
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-black/5 hover:border-black/25 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Large Main Image with hover zoom and crossfade */}
          <div
            ref={mainImageContainerRef}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-[#F7F7F7] border border-black/5 shadow-card isolate cursor-crosshair"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                <Image
                  src={images[activeImageIdx]}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`object-cover object-center transition-transform duration-200 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                        }
                      : undefined
                  }
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
              {product.tags?.includes("NEW") && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-accent text-white shadow-sm">
                  NEW
                </span>
              )}
              {isOnSale && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-destructive text-white shadow-sm">
                  PRIVILEGE SALE
                </span>
              )}
            </div>

            {/* Wishlist Heart on main image */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-black/5 flex items-center justify-center text-foreground hover:text-destructive transition-colors"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited
                    ? "fill-destructive text-destructive"
                    : "text-foreground-secondary hover:text-destructive"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-foreground-secondary mb-2">
              <span className="caption-label">{product.sku}</span>
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: product.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast({ type: "info", title: "Link Copied", message: "Product link copied to clipboard." });
                  }
                }}
                className="hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal leading-tight mb-3">
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-black/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-foreground">
                {(product.rating || 5).toFixed(1)}
              </span>
              <span className="text-xs text-foreground-secondary">
                ({reviewsList.length} patron reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-foreground">
                {formatCurrency(effectivePrice)}
              </span>
              {isOnSale && (
                <span className="text-lg text-foreground-secondary line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-foreground-secondary leading-relaxed font-light">
              {product.description.replace(/<[^>]*>?/gm, "")}
            </p>
          </div>

          <div className="border-t border-black/5 pt-6 space-y-5">
            {/* Options Selectors */}
            {product.options &&
              product.options.map((option) => (
                <div key={option.id}>
                  <div className="flex justify-between text-xs mb-2.5">
                    <span className="caption-label">{option.name}</span>
                    <span className="font-semibold text-foreground">
                      {selectedOptions[option.name]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values?.map((val) => {
                      const isSelected = selectedOptions[option.name] === val.value;
                      return (
                        <button
                          key={val.id}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [option.name]: val.value,
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? "border-accent bg-accent text-white shadow-sm ring-2 ring-accent/20"
                              : "border-black/10 hover:border-black/30 text-foreground bg-white"
                          }`}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Quantity Selector & Stock Info */}
            <div>
              <div className="flex justify-between text-xs mb-2.5">
                <span className="caption-label">Quantity</span>
                <span className="text-[11px] text-success font-medium">
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} pieces available`
                    : "Out of Stock"}
                </span>
              </div>
              <div className="inline-flex items-center border border-black/10 rounded-full p-1 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Bag CTA Button with Flying Image Animation */}
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                shimmer
                size="lg"
                className="w-full text-base justify-center py-4 rounded-full shadow-lg"
              >
                {product.stock_quantity > 0
                  ? `Add to Bag • ${formatCurrency(effectivePrice * quantity)}`
                  : "Piece Currently Archived"}
              </Button>
            </div>

            {/* Assurance badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/5 text-center text-[11px] text-foreground-secondary">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-accent" />
                <span>Complimentary Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-accent" />
                <span>2-Year Atelier Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-accent" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* 3. Accordions: Description, Specifications, Shipping, Reviews */}
          <div className="pt-6 border-t border-black/5 divide-y divide-black/5">
            {/* Description */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("description")}
                className="w-full flex items-center justify-between font-serif text-lg text-foreground text-left"
              >
                <span>Curatorial Overview</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openAccordions.description ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordions.description && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-3 text-sm text-foreground-secondary leading-relaxed font-light"
                  >
                    <p>{product.description.replace(/<[^>]*>?/gm, "")}</p>
                    <p className="mt-3">
                      Each piece is hand-inspected and serialized in our New York archive prior to shipment. Accompanied by numbered certificate of origin.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Specifications */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("specifications")}
                className="w-full flex items-center justify-between font-serif text-lg text-foreground text-left"
              >
                <span>Technical Specifications</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openAccordions.specifications ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordions.specifications && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-3"
                  >
                    <table className="w-full text-xs text-foreground-secondary divide-y divide-black/5">
                      <tbody>
                        <tr>
                          <td className="py-2 font-medium text-foreground w-1/3">Reference SKU</td>
                          <td className="py-2">{product.sku}</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-foreground">Origin</td>
                          <td className="py-2">Florence, Italy / Glashütte, Germany</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-foreground">Materiality</td>
                          <td className="py-2">Surgical 316L Stainless Steel, Sapphire Crystal, Full-Grain Leather</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-foreground">Dimensions</td>
                          <td className="py-2">Case 39.5mm | Thickness 9.8mm | Lug width 20mm</td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shipping & Returns */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between font-serif text-lg text-foreground text-left"
              >
                <span>Insured Delivery & Returns</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openAccordions.shipping ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordions.shipping && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-3 text-xs text-foreground-secondary space-y-2 leading-relaxed"
                  >
                    <p>
                      <strong>Domestic:</strong> Complimentary 2-day priority tracked delivery on all orders above $250.
                    </p>
                    <p>
                      <strong>Global:</strong> Dispatched with DHL Express Worldwide with complete insurance coverage against loss or damage.
                    </p>
                    <p>
                      <strong>Returns:</strong> 30-day trial window. Complimentary return shipping label included in the collector case.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Reviews Section */}
      <section className="mt-20 pt-16 border-t border-black/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="caption-label">Collector Perspectives</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-1">
              Patron Reviews
            </h2>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-card">
            <div className="text-3xl font-serif font-medium text-foreground">
              {(product.rating || 5).toFixed(1)}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Based on {reviewsList.length} verified collectors
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Reviews List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {reviewsList.length === 0 ? (
              <p className="text-sm text-foreground-secondary py-8 font-light">
                No reviews yet for this archival piece. Be the first to share your impression.
              </p>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl bg-white border border-black/5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-foreground-secondary">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-foreground mb-1.5">
                    {rev.title}
                  </h4>
                  <p className="text-sm text-foreground-secondary leading-relaxed font-light mb-4">
                    {rev.body}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">{rev.user_name}</span>
                    {rev.is_verified && (
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-success flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-black/5 shadow-card">
            <h3 className="font-serif text-xl font-normal text-foreground mb-2">
              Share Your Perspective
            </h3>
            <p className="text-xs text-foreground-secondary mb-6 leading-relaxed">
              Help prospective collectors understand the weight, finish, and wrist presence.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="caption-label block mb-1.5">Score Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-black/15"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="caption-label block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Vance"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="caption-label block mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your experience"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="caption-label block mb-1">Curatorial Observations</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe craftsmanship, finishing, tactile feel..."
                  value={newReviewBody}
                  onChange={(e) => setNewReviewBody(e.target.value)}
                  className="w-full text-xs p-4 rounded-xl border border-black/10 focus:outline-none focus:border-accent"
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmittingReview}
                shimmer
                className="w-full justify-center"
              >
                Submit Review
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. Related Products */}
      <section className="mt-24 pt-16 border-t border-black/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="caption-label">Related Archival Pieces</span>
            <h3 className="font-serif text-2xl sm:text-3xl text-foreground font-normal mt-1">
              You May Also Appreciate
            </h3>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary hover:text-accent transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
