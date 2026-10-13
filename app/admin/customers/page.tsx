"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { getStoredOrders, fetchAllOrders } from "@/lib/orders";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomersFromOrders = async () => {
      setIsLoading(true);
      const orders = await fetchAllOrders();
      const orderList = orders || getStoredOrders();

      const map = new Map<string, CustomerRecord>();
      for (const ord of orderList) {
        const key = ord.email.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += ord.total;
          if (new Date(ord.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = ord.created_at;
          }
        } else {
          map.set(key, {
            id: "cust-" + map.size,
            name: ord.shipping_address.full_name,
            email: ord.email,
            phone: ord.shipping_address.phone || "Not provided",
            city: ord.shipping_address.city,
            totalOrders: 1,
            totalSpent: ord.total,
            lastOrderDate: ord.created_at,
          });
        }
      }

      setCustomers(Array.from(map.values()));
      setIsLoading(false);
    };

    loadCustomersFromOrders();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Registered Patrons & Clients
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Customer directory automatically built from order checkouts ({customers.length} clients).
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name, email, city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-accent bg-[#F9FAFB]"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#6B7280]">
            Loading patrons directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              {customers.length === 0 ? "0 Patrons Registered" : "No patrons found"}
            </h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {customers.length === 0
                ? "Your customer database will automatically populate with profiles when clients place their first order on your storefront."
                : "No customer profiles match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-black/5 text-[#6B7280] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Last Order</th>
                  <th className="p-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="p-4 font-semibold text-[#111827]">{c.name}</td>
                    <td className="p-4 text-[#6B7280]">{c.email}</td>
                    <td className="p-4 text-[#4B5563]">{c.city}</td>
                    <td className="p-4 font-semibold">{c.totalOrders}</td>
                    <td className="p-4 font-semibold text-[#111827]">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="p-4 text-[#6B7280]">
                      {formatDate(c.lastOrderDate)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-[#6B7280] hover:text-[#111827]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCust && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCust(null)}
          title="Customer Profile"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/5 space-y-2">
              <p className="font-semibold text-sm text-[#111827]">{selectedCust.name}</p>
              <p className="text-[#6B7280]">{selectedCust.email}</p>
              <p className="text-[#6B7280]">Phone: {selectedCust.phone}</p>
              <p className="text-[#6B7280]">Location: {selectedCust.city}, Pakistan</p>
              <div className="pt-2 border-t border-black/5 flex justify-between">
                <span>Total Orders: {selectedCust.totalOrders}</span>
                <span className="font-semibold text-accent">
                  Total Spent: {formatCurrency(selectedCust.totalSpent)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
