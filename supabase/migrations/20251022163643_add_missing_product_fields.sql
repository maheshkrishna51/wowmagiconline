/*
  # Add Missing Product Fields

  1. Changes
    - Add `weight` column to products table (text field for weight information like "500g")
    - Add `dimensions` column to products table (text field for dimensions like "10x10x5 cm")
    - Add `meta_title` column to products table (for SEO meta title)
    - Add `meta_description` column to products table (for SEO meta description)
    - Add `meta_keywords` column to products table (for SEO keywords)
  
  2. Notes
    - These fields are optional and allow null values
    - All fields are text type for flexibility
*/

-- Add missing product fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight text,
ADD COLUMN IF NOT EXISTS dimensions text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text;
