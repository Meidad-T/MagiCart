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

        // Generate specific shelf product images
        const getProductSpecificImage = (productName: string) => {
          const imageMap: Record<string, string> = {
            // Dairy products - packaged/carton versions
            '1 Gallon Whole Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format',
            'Eggs 12 count': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop&auto=format',
            'Mozzarella Cheese 8 oz': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Chedder Cheese 8 oz': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Salted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format',
            'Unsalted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format',
            
            // Produce - fresh as displayed in stores
            'Bananas': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop&auto=format',
            'Tomatoes': 'https://images.unsplash.com/photo-1546470427-e2b89e5c7630?w=400&h=300&fit=crop&auto=format',
            'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop&auto=format',
            'Oranges': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&auto=format',
            'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop&auto=format',
            'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop&auto=format',
            'Onions': 'https://images.unsplash.com/photo-1508747702303-7e6e190ed8b3?w=400&h=300&fit=crop&auto=format',
            
            // Bakery - packaged bread
            'White Bread Loaf': 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop&auto=format',
            
            // Meat - packaged/bagged
            'Bacon': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            
            // Pantry - bags and containers
            'White Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format',
            'Brown Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format',
            'Pasta': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format',
            'Flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format',
            'White Sugar': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&auto=format',
            'Brown Sugar': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&auto=format',
            'Peanut Butter 16 ounce': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&auto=format',
            'Grape Jelly 18 ounce': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&auto=format',
            'Strawberry Jelly 18 ounce': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&auto=format',
            
            // Drinks - bottles and containers
            '3 Liter Coke Bottle': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop&auto=format',
            '3 Liter Sprite Bottle': 'https://images.unsplash.com/photo-1594971475674-6a97f8fe8c2d?w=400&h=300&fit=crop&auto=format',
            '3 Liter Dr Pepper Bottle': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop&auto=format',
            'Bottled water 1 Gallon': 'https://images.unsplash.com/photo-1622618338451-9b6b1b5e58a2?w=400&h=300&fit=crop&auto=format',
            
            // Chips - actual packaged chip bags
            'Dortios Cool Ranch 14.5 Oz Bag': 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=300&fit=crop&auto=format',
            'Dortios BBQ 14.5 Oz Bag': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop&auto=format',
            'Dortios Nacho Cheese 14.5 Oz Bag': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop&auto=format',
            
            // Frozen Foods - boxed/packaged frozen items
            'DiGiorno Rising Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Three Meat Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Four Cheese Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Supreme Meat Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Cheese & Three Meat Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Five Cheese Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Thin Crust Supreme Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Classic Crust Cheese & Pepperoni': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Red Baron Four Cheese Classic Crust Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Red Baron Four Meat Classic Crust Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Red Baron Supreme Classic Crust Pizza': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Tombstone Roadhouse Loaded Double Down Deluxe': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Stouffers Lasagna with Meat & Sauce': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Marie Callenders Chicken Pot Pie': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Healthy Choice Cafe Steamers Grilled Chicken Marinara': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Banquet Mega Bowls Buffalo Chicken Mac & Cheese': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Great Value Chicken Alfredo Pasta': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Lean Cuisine Chicken Fettuccine Alfredo': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Hungry-Man Boneless Fried Chicken': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Amys Mexican Casserole Bowl': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Great Value Enchiladas & Spanish Rice': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Devour Sweet & Smoky BBQ Meatballs': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Ore-Ida Golden Crinkles French Fries': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'TGI Fridays Loaded Potato Skins': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Farm Rich Mozzarella Sticks': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Totinos Pepperoni Pizza Rolls': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'Great Value Onion Rings': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format',
            'State Fair Classic Corn Dogs': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format'
          };
          
          return imageMap[productName] || 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format';
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
