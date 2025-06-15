
-- Create table for detailed store locations (for Kroger and potentially other chains)
CREATE TABLE public.store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain TEXT NOT NULL,
  name TEXT NOT NULL,
  location_id TEXT,
  store_number TEXT,
  division_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  county TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geolocation POINT,
  hours JSONB,
  departments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;

-- Public read RLS policy
CREATE POLICY "Public read store locations" ON public.store_locations
  FOR SELECT USING (true);
