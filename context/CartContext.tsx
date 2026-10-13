"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem } from "@/types";

interface FlyingItemState {
  image: string;
  startX: number;
  startY: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "id">,
    originRect?: { top: number; left: number; width: number; height: number }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  flyingItem: FlyingItemState | null;
  clearFlyingItem: () => void;
  isCartBouncing: boolean;
  appliedCoupon: { code: string; discountPercent?: number; discountFixed?: number } | null;
  applyCoupon: (coupon: { code: string; discountPercent?: number; discountFixed?: number }) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flyingItem, setFlyingItem] = useState<FlyingItemState | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent?: number;
    discountFixed?: number;
  } | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atelier_cart_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem("atelier_applied_coupon");
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.warn("Could not load cart from storage", e);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("atelier_cart_items", JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem("atelier_applied_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("atelier_applied_coupon");
      }
    } catch (e) {
      // ignore
    }
  }, [appliedCoupon]);

  const triggerCartBounce = useCallback(() => {
    setIsCartBouncing(true);
    setTimeout(() => {
      setIsCartBouncing(false);
    }, 600);
  }, []);

  const clearFlyingItem = useCallback(() => {
    setFlyingItem(null);
  }, []);

  const addItem = useCallback(
    (
      newItem: Omit<CartItem, "id">,
      originRect?: { top: number; left: number; width: number; height: number }
    ) => {
      // Trigger flying animation if coordinates provided
      if (originRect) {
        setFlyingItem({
          image: newItem.image,
          startX: originRect.left + originRect.width / 2,
          startY: originRect.top + originRect.height / 2,
        });

        // Trigger cart bounce after flying animation flight duration (~500ms)
        setTimeout(() => {
          triggerCartBounce();
        }, 450);
      } else {
        triggerCartBounce();
      }

      setItems((prev) => {
        const itemKey = `${newItem.product_id}-${newItem.variant_id || "default"}`;
        const existingIndex = prev.findIndex((item) => item.id === itemKey);

        if (existingIndex > -1) {
          const updated = [...prev];
          const currentQty = updated[existingIndex].quantity;
          const max = newItem.max_stock || 99;
          updated[existingIndex].quantity = Math.min(currentQty + newItem.quantity, max);
          return updated;
        } else {
          return [
            ...prev,
            {
              ...newItem,
              id: itemKey,
            },
          ];
        }
      });
    },
    [triggerCartBounce]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: Math.min(quantity, item.max_stock || 99),
          };
        }
        return item;
      })
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem("atelier_cart_items");
    localStorage.removeItem("atelier_applied_coupon");
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const applyCoupon = (coupon: { code: string; discountPercent?: number; discountFixed?: number }) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        flyingItem,
        clearFlyingItem,
        isCartBouncing,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
