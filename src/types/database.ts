
export interface Store {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPrice {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithPrices extends Product {
  category: Category;
  prices: Record<string, number>; // store name -> price
  walmart_price: number;
  heb_price: number;
  aldi_price: number;
  target_price: number;
  kroger_price: number;
  sams_price: number;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingSession {
  id: string;
  user_id?: string;
  session_data: any;
  shopping_type?: 'pickup' | 'delivery' | 'instore';
  store_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingPlan {
  id: string;
  user_id: string;
  name: string;
  items: any; // Changed from any[] to any to match Supabase Json type
  frequency: 'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom';
  custom_frequency_days?: number;
  store_name: string;
  store_address?: string;
  shopping_type: 'pickup' | 'delivery' | 'instore';
  delivery_address?: string;
  pickup_time?: string;
  estimated_total: number;
  item_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
