
-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_prices table to store prices for each product at each store
CREATE TABLE public.product_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, store_id)
);

-- Enable Row Level Security (make tables publicly readable for now)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on product_prices" ON public.product_prices FOR SELECT USING (true);

-- Insert store data
INSERT INTO public.stores (name, display_name) VALUES
  ('walmart', 'Walmart'),
  ('heb', 'H-E-B'),
  ('aldi', 'Aldi'),
  ('target', 'Target'),
  ('kroger', 'Kroger'),
  ('sams', 'Sam''s Club');

-- Insert category data
INSERT INTO public.categories (name) VALUES
  ('dairy'),
  ('produce'),
  ('bakery'),
  ('meat'),
  ('pantry'),
  ('drink'),
  ('chips');

-- Insert sample products (using your existing data)
WITH category_lookup AS (
  SELECT id as dairy_id FROM public.categories WHERE name = 'dairy'
), product_inserts AS (
  INSERT INTO public.products (name, category_id, unit, description) 
  SELECT 
    '1 Gallon Whole Milk',
    (SELECT dairy_id FROM category_lookup),
    'each',
    'Fresh whole milk, 1 gallon container'
  RETURNING id, name
)
INSERT INTO public.product_prices (product_id, store_id, price)
SELECT 
  p.id,
  s.id,
  CASE s.name
    WHEN 'walmart' THEN 2.62
    WHEN 'heb' THEN 3.19
    WHEN 'aldi' THEN 2.59
    WHEN 'target' THEN 3.59
    WHEN 'kroger' THEN 3.09
    WHEN 'sams' THEN 3.52
  END
FROM product_inserts p
CROSS JOIN public.stores s;

-- Add more sample products (fixing the column order issue)
WITH category_lookup AS (
  SELECT 
    (SELECT id FROM public.categories WHERE name = 'dairy') as dairy_id,
    (SELECT id FROM public.categories WHERE name = 'produce') as produce_id,
    (SELECT id FROM public.categories WHERE name = 'bakery') as bakery_id
), product_inserts AS (
  INSERT INTO public.products (name, category_id, unit, description) VALUES
    ('Eggs 12 count', (SELECT dairy_id FROM category_lookup), 'each', 'Fresh large eggs, 12 count'),
    ('White Bread Loaf', (SELECT bakery_id FROM category_lookup), 'each', 'Fresh white bread loaf'),
    ('Bananas', (SELECT produce_id FROM category_lookup), 'lb', 'Fresh bananas')
  RETURNING id, name
)
-- Insert prices for the new products
INSERT INTO public.product_prices (product_id, store_id, price)
SELECT 
  p.id,
  s.id,
  CASE 
    WHEN p.name = 'Eggs 12 count' THEN
      CASE s.name
        WHEN 'walmart' THEN 2.72
        WHEN 'heb' THEN 3.56
        WHEN 'aldi' THEN 5.29
        WHEN 'target' THEN 3.49
        WHEN 'kroger' THEN 2.99
        WHEN 'sams' THEN 5.94
      END
    WHEN p.name = 'White Bread Loaf' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.42
        WHEN 'heb' THEN 1.30
        WHEN 'aldi' THEN 1.55
        WHEN 'target' THEN 1.49
        WHEN 'kroger' THEN 1.99
        WHEN 'sams' THEN 2.38
      END
    WHEN p.name = 'Bananas' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.54
        WHEN 'heb' THEN 0.56
        WHEN 'aldi' THEN 0.33
        WHEN 'target' THEN 0.32
        WHEN 'kroger' THEN 0.59
        WHEN 'sams' THEN 0.66
      END
  END
FROM product_inserts p
CROSS JOIN public.stores s;
