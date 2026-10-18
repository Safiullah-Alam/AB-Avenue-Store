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
            ? "bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm py-3"
            : "bg-[#FFF9F5]/95 backdrop-blur-sm border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-foreground hover:text-accent transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2 select-none">
              <Image
                src="/ab-avenue-logo.jpg"
                alt="AB Avenue"
                width={36}
                height={36}
                className="rounded-md"
              />
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-wider text-foreground group-hover:text-accent transition-colors">
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
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-foreground transition-colors"
              aria-label="Search items"
            >
              <Search className="w-5 h-5" />
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

      {/* 4. Full-screen Mobile Navigation Overlay with staggered nav links */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="flex items-center justify-between pb-6 border-b border-black/5">
              <span className="font-serif text-2xl text-foreground font-normal">
                {initialSiteSettings.site_name}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-foreground"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="flex-1 flex flex-col justify-center space-y-6 py-8"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-serif text-3xl font-normal text-foreground hover:text-accent transition-colors block"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {isAdmin && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="pt-6 border-t border-black/5"
                >
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-semibold text-accent flex items-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Admin Studio
                  </Link>
                </motion.div>
              )}
            </motion.nav>

            <div className="pt-6 border-t border-black/5 text-xs text-foreground-secondary flex justify-between">
              <span>{initialSiteSettings.contact_email}</span>
              <span>{initialSiteSettings.contact_phone}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
