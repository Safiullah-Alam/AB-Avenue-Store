"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Coins, ShoppingBag, Users, Sparkles } from "lucide-react";
import { Order, Product } from "@/types";
import { getStoredOrders, fetchAllOrders } from "@/lib/orders";
import { getStoredProducts, fetchAllProducts } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [ords, prods] = await Promise.all([
        fetchAllOrders(),
        fetchAllProducts(),
      ]);
      setOrders(ords || getStoredOrders());
      setProducts(prods || getStoredProducts());
      setIsLoading(false);
    };

    loadData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.payment_status === "paid" ? o.total : 0),
    0
  );
  const totalOrders = orders.length;
  const uniquePatrons = new Set(orders.map((o) => o.email)).size;

  // Build chart data from actual orders if any
  const chartData = orders.map((o) => ({
    date: new Date(o.created_at).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    }),
    revenue: o.total,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Commerce Analytics & Insights
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time performance metrics, gross revenue, and order velocity.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Gross Revenue</span>
            <Coins className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {totalOrders === 0 ? "Initial shop state (Rs. 0)" : "Settled revenue"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Orders Count</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {totalOrders}
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {totalOrders === 0 ? "Awaiting first client order" : "Recorded orders"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium uppercase tracking-wider text-[11px]">Patrons</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-serif font-semibold text-[#111827]">
            {uniquePatrons}
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {uniquePatrons === 0 ? "0 registered patrons" : "Unique buyers"}
          </p>
        </div>
      </div>

      {/* Revenue Trajectory Chart or Zero State */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
        <div className="border-b border-black/5 pb-4">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            Revenue Trajectory (PKR)
          </h3>
          <p className="text-xs text-[#6B7280]">
            Timeline of client orders and EasyPaisa settlements
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-xs text-[#6B7280]">
            Loading metrics...
          </div>
        ) : chartData.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-[#111827]">
              Starting from Zero
            </p>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              No historical transactions recorded yet. Once your first customer checks out with EasyPaisa or COD, dynamic trend charts will plot your revenue velocity here.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E8567F"
                  fill="#E8567F"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Catalog Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-2">
        <h3 className="font-serif text-lg font-semibold text-[#111827]">
          Catalog Size
        </h3>
        <p className="text-xs text-[#6B7280]">
          Total Active Stock: <strong className="text-[#111827]">{products.length} products</strong> listed in the shop catalog.
        </p>
      </div>
    </div>
  );
}
