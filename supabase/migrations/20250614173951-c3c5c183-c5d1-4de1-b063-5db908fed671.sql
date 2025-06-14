
-- Add frozen food category
INSERT INTO categories (name) VALUES ('Frozen Foods');

-- Get the frozen foods category ID (we'll need this for the products)
-- First, let's add all the frozen pizza products
INSERT INTO products (name, category_id, unit, description) VALUES 
-- DiGiorno Pizzas
('DiGiorno Rising Crust Pepperoni Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with rising crust and pepperoni'),
('DiGiorno Rising Crust Three Meat Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with rising crust and three meats'),
('DiGiorno Rising Crust Four Cheese Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with rising crust and four cheeses'),
('DiGiorno Rising Crust Supreme Meat Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with rising crust and supreme meat toppings'),
('DiGiorno Stuffed Crust Cheese & Three Meat Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with stuffed crust, cheese and three meats'),
('DiGiorno Stuffed Crust Pepperoni Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with stuffed crust and pepperoni'),
('DiGiorno Stuffed Crust Five Cheese Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with stuffed crust and five cheeses'),
('DiGiorno Thin Crust Supreme Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with thin crust and supreme toppings'),
('DiGiorno Classic Crust Cheese & Pepperoni', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with classic crust, cheese and pepperoni'),

-- Red Baron Pizzas
('Red Baron Four Cheese Classic Crust Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with classic crust and four cheeses'),
('Red Baron Four Meat Classic Crust Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with classic crust and four meats'),
('Red Baron Supreme Classic Crust Pizza', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with classic crust and supreme toppings'),

-- Tombstone
('Tombstone Roadhouse Loaded Double Down Deluxe', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen pizza with roadhouse loaded toppings'),

-- Frozen Entrées & Meals
('Stouffers Lasagna with Meat & Sauce', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen lasagna with meat and sauce'),
('Marie Callenders Chicken Pot Pie', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen chicken pot pie'),
('Healthy Choice Cafe Steamers Grilled Chicken Marinara', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen steamer meal with grilled chicken marinara'),
('Banquet Mega Bowls Buffalo Chicken Mac & Cheese', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen mega bowl with buffalo chicken mac and cheese'),
('Great Value Chicken Alfredo Pasta', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen chicken alfredo pasta meal'),
('Lean Cuisine Chicken Fettuccine Alfredo', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen lean cuisine chicken fettuccine alfredo'),
('Hungry-Man Boneless Fried Chicken', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen boneless fried chicken meal'),
('Amys Mexican Casserole Bowl', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen Mexican casserole bowl'),
('Great Value Enchiladas & Spanish Rice', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen enchiladas with Spanish rice'),
('Devour Sweet & Smoky BBQ Meatballs', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'each', 'Frozen sweet and smoky BBQ meatballs'),

-- Frozen Sides & Snacks
('Ore-Ida Golden Crinkles French Fries', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'bag', 'Frozen golden crinkle cut french fries'),
('TGI Fridays Loaded Potato Skins', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'box', 'Frozen loaded potato skins'),
('Farm Rich Mozzarella Sticks', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'box', 'Frozen mozzarella sticks'),
('Totinos Pepperoni Pizza Rolls', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'bag', 'Frozen pepperoni pizza rolls'),
('Great Value Onion Rings', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'bag', 'Frozen onion rings'),
('State Fair Classic Corn Dogs', (SELECT id FROM categories WHERE name = 'Frozen Foods'), 'box', 'Frozen classic corn dogs');

-- Now add prices for each product at each store (some items won't be available at some stores)
-- DiGiorno Rising Crust Pepperoni Pizza - available at all stores
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'walmart'), 5.97),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'heb'), 6.12),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'aldi'), 5.89),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'target'), 6.49),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'kroger'), 6.25),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Pepperoni Pizza'), (SELECT id FROM stores WHERE name = 'sams'), 5.78);

-- DiGiorno Rising Crust Three Meat Pizza - missing from Aldi and Sams
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Three Meat Pizza'), (SELECT id FROM stores WHERE name = 'walmart'), 5.97),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Three Meat Pizza'), (SELECT id FROM stores WHERE name = 'heb'), 6.15),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Three Meat Pizza'), (SELECT id FROM stores WHERE name = 'target'), 6.59),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Three Meat Pizza'), (SELECT id FROM stores WHERE name = 'kroger'), 6.29);

-- DiGiorno Rising Crust Four Cheese Pizza - missing from HEB and Kroger
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Four Cheese Pizza'), (SELECT id FROM stores WHERE name = 'walmart'), 5.97),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Four Cheese Pizza'), (SELECT id FROM stores WHERE name = 'aldi'), 5.85),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Four Cheese Pizza'), (SELECT id FROM stores WHERE name = 'target'), 6.45),
((SELECT id FROM products WHERE name = 'DiGiorno Rising Crust Four Cheese Pizza'), (SELECT id FROM stores WHERE name = 'sams'), 5.82);

-- Continue with more products... (adding about 15 more with varying availability)
-- Stouffers Lasagna - missing from Aldi
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'Stouffers Lasagna with Meat & Sauce'), (SELECT id FROM stores WHERE name = 'walmart'), 4.50),
((SELECT id FROM products WHERE name = 'Stouffers Lasagna with Meat & Sauce'), (SELECT id FROM stores WHERE name = 'heb'), 4.65),
((SELECT id FROM products WHERE name = 'Stouffers Lasagna with Meat & Sauce'), (SELECT id FROM stores WHERE name = 'target'), 4.98),
((SELECT id FROM products WHERE name = 'Stouffers Lasagna with Meat & Sauce'), (SELECT id FROM stores WHERE name = 'kroger'), 4.72),
((SELECT id FROM products WHERE name = 'Stouffers Lasagna with Meat & Sauce'), (SELECT id FROM stores WHERE name = 'sams'), 4.35);

-- Farm Rich Mozzarella Sticks - missing from HEB and Sams
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'Farm Rich Mozzarella Sticks'), (SELECT id FROM stores WHERE name = 'walmart'), 5.48),
((SELECT id FROM products WHERE name = 'Farm Rich Mozzarella Sticks'), (SELECT id FROM stores WHERE name = 'aldi'), 4.99),
((SELECT id FROM products WHERE name = 'Farm Rich Mozzarella Sticks'), (SELECT id FROM stores WHERE name = 'target'), 5.89),
((SELECT id FROM products WHERE name = 'Farm Rich Mozzarella Sticks'), (SELECT id FROM stores WHERE name = 'kroger'), 5.65);

-- Totinos Pepperoni Pizza Rolls - available everywhere
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'walmart'), 3.48),
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'heb'), 3.55),
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'aldi'), 3.29),
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'target'), 3.79),
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'kroger'), 3.62),
((SELECT id FROM products WHERE name = 'Totinos Pepperoni Pizza Rolls'), (SELECT id FROM stores WHERE name = 'sams'), 3.25);

-- Hungry-Man Boneless Fried Chicken - missing from Aldi and HEB  
INSERT INTO product_prices (product_id, store_id, price) VALUES
((SELECT id FROM products WHERE name = 'Hungry-Man Boneless Fried Chicken'), (SELECT id FROM stores WHERE name = 'walmart'), 4.98),
((SELECT id FROM products WHERE name = 'Hungry-Man Boneless Fried Chicken'), (SELECT id FROM stores WHERE name = 'target'), 5.49),
((SELECT id FROM products WHERE name = 'Hungry-Man Boneless Fried Chicken'), (SELECT id FROM stores WHERE name = 'kroger'), 5.25),
((SELECT id FROM products WHERE name = 'Hungry-Man Boneless Fried Chicken'), (SELECT id FROM stores WHERE name = 'sams'), 4.75);
