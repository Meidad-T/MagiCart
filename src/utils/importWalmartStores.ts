
import { supabase } from '@/integrations/supabase/client';

// Import the Walmart stores data
import walmartStoresData from '../../walmart-stores.json';

export async function importWalmartStores() {
  console.log('Starting Walmart store import...');
  
  if (!walmartStoresData || !Array.isArray(walmartStoresData)) {
    console.error('No Walmart data found or data is not an array');
    return { success: false, error: 'Invalid Walmart data' };
  }

  const stores = walmartStoresData.map((store: any, index) => {
    // Skip if missing required data
    if (!store.address) {
      console.log(`Skipping Walmart store ${index}: missing address data`);
      return null;
    }

    return {
      chain: 'WALMART',
      name: `Walmart Store ${store.store_id}`,
      store_number: store.store_id || null,
      location_id: store.store_id || null,
      address_line1: store.address,
      address_line2: null,
      city: null, // Not available in the current data structure
      state: null, // Not available in the current data structure
      zip_code: store.postal_code || null,
      phone: null, // Not available in the current data structure
      latitude: null, // Not available in the current data structure
      longitude: null, // Not available in the current data structure
      geolocation: null,
      hours: null, // Not available in the current data structure
      departments: null // Not available in the current data structure
    };
  }).filter(store => store !== null);

  console.log(`Parsed ${stores.length} valid Walmart stores`);

  // Insert in batches
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < stores.length; i += batchSize) {
    const batch = stores.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('store_locations')
        .insert(batch);

      if (error) {
        console.error(`Error inserting Walmart batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }

      totalInserted += batch.length;
      console.log(`Inserted Walmart batch ${Math.floor(i / batchSize) + 1}: ${batch.length} stores (Total: ${totalInserted})`);
    } catch (error) {
      console.error(`Failed to insert Walmart batch starting at index ${i}:`, error);
      throw error;
    }
  }

  console.log(`Successfully imported ${totalInserted} Walmart stores!`);
  return { success: true, count: totalInserted };
}
