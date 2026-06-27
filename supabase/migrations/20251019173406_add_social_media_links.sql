/*
  # Add Social Media Links Configuration

  1. Changes
    - Adds social_media_links entry to cms_content table for storing Facebook, Instagram, and YouTube links
    - Uses metadata JSONB field to store the social media links
  
  2. Structure
    - Key: 'social_media_links'
    - Metadata: { facebook: string, instagram: string, youtube: string }
  
  3. Security
    - Uses existing RLS policies on cms_content table
*/

INSERT INTO cms_content (key, title, content, metadata)
VALUES (
  'social_media_links',
  'Social Media Links',
  'Social media profile links',
  '{"facebook": "", "instagram": "", "youtube": ""}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
