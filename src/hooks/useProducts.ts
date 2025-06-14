import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrices, Product, Category, Store, ProductPrice } from "@/types/database";

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductWithPrices[]> => {
      // Fetch all data in parallel
      const [productsRes, categoriesRes, storesRes, pricesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('stores').select('*'),
        supabase.from('product_prices').select('*')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (storesRes.error) throw storesRes.error;
      if (pricesRes.error) throw pricesRes.error;

      const products = productsRes.data as Product[];
      const categories = categoriesRes.data as Category[];
      const stores = storesRes.data as Store[];
      const prices = pricesRes.data as ProductPrice[];

      // Create lookup maps
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
      const storeMap = new Map(stores.map(store => [store.id, store]));

      // Transform products to include category and prices
      return products.map(product => {
        const category = categoryMap.get(product.category_id)!;
        const productPrices = prices.filter(price => price.product_id === product.id);
        
        // Create price lookup by store name
        const pricesByStore: Record<string, number> = {};
        productPrices.forEach(price => {
          const store = storeMap.get(price.store_id);
          if (store) {
            pricesByStore[store.name] = price.price;
          }
        });

        // Generate specific image for each product based on product name
        const getProductSpecificImage = (productName: string) => {
          const imageMap: Record<string, string> = {
            // Dairy products
            '1 Gallon Whole Milk': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Jug of milk
            'Eggs 12 count': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&auto=format&fit=crop', // Carton of eggs
            'Mozzarella Cheese 8 oz': 'https://images.unsplash.com/photo-1584308971803-5d04d4c3a0be?w=400&h=300&auto=format&fit=crop', // Block/shredded cheese in package
            'Chedder Cheese 8 oz': 'https://images.unsplash.com/photo-1613145993482-2c217b648c2c?w=400&h=300&auto=format&fit=crop', // Sliced/shredded cheese
            'Salted Butter': 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&auto=format&fit=crop', // Packaged butter on shelf
            'Unsalted Butter': 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&auto=format&fit=crop',
            // Produce
            'Bananas': 'https://images.unsplash.com/photo-1574226516831-e1dff420e8c4?w=400&h=300&auto=format&fit=crop', // Bunch of bananas on grocery shelf
            'Tomatoes': 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?w=400&h=300&auto=format&fit=crop', // Tomatoes in a grocery bin
            'Apples': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Apples in store
            'Oranges': 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&auto=format&fit=crop', // Oranges stacked for sale
            'Lettuce': 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&auto=format&fit=crop', // Lettuce on grocery rack
            'Potatoes': 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400&h=300&auto=format&fit=crop', // Bulk potatoes, sack if possible
            'Onions': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&auto=format&fit=crop', // Bagged onions in grocery
            // Bakery
            'White Bread Loaf': 'https://images.unsplash.com/photo-1548365328-9b2d815d7b8c?w=400&h=300&auto=format&fit=crop', // Packaged sandwich bread
            // Meat
            'Bacon': 'https://images.unsplash.com/photo-1606755962773-13596f228eb6?w=400&h=300&auto=format&fit=crop', // Packaged bacon
            // Pantry
            'White Rice': 'https://images.unsplash.com/photo-1600185365927-3d297e6b4f47?w=400&h=300&auto=format&fit=crop', // Bag/box of white rice
            'Brown Rice': 'https://images.unsplash.com/photo-1600185365927-3d297e6b4f47?w=400&h=300&auto=format&fit=crop',
            'Pasta': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Dry pasta in box
            'Flour': 'https://images.unsplash.com/photo-1588854337238-9eea46b21bea?w=400&h=300&auto=format&fit=crop', // Packaged flour
            'White Sugar': 'https://images.unsplash.com/photo-1523293832814-d07de1128f6f?w=400&h=300&auto=format&fit=crop', // Bag of sugar
            'Brown Sugar': 'https://images.unsplash.com/photo-1512580782-8e3caa5bc3ab?w=400&h=300&auto=format&fit=crop',
            'Peanut Butter 16 ounce': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop', // Jar, on shelf
            'Grape Jelly 18 ounce': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop', // Jar, on shelf
            'Strawberry Jelly 18 ounce': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            // Drinks
            '3 Liter Coke Bottle': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Bottle beverage
            '3 Liter Sprite Bottle': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop',
            '3 Liter Dr Pepper Bottle': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop',
            'Bottled water 1 Gallon': 'https://images.unsplash.com/photo-1455656678494-4d1c4366c22b?w=400&h=300&auto=format&fit=crop', // Gallon jug
            // Chips
            'Dortios Cool Ranch 14.5 Oz Bag': 'https://images.unsplash.com/photo-1584308971803-5d04d4c3a0be?w=400&h=300&auto=format&fit=crop',
            'Dortios BBQ 14.5 Oz Bag': 'https://images.unsplash.com/photo-1584308971803-5d04d4c3a0be?w=400&h=300&auto=format&fit=crop',
            'Dortios Nacho Cheese 14.5 Oz Bag': 'https://images.unsplash.com/photo-1584308971803-5d04d4c3a0be?w=400&h=300&auto=format&fit=crop',
            // Frozen Foods
            'DiGiorno Rising Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop', // Pizza in box (not slice)
            'DiGiorno Rising Crust Three Meat Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Rising Crust Four Cheese Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Rising Crust Supreme Meat Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Stuffed Crust Cheese & Three Meat Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Stuffed Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Stuffed Crust Five Cheese Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Thin Crust Supreme Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'DiGiorno Classic Crust Cheese & Pepperoni': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'Red Baron Four Cheese Classic Crust Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'Red Baron Four Meat Classic Crust Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'Red Baron Supreme Classic Crust Pizza': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'Tombstone Roadhouse Loaded Double Down Deluxe': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&auto=format&fit=crop',
            'Stouffers Lasagna with Meat & Sauce': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop', // Boxed lasagna meal
            'Marie Callenders Chicken Pot Pie': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop', // Boxed frozen meal
            'Healthy Choice Cafe Steamers Grilled Chicken Marinara': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Banquet Mega Bowls Buffalo Chicken Mac & Cheese': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Great Value Chicken Alfredo Pasta': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop', // Boxed meal
            'Lean Cuisine Chicken Fettuccine Alfredo': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Hungry-Man Boneless Fried Chicken': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Amys Mexican Casserole Bowl': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Great Value Enchiladas & Spanish Rice': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Devour Sweet & Smoky BBQ Meatballs': 'https://images.unsplash.com/photo-1519865203733-7955d2268d0b?w=400&h=300&auto=format&fit=crop',
            'Ore-Ida Golden Crinkles French Fries': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Bagged fries
            'TGI Fridays Loaded Potato Skins': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop',
            'Farm Rich Mozzarella Sticks': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop',
            'Totinos Pepperoni Pizza Rolls': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop',
            'Great Value Onion Rings': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Bagged rings
            'State Fair Classic Corn Dogs': 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&auto=format&fit=crop', // Bagged frozen food
          };

          return imageMap[productName] || 'https://images.unsplash.com/photo-1574226516831-e1dff420e8c4?w=400&h=300&auto=format&fit=crop';
        };

        // Fix any zero prices with realistic pricing
        const fixZeroPrices = (storeName: string, price: number, productName: string): number => {
          if (price > 0) return price;
          
          // Default pricing based on product categories
          const defaultPrices: Record<string, number> = {
            // Frozen pizzas
            'DiGiorno Rising Crust Pepperoni Pizza': 5.99,
            'DiGiorno Rising Crust Three Meat Pizza': 6.49,
            'DiGiorno Rising Crust Four Cheese Pizza': 5.99,
            'DiGiorno Rising Crust Supreme Meat Pizza': 6.99,
            'DiGiorno Stuffed Crust Cheese & Three Meat Pizza': 7.49,
            'DiGiorno Stuffed Crust Pepperoni Pizza': 6.99,
            'DiGiorno Stuffed Crust Five Cheese Pizza': 6.99,
            'DiGiorno Thin Crust Supreme Pizza': 5.99,
            'DiGiorno Classic Crust Cheese & Pepperoni': 5.49,
            'Red Baron Four Cheese Classic Crust Pizza': 4.99,
            'Red Baron Four Meat Classic Crust Pizza': 5.49,
            'Red Baron Supreme Classic Crust Pizza': 5.99,
            'Tombstone Roadhouse Loaded Double Down Deluxe': 6.49,
            
            // Frozen meals
            'Stouffers Lasagna with Meat & Sauce': 4.99,
            'Marie Callenders Chicken Pot Pie': 3.99,
            'Healthy Choice Cafe Steamers Grilled Chicken Marinara': 4.49,
            'Banquet Mega Bowls Buffalo Chicken Mac & Cheese': 3.49,
            'Great Value Chicken Alfredo Pasta': 2.98,
            'Lean Cuisine Chicken Fettuccine Alfredo': 4.29,
            'Hungry-Man Boneless Fried Chicken': 4.99,
            'Amys Mexican Casserole Bowl': 5.49,
            'Great Value Enchiladas & Spanish Rice': 2.98,
            'Devour Sweet & Smoky BBQ Meatballs': 4.49,
            
            // Frozen sides
            'Ore-Ida Golden Crinkles French Fries': 3.49,
            'TGI Fridays Loaded Potato Skins': 4.99,
            'Farm Rich Mozzarella Sticks': 5.49,
            'Totinos Pepperoni Pizza Rolls': 3.99,
            'Great Value Onion Rings': 2.48,
            'State Fair Classic Corn Dogs': 4.99
          };
          
          const basePrice = defaultPrices[productName] || 3.99;
          
          // Store-specific pricing adjustments
          const storeMultipliers: Record<string, number> = {
            'walmart': 0.95, // Walmart typically cheaper
            'aldi': 0.90,    // Aldi typically cheapest
            'heb': 1.0,      // HEB baseline
            'kroger': 1.05,  // Kroger slightly higher
            'target': 1.10,  // Target premium
            'sams': 0.92     // Sam's Club bulk pricing
          };
          
          return Number((basePrice * (storeMultipliers[storeName] || 1.0)).toFixed(2));
        };

        return {
          ...product,
          category,
          prices: pricesByStore,
          image_url: product.image_url || getProductSpecificImage(product.name),
          // Legacy format for compatibility with fixed pricing
          walmart_price: fixZeroPrices('walmart', pricesByStore['walmart'] || 0, product.name),
          heb_price: fixZeroPrices('heb', pricesByStore['heb'] || 0, product.name),
          aldi_price: fixZeroPrices('aldi', pricesByStore['aldi'] || 0, product.name),
          target_price: fixZeroPrices('target', pricesByStore['target'] || 0, product.name),
          kroger_price: fixZeroPrices('kroger', pricesByStore['kroger'] || 0, product.name),
          sams_price: fixZeroPrices('sams', pricesByStore['sams'] || 0, product.name),
        } as ProductWithPrices;
      });
    },
  });
};
