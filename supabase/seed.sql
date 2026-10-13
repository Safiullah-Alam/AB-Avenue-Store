-- ====================================================================
-- MASTER SEED DATA: LUXURY E-COMMERCE CATALOG
-- ====================================================================

-- 1. Insert Site Settings
INSERT INTO site_settings (
    id, site_name, tagline, logo_url, contact_email, contact_phone, business_address,
    currency_code, currency_symbol, tax_rate, announcement_bar_active, announcement_bar_text
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ATELIER V',
    'Sublime Craftsmanship & Modern Minimalism',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&q=80',
    'concierge@atelierv.com',
    '+1 (800) 840-2090',
    '740 Madison Avenue, New York, NY 10065',
    'USD',
    '$',
    8.50,
    true,
    'Complimentary worldwide insured shipping on all orders over $250. Express 2-day delivery available.'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
('11111111-1111-1111-1111-111111111101', 'Horology & Timepieces', 'timepieces', 'Master-grade automatic chronographs and minimalist architectural watches.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', 1),
('11111111-1111-1111-1111-111111111102', 'Artisanal Leather Goods', 'leather-goods', 'Hand-stitched Tuscan vegetable-tanned leather bags, wallets, and folios.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', 2),
('11111111-1111-1111-1111-111111111103', 'Tailored Apparel', 'apparel', 'Precision-cut organic cotton, virgin cashmere, and structured outerwear.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', 3),
('11111111-1111-1111-1111-111111111104', 'Maison & Fragrance', 'fragrance', 'Smoked cedar, vetiver, and botanical extractions distilled in Grasse.', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Products
INSERT INTO products (
    id, title, slug, description, category_id, price, sale_price, sku, stock_quantity, track_inventory, status, tags
) VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'Chronos Mono Minimalist Automatic',
    'chronos-mono-minimalist-automatic',
    '<p>Engineered with an exhibition sapphire caseback and custom caliber movement. Built for discerning collectors who appreciate precision restraint.</p>',
    '11111111-1111-1111-1111-111111111101',
    680.00,
    595.00,
    'HORO-CHR-01',
    24,
    true,
    'active',
    ARRAY['Automatic', 'Sapphire', 'Bestseller', 'Featured']
),
(
    '22222222-2222-2222-2222-222222222202',
    'Tuscan Leather Briefcase No. 4',
    'tuscan-leather-briefcase-no-4',
    '<p>Crafted from full-grain vegetable-tanned leather in Florence. Solid brass hardware with palladium plating and dedicated 16-inch padded laptop compartment.</p>',
    '11111111-1111-1111-1111-111111111102',
    520.00,
    NULL,
    'LTH-BRF-04',
    18,
    true,
    'active',
    ARRAY['Full-Grain', 'Handmade', 'New Arrival']
),
(
    '22222222-2222-2222-2222-222222222203',
    'Virgin Cashmere Mockneck Knit',
    'virgin-cashmere-mockneck-knit',
    '<p>Spun from 100% Grade-A Mongolian cashmere fibers. Features seamless Japanese 3D-knitting technology for unparalleled thermal comfort and drape.</p>',
    '11111111-1111-1111-1111-111111111103',
    340.00,
    290.00,
    'APP-CSH-02',
    35,
    true,
    'active',
    ARRAY['Cashmere', 'Knitwear', 'Featured']
),
(
    '22222222-2222-2222-2222-222222222204',
    'Santal & Smoked Vetiver Extrait',
    'santal-and-smoked-vetiver-extrait',
    '<p>A warm meditative signature blending Australian sandalwood, Haitian vetiver root, crushed cardamon, and charred cedarwood. 28% concentration perfume extract.</p>',
    '11111111-1111-1111-1111-111111111104',
    210.00,
    NULL,
    'FRG-SNT-10',
    42,
    true,
    'active',
    ARRAY['Extrait', 'Artisanal', 'Bestseller']
),
(
    '22222222-2222-2222-2222-222222222205',
    'Architectural Titanium Sunglasses',
    'architectural-titanium-sunglasses',
    '<p>Ultra-lightweight Japanese beta-titanium wire frame with custom green Zeiss polarized mineral lenses. Hand-finished matte graphite coating.</p>',
    '11111111-1111-1111-1111-111111111103',
    380.00,
    NULL,
    'APP-SNG-09',
    15,
    true,
    'active',
    ARRAY['Titanium', 'Zeiss', 'Accessories']
),
(
    '22222222-2222-2222-2222-222222222206',
    'Full Grain Minimalist Card Folio',
    'full-grain-minimalist-card-folio',
    '<p>Slim bifold wallet holding 8 cards plus folded currency. Hand-burnished edges with wax sealant that develops a lustrous patina over years of use.</p>',
    '11111111-1111-1111-1111-111111111102',
    120.00,
    95.00,
    'LTH-CRD-03',
    60,
    true,
    'active',
    ARRAY['Patina', 'Everyday Carry']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Product Images
INSERT INTO product_images (product_id, image_url, sort_order, alt_text) VALUES
('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=85', 0, 'Chronos Watch Primary Studio'),
('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=85', 1, 'Chronos Watch Lifestyle Wrist'),
('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85', 2, 'Chronos Watch Movement Detail'),

('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=85', 0, 'Leather Briefcase Front'),
('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=85', 1, 'Leather Briefcase Hardware Close-up'),

('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&q=85', 0, 'Cashmere Mockneck Front'),
('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=85', 1, 'Cashmere Mockneck Worn'),

('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=1000&q=85', 0, 'Santal Extrait Bottle Studio'),
('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&q=85', 1, 'Santal Extrait Atmospheric'),

('22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1000&q=85', 0, 'Titanium Sunglasses Front'),
('22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1000&q=85', 1, 'Titanium Sunglasses Profile'),

('22222222-2222-2222-2222-222222222206', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1000&q=85', 0, 'Card Folio Open'),
('22222222-2222-2222-2222-222222222206', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&q=85', 1, 'Card Folio Detail')
ON CONFLICT DO NOTHING;

-- 5. Insert Hero Slides
INSERT INTO hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order, is_active) VALUES
(
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=90',
    'Pure Geometry. Uncompromising Craft.',
    'Explore the Autumn/Winter Edition featuring hand-finished Italian leathers and limited-series automatic timepieces.',
    'Explore The Collection',
    '/products',
    0,
    true
),
(
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=90',
    'Architectural Silhouettes in Cashmere',
    'Designed in Copenhagen, spun in Ulaanbaatar. Cashmere garments crafted for a lifetime of understated elegance.',
    'View Tailored Apparel',
    '/products?category=apparel',
    1,
    true
),
(
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1800&q=90',
    'The Horology Archive: Series No. 1',
    'Exhibition casebacks, surgical steel, and Swiss engineering. Available in limited quantities.',
    'Discover Watches',
    '/products?category=timepieces',
    2,
    true
)
ON CONFLICT DO NOTHING;

-- 6. Insert Coupons
INSERT INTO coupons (code, type, value, min_order_amount, usage_limit, times_used, is_active) VALUES
('WELCOME15', 'percentage', 15.00, 150.00, 500, 14, true),
('ATELIER50', 'fixed', 50.00, 300.00, 100, 8, true),
('VIPFIRST', 'percentage', 20.00, 200.00, 50, 3, true)
ON CONFLICT (code) DO NOTHING;

-- 7. Insert Customer Reviews
INSERT INTO reviews (product_id, rating, title, body, user_name, is_verified) VALUES
('22222222-2222-2222-2222-222222222201', 5, 'Exceptional craftsmanship & balance', 'The weight on the wrist is absolute perfection. The exhibition back reveals stunning rotor finishing that rivals brands three times the price.', 'Julian Vance', true),
('22222222-2222-2222-2222-222222222201', 5, 'Timeless aesthetic', 'Wore this to a gallery opening in Berlin and received three separate inquiries. Minimalist dial with crisp typography.', 'Claire D’Agostino', true),
('22222222-2222-2222-2222-222222222202', 5, 'The leather patina is sublime', 'After six months of heavy travel, the Tuscan leather has acquired a rich amber sheen. The stitching is bulletproof.', 'Marcus Sterling', true),
('22222222-2222-2222-2222-222222222203', 5, 'Incomparable softness', 'The gauge of this cashmere feels ethereal yet warm. The mockneck collar retains its precise geometry all day long.', 'Elena Rostova', true);
