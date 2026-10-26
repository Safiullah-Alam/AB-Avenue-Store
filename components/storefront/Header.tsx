"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { initialSiteSettings } from "@/lib/mock-data";
import { SearchModal } from "./SearchModal";

export function Header() {
  const pathname = usePathname();
  const { itemCount, openDrawer, isCartBouncing } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, profile, isAdmin, signOut } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Shrink header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "All Products", href: "/products" },
    { label: "Girls", href: "/products?category=girls" },
    { label: "Boys", href: "/products?category=boys" },
    { label: "Baby", href: "/products?category=baby" },
    { label: "Accessories", href: "/products?category=accessories" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {/* 1. Announcement Bar */}
      {initialSiteSettings.announcement_bar_active && (
        <div
          style={{ backgroundColor: initialSiteSettings.announcement_bar_color || "#1A1A1A" }}
          className="text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide z-40 relative flex items-center justify-center gap-2"
        >
          <span>{initialSiteSettings.announcement_bar_text}</span>
          {initialSiteSettings.announcement_bar_link && (
            <Link
              href={initialSiteSettings.announcement_bar_link}
              className="underline hover:text-white/80 transition-opacity"
            >
              Shop Now
            </Link>
          )}
        </div>
      )}

      {/* 2. Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-black/5 shadow-sm py-2.5 sm:py-3"
            : "bg-[#FFF9F5]/95 backdrop-blur-sm border-b border-transparent py-3 sm:py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-16 flex items-center justify-between gap-2">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-foreground hover:text-accent transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-4 lg:gap-8 min-w-0">
            <Link href="/" className="group flex items-center gap-2 select-none min-w-0">
              <div className="relative w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0">
                <Image
                  src="/ab-avenue-logo.jpg"
                  alt="AB Avenue"
                  fill
                  className="rounded-md object-contain"
                />
              </div>
              <span className="font-serif text-lg sm:text-2xl font-normal tracking-wider text-foreground group-hover:text-accent transition-colors truncate">
                {initialSiteSettings.site_name}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-semibold uppercase tracking-widest transition-colors py-1 relative ${
                      isActive
                        ? "text-accent"
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 text-foreground transition-colors"
              aria-label="Search items"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2 rounded-full hover:bg-black/5 text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="p-2 rounded-full hover:bg-black/5 text-foreground transition-colors flex items-center gap-1"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-dropdown border border-black/5 p-2 z-50 text-xs"
                  >
                    <div className="p-3 border-b border-black/5 mb-1">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {profile?.full_name || user?.email || "Guest Collector"}
                      </p>
                      <p className="text-foreground-secondary text-[11px] truncate">
                        {profile?.email || "Sign in for order history"}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-foreground hover:bg-black/5 transition-colors"
                    >
                      <span>Dashboard & Orders</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-foreground-secondary" />
                    </Link>

                    <Link
                      href="/account/wishlist"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-foreground hover:bg-black/5 transition-colors"
                    >
                      <span>Saved Wishlist ({wishlistCount})</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-foreground-secondary" />
                    </Link>

                    {/* Admin Portal - Only visible if verified as Admin */}
                    {isAdmin && (
                      <>
                        <div className="my-1 border-t border-black/5" />
                        <Link
                          href="/admin"
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-accent font-semibold bg-accent/5 hover:bg-accent/10 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Studio
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    )}

                    {user && (
                      <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 mt-1 rounded-lg text-destructive hover:bg-destructive/5 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button with Spring Bounce & Animated +1 Badge */}
            <motion.button
              id="header-cart-btn"
              onClick={openDrawer}
              animate={
                isCartBouncing
                  ? { scale: [1, 1.35, 1], rotate: [0, -8, 8, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
              }}
              className="relative p-2 rounded-full bg-foreground text-white hover:bg-black shadow-sm transition-all flex items-center justify-center cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* 3. Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 4. Full-screen Mobile Navigation Drawer with quick categories and shortcuts */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col p-6 sm:p-8 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Image
                  src="/ab-avenue-logo.jpg"
                  alt="AB Avenue"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="font-serif text-xl text-foreground font-medium">
                  {initialSiteSettings.site_name}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Search Bar in Mobile Menu */}
            <div className="pt-4 pb-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#F6F6F6] text-foreground-secondary hover:text-foreground text-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-accent" />
                  Search products, sizes, tracksuits...
                </span>
                <span className="text-[10px] font-semibold uppercase bg-black/5 px-2 py-0.5 rounded-full">
                  Tap
                </span>
              </button>
            </div>

            {/* Delivery Charges Banner */}
            <div className="my-3 p-3 rounded-2xl bg-accent/5 border border-accent/15 text-xs text-foreground">
              <p className="font-bold text-accent flex items-center gap-1.5 mb-0.5">
                <span>🚚 Delivery Rs. 100 – Rs. 300</span>
              </p>
              <p className="text-[11px] text-foreground-secondary">
                Subject to location. Delivery charges will be quoted on WhatsApp order confirmation.
              </p>
            </div>

            {/* Main Navigation Links */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="flex-1 py-4 space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary px-1">
                Explore Collections
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/products?category=boys"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#F9F9F9] hover:bg-accent/10 border border-black/5 transition-all text-left group"
                >
                  <span className="text-xl block mb-1">👦</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-accent">Boys' Collection</p>
                  <span className="text-[10px] text-foreground-secondary">Tracksuits & Sets</span>
                </Link>

                <Link
                  href="/products?category=girls"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#F9F9F9] hover:bg-accent/10 border border-black/5 transition-all text-left group"
                >
                  <span className="text-xl block mb-1">👧</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-accent">Girls' Collection</p>
                  <span className="text-[10px] text-foreground-secondary">Dresses & Outfits</span>
                </Link>

                <Link
                  href="/products?category=baby"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#F9F9F9] hover:bg-accent/10 border border-black/5 transition-all text-left group"
                >
                  <span className="text-xl block mb-1">🍼</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-accent">Baby Essentials</p>
                  <span className="text-[10px] text-foreground-secondary">Soft Rompers</span>
                </Link>

                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#F9F9F9] hover:bg-accent/10 border border-black/5 transition-all text-left group"
                >
                  <span className="text-xl block mb-1">✨</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-accent">All Products</p>
                  <span className="text-[10px] text-foreground-secondary">View Complete Shop</span>
                </Link>
              </div>

              <div className="pt-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-2 rounded-xl text-sm font-medium text-foreground hover:bg-black/5 hover:text-accent transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-foreground-secondary" />
                  </Link>
                ))}
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-black/5">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-accent/10 text-accent font-semibold flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Admin Studio Console
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.nav>

            {/* Quick Contact & Footer */}
            <div className="pt-4 border-t border-black/5 text-xs text-foreground-secondary flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>WhatsApp: <strong>+92 323 8048183</strong></span>
                <a
                  href="https://wa.me/923238048183"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Message
                </a>
              </div>
              <p className="text-[11px] text-foreground-secondary truncate">{initialSiteSettings.business_address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
