/*
  # Create Banner Management Tables

  1. New Tables
    - `banners_static` - Static left banner on dashboard
      - `id` (uuid, primary key)
      - `image_url` (text, banner image URL)
      - `destination_url` (text, click destination)
      - `link_behavior` (text, 'new_tab' or 'same_tab')
      - `is_active` (boolean, whether banner is displayed)
      - `updated_at` (timestamp)
      
    - `banners_dynamic` - Dynamic slider banners on dashboard
      - `id` (uuid, primary key)
      - `image_url` (text, banner image URL)
      - `destination_url` (text, click destination)
      - `link_behavior` (text, 'new_tab' or 'same_tab')
      - `display_order` (integer, order in slider)
      - `is_active` (boolean, whether banner is displayed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policy for anonymous users to read active banners
    - Add policy for authenticated admins to manage banners
*/

CREATE TABLE IF NOT EXISTS banners_static (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  destination_url text,
  link_behavior text DEFAULT 'new_tab' CHECK (link_behavior IN ('new_tab', 'same_tab')),
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners_dynamic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  destination_url text,
  link_behavior text DEFAULT 'new_tab' CHECK (link_behavior IN ('new_tab', 'same_tab')),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners_static ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners_dynamic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active static banners"
  ON banners_static FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage static banners"
  ON banners_static FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can view active dynamic banners"
  ON banners_dynamic FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage dynamic banners"
  ON banners_dynamic FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

INSERT INTO banners_static (image_url, destination_url, link_behavior, is_active)
VALUES ('/src/assets/banner_left.png', '#', 'new_tab', true)
ON CONFLICT DO NOTHING;

INSERT INTO banners_dynamic (image_url, destination_url, link_behavior, display_order, is_active)
VALUES 
  ('/src/assets/banner_right_slider1.png', '#', 'new_tab', 1, true),
  ('/src/assets/banner_right_slider2.png', '#', 'new_tab', 2, true)
ON CONFLICT DO NOTHING;
