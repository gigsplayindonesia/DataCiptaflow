-- Fix system_settings keys to match frontend references

-- The frontend uses 'max_file_size' and 'point_price' but the migration created
-- 'max_file_size_mb' and 'point_price_idr'. Add the correct keys.

INSERT INTO system_settings (key, value) VALUES
  ('max_file_size', '50'),
  ('point_price', '1000'),
  ('verification_cost', '10')
ON CONFLICT (key) DO NOTHING;
