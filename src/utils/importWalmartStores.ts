
import { supabase } from '@/integrations/supabase/client';

// This will be populated once you provide the Walmart JSON data
export async function importWalmartStores(walmartData?: any[]) {
  console.log('Starting Walmart store import...');
  
  if (!walmartData || !Array.isArray(walmartData)) {
    console.error('No Walmart data provided or data is not an array');
    return { success: false, error: 'Invalid Walmart data provided' };
  }

  const stores = walmartData.map((store, index) => {
    // This mapping will depend on the structure of your Walmart JSON
    // Common fields might include: id, name, address, city, state, zip, lat, lng, phone
    
    // Skip if missing required data
    if (!store.address || !store.city || !store.zip) {
      console.log(`Skipping Walmart store ${index}: missing address data`);
      return null;
    }

    return {
      chain: 'WALMART',
      name: store.name || `Walmart ${store.city}`,
      store_number: store.id || store.storeNumber || null,
      location_id: store.locationId || null,
      address_line1: store.address || store.streetAddress,
      address_line2: store.address2 || null,
      city: store.city,
      state: store.state || store.stateCode,
      zip_code: store.zip || store.zipCode,
      phone: store.phone || null,
      latitude: store.lat || store.latitude || null,
      longitude: store.lng || store.longitude || null,
      geolocation: (store.lat && store.lng) ? `(${store.lat},${store.lng})` : null,
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
