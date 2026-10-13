import { Order, FulfillmentStatus, PaymentStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "ab_store_orders";

/**
 * Read locally stored orders
 */
export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading stored orders:", e);
  }
  return [];
}

/**
 * Fetch orders from Supabase if configured, otherwise fallback to local store
 */
export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*), timeline:order_timeline(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data as Order[];
      }
    } catch (err) {
      console.warn("Supabase fetch orders error, fallback to local:", err);
    }
  }
  return getStoredOrders();
}

/**
 * Save new order
 */
export async function saveOrder(order: Order): Promise<Order> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("orders").insert([
        {
          id: order.id,
          order_number: order.order_number,
          user_id: order.user_id,
          email: order.email,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          shipping_method: order.shipping_method,
          shipping_cost: order.shipping_cost,
          subtotal: order.subtotal,
          discount_amount: order.discount_amount,
          tax_amount: order.tax_amount,
          total: order.total,
          coupon_code: order.coupon_code,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          easypaisa_transaction_id: order.easypaisa_transaction_id,
          payment_method: order.payment_method,
          notes: order.notes,
        },
      ]);
    } catch (err) {
      console.warn("Supabase save order error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const existing = getStoredOrders();
    const updated = [order, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("atelier_last_order", JSON.stringify(order));
    window.dispatchEvent(new Event("orders_updated"));
  }

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  updates: {
    fulfillment_status?: FulfillmentStatus;
    payment_status?: PaymentStatus;
    tracking_number?: string;
    tracking_carrier?: string;
    timelineNote?: string;
  }
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from("orders")
        .update({
          fulfillment_status: updates.fulfillment_status,
          payment_status: updates.payment_status,
          tracking_number: updates.tracking_number,
          tracking_carrier: updates.tracking_carrier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    } catch (err) {
      console.warn("Supabase update order status error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const existing = getStoredOrders();
    const updated = existing.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        fulfillment_status: updates.fulfillment_status || o.fulfillment_status,
        payment_status: updates.payment_status || o.payment_status,
        tracking_number: updates.tracking_number ?? o.tracking_number,
        tracking_carrier: updates.tracking_carrier ?? o.tracking_carrier,
        timeline: updates.timelineNote
          ? [
              ...(o.timeline || []),
              {
                id: "tl-" + Date.now(),
                order_id: o.order_number,
                status: `Updated to ${updates.fulfillment_status || o.fulfillment_status}`,
                note: updates.timelineNote,
                created_at: new Date().toISOString(),
              },
            ]
          : o.timeline,
        updated_at: new Date().toISOString(),
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders_updated"));
  }
}
