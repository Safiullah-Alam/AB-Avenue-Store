"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { initialSiteSettings } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";

export function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubscribed(true);
    showToast({
      type: "success",
      title: "Subscribed to Gazette",
      message: "Thank you for subscribing to the ATELIER V archival gazette.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-[#141414] text-[#E5E5E5] pt-20 pb-12 border-t border-black/20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-widest text-white font-normal">
                {initialSiteSettings.site_name}
              </span>
            </Link>
            <p className="text-sm text-[#9CA3AF] max-w-sm leading-relaxed font-light">
              {initialSiteSettings.tagline}. Dedicated to uncompromising purity, organic materials, and architectural engineering.
            </p>
            <div className="pt-2 text-xs text-[#9CA3AF] space-y-1">
              <p>{initialSiteSettings.business_address}</p>
              <p>{initialSiteSettings.contact_email} • {initialSiteSettings.contact_phone}</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={initialSiteSettings.social_instagram || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors text-white"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={initialSiteSettings.social_facebook || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors text-white"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href={initialSiteSettings.social_twitter || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors text-white"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={initialSiteSettings.social_youtube || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors text-white"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Collections */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-widest text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              <li>
                <Link href="/products?category=timepieces" className="hover:text-white transition-colors">
                  Horology & Watches
                </Link>
              </li>
              <li>
                <Link href="/products?category=leather-goods" className="hover:text-white transition-colors">
                  Artisanal Leather
                </Link>
              </li>
              <li>
                <Link href="/products?category=apparel" className="hover:text-white transition-colors">
                  Tailored Cashmere
                </Link>
              </li>
              <li>
                <Link href="/products?category=fragrance" className="hover:text-white transition-colors">
                  Maison Fragrance
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Archival Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Maison */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-widest text-white mb-4">
              Maison
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  The Atelier Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Private Concierge
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-accent hover:text-accent-light transition-colors font-semibold">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-semibold tracking-widest text-white mb-2">
              The Gazette
            </h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Receive private previews of limited edition releases and horological insights.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full text-xs px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-accent transition-colors pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-white text-black hover:bg-accent hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Submit newsletter"
                >
                  {isSubscribed ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <p>© {new Date().getFullYear()} {initialSiteSettings.site_name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] font-medium tracking-wider uppercase">
            <span>Razorpay Secure</span>
            <span>•</span>
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>Amex</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
