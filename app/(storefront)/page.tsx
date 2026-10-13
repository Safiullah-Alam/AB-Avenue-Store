"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Award, Truck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { QuickViewModal } from "@/components/storefront/QuickViewModal";
import { initialCategories, initialHeroSlides, initialReviews } from "@/lib/mock-data";
import { Product } from "@/types";
import { getStoredProducts, fetchAllProducts } from "@/lib/products";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

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

  // Auto-rotating carousel (every 6.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % initialHeroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % initialHeroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + initialHeroSlides.length) % initialHeroSlides.length);
  };

  // Split products
  const newArrivals = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);

  const bestSellers = [...products].filter(
    (p) => p.tags.includes("Bestseller") || (p.rating ?? 0) >= 4.9
  ).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section: Auto-rotating luxury carousel with word-by-word reveal */}
      <section className="relative w-full h-[85vh] min-h-[580px] max-h-[820px] bg-black overflow-hidden isolate">
        <AnimatePresence mode="wait">
          {initialHeroSlides.map((slide, idx) => {
            if (idx !== currentSlide) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image with slow cinematic zoom */}
                <motion.div
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={slide.image_url}
                    alt={slide.heading}
                    fill
                    priority={idx === 0}
                    className="object-cover object-center brightness-[0.7]"
                  />
                </motion.div>

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

                {/* Content */}
                <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-end pb-16 sm:pb-24">
                  <div className="max-w-2xl text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="caption-label text-white/80 mb-3 tracking-[0.2em]"
                    >
                      NEW COLLECTION 2026
                    </motion.div>

                    {/* Word-by-word stagger animated headline */}
                    <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] mb-5 tracking-tight text-white">
                      {slide.heading.split(" ").map((word, wordIdx) => (
                        <motion.span
                          key={wordIdx}
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3 + wordIdx * 0.08,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="inline-block mr-3"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </h1>

                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="text-base sm:text-lg text-white/85 font-light leading-relaxed mb-8 max-w-lg"
                    >
                      {slide.subheading}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="flex flex-wrap items-center gap-4"
                    >
                      <Link href={slide.cta_link}>
                        <Button
                          shimmer
                          size="lg"
                          className="px-8 shadow-2xl"
                        >
                          {slide.cta_text}
                        </Button>
                      </Link>
                      <Link href="/products">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="text-white hover:text-white hover:bg-white/10 border border-white/20"
                        >
                          View Catalog
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Carousel controls */}
        <div className="absolute bottom-6 right-6 sm:right-16 z-20 flex items-center gap-3">
          <div className="flex gap-2 mr-2">
            {initialHeroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. Infinite Trust Bar */}
      <section className="bg-white border-y border-black/5 py-6 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Award className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">100% Safe Fabrics</h4>
                <p className="text-[11px] text-foreground-secondary">Skin-tested & hypoallergenic materials</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Premium Cotton</h4>
                <p className="text-[11px] text-foreground-secondary">Breathable & gentle on baby skin</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Truck className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Free Karachi Delivery</h4>
                <p className="text-[11px] text-foreground-secondary">On orders above Rs. 3,000</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Easy Returns</h4>
                <p className="text-[11px] text-foreground-secondary">7-day hassle-free exchange & returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories: Horizontal scrollable cards */}
      <section className="py-20 lg:py-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="caption-label">Explore Our World</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-1">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary hover:text-accent transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-black/5 bg-[#F5F5F0]"
              >
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={cat.image_url || ""}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-white/70 mb-1">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif text-2xl font-normal leading-snug group-hover:text-accent-light transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2 font-light">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase text-white/90 group-hover:translate-x-1 transition-transform">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. New Arrivals Grid */}
      <section className="py-20 lg:py-28 bg-[#FFF0E8]/60 border-y border-black/5">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="caption-label">Just In!</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary hover:text-accent transition-colors flex items-center gap-1"
            >
              <span>View All New Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Promotional Hero Banner: Countdown Sale / Limited Archive */}
      <section className="py-20 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-[#E8567F] text-white p-8 sm:p-16 lg:p-20 shadow-2xl isolate">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src="/hero-2.jpg"
              alt="Kids clothing collection"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8567F] via-[#E8567F]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl">
            <span className="caption-label text-white/90 mb-2">✨ Special Offer</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight mb-4">
              Welcome Sale: Up to 20% Off!
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-8 font-light">
              Use code <strong className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">WELCOME10</strong> for 10% off orders over Rs. 2,000, or <strong className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">AB500</strong> for Rs. 500 off orders over Rs. 3,000.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button shimmer size="lg">
                  Shop the Sale
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="text-white border border-white/20">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Best Sellers Grid */}
      <section className="py-20 lg:py-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="caption-label">Collector Favorites</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-1">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?sort=best-selling"
            className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary hover:text-accent transition-colors flex items-center gap-1"
          >
            <span>Explore All Icons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 7. Testimonials & Patron Reviews */}
      <section className="py-20 bg-white border-t border-black/5">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="caption-label">Collector Impressions</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-normal mt-1">
              Voices of Discerning Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initialReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-8 rounded-2xl bg-[#FFF9F5] border border-black/5 flex flex-col justify-between shadow-card"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h4 className="font-serif text-lg font-medium text-foreground mb-2">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                  <p className="text-sm text-foreground-secondary leading-relaxed font-light">
                    {rev.body}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-black/5 flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">{rev.user_name}</span>
                  {rev.is_verified && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-success flex items-center gap-1">
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Editorial / Social Gallery Grid */}
      <section className="py-20 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="text-center max-w-md mx-auto mb-10">
          <span className="caption-label">Follow Us</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal mt-1 text-foreground">
            @ABAvenue.pk
          </h2>
          <p className="text-xs text-foreground-secondary mt-1">
            Tag us in your little one&apos;s adorable outfits from Karachi!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
            "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
            "https://images.unsplash.com/photo-1543854589-fdd4d3a0d181?w=600&q=80",
            "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80",
          ].map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-black/5">
              <Image
                src={url}
                alt="Kids fashion"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold tracking-wider uppercase">
                View on Instagram
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
