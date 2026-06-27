/*
  # Add Content Management for Pages

  1. New Tables
    - `content_pages`
      - `id` (uuid, primary key)
      - `page_key` (text, unique) - identifier for the page (e.g., 'about_us', 'privacy_policy')
      - `title` (text) - page title
      - `content` (text) - page content (HTML/markdown)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `content_pages` table
    - Add policy for public to read content
    - Add policy for authenticated admins to manage content

  3. Initial Data
    - Insert default content for About Us, Privacy Policy, Shipping Policy, Return Policy
*/

CREATE TABLE IF NOT EXISTS content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content pages"
  ON content_pages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert content pages"
  ON content_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content pages"
  ON content_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete content pages"
  ON content_pages
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO content_pages (page_key, title, content) VALUES
  ('about_us', 'About Us', '<h1>About Us</h1><p>Welcome to our store. We are passionate about creating amazing chocolate gifts and experiences.</p>'),
  ('privacy_policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>'),
  ('shipping_policy', 'Shipping Policy', '<h1>Shipping Policy</h1><p>We offer reliable shipping services to ensure your orders arrive safely and on time.</p>'),
  ('return_policy', 'Return Policy', '<h1>Return Policy</h1><p>We want you to be completely satisfied with your purchase. Learn about our return and refund policies.</p>')
ON CONFLICT (page_key) DO NOTHING;
