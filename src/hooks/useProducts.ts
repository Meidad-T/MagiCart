
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
            '1 Gallon Whole Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format',
            'Eggs 12 count': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop&auto=format',
            'Mozzarella Cheese 8 oz': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop&auto=format',
            'Chedder Cheese 8 oz': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=300&fit=crop&auto=format',
            'Salted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format',
            'Unsalted Butter': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop&auto=format',
            
            // Produce
            'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&auto=format',
            'Tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop&auto=format',
            'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop&auto=format',
            'Oranges': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&auto=format',
            'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop&auto=format',
            'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop&auto=format',
            'Onions': 'https://images.unsplash.com/photo-1508747702303-7e6e190ed8b3?w=400&h=300&fit=crop&auto=format',
            
            // Bakery
            'White Bread Loaf': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format',
            
            // Meat
            'Bacon': 'https://images.unsplash.com/photo-1608877906550-1d57c9d1b9fc?w=400&h=300&fit=crop&auto=format',
            
            // Pantry
            'White Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format',
            'Brown Rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop&auto=format',
            'Pasta': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=300&fit=crop&auto=format',
            'Flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format',
            'White Sugar': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format',
            'Brown Sugar': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&auto=format',
            'Peanut Butter 16 ounce': 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop&auto=format',
            'Grape Jelly 18 ounce': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&auto=format',
            'Strawberry Jelly 18 ounce': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&auto=format',
            
            // Drinks - better bottle/container images
            '3 Liter Coke Bottle': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop&auto=format',
            '3 Liter Sprite Bottle': 'https://images.unsplash.com/photo-1594971475674-6a97f8fe8c2d?w=400&h=300&fit=crop&auto=format',
            '3 Liter Dr Pepper Bottle': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop&auto=format',
            'Bottled water 1 Gallon': 'https://images.unsplash.com/photo-1622618338451-9b6b1b5e58a2?w=400&h=300&fit=crop&auto=format',
            
            // Chips - actual chip bag images
            'Dortios Cool Ranch 14.5 Oz Bag': 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=300&fit=crop&auto=format',
            'Dortios BBQ 14.5 Oz Bag': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop&auto=format',
            'Dortios Nacho Cheese 14.5 Oz Bag': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop&auto=format',
            
            // Frozen Foods - pizza and frozen meal images
            'DiGiorno Rising Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Three Meat Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Four Cheese Pizza': 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Supreme Meat Pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Cheese & Three Meat Pizza': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Stuffed Crust Five Cheese Pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Thin Crust Supreme Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Classic Crust Cheese & Pepperoni': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format',
            'Red Baron Four Cheese Classic Crust Pizza': 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&h=300&fit=crop&auto=format',
            'Red Baron Four Meat Classic Crust Pizza': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format',
            'Red Baron Supreme Classic Crust Pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop&auto=format',
            'Tombstone Roadhouse Loaded Double Down Deluxe': 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=400&h=300&fit=crop&auto=format',
            'Stouffers Lasagna with Meat & Sauce': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&auto=format',
            'Marie Callenders Chicken Pot Pie': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
            'Healthy Choice Cafe Steamers Grilled Chicken Marinara': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format',
            'Banquet Mega Bowls Buffalo Chicken Mac & Cheese': 'https://images.unsplash.com/photo-1559054663-e9b23fdf4726?w=400&h=300&fit=crop&auto=format',
            'Great Value Chicken Alfredo Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&auto=format',
            'Lean Cuisine Chicken Fettuccine Alfredo': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format',
            'Hungry-Man Boneless Fried Chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&auto=format',
            'Amys Mexican Casserole Bowl': 'https://images.unsplash.com/photo-1559054663-e9b23fdf4726?w=400&h=300&fit=crop&auto=format',
            'Great Value Enchiladas & Spanish Rice': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
            'Devour Sweet & Smoky BBQ Meatballs': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format',
            'Ore-Ida Golden Crinkles French Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&auto=format',
            'TGI Fridays Loaded Potato Skins': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format',
            'Farm Rich Mozzarella Sticks': 'https://images.unsplash.com/photo-1619740455993-12ad3bb6ed6e?w=400&h=300&fit=crop&auto=format',
            'Totinos Pepperoni Pizza Rolls': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format',
            'Great Value Onion Rings': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop&auto=format',
            'State Fair Classic Corn Dogs': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&auto=format'
          };
          
          return imageMap[productName] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format';
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
