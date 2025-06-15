
import { supabase } from '@/integrations/supabase/client';

export async function importTargetStores(searchParams: {
  zipcode?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  console.log('Starting Target store import with params:', searchParams);
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-target-locations', {
      body: searchParams
    });

    if (error) {
      console.error('Target import error:', error);
      throw error;
    }

    console.log(`Successfully imported ${data.count} Target stores!`);
    return { success: true, count: data.count };
  } catch (error) {
    console.error('Target store import failed:', error);
    throw error;
  }
}
