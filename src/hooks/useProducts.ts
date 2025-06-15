
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
            'Unsalted Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format',
            
            // Produce
            'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&auto=format',
            'Tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop&auto=format',
            'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop&auto=format',
            'Oranges': 'https://th.bing.com/th/id/OIP.hOr6_I_hlrEyTS_vK4_ccgHaEK?r=0&rs=1&pid=ImgDetMain',
            'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop&auto=format',
            'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop&auto=format',
            'Onions': 'https://www.gardeningknowhow.com/wp-content/uploads/2020/09/onions.jpg',
            
            // Bakery
            'White Bread Loaf': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format',
            
            // Meat
            'Bacon': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format', // Strips of bacon cooked and appetizing
            
            // Pantry
            'White Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format',
            'Brown Rice': 'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            'Pasta': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=300&fit=crop&auto=format',
            'Flour': 'https://www.gannett-cdn.com/presto/2020/04/27/USAT/e88332ed-9706-454f-b95c-a3cc7afba395-flour.jpg?crop=2111,1188,x9,y0&width=1600&height=800&fit=bounds',
            'White Sugar': 'https://th.bing.com/th/id/OIP.QaXdIgB1MHqDal5OxpCPlwHaHa?r=0&rs=1&pid=ImgDetMain',
            'Brown Sugar': 'https://i5.walmartimages.com/asr/b106322c-8a05-4c7b-b23b-235b4b1dc793.3fd719d6b0d015b1feccaa675763a657.jpeg',
            'Peanut Butter 16 ounce': 'https://live.staticflickr.com/3850/14360041550_45d7bf9975.jpg',
            'Grape Jelly 18 ounce': 'https://i5.walmartimages.com/seo/Smucker-s-Concord-Grape-Jelly-18-Ounces_d1337e48-cb1a-45fc-9f5e-405c81e2f42c.35d0f9766f1c793207a2bf8ad24c5ae4.jpeg',
            'Strawberry Jelly 18 ounce': 'https://images.freshop.com/00051500022153/c21b6392b526cd13b19583c4319807b6_large.png',
            
            // Drinks - better bottle/container images
            '3 Liter Coke Bottle': 'https://live.staticflickr.com/7318/13933195050_6016499339.jpg',
            '3 Liter Sprite Bottle': 'https://www.foodista.com/sites/default/files/styles/featured/public/field/image/12.jpg',
            '3 Liter Dr Pepper Bottle': 'https://c2.staticflickr.com/4/3215/2978925649_d7ca56738f_b.jpg',
            'Bottled water 1 Gallon': 'https://th.bing.com/th/id/R.30251710d09b6bad7d87e3f3468ae5f2?rik=A4MsrMnhAi%2btMQ&riu=http%3a%2f%2fboxingcoachmike.com%2fwp-content%2fuploads%2f2010%2f12%2ffesting.jpg&ehk=sjtB9pTD46UBtTp2MIb40eyR8ODrcwF1CZdDZ8NFGLQ%3d&risl=&pid=ImgRaw&r=0',
            
            // Chips - actual chip bag images
            'Dortios Cool Ranch 14.5 Oz Bag': 'https://c1.staticflickr.com/7/6129/6043807379_3af9bd7a00_b.jpg',
            'Dortios BBQ 14.5 Oz Bag': 'https://smartlabel.pepsico.info/028400697354-0001-en-US/images/a5411be8-f61f-44ae-bfe9-a2cb7dfd4582.JPEG',
            'Dortios Nacho Cheese 14.5 Oz Bag': 'https://i.etsystatic.com/6036337/r/il/66984d/3249809498/il_794xN.3249809498_bzl5.jpg',
            
            // Frozen Foods - pizza and frozen meal images
            'DiGiorno Rising Crust Pepperoni Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format',
            'DiGiorno Rising Crust Three Meat Pizza': 'https://live.staticflickr.com/3842/15121649151_9501dbbb1c_b.jpg',
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
