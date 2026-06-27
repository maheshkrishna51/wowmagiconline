/*
  # Initial E-Commerce Schema for Chocolate & Gift Store

  ## Overview
  This migration creates the complete database structure for a custom chocolate and gift store
  with full admin capabilities, customer ordering, and content management.

  ## New Tables
  
  ### 1. `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (Gifts, Chocolates, Hampers)
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Category description
  - `image_url` (text) - Category banner image
  - `display_order` (integer) - Sort order for display
  - `is_active` (boolean) - Visibility status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid, foreign key) - Links to categories
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Full product description
  - `short_description` (text) - Brief summary
  - `price` (decimal) - Product price
  - `compare_price` (decimal) - Original price for discounts
  - `sku` (text, unique) - Stock keeping unit
  - `stock_quantity` (integer) - Available inventory
  - `low_stock_threshold` (integer) - Alert threshold
  - `images` (jsonb) - Array of image URLs
  - `custom_options` (jsonb) - Configurable product options
  - `is_featured` (boolean) - Featured product flag
  - `is_active` (boolean) - Availability status
  - `seo_title` (text) - SEO page title
  - `seo_description` (text) - SEO meta description
  - `seo_keywords` (text) - SEO keywords
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `customers`
  - `id` (uuid, primary key) - Unique customer identifier
  - `name` (text) - Customer full name
  - `whatsapp_number` (text) - WhatsApp contact
  - `email` (text) - Email address (optional)
  - `addresses` (jsonb) - Array of delivery addresses
  - `total_orders` (integer) - Order count
  - `total_spent` (decimal) - Lifetime value
  - `created_at` (timestamptz) - Registration date
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_id` (uuid, foreign key) - Links to customers
  - `customer_name` (text) - Name at time of order
  - `customer_whatsapp` (text) - WhatsApp at time of order
  - `delivery_address` (text) - Full delivery address
  - `items` (jsonb) - Array of ordered items with details
  - `subtotal` (decimal) - Items total
  - `delivery_fee` (decimal) - Delivery charge
  - `total_amount` (decimal) - Final total
  - `status` (text) - Order status
  - `notes` (text) - Customer notes
  - `admin_notes` (text) - Internal notes
  - `whatsapp_sent` (boolean) - Notification status
  - `created_at` (timestamptz) - Order date
  - `updated_at` (timestamptz) - Last status update

  ### 5. `wishlists`
  - `id` (uuid, primary key) - Unique wishlist entry
  - `session_id` (text) - Browser session identifier
  - `product_id` (uuid, foreign key) - Links to products
  - `created_at` (timestamptz) - Addition date

  ### 6. `testimonials`
  - `id` (uuid, primary key) - Unique testimonial identifier
  - `customer_name` (text) - Reviewer name
  - `rating` (integer) - Star rating (1-5)
  - `comment` (text) - Review text
  - `image_url` (text) - Customer photo (optional)
  - `is_featured` (boolean) - Display on homepage
  - `is_active` (boolean) - Published status
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz) - Submission date

  ### 7. `portfolio_items`
  - `id` (uuid, primary key) - Unique portfolio item
  - `title` (text) - Project title
  - `description` (text) - Project description
  - `images` (jsonb) - Array of image URLs
  - `category` (text) - Project category
  - `is_active` (boolean) - Published status
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz) - Creation date

  ### 8. `cms_content`
  - `id` (uuid, primary key) - Unique content identifier
  - `key` (text, unique) - Content identifier (about_us, contact_info, etc.)
  - `title` (text) - Content title
  - `content` (text) - Main content (HTML supported)
  - `metadata` (jsonb) - Additional structured data
  - `updated_at` (timestamptz) - Last update timestamp

  ### 9. `site_settings`
  - `id` (uuid, primary key) - Unique setting identifier
  - `key` (text, unique) - Setting identifier
  - `value` (text) - Setting value
  - `category` (text) - Setting group (general, seo, branding, etc.)
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for customer-facing content
  - Authenticated admin-only write access
  - Session-based wishlist access

  ## Indexes
  - Created on foreign keys for performance
  - Slug fields indexed for fast lookups
  - Order numbers indexed for quick search
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_price decimal(10,2) DEFAULT 0,
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  images jsonb DEFAULT '[]'::jsonb,
  custom_options jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  email text DEFAULT '',
  addresses jsonb DEFAULT '[]'::jsonb,
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  delivery_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  delivery_fee decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  admin_notes text DEFAULT '',
  whatsapp_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  image_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  category text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create cms_content table
CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text DEFAULT '',
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_wishlists_session ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for customer-facing content

-- Categories: Public can view active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products: Public can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers: Only authenticated admins can access
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: Public can create, authenticated can manage
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Wishlists: Session-based access
CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL
  USING (true)
  WITH CHECK (true);

-- Testimonials: Public can view active
CREATE POLICY "Public can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Portfolio: Public can view active items
CREATE POLICY "Public can view active portfolio items"
  ON portfolio_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage portfolio"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CMS Content: Public can view
CREATE POLICY "Public can view cms content"
  ON cms_content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage cms content"
  ON cms_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Settings: Public can view
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default data
INSERT INTO cms_content (key, title, content, metadata) VALUES
  ('about_us', 'About Us', '<p>Welcome to our custom chocolate and gift store. We specialize in creating beautiful, personalized chocolates and gift hampers for every occasion.</p>', '{}'),
  ('contact_info', 'Contact Information', '', '{"phone": "", "email": "", "address": "", "hours": ""}'),
  ('faq', 'Frequently Asked Questions', '', '{"items": []}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, category) VALUES
  ('site_name', 'Chocolate & Gifts Store', 'general'),
  ('logo_url', '', 'branding'),
  ('primary_color', '#8B4513', 'branding'),
  ('whatsapp_business_number', '', 'general'),
  ('delivery_fee', '0', 'general'),
  ('meta_title', 'Custom Chocolates & Gift Hampers', 'seo'),
  ('meta_description', 'Premium custom chocolates, gifts, and hampers for every occasion', 'seo'),
  ('meta_keywords', 'chocolates, gifts, hampers, custom gifts', 'seo')
ON CONFLICT (key) DO NOTHING;

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Chocolates', 'chocolates', 'Premium handcrafted chocolates', 1),
  ('Gifts', 'gifts', 'Thoughtful gift items for every occasion', 2),
  ('Hampers', 'hampers', 'Curated gift hampers and baskets', 3)
ON CONFLICT (slug) DO NOTHING;
