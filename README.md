# ATELIER V — Production-Grade Full-Stack Luxury E-Commerce Platform

A production-grade e-commerce platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase** (Auth + Database + Storage), and **Razorpay** payments.

Inspired by the visual minimalism and tactile precision of Apple Store, Aesop, and Mr Porter.

---

## 💎 Features & Architecture

### 1. Storefront Experience
- **Editorial Homepage**: Word-by-word staggered hero carousel, infinite trust bar, curated category cards, new arrival highlights with pulsing badges, countdown event banner, and social gallery.
- **Product Listing Page (PLP)**: Real-time faceted sidebar filters (category, dual-range price slider, minimum rating, in-stock only), responsive active filter chips, sort options, and infinite pagination.
- **Quick View Modal**: Instant centered modal exploration with option selectors and direct cart insertion.
- **Product Detail Page (PDP)**: Interactive image zoom gallery with hover magnification, crossfading thumbnails, color/finish and size pill selectors, smooth animated accordions (Curatorial Overview, Technical Specs, Delivery Policy), verified collector review submissions, and related pieces.
- **Orchestrated Micro-Interactions (Framer Motion)**:
  - **Flying Add-To-Cart Bezier Ghost**: Ghost image flies from clicked product along an arched bezier curve toward the header cart button.
  - **Spring Bouncing Cart Badge**: The shopping bag icon triggers a spring bounce (`scale 1 → 1.35 → 1`, stiffness 400) with animated badge pop-in.
  - **Slide-Over Cart Drawer**: Opens with backdrop blur, staggered item entrances, animated item exit removal, and live promotional coupon validation (`WELCOME15`, `ATELIER50`).
- **Multi-Step Checkout**: Progress indicator tracking Shipping → Payment (Razorpay Elements) → Verification, leading to an Order Confirmation screen with animated SVG checkmark drawing.
- **Collector Portal (`/account`)**: Order audit history, live shipment tracking inspector, address book CRUD, profile credentials, and private wishlist.

### 2. Full-Featured Admin Studio (`/admin`)
- **Completely Isolated Architecture**: Custom white sidebar layout with zero storefront bleed.
- **Executive Dashboard**: Animated KPI metric cards with period-over-period delta badges, interactive **Recharts** revenue area chart, top selling products bar chart, recent acquisitions feed, and low-stock threshold alerts.
- **Catalog Management (`/admin/products`)**: Filterable, searchable data table with bulk status updates and bulk deletion, alongside a full product builder supporting dynamic option groups (variants), inventory tracking, and image galleries.
- **Order Management (`/admin/orders`)**: Complete order status lifecycle (Pending → Processing → Shipped → Delivered), courier tracking attachment, CSV export, and printable packing slips.
- **Category Disciplines (`/admin/categories`)**: Custom departments and category management.
- **Promotional Coupons (`/admin/coupons`)**: Percentage or fixed-amount privilege codes with usage quotas and minimum spend thresholds.
- **Brand & Storefront Customization (`/admin/settings`)**: Dynamic brand logo slots, announcement bar color and copy, currency symbols, sales tax rates, and homepage hero slide creation without touching source code.
- **SEO & Search Console (`/admin/seo`)**: Meta title templates, Google Analytics / GA4 measurement ID, Facebook Pixel ID, and live editable `robots.txt`.
- **Media Library (`/admin/media`)**: Image asset registry with one-click CDN URL copying.
- **Commerce Intelligence (`/admin/analytics`)**: Deep dive charts analyzing gross revenue trends, customer acquisition rates, and revenue share by discipline.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with agency HSL palette (`#FAFAFA`, `#F5F5F0`, `#1A1A1A`, `#2563EB`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Database & Auth**: Supabase PostgreSQL with RLS & Storage
- **Payments**: Razorpay

---

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your Supabase and Razorpay credentials. The application features built-in mock and fallback resilience, allowing complete exploration out-of-the-box even before remote credentials are provided.

### 3. Initialize Supabase Database
In your Supabase project SQL Editor, execute:
1. `supabase/schema.sql` (Creates all 20 tables, custom enums, sequence, auto-update triggers, inventory decrement triggers, and Row Level Security policies).
2. `supabase/seed.sql` (Populates luxury timepieces, leather goods, cashmere knitwear, coupons, and initial reviews).

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit [http://localhost:3000](http://localhost:3000) for the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Studio console.

---

## 📜 Database Schema Summary
All 20 required tables with strict RLS:
- `profiles`, `site_settings`, `seo_settings`, `page_seo`
- `categories`, `products`, `product_images`, `product_options`, `product_option_values`, `product_variants`
- `addresses`, `orders`, `order_items`, `order_timeline`, `reviews`
- `coupons`, `subscribers`, `hero_slides`, `wishlist`, `media`
