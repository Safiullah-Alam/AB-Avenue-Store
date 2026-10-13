import { Product, Category, HeroSlide, SiteSettings, Review, Coupon, Order } from "@/types";

export const initialSiteSettings: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  site_name: "AB Avenue",
  tagline: "Adorable Fashion for Little Stars",
  logo_url: "/ab-avenue-logo.jpg",
  contact_email: "safiullah@abavenue.pk",
  contact_phone: "+92 323 8048183",
  business_address: "Shop 12, Dolmen Mall Clifton, Karachi, Pakistan",
  currency_code: "PKR",
  currency_symbol: "Rs.",
  tax_rate: 0,
  tax_inclusive: true,
  announcement_bar_active: true,
  announcement_bar_text: "🎉 Free delivery across Karachi on orders over Rs. 3,000! EasyPaisa & Cash on Delivery accepted.",
  announcement_bar_link: "/products",
  announcement_bar_color: "#E8567F",
  social_instagram: "https://instagram.com/abavenue.pk",
  social_facebook: "https://facebook.com/abavenue.pk",
  social_twitter: "https://x.com/abavenue_pk",
  social_tiktok: "https://tiktok.com/@abavenue.pk",
  social_youtube: "https://youtube.com/@abavenue",
};

export const initialCategories: Category[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Girls' Collection",
    slug: "girls",
    description: "Beautiful dresses, frocks, and outfits for your little princess — from party wear to everyday essentials.",
    image_url: "/cat-girls.jpg",
    sort_order: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Boys' Collection",
    slug: "boys",
    description: "Smart casuals, polo shirts, denim, and trendy outfits for active little gentlemen.",
    image_url: "/cat-boys.jpg",
    sort_order: 2,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    name: "Baby Essentials",
    slug: "baby",
    description: "Soft cotton rompers, onesies, booties, and newborn must-haves crafted with tender care.",
    image_url: "/cat-baby.jpg",
    sort_order: 3,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    name: "Accessories & Shoes",
    slug: "accessories",
    description: "Hair clips, bows, backpacks, socks, and shoes to complete every adorable outfit.",
    image_url: "/cat-boys.jpg",
    sort_order: 4,
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const initialHeroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    image_url: "/hero-1.jpg",
    heading: "Little Stars. Big Style.",
    subheading: "Discover our premium children's collection — cozy, colorful, and crafted with love for your little ones.",
    cta_text: "Shop New Arrivals",
    cta_link: "/products",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "slide-2",
    image_url: "/hero-2.jpg",
    heading: "Soft Fabrics. Happy Kids.",
    subheading: "100% breathable cotton essentials designed for Pakistan's climate — keeping your little one comfortable all day.",
    cta_text: "Explore Collection",
    cta_link: "/products?category=baby",
    sort_order: 1,
    is_active: true,
  },
];

// Clean zero starting point for new store
export const initialProducts: Product[] = [];

export const initialOrders: Order[] = [];

export const initialReviews: Review[] = [];

export const initialCoupons: Coupon[] = [
  {
    id: "coup-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    min_order_amount: 1500,
    times_used: 0,
    is_active: true,
  },
  {
    id: "coup-2",
    code: "FREESHIP",
    type: "fixed",
    value: 250,
    min_order_amount: 3000,
    times_used: 0,
    is_active: true,
  },
];
