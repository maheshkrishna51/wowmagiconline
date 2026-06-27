/*
  # Add Hero Section Content

  1. Changes
    - Insert hero section content into cms_content table
    - This allows admin to customize:
      - Hero badge text (e.g., "Premium Handcrafted Gifts")
      - Hero heading
      - Hero subheading
      - Call-to-action buttons

  2. Content Structure
    - Uses metadata JSON field to store all hero text elements
    - Default values match current hardcoded text
*/

INSERT INTO cms_content (key, title, content, metadata)
VALUES (
  'hero_section',
  'Hero Section',
  'Homepage hero section content',
  jsonb_build_object(
    'badge_text', 'Premium Handcrafted Gifts',
    'heading_line1', 'Crafted With Love,',
    'heading_line2', 'Delivered With Care',
    'subheading', 'Discover our exquisite collection of handmade chocolates and personalized gifts that create unforgettable moments',
    'primary_button_text', 'Shop Now',
    'primary_button_url', '/shop',
    'secondary_button_text', 'View Our Works',
    'secondary_button_url', '/our-works'
  )
)
ON CONFLICT (key) DO UPDATE
SET
  metadata = EXCLUDED.metadata,
  updated_at = now();
