"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  User as UserIcon,
  Heart,
  LogOut,
  ExternalLink,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Order, Address } from "@/types";
import { getStoredOrders, fetchAllOrders } from "@/lib/orders";
import { formatCurrency, formatDate } from "@/lib/utils";

type AccountTab = "orders" | "addresses" | "profile";

export default function AccountPage() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Address form state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      user_id: user?.id || "demo-user",
      full_name: profile?.full_name || "Safiullah",
      phone: "+92 323 8048183",
      address_line1: "Shop 12, Dolmen Mall Clifton",
      city: "Karachi",
      state: "Sindh",
      zip: "75600",
      country: "Pakistan",
      is_default: true,
    },
  ]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "Pakistan",
  });

  // Profile update state
  const [profileName, setProfileName] = useState(profile?.full_name || "Safiullah");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "03238048183");

  // Load orders from store
  useEffect(() => {
    const load = async () => {
      const ords = await fetchAllOrders();
      setOrders(ords || getStoredOrders());
    };
    load();
  }, []);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Address = {
      id: "addr-" + Date.now(),
      user_id: user?.id || "demo-user",
      full_name: newAddr.fullName,
      phone: newAddr.phone,
      address_line1: newAddr.line1,
      city: newAddr.city,
      state: newAddr.state,
      zip: newAddr.zip,
      country: newAddr.country,
      is_default: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, created]);
    setIsAddingAddress(false);
    setNewAddr({ fullName: "", phone: "", line1: "", city: "", state: "", zip: "", country: "United States" });
    showToast({ type: "success", title: "Address Saved", message: "New shipping address added." });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast({ type: "info", title: "Address Removed", message: "The address has been removed." });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
      {/* Account Header */}
      <div className="border-b border-black/5 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="caption-label">Collector Portal</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-foreground font-normal mt-1">
            {profile?.full_name || "Client Dashboard"}
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            {profile?.email || user?.email || "Collector since 2024"} • Access level: {profile?.role?.toUpperCase() || "PATRON"}
          </p>
        </div>

        {/* Quick Demo Switcher & Admin Shortcuts */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button size="sm" className="bg-accent text-white gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Admin Studio</span>
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-destructive hover:bg-destructive/5 border-destructive/20 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Navigation Sidebar (3 Cols) */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-2xl border border-black/5 shadow-card space-y-1">
          <button
            onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "orders"
                ? "bg-accent text-white shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-black/5"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order Archive ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "addresses"
                ? "bg-accent text-white shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-black/5"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Address Book</span>
          </button>

          <Link
            href="/account/wishlist"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-foreground-secondary hover:text-foreground hover:bg-black/5 transition-all"
          >
            <Heart className="w-4 h-4" />
            <span>Curated Wishlist</span>
          </Link>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "profile"
                ? "bg-accent text-white shadow-sm"
                : "text-foreground-secondary hover:text-foreground hover:bg-black/5"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Collector Profile</span>
          </button>
        </aside>

        {/* Right Main Content (9 Cols) */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-10 rounded-3xl border border-black/5 shadow-card min-h-[480px]">
          {/* TAB 1: ORDERS ARCHIVE & DETAIL */}
          {activeTab === "orders" && (
            <div>
              {selectedOrder ? (
                /* Order Detail View */
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-xs font-semibold uppercase tracking-wider text-accent hover:underline mb-1 block"
                      >
                        ← Back to Order History
                      </button>
                      <h2 className="font-serif text-2xl font-normal text-foreground">
                        Order {selectedOrder.order_number}
                      </h2>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        Placed on {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        selectedOrder.fulfillment_status === "delivered"
                          ? "bg-success/15 text-success"
                          : selectedOrder.fulfillment_status === "shipped"
                          ? "bg-accent/15 text-accent"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedOrder.fulfillment_status}
                    </span>
                  </div>

                  {/* Tracking Bar */}
                  {selectedOrder.tracking_number && (
                    <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Carrier: {selectedOrder.tracking_carrier}
                          </p>
                          <p className="text-[11px] font-mono text-foreground-secondary">
                            Tracking: {selectedOrder.tracking_number}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        In Transit
                      </span>
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="space-y-3 pt-2">
                    <h3 className="caption-label">Acquired Items</h3>
                    <div className="divide-y divide-black/5">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 text-xs items-center">
                          {item.image_url && (
                            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#FAFAFA] border border-black/5 flex-shrink-0">
                              <Image src={item.image_url} alt="" fill className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-medium text-foreground">
                              {item.title}
                            </h4>
                            {item.variant_info && (
                              <p className="text-foreground-secondary text-[11px] mt-0.5">
                                {Object.entries(item.variant_info)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(" • ")}
                              </p>
                            )}
                            <p className="text-foreground-secondary mt-1">
                              Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          <span className="font-semibold text-sm text-foreground">
                            {formatCurrency(item.line_total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/5 text-xs">
                    <div className="p-4 rounded-xl bg-[#FAFAFA]">
                      <h4 className="font-semibold uppercase tracking-wider text-foreground mb-2 text-[11px]">
                        Shipping Destination
                      </h4>
                      <p className="text-foreground">{selectedOrder.shipping_address.full_name}</p>
                      <p className="text-foreground-secondary">{selectedOrder.shipping_address.address_line1}</p>
                      <p className="text-foreground-secondary">
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                        {selectedOrder.shipping_address.zip}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAFAFA] space-y-1.5">
                      <h4 className="font-semibold uppercase tracking-wider text-foreground mb-2 text-[11px]">
                        Financial Summary
                      </h4>
                      <div className="flex justify-between text-foreground-secondary">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-foreground-secondary">
                        <span>Shipping ({selectedOrder.shipping_method})</span>
                        <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-black/5">
                        <span>Total Paid</span>
                        <span className="text-accent text-sm">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-6">
                  <div className="pb-4 border-b border-black/5">
                    <h2 className="font-serif text-2xl font-normal text-foreground">
                      Order History
                    </h2>
                    <p className="text-xs text-foreground-secondary mt-1">
                      View previous acquisitions and status updates.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-foreground-secondary">
                      <p className="font-serif text-lg">No orders recorded yet.</p>
                      <Link href="/products" className="text-xs text-accent underline mt-2 inline-block">
                        Browse the current catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="p-5 rounded-2xl border border-black/5 hover:border-black/20 bg-[#FAFAFA] hover:bg-white transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono font-semibold text-xs text-foreground">
                                {ord.order_number}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  ord.fulfillment_status === "delivered"
                                    ? "bg-success/15 text-success"
                                    : ord.fulfillment_status === "shipped"
                                    ? "bg-accent/15 text-accent"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.fulfillment_status}
                              </span>
                            </div>
                            <p className="text-xs text-foreground-secondary">
                              Placed {formatDate(ord.created_at)} • {ord.items?.length || 1} item(s)
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-base text-foreground">
                              {formatCurrency(ord.total)}
                            </span>
                            <span className="text-xs font-semibold text-accent flex items-center gap-1">
                              View <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground">
                    Address Book
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Manage your shipping and billing locations.
                  </p>
                </div>
                {!isAddingAddress && (
                  <Button size="sm" onClick={() => setIsAddingAddress(true)} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </Button>
                )}
              </div>

              {isAddingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
                  <Input
                    label="Full Name"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Telephone"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    required
                  />
                  <Input
                    label="Street Address"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      required
                    />
                    <Input
                      label="ZIP"
                      value={newAddr.zip}
                      onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAddress(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" shimmer>
                      Save Address
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl border border-black/5 bg-[#FAFAFA] text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{addr.full_name}</span>
                          {addr.is_default && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-foreground-secondary">{addr.address_line1}</p>
                        <p className="text-foreground-secondary">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p className="text-foreground-secondary mt-2">{addr.phone}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-black/5 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-destructive hover:underline text-[11px] font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-lg">
              <div className="pb-4 border-b border-black/5">
                <h2 className="font-serif text-2xl font-normal text-foreground">
                  Collector Profile
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Manage your personal credentials and communication preferences.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={profile?.email || "julian.vance@example.com"}
                  disabled
                />

                <Input
                  label="Phone Number"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    onClick={() =>
                      showToast({
                        type: "success",
                        title: "Profile Updated",
                        message: "Your preferences have been saved.",
                      })
                    }
                    shimmer
                    size="md"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
