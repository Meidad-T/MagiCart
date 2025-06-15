
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

// Set CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipcode, city, state, latitude, longitude, radius = 100 } = await req.json();

    // Get the RapidAPI key from Supabase secrets
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ error: "RapidAPI key not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (zipcode) {
      params.append('zipcode', zipcode);
    } else if (city && state) {
      params.append('city', city);
      params.append('state', state);
    } else if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
    } else {
      return new Response(
        JSON.stringify({ error: "Must provide zipcode, city+state, or latitude+longitude" }),
        { status: 400, headers: corsHeaders }
      );
    }
    params.append('radius', radius.toString());

    // Make Target API call
    const url = `https://target-com-store-product-reviews-locations-data.p.rapidapi.com/store/list?${params}`;
    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "target-com-store-product-reviews-locations-data.p.rapidapi.com",
      },
    });

    if (!apiRes.ok) {
      const errMsg = await apiRes.text();
      return new Response(
        JSON.stringify({ error: "Error from Target API", message: errMsg }),
        { status: apiRes.status, headers: corsHeaders }
      );
    }

    const targetData = await apiRes.json();

    // Parse locations and prepare for insert
    const locations = (targetData.stores || targetData.data || []).map((item: any) => ({
      chain: "TARGET",
      name: item.location_name || `Target Store ${item.location_id}`,
      location_id: item.location_id?.toString() || "",
      store_number: item.location_id?.toString() || "",
      division_number: null,
      address_line1: item.address_line_1 || "",
      address_line2: null,
      city: item.city || "",
      county: item.county || "",
      state: item.state || "",
      zip_code: item.postal_code || "",
      phone: item.phone_number || "",
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      geolocation:
        item.latitude && item.longitude
          ? `(${item.latitude},${item.longitude})`
          : null,
      hours: item.hours ? JSON.stringify(item.hours) : null,
      departments: null,
    }));

    // Insert into Supabase table using service key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${supabaseUrl}/rest/v1/store_locations`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(locations),
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(JSON.stringify({ error: "DB insert failed", details: body }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const inserted = await res.json();
    return new Response(JSON.stringify({ inserted, count: locations.length }), { 
      status: 201, 
      headers: corsHeaders 
    });
  } catch (err) {
    console.error("[EdgeFn] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
