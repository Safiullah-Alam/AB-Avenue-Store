"use client";

import React, { useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { initialCoupons } from "@/lib/mock-data";
import { Coupon } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isAdding, setIsAdding] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("150");
  const [usageLimit, setUsageLimit] = useState("500");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    const created: Coupon = {
      id: "cpn-" + Date.now(),
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      min_order_amount: minOrder ? Number(minOrder) : 0,
      usage_limit: usageLimit ? Number(usageLimit) : 100,
      times_used: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setCoupons([...coupons, created]);
    setCode("");
    setValue("");
    setIsAdding(false);

    showToast({
      type: "success",
      title: "Promotional Code Created",
      message: `Code ${created.code} is now active.`,
    });
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    showToast({
      type: "info",
      title: "Coupon Removed",
      message: "The coupon code has been deactivated.",
    });
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    showToast({ type: "info", title: "Code Copied", message: `Copied ${c} to clipboard.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Promotional Coupons
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure private collector privilege codes and track redemption tallies.
          </p>
        </div>
        {!isAdding && (
          <Button size="md" onClick={() => setIsAdding(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Create Promotional Code</span>
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreateCoupon} className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-serif text-lg font-semibold text-[#111827]">
            New Promotional Privilege
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Coupon Code (e.g. VIP20)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
            <div>
              <label className="caption-label block mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                className="w-full text-xs p-2.5 rounded-xl border border-black/10 focus:outline-none bg-white font-medium"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Amount Off ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={type === "percentage" ? "Discount Percentage (%)" : "Fixed Discount ($)"}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <Input
              label="Minimum Order ($)"
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
            />
            <Input
              label="Maximum Usage Limit"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" shimmer>
              Activate Code
            </Button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-black/5 bg-[#FAFAFA] text-[#6B7280] font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Code</th>
                <th className="py-4 pr-4">Privilege Value</th>
                <th className="py-4 pr-4">Min Order</th>
                <th className="py-4 pr-4">Redemptions</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4">
                    <button
                      onClick={() => copyCode(c.code)}
                      className="font-mono font-bold text-accent bg-accent/5 px-2.5 py-1 rounded border border-accent/20 inline-flex items-center gap-1.5 hover:bg-accent/10"
                    >
                      <span>{c.code}</span>
                      <Copy className="w-3 h-3 opacity-60" />
                    </button>
                  </td>
                  <td className="py-4 pr-4 font-semibold text-foreground">
                    {c.type === "percentage" ? `${c.value}% Off` : `$${c.value} Off`}
                  </td>
                  <td className="py-4 pr-4 text-[#6B7280]">
                    {c.min_order_amount ? formatCurrency(c.min_order_amount) : "No minimum"}
                  </td>
                  <td className="py-4 pr-4 text-foreground">
                    <span className="font-semibold">{c.times_used}</span> / {c.usage_limit || "∞"} used
                  </td>
                  <td className="py-4 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                      title="Deactivate coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
