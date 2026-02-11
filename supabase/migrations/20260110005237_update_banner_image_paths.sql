/*
  # Update Banner Image Paths to Public URLs

  1. Changes
    - Replace `/src/assets/` paths with `/banners/` public URLs
    - Ensure all banner records point to publicly accessible images
    - Maintain existing banner functionality and data integrity

  2. Path Mappings
    - `/src/assets/banner_left.png` → `/banners/banner_left.png`
    - `/src/assets/banner_right_slider1.png` → `/banners/banner_right_slider1.png`
    - `/src/assets/banner_right_slider2.png` → `/banners/banner_right_slider2.png`

  3. Data Updates
    - Update all banners_static records with correct public paths
    - Update all banners_dynamic records with correct public paths
*/

UPDATE banners_static
SET image_url = '/banners/banner_left.png'
WHERE image_url = '/src/assets/banner_left.png';

UPDATE banners_dynamic
SET image_url = REPLACE(image_url, '/src/assets/', '/banners/')
WHERE image_url LIKE '/src/assets/banner_%';
