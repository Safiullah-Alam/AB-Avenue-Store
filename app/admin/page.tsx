"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  AlertTriangle,
  ChevronRight,
  Package,
  PlusCircle,
  Coins,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Product, Order } from "@/types";
import { getStoredProducts, fetchAllProducts } from "@/lib/products";
import { getStoredOrders, fetchAllOrders } from "@/lib/orders";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [prods, ords] = await Promise.all([
      fetchAllProducts(),
      fetchAllOrders(),
    ]);
    setProducts(prods || getStoredProducts());
    setOrders(ords || getStoredOrders());
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleProductUpdate = () => {
      setProducts(getStoredProducts());
    };
    const handleOrderUpdate = () => {
      setOrders(getStoredOrders());
    };

    window.addEventListener("products_updated", handleProductUpdate);
    window.addEventListener("orders_updated", handleOrderUpdate);

    return () => {
      window.removeEventListener("products_updated", handleProductUpdate);
      window.removeEventListener("orders_updated", handleOrderUpdate);
    };
  }, []);

  // Dynamic metrics from actual shop activity (starts cleanly at 0)
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.payment_status === "paid" ? o.total : 0),
    0
  );
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStockProducts = products.filter((p) => p.stock_quantity < 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Overview Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time commerce overview, store orders, and stock inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Starting From Zero Welcome Card */}
      {products.length === 0 && orders.length === 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-full border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Shop Initialized from Zero</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#111827]">
              Welcome, Safiullah! Ready to start your business.
            </h2>
            <p className="text-xs text-[#4B5563] max-w-xl">
              All demo products and dummy figures have been removed. Your catalog, revenue, and customer metrics will update live as you add your real inventory and receive EasyPaisa or COD orders.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md whitespace-nowrap transition-transform active:scale-95"
          >
            + Create Your First Product
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-[#9CA3AF]">
            {totalOrders === 0 ? "No sales recorded yet" : `From ${totalOrders} orders`}
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {totalOrders}
          </div>
          <div className="text-xs text-[#9CA3AF]">
            {totalOrders === 0 ? "Awaiting first client order" : "Recorded in shop"}
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Total Customers</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {uniqueCustomers}
          </div>
          <div className="text-xs text-[#9CA3AF]">
            {uniqueCustomers === 0 ? "0 registered patrons" : "Unique buyers"}
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Avg. Order Value</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {formatCurrency(avgOrderValue)}
          </div>
          <div className="text-xs text-[#9CA3AF]">
            {totalOrders === 0 ? "Calculated after first order" : "Per transaction average"}
          </div>
        </div>
      </div>

      {/* Main Section: Catalog & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#111827]">
                Recent Orders
              </h3>
              <p className="text-xs text-[#6B7280]">
                Incoming customer orders via EasyPaisa and Cash on Delivery
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#111827]">No orders placed yet</p>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                When customers check out on your storefront and transfer via EasyPaisa (03238048183) or select COD, their orders will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#111827]">{order.order_number}</p>
                    <p className="text-[#6B7280]">
                      {order.shipping_address.full_name} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#111827]">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        order.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.payment_method === "cod" ? "COD" : "EasyPaisa"} • {order.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Quick Status (1 Column) */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#111827]">
                Product Inventory
              </h3>
              <p className="text-xs text-[#6B7280]">
                Active stock overview ({products.length} products listed)
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-accent font-semibold hover:underline"
            >
              Catalog
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#111827]">0 Products in Catalog</p>
              <p className="text-xs text-[#6B7280]">
                You haven&apos;t added any products yet. Click below to add your first item.
              </p>
              <Link
                href="/admin/products/new"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold shadow-sm"
              >
                + Add Product
              </Link>
            </div>
          ) : lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{lowStockProducts.length} item(s) have low stock (&lt; 5 units)</span>
              </div>
              <div className="divide-y divide-black/5">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#111827] truncate max-w-[160px]">
                      {p.title}
                    </span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {p.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-emerald-700 font-medium bg-emerald-50/50 rounded-2xl p-4">
              All inventory levels healthy across your {products.length} active products.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
