
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

        // Generate placeholder image based on category
        const getPlaceholderImage = (categoryName: string) => {
          const imageMap = {
            'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
            'produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
            'bakery': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop',
            'meat': 'https://images.unsplash.com/photo-1448907503123-67254d59ca4f?w=300&h=200&fit=crop',
            'pantry': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
            'drink': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=300&h=200&fit=crop',
            'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop'
          };
          return imageMap[categoryName as keyof typeof imageMap] || imageMap['pantry'];
        };

        return {
          ...product,
          category,
          prices: pricesByStore,
          image_url: product.image_url || getPlaceholderImage(category.name),
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
