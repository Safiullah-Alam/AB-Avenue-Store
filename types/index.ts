export type UserRole = 'customer' | 'admin';

export type ProductStatus = 'draft' | 'active';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type CouponType = 'percentage' | 'fixed';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline?: string | null;
  logo_url?: string | null;
  logo_inverted_url?: string | null;
  favicon_url?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  business_address?: string | null;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  tax_inclusive: boolean;
  announcement_bar_active: boolean;
  announcement_bar_text?: string | null;
  announcement_bar_link?: string | null;
  announcement_bar_color?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  social_tiktok?: string | null;
  social_youtube?: string | null;
  updated_at?: string;
}

export interface SEOSettings {
  id: string;
  meta_title_template: string;
  default_meta_description: string;
  og_default_image_url?: string | null;
  ga_tracking_id?: string | null;
  fb_pixel_id?: string | null;
  search_console_meta?: string | null;
  robots_txt?: string | null;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text?: string | null;
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price?: number | null;
  stock_quantity: number;
  option_values: Array<{ option_name: string; value: string }>;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id?: string | null;
  category?: Category;
  price: number;
  sale_price?: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  sku: string;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: ProductStatus;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  tags: string[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  title: string;
  variant_info?: Record<string, string>;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string;
}

export interface OrderTimelineItem {
  id: string;
  order_id: string;
  status: string;
  note?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  email: string;
  shipping_address: {
    full_name: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billing_address: {
    full_name: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  easypaisa_transaction_id?: string | null;
  payment_method?: "easypaisa_wallet" | "easypaisa_qr" | "cod" | null;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  timeline?: OrderTimelineItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount?: number | null;
  usage_limit?: number | null;
  per_customer_limit?: number | null;
  times_used: number;
  valid_from?: string | null;
  valid_to?: string | null;
  applicable_products?: string[];
  applicable_categories?: string[];
  is_active: boolean;
  created_at?: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading?: string | null;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

export interface CartItem {
  id: string; // unique item key e.g. productId-variantId
  product_id: string;
  variant_id?: string | null;
  title: string;
  slug: string;
  price: number;
  regular_price?: number;
  image: string;
  quantity: number;
  variant_info?: Record<string, string>;
  max_stock: number;
}
