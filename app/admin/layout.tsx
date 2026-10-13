"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Search,
  Image as ImageIcon,
  BarChart3,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initialSiteSettings } from "@/lib/mock-data";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, isAdmin, verifyAdminPasskey, signOut, signInWithEmail } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Security gate states
  const [passkeyInput, setPasskeyInput] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"passkey" | "email">("passkey");
  const [gateError, setGateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if session passkey exists
    const sessionAuth = sessionStorage.getItem("ab_admin_authenticated");
    if (sessionAuth === "true" && !isAdmin) {
      verifyAdminPasskey("safiullah2024");
    }
  }, [isAdmin, verifyAdminPasskey]);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError("");
    setIsSubmitting(true);

    const success = verifyAdminPasskey(passkeyInput);
    if (success) {
      setPasskeyInput("");
    } else {
      setGateError("Invalid Admin Passkey. Access is restricted to Safiullah.");
    }
    setIsSubmitting(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError("");
    setIsSubmitting(true);

    const { error } = await signInWithEmail(adminEmail, adminPassword);
    if (error) {
      setGateError(error || "Invalid credentials.");
    }
    setIsSubmitting(false);
  };

  const handleAdminLock = () => {
    signOut();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ab_admin_authenticated");
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECURE GATE: Block unauthorized visitors from /admin
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
              {initialSiteSettings.site_name} Admin Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Restricted Area. Access is exclusively reserved for the store owner (Safiullah).
            </p>
          </div>

          {gateError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {gateError}
            </div>
          )}

          {/* Toggle Login Modes */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setLoginMode("passkey");
                setGateError("");
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === "passkey"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Owner Passkey / PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("email");
                setGateError("");
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === "email"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Email & Password
            </button>
          </div>

          {loginMode === "passkey" ? (
            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Passkey / Owner PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    placeholder="Enter owner passkey or phone"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Default: <code className="text-rose-400">safiullah2024</code> or your phone number <code className="text-rose-400">03238048183</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passkeyInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Unlock Store Console"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="safiullah@abavenue.pk"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !adminEmail.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Signing In..." : "Authenticate as Admin"}
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>Return to Public Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED: Full Admin Interface for Safiullah
  // -------------------------------------------------------------
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Brand Settings", href: "/admin/settings", icon: Settings },
    { label: "SEO Settings", href: "/admin/seo", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#1A1A1A]"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-semibold tracking-wider text-sm">
            {initialSiteSettings.site_name} ADMIN
          </span>
        </div>
        <Link
          href="/"
          className="text-xs text-accent font-semibold flex items-center gap-1"
        >
          <span>Store</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-black/10 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <Link href="/admin" className="block">
              <span className="font-serif text-lg tracking-wider text-[#1A1A1A] font-semibold block">
                {initialSiteSettings.site_name}
              </span>
              <span className="caption-label text-[10px] text-[#6B6B6B] block mt-0.5">
                OWNER CONSOLE
              </span>
            </Link>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Admin Session" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-sm font-semibold"
                      : "text-[#4B5563] hover:text-[#111827] hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Storefront Quick Access */}
        <div className="p-4 border-t border-black/5 space-y-3 bg-[#FAFAFA]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-semibold text-[#1A1A1A] transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6B6B6B]" />
          </Link>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5">
            <div className="min-w-0">
              <p className="font-semibold text-[#1A1A1A] truncate text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                {profile?.full_name || "Safiullah (Owner)"}
              </p>
              <p className="text-[10px] text-[#6B6B6B] truncate">
                Role: Verified Admin
              </p>
            </div>
            <button
              onClick={handleAdminLock}
              title="Lock Admin Session"
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
