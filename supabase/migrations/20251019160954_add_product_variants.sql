/*
  # Add Product Variants Support

  ## Overview
  This migration adds support for product variants (like Pack Size) where each variant
  can have different prices. Products can now have multiple variants, each with its own
  price and stock management.

  ## New Tables

  ### 1. `product_variants`
  - `id` (uuid, primary key) - Unique variant identifier
  - `product_id` (uuid, foreign key) - References products table
  - `variant_name` (text) - Name of the variant (e.g., "250g", "500g", "1kg")
  - `price` (decimal) - Price for this specific variant
  - `compare_price` (decimal) - Original price for showing discounts
  - `sku` (text) - Unique SKU for this variant
  - `stock_quantity` (integer) - Available inventory for this variant
  - `display_order` (integer) - Order in which variants are displayed
  - `is_active` (boolean) - Whether this variant is available
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Changes

  1. Creates product_variants table with proper relationships
  2. Sets up RLS policies for variants (public read, admin write)
  3. Adds indexes for performance
  4. Includes default values for all fields

  ## Security

  - RLS enabled on product_variants table
  - Public can view active variants
  - Only authenticated users can manage variants (admin only in practice)
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  price decimal(10, 2) NOT NULL,
  compare_price decimal(10, 2),
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Anyone can view active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
