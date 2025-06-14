
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
            '1 Gallon Whole Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
            'Eggs 12 count': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=200&fit=crop',
            'Mozzarella Cheese 8 oz': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
            'Chedder Cheese 8 oz': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=300&h=200&fit=crop',
            'Salted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=200&fit=crop',
            'Unsalted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=200&fit=crop',
            
            // Produce
            'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
            'Tomatoes': 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba8b?w=300&h=200&fit=crop',
            'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
            'Oranges': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop',
            'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
            'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop',
            'Onions': 'https://images.unsplash.com/photo-1518322444705-f661f0d6954d?w=300&h=200&fit=crop',
            
            // Bakery
            'White Bread Loaf': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop',
            
            // Meat
            'Bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44b982?w=300&h=200&fit=crop',
            
            // Pantry
            'White Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
            'Brown Rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&h=200&fit=crop',
            'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
            'Flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
            'White Sugar': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop',
            'Brown Sugar': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=200&fit=crop',
            'Peanut Butter 16 ounce': 'https://images.unsplash.com/photo-1560180980-23c49cb050ce?w=300&h=200&fit=crop',
            'Grape Jelly 18 ounce': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
            'Strawberry Jelly 18 ounce': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
            
            // Drinks
            '3 Liter Coke Bottle': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop',
            '3 Liter Sprite Bottle': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop',
            '3 Liter Dr Pepper Bottle': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop',
            'Bottled water 1 Gallon': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
            
            // Chips
            'Dortios Cool Ranch 14.5 Oz Bag': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop',
            'Dortios BBQ 14.5 Oz Bag': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop',
            'Dortios Nacho Cheese 14.5 Oz Bag': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop'
          };
          
          return imageMap[productName] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop';
        };

        return {
          ...product,
          category,
          prices: pricesByStore,
          image_url: product.image_url || getProductSpecificImage(product.name),
          // Legacy format for compatibility
          walmart_price: pricesByStore['walmart'] || 0,
          heb_price: pricesByStore['heb'] || 0,
          aldi_price: pricesByStore['aldi'] || 0,
          target_price: pricesByStore['target'] || 0,
          kroger_price: pricesByStore['kroger'] || 0,
          sams_price: pricesByStore['sams'] || 0,
        } as ProductWithPrices;
      });
    },
  });
};
