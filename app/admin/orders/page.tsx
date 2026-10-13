"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Printer,
  Eye,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Order, FulfillmentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getStoredOrders, fetchAllOrders, updateOrderStatus } from "@/lib/orders";

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Status and Tracking inputs
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("TCS Courier");
  const [timelineNote, setTimelineNote] = useState("");

  const loadOrders = async () => {
    setIsLoading(true);
    const ords = await fetchAllOrders();
    setOrders(ords || getStoredOrders());
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const handleUpdate = () => {
      setOrders(getStoredOrders());
    };
    window.addEventListener("orders_updated", handleUpdate);
    return () => window.removeEventListener("orders_updated", handleUpdate);
  }, []);

  const filtered = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.order_number.toLowerCase().includes(q) ||
      ord.shipping_address.full_name.toLowerCase().includes(q) ||
      ord.email.toLowerCase().includes(q) ||
      (ord.easypaisa_transaction_id && ord.easypaisa_transaction_id.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === "all" ? true : ord.fulfillment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (newStatus: FulfillmentStatus) => {
    if (!activeOrder) return;
    await updateOrderStatus(activeOrder.id, {
      fulfillment_status: newStatus,
      timelineNote: timelineNote || `Status changed to ${newStatus.toUpperCase()}`,
    });

    const updatedOrders = getStoredOrders();
    setOrders(updatedOrders);
    const updatedActive = updatedOrders.find((o) => o.id === activeOrder.id) || null;
    setActiveOrder(updatedActive);
    setTimelineNote("");

    showToast({
      type: "success",
      title: "Order Status Updated",
      message: `${activeOrder.order_number} marked as ${newStatus}.`,
    });
  };

  const handleAddTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !trackingNumber.trim()) return;

    await updateOrderStatus(activeOrder.id, {
      tracking_number: trackingNumber.trim(),
      tracking_carrier: carrier,
      fulfillment_status: "shipped",
      timelineNote: `Dispatched with ${carrier} (Tracking: ${trackingNumber.trim()})`,
    });

    const updatedOrders = getStoredOrders();
    setOrders(updatedOrders);
    const updatedActive = updatedOrders.find((o) => o.id === activeOrder.id) || null;
    setActiveOrder(updatedActive);
    setTrackingNumber("");

    showToast({
      type: "success",
      title: "Tracking Attached",
      message: `${carrier} tracking added to ${activeOrder.order_number}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111827]">
            Store Orders
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor client orders, EasyPaisa payments, and courier fulfillment ({orders.length} orders total).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(orders, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `orders_${Date.now()}.json`);
              downloadAnchor.click();
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, client, TRX ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-accent bg-[#F9FAFB]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-[#4B5563] focus:outline-none"
        >
          <option value="all">All Fulfillments</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table or Empty State */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#6B7280]">
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#111827]">
              {orders.length === 0 ? "0 Orders in Shop" : "No matching orders"}
            </h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {orders.length === 0
                ? "Your shop is ready for business. When customers check out and complete transfer to EasyPaisa (03238048183) or COD, orders will appear here."
                : "No orders matched your current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-black/5 text-[#6B7280] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="p-4 font-mono font-semibold text-[#111827]">
                      {ord.order_number}
                    </td>
                    <td className="p-4 text-[#6B7280]">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-[#111827]">
                          {ord.shipping_address.full_name}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          {ord.shipping_address.city}, Pakistan
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="font-medium text-[#111827]">
                          {ord.payment_method === "cod" ? "Cash on Delivery" : "EasyPaisa Wallet"}
                        </span>
                        {ord.easypaisa_transaction_id && (
                          <p className="font-mono text-[10px] text-emerald-700">
                            TRX: {ord.easypaisa_transaction_id}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#111827]">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          ord.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          ord.fulfillment_status === "delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : ord.fulfillment_status === "shipped"
                            ? "bg-blue-50 text-blue-700"
                            : ord.fulfillment_status === "processing"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ord.fulfillment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveOrder(ord)}
                        className="px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-semibold text-[#111827] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management Modal */}
      {activeOrder && (
        <Modal
          isOpen={true}
          onClose={() => setActiveOrder(null)}
          title={`Order ${activeOrder.order_number}`}
        >
          <div className="space-y-6 pt-2 text-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-2">
              <div>
                <p className="text-[#6B7280]">
                  Placed on {formatDate(activeOrder.created_at)}
                </p>
                <p className="font-semibold text-lg text-[#111827]">
                  Total: {formatCurrency(activeOrder.total)}
                </p>
              </div>

              {/* Status change actions */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6B7280]">Fulfillment:</span>
                <select
                  value={activeOrder.fulfillment_status}
                  onChange={(e) =>
                    handleUpdateStatus(e.target.value as FulfillmentStatus)
                  }
                  className="px-3 py-1.5 rounded-xl border border-black/10 font-semibold bg-white text-[#111827] focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Client & Payment Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-black/5 bg-[#FAFAFA] space-y-2">
                <h4 className="font-semibold text-[#111827] uppercase tracking-wider text-[11px]">
                  Client & Shipping Details
                </h4>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <span>{activeOrder.shipping_address.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{activeOrder.email}</span>
                </div>
                {activeOrder.shipping_address.phone && (
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeOrder.shipping_address.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-[#6B7280]">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    {activeOrder.shipping_address.address_line1},{" "}
                    {activeOrder.shipping_address.city}, Pakistan
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-black/5 bg-[#FAFAFA] space-y-2">
                <h4 className="font-semibold text-[#111827] uppercase tracking-wider text-[11px]">
                  EasyPaisa & Payment Details
                </h4>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Method:</span>
                  <span className="font-semibold text-[#111827]">
                    {activeOrder.payment_method === "cod"
                      ? "Cash on Delivery"
                      : "EasyPaisa Mobile Account"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Account Title:</span>
                  <span className="font-mono text-[#111827]">Safiullah</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Account Number:</span>
                  <span className="font-mono text-[#111827]">03238048183</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">EasyPaisa TRX ID:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {activeOrder.easypaisa_transaction_id || "None / COD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Payment Status:</span>
                  <span className="font-semibold uppercase text-emerald-700">
                    {activeOrder.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Courier Tracking Section */}
            <form
              onSubmit={handleAddTracking}
              className="p-4 rounded-2xl border border-black/5 bg-[#FAFAFA] space-y-3"
            >
              <h4 className="font-semibold text-[#111827] uppercase tracking-wider text-[11px]">
                Courier Dispatch & Tracking
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                >
                  <option value="TCS Courier">TCS Courier</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="CallCourier">CallCourier</option>
                  <option value="DHL Express">DHL Express</option>
                </select>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g. 128938491)"
                  className="px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" type="submit" disabled={!trackingNumber.trim()}>
                  Attach Tracking & Mark Shipped
                </Button>
              </div>
            </form>

            {/* Items Table */}
            <div>
              <h4 className="font-semibold text-[#111827] uppercase tracking-wider text-[11px] mb-2">
                Order Items
              </h4>
              <div className="border border-black/5 rounded-2xl overflow-hidden divide-y divide-black/5">
                {activeOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#111827]">{item.title}</p>
                      {item.variant_info && (
                        <p className="text-[11px] text-[#6B7280]">
                          {Object.entries(item.variant_info)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#111827]">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-[#6B7280]">
                        {formatCurrency(item.line_total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
