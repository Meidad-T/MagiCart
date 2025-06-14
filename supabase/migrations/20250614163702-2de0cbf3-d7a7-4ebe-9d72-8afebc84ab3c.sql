
-- Insert all the missing products and their prices
WITH category_lookup AS (
  SELECT 
    (SELECT id FROM public.categories WHERE name = 'dairy') as dairy_id,
    (SELECT id FROM public.categories WHERE name = 'produce') as produce_id,
    (SELECT id FROM public.categories WHERE name = 'bakery') as bakery_id,
    (SELECT id FROM public.categories WHERE name = 'meat') as meat_id,
    (SELECT id FROM public.categories WHERE name = 'pantry') as pantry_id,
    (SELECT id FROM public.categories WHERE name = 'drink') as drink_id,
    (SELECT id FROM public.categories WHERE name = 'chips') as chips_id
), product_inserts AS (
  INSERT INTO public.products (name, category_id, unit, description) VALUES
    -- Produce items (excluding already added Bananas)
    ('Tomatoes', (SELECT produce_id FROM category_lookup), 'lb', 'Fresh tomatoes'),
    ('Apples', (SELECT produce_id FROM category_lookup), 'each', 'Fresh apples'),
    ('Oranges', (SELECT produce_id FROM category_lookup), 'each', 'Fresh oranges'),
    ('Lettuce', (SELECT produce_id FROM category_lookup), 'each', 'Fresh lettuce'),
    ('Potatoes', (SELECT produce_id FROM category_lookup), 'each', 'Fresh potatoes'),
    ('Onions', (SELECT produce_id FROM category_lookup), 'each', 'Fresh onions'),
    
    -- Dairy items (excluding already added Milk and Eggs)
    ('Mozzarella Cheese 8 oz', (SELECT dairy_id FROM category_lookup), 'each', 'Mozzarella cheese 8 oz package'),
    ('Chedder Cheese 8 oz', (SELECT dairy_id FROM category_lookup), 'each', 'Cheddar cheese 8 oz package'),
    ('Salted Butter', (SELECT dairy_id FROM category_lookup), 'pack of 4 sticks', 'Salted butter pack'),
    ('Unsalted Butter', (SELECT dairy_id FROM category_lookup), 'pack of 4 sticks', 'Unsalted butter pack'),
    
    -- Meat items
    ('Bacon', (SELECT meat_id FROM category_lookup), '12 Oz', 'Bacon 12 oz package'),
    
    -- Pantry items
    ('White Rice', (SELECT pantry_id FROM category_lookup), '32 Oz', 'White rice 32 oz bag'),
    ('Brown Rice', (SELECT pantry_id FROM category_lookup), '32 Oz', 'Brown rice 32 oz bag'),
    ('Pasta', (SELECT pantry_id FROM category_lookup), '16 Oz', 'Pasta 16 oz box'),
    ('Flour', (SELECT pantry_id FROM category_lookup), '2 lb', 'All-purpose flour 2 lb bag'),
    ('White Sugar', (SELECT pantry_id FROM category_lookup), '4 lb', 'White sugar 4 lb bag'),
    ('Brown Sugar', (SELECT pantry_id FROM category_lookup), '4 lb', 'Brown sugar 4 lb bag'),
    ('Peanut Butter 16 ounce', (SELECT pantry_id FROM category_lookup), 'each', 'Peanut butter 16 oz jar'),
    ('Grape Jelly 18 ounce', (SELECT pantry_id FROM category_lookup), 'each', 'Grape jelly 18 oz jar'),
    ('Strawberry Jelly 18 ounce', (SELECT pantry_id FROM category_lookup), 'each', 'Strawberry jelly 18 oz jar'),
    
    -- Drink items
    ('3 Liter Coke Bottle', (SELECT drink_id FROM category_lookup), 'each', '3 liter Coca-Cola bottle'),
    ('3 Liter Sprite Bottle', (SELECT drink_id FROM category_lookup), 'each', '3 liter Sprite bottle'),
    ('3 Liter Dr Pepper Bottle', (SELECT drink_id FROM category_lookup), 'each', '3 liter Dr Pepper bottle'),
    ('Bottled water 1 Gallon', (SELECT drink_id FROM category_lookup), 'each', '1 gallon bottled water'),
    
    -- Chips items
    ('Dortios Cool Ranch 14.5 Oz Bag', (SELECT chips_id FROM category_lookup), 'each', 'Doritos Cool Ranch 14.5 oz bag'),
    ('Dortios BBQ 14.5 Oz Bag', (SELECT chips_id FROM category_lookup), 'each', 'Doritos BBQ 14.5 oz bag'),
    ('Dortios Nacho Cheese 14.5 Oz Bag', (SELECT chips_id FROM category_lookup), 'each', 'Doritos Nacho Cheese 14.5 oz bag')
  RETURNING id, name
)
-- Insert prices for all the new products
INSERT INTO public.product_prices (product_id, store_id, price)
SELECT 
  p.id,
  s.id,
  CASE 
    WHEN p.name = 'Tomatoes' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.98
        WHEN 'heb' THEN 0.80
        WHEN 'aldi' THEN 2.19
        WHEN 'target' THEN 0.44
        WHEN 'kroger' THEN 0.30
        WHEN 'sams' THEN 1.37
      END
    WHEN p.name = 'Apples' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.82
        WHEN 'heb' THEN 0.70
        WHEN 'aldi' THEN 0.67
        WHEN 'target' THEN 1.59
        WHEN 'kroger' THEN 1.50
        WHEN 'sams' THEN 0.70
      END
    WHEN p.name = 'Oranges' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.79
        WHEN 'heb' THEN 0.52
        WHEN 'aldi' THEN 0.67
        WHEN 'target' THEN 0.89
        WHEN 'kroger' THEN 0.99
        WHEN 'sams' THEN 0.89
      END
    WHEN p.name = 'Lettuce' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.58
        WHEN 'heb' THEN 1.61
        WHEN 'aldi' THEN 1.89
        WHEN 'target' THEN 1.30
        WHEN 'kroger' THEN 1.69
        WHEN 'sams' THEN 1.09
      END
    WHEN p.name = 'Potatoes' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.83
        WHEN 'heb' THEN 1.01
        WHEN 'aldi' THEN 0.80
        WHEN 'target' THEN 0.89
        WHEN 'kroger' THEN 0.74
        WHEN 'sams' THEN 0.77
      END
    WHEN p.name = 'Onions' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.94
        WHEN 'heb' THEN 1.54
        WHEN 'aldi' THEN 1.10
        WHEN 'target' THEN 1.19
        WHEN 'kroger' THEN 0.80
        WHEN 'sams' THEN 0.70
      END
    WHEN p.name = 'Mozzarella Cheese 8 oz' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.97
        WHEN 'heb' THEN 2.05
        WHEN 'aldi' THEN 2.05
        WHEN 'target' THEN 1.99
        WHEN 'kroger' THEN 2.29
        WHEN 'sams' THEN 2.05
      END
    WHEN p.name = 'Chedder Cheese 8 oz' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.97
        WHEN 'heb' THEN 2.05
        WHEN 'aldi' THEN 2.05
        WHEN 'target' THEN 1.99
        WHEN 'kroger' THEN 2.29
        WHEN 'sams' THEN 2.05
      END
    WHEN p.name = 'Salted Butter' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.96
        WHEN 'heb' THEN 5.08
        WHEN 'aldi' THEN 4.15
        WHEN 'target' THEN 5.39
        WHEN 'kroger' THEN 4.29
        WHEN 'sams' THEN 4.40
      END
    WHEN p.name = 'Unsalted Butter' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.96
        WHEN 'heb' THEN 5.08
        WHEN 'aldi' THEN 4.15
        WHEN 'target' THEN 5.39
        WHEN 'kroger' THEN 4.29
        WHEN 'sams' THEN 4.40
      END
    WHEN p.name = 'Bacon' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.97
        WHEN 'heb' THEN 4.49
        WHEN 'aldi' THEN 4.75
        WHEN 'target' THEN 5.49
        WHEN 'kroger' THEN 4.99
        WHEN 'sams' THEN 4.99
      END
    WHEN p.name = 'White Rice' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.77
        WHEN 'heb' THEN 1.85
        WHEN 'aldi' THEN 4.15
        WHEN 'target' THEN 3.49
        WHEN 'kroger' THEN 2.39
        WHEN 'sams' THEN 3.56
      END
    WHEN p.name = 'Brown Rice' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.87
        WHEN 'heb' THEN 1.97
        WHEN 'aldi' THEN 4.15
        WHEN 'target' THEN 3.49
        WHEN 'kroger' THEN 2.49
        WHEN 'sams' THEN 3.56
      END
    WHEN p.name = 'Pasta' THEN
      CASE s.name
        WHEN 'walmart' THEN 0.98
        WHEN 'heb' THEN 1.02
        WHEN 'aldi' THEN 1.09
        WHEN 'target' THEN 1.89
        WHEN 'kroger' THEN 1.25
        WHEN 'sams' THEN 1.20
      END
    WHEN p.name = 'Flour' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.32
        WHEN 'heb' THEN 1.37
        WHEN 'aldi' THEN 2.59
        WHEN 'target' THEN 3.99
        WHEN 'kroger' THEN 1.49
        WHEN 'sams' THEN 2.10
      END
    WHEN p.name = 'White Sugar' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.14
        WHEN 'heb' THEN 3.27
        WHEN 'aldi' THEN 3.65
        WHEN 'target' THEN 4.89
        WHEN 'kroger' THEN 3.19
        WHEN 'sams' THEN 3.30
      END
    WHEN p.name = 'Brown Sugar' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.14
        WHEN 'heb' THEN 3.27
        WHEN 'aldi' THEN 3.65
        WHEN 'target' THEN 4.89
        WHEN 'kroger' THEN 3.19
        WHEN 'sams' THEN 3.30
      END
    WHEN p.name = 'Peanut Butter 16 ounce' THEN
      CASE s.name
        WHEN 'walmart' THEN 3.12
        WHEN 'heb' THEN 3.24
        WHEN 'aldi' THEN 2.99
        WHEN 'target' THEN 3.29
        WHEN 'kroger' THEN 3.19
        WHEN 'sams' THEN 3.99
      END
    WHEN p.name = 'Grape Jelly 18 ounce' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.98
        WHEN 'heb' THEN 2.06
        WHEN 'aldi' THEN 2.45
        WHEN 'target' THEN 1.99
        WHEN 'kroger' THEN 3.69
        WHEN 'sams' THEN 3.20
      END
    WHEN p.name = 'Strawberry Jelly 18 ounce' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.98
        WHEN 'heb' THEN 2.06
        WHEN 'aldi' THEN 2.45
        WHEN 'target' THEN 1.99
        WHEN 'kroger' THEN 3.69
        WHEN 'sams' THEN 3.20
      END
    WHEN p.name = '3 Liter Coke Bottle' THEN
      CASE s.name
        WHEN 'walmart' THEN 2.97
        WHEN 'heb' THEN 3.24
        WHEN 'aldi' THEN 2.50
        WHEN 'target' THEN 3.25
        WHEN 'kroger' THEN 2.99
        WHEN 'sams' THEN 2.99
      END
    WHEN p.name = '3 Liter Sprite Bottle' THEN
      CASE s.name
        WHEN 'walmart' THEN 2.97
        WHEN 'heb' THEN 3.24
        WHEN 'aldi' THEN 2.50
        WHEN 'target' THEN 3.25
        WHEN 'kroger' THEN 2.99
        WHEN 'sams' THEN 2.99
      END
    WHEN p.name = '3 Liter Dr Pepper Bottle' THEN
      CASE s.name
        WHEN 'walmart' THEN 2.97
        WHEN 'heb' THEN 3.24
        WHEN 'aldi' THEN 2.50
        WHEN 'target' THEN 3.25
        WHEN 'kroger' THEN 2.99
        WHEN 'sams' THEN 2.99
      END
    WHEN p.name = 'Bottled water 1 Gallon' THEN
      CASE s.name
        WHEN 'walmart' THEN 1.23
        WHEN 'heb' THEN 1.28
        WHEN 'aldi' THEN 1.49
        WHEN 'target' THEN 2.49
        WHEN 'kroger' THEN 1.49
        WHEN 'sams' THEN 1.55
      END
    WHEN p.name = 'Dortios Cool Ranch 14.5 Oz Bag' THEN
      CASE s.name
        WHEN 'walmart' THEN 6.99
        WHEN 'heb' THEN 5.20
        WHEN 'aldi' THEN 5.25
        WHEN 'target' THEN 6.69
        WHEN 'kroger' THEN 6.49
        WHEN 'sams' THEN 6.30
      END
    WHEN p.name = 'Dortios BBQ 14.5 Oz Bag' THEN
      CASE s.name
        WHEN 'walmart' THEN 6.99
        WHEN 'heb' THEN 5.20
        WHEN 'aldi' THEN 5.25
        WHEN 'target' THEN 6.69
        WHEN 'kroger' THEN 6.49
        WHEN 'sams' THEN 6.30
      END
    WHEN p.name = 'Dortios Nacho Cheese 14.5 Oz Bag' THEN
      CASE s.name
        WHEN 'walmart' THEN 6.99
        WHEN 'heb' THEN 5.20
        WHEN 'aldi' THEN 5.25
        WHEN 'target' THEN 6.69
        WHEN 'kroger' THEN 6.49
        WHEN 'sams' THEN 6.30
      END
  END
FROM product_inserts p
CROSS JOIN public.stores s;
