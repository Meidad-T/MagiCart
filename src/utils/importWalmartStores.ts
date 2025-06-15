
import { supabase } from '@/integrations/supabase/client';

// Import the Walmart stores data
import walmartStoresData from '../../walmart-stores.json';

export async function importWalmartStores() {
  console.log('Starting Walmart store import...');
  
  if (!walmartStoresData || !Array.isArray(walmartStoresData)) {
    console.error('No Walmart data found or data is not an array');
    return { success: false, error: 'Invalid Walmart data' };
  }

  const stores = walmartStoresData.map((store, index) => {
    // Skip if missing required data
    if (!store.address || !store.city) {
      console.log(`Skipping Walmart store ${index}: missing address data`);
      return null;
    }

    return {
      chain: 'WALMART',
      name: store.name || `Walmart ${store.city}`,
      store_number: store.id?.toString() || store.storeNumber?.toString() || null,
      location_id: store.locationId?.toString() || null,
      address_line1: store.address || store.streetAddress,
      address_line2: store.address2 || null,
      city: store.city,
      state: store.state || store.stateCode,
      zip_code: store.zipCode || store.zip,
      phone: store.phone || null,
      latitude: parseFloat(store.latitude) || parseFloat(store.lat) || null,
      longitude: parseFloat(store.longitude) || parseFloat(store.lng) || null,
      geolocation: (store.latitude && store.longitude) ? `(${store.latitude},${store.longitude})` : null,
      hours: store.hours || null,
      departments: store.departments || null
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
