-- ====================================================================
-- MASTER E-COMMERCE SUPABASE DATABASE SCHEMA & POLICIES
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'active');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fulfillment_status_type AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT NOT NULL DEFAULT 'AURA Luxury Studio',
    tagline TEXT DEFAULT 'Timeless design for the modern connoisseur',
    logo_url TEXT,
    logo_inverted_url TEXT,
    favicon_url TEXT,
    contact_email TEXT DEFAULT 'concierge@aurastudio.com',
    contact_phone TEXT DEFAULT '+1 (800) 287-2024',
    business_address TEXT DEFAULT '452 West Broadway, SoHo, New York, NY 10012',
    currency_code TEXT DEFAULT 'USD' NOT NULL,
    currency_symbol TEXT DEFAULT '$' NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 8.25 NOT NULL,
    tax_inclusive BOOLEAN DEFAULT false NOT NULL,
    announcement_bar_active BOOLEAN DEFAULT true NOT NULL,
    announcement_bar_text TEXT DEFAULT 'Complimentary global shipping on orders over $250',
    announcement_bar_link TEXT DEFAULT '/products',
    announcement_bar_color TEXT DEFAULT '#1A1A1A',
    social_instagram TEXT DEFAULT 'https://instagram.com',
    social_facebook TEXT DEFAULT 'https://facebook.com',
    social_twitter TEXT DEFAULT 'https://x.com',
    social_tiktok TEXT DEFAULT 'https://tiktok.com',
    social_youtube TEXT DEFAULT 'https://youtube.com',
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meta_title_template TEXT DEFAULT '{Page Title} | AURA Luxury Studio',
    default_meta_description TEXT DEFAULT 'Discover curated luxury goods, artisanal timepieces, and bespoke everyday essentials crafted for longevity.',
    og_default_image_url TEXT,
    ga_tracking_id TEXT,
    fb_pixel_id TEXT,
    search_console_meta TEXT,
    robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Page SEO Table
CREATE TABLE IF NOT EXISTS page_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT UNIQUE NOT NULL,
    meta_title TEXT NOT NULL,
    meta_description TEXT,
    og_image_url TEXT
);

-- 7. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2),
    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INT DEFAULT 0 NOT NULL,
    track_inventory BOOLEAN DEFAULT true NOT NULL,
    allow_backorders BOOLEAN DEFAULT false NOT NULL,
    status product_status DEFAULT 'draft' NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    alt_text TEXT
);

-- 10. Product Options Table (e.g. Size, Color)
CREATE TABLE IF NOT EXISTS product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

-- 11. Product Option Values Table
CREATE TABLE IF NOT EXISTS product_option_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID REFERENCES product_options(id) ON DELETE CASCADE NOT NULL,
    value TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);

-- 12. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price NUMERIC(10,2),
    stock_quantity INT DEFAULT 0 NOT NULL,
    option_values JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Customer Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Orders Sequence for ORD-XXXXX
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10001;

-- 15. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || nextval('order_number_seq')),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    shipping_method TEXT NOT NULL DEFAULT 'Standard Delivery',
    shipping_cost NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    coupon_code TEXT,
    payment_status payment_status_type DEFAULT 'pending' NOT NULL,
    fulfillment_status fulfillment_status_type DEFAULT 'pending' NOT NULL,
    easypaisa_transaction_id TEXT,
    payment_method TEXT,
    tracking_number TEXT,
    tracking_carrier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    variant_info JSONB DEFAULT '{}',
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(10,2) NOT NULL
);

-- 17. Order Timeline Table
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL DEFAULT 'Verified Collector',
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type coupon_type DEFAULT 'percentage' NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) DEFAULT 0.00,
    usage_limit INT,
    per_customer_limit INT DEFAULT 1,
    times_used INT DEFAULT 0 NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    applicable_products UUID[] DEFAULT '{}',
    applicable_categories UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 20. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 21. Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    heading TEXT NOT NULL,
    subheading TEXT,
    cta_text TEXT DEFAULT 'Discover Collection',
    cta_link TEXT DEFAULT '/products',
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- 22. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 23. Media Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    size BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- TRIGGERS & FUNCTIONS
-- ====================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE TRIGGER trigger_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE PROCEDURE set_updated_at_timestamp();

-- Function: Sync Auth Users to Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        new.raw_user_meta_data->>'avatar_url',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function: Stock decrement on order item insertion
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id AND track_inventory = true;

    IF NEW.variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
        WHERE id = NEW.variant_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE PROCEDURE decrement_product_stock();

-- Function: Recalculate coupon times_used
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_code IS NOT NULL AND NEW.coupon_code <> '' THEN
        UPDATE coupons
        SET times_used = times_used + 1
        WHERE code = NEW.coupon_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_coupon
AFTER INSERT ON orders
FOR EACH ROW EXECUTE PROCEDURE increment_coupon_usage();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by owners and admins" ON profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Public Read Tables
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings admin write" ON site_settings FOR ALL USING (public.is_admin());

CREATE POLICY "SEO settings viewable by everyone" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "SEO settings admin write" ON seo_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Page SEO viewable by everyone" ON page_seo FOR SELECT USING (true);
CREATE POLICY "Page SEO admin write" ON page_seo FOR ALL USING (public.is_admin());

CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON categories FOR ALL USING (public.is_admin());

CREATE POLICY "Active products viewable by everyone" ON products FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Products admin write" ON products FOR ALL USING (public.is_admin());

CREATE POLICY "Product images viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Product images admin write" ON product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Product options viewable by everyone" ON product_options FOR SELECT USING (true);
CREATE POLICY "Product options admin write" ON product_options FOR ALL USING (public.is_admin());

CREATE POLICY "Product option values viewable by everyone" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "Product option values admin write" ON product_option_values FOR ALL USING (public.is_admin());

CREATE POLICY "Product variants viewable by everyone" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Product variants admin write" ON product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Hero slides viewable by everyone" ON hero_slides FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Hero slides admin write" ON hero_slides FOR ALL USING (public.is_admin());

CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE USING (public.is_admin());

-- Customer Protected Data Policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON addresses FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view timeline of own orders" ON order_timeline FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_timeline.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins can manage order timeline" ON order_timeline FOR ALL USING (public.is_admin());

CREATE POLICY "Active coupons viewable by all" ON coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Coupons admin write" ON coupons FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON subscribers FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Media public read" ON media FOR SELECT USING (true);
CREATE POLICY "Media admin write" ON media FOR ALL USING (public.is_admin());

-- ====================================================================
-- STORAGE BUCKETS SETUP (Execute in Supabase Storage SQL Editor)
-- ====================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media-library', 'media-library', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false) ON CONFLICT DO NOTHING;
