import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { FlyingCartGhost } from "@/components/storefront/FlyingCartGhost";
import { CartDrawer } from "@/components/storefront/CartDrawer";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AB Avenue | Adorable Children's Fashion — Karachi",
  description:
    "Shop the cutest children's clothing in Karachi. From party dresses to everyday essentials — AB Avenue brings joy to your little one's wardrobe. Reliable delivery across Pakistan with WhatsApp order confirmation.",
  icons: {
    icon: [
      { url: "/ab-avenue-logo.jpg" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/ab-avenue-logo.jpg",
    apple: "/ab-avenue-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${playfair.variable}`}>
      <body className={`${nunito.className} antialiased bg-background text-foreground min-h-screen selection:bg-accent/20 selection:text-accent font-sans`}>
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
