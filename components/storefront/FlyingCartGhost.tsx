"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export function FlyingCartGhost() {
  const { flyingItem, clearFlyingItem } = useCart();
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!flyingItem) return;

    // Locate the header cart icon in the DOM
    const cartEl = document.getElementById("header-cart-btn");
    if (cartEl) {
      const rect = cartEl.getBoundingClientRect();
      setTargetPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      // Default fallback top-right
      setTargetPos({
        x: window.innerWidth - 60,
        y: 40,
      });
    }
  }, [flyingItem]);

  if (!flyingItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="flying-cart-ghost"
        initial={{
          opacity: 1,
          scale: 1,
          rotate: 0,
          x: flyingItem.startX - 48,
          y: flyingItem.startY - 48,
          position: "fixed",
          zIndex: 9999,
          pointerEvents: "none",
        }}
        animate={{
          opacity: [1, 0.9, 0],
          scale: [1, 0.6, 0.2],
          rotate: [0, 5, 12],
          x: targetPos.x - 24,
          y: targetPos.y - 24,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1], // fluid bezier arc
        }}
        onAnimationComplete={() => {
          clearFlyingItem();
        }}
        className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-white ring-2 ring-accent/30 bg-white"
      >
        <Image
          src={flyingItem.image}
          alt="Adding to bag"
          fill
          sizes="96px"
          className="object-cover"
        />
      </motion.div>
    </AnimatePresence>
  );
}
