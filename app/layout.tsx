import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { FlyingCartGhost } from "@/components/storefront/FlyingCartGhost";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const metadata: Metadata = {
  title: "AB Avenue | Adorable Children's Fashion — Karachi",
  description:
    "Shop the cutest children's clothing in Karachi. From party dresses to everyday essentials — AB Avenue brings joy to your little one's wardrobe. Free delivery across Karachi!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground min-h-screen selection:bg-accent/20 selection:text-accent font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {/* Global Flying Cart Bezier Animation */}
                <FlyingCartGhost />
                {/* Global Cart Slide-Over Drawer */}
                <CartDrawer />
                {children}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
