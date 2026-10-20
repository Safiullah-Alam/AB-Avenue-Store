"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Heart, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAdmin } = useAuth();

  // Don't render on admin studio pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/products");
  const isWishlist = pathname.startsWith("/account/wishlist");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isHome ? "text-accent font-semibold" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* 2. Shop / Catalog */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isShop ? "text-accent font-semibold" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isShop ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Shop</span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href="/account/wishlist"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isWishlist ? "text-accent font-semibold" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlist ? "stroke-[2.5] fill-accent/20" : "stroke-[1.75]"}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </Link>

        {/* 4. Cart Button */}
        <button
          onClick={openDrawer}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-foreground-secondary hover:text-foreground transition-all"
          aria-label="Open Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Bag</span>
        </button>

        {/* 5. Admin / Account */}
        {isAdmin ? (
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-accent font-semibold"
          >
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </Link>
        ) : (
          <Link
            href="/account"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              pathname.startsWith("/account") && !isWishlist
                ? "text-accent font-semibold"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
              U
            </div>
            <span className="text-[10px] mt-0.5">Account</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
