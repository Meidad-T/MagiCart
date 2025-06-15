
-- Add a logo_url column to the stores table so each store can have a logo image
ALTER TABLE public.stores
ADD COLUMN logo_url TEXT;

-- If needed, add additional RLS or policies here (current table has none by default)
