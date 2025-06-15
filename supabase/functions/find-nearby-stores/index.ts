import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("find-nearby-stores function invoked.");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const { lat, lng, keyword } = await req.json();
    console.log("Request body parsed:", { lat, lng, keyword });

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      console.error("Google Maps API key not found in environment variables.");
      throw new Error("Google Maps API key not configured");
    }
    console.log("Google Maps API key found.");

    if (!lat || !lng || !keyword) {
      console.error("Missing required parameters.");
      throw new Error("Missing required parameters: lat, lng, keyword");
    }

    const radius = 19312; // 12 miles in meters
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
    console.log("Fetching from Google Places API:", url.replace(apiKey, "REDACTED_API_KEY"));

    const apiRes = await fetch(url);
    console.log("Google Places API response status:", apiRes.status);

    if (!apiRes.ok) {
      const errMsg = await apiRes.text();
      console.error("Error from Google Places API:", errMsg);
      throw new Error(`Google Places API error: ${apiRes.statusText}`);
    }

    const data = await apiRes.json();
    console.log("Successfully fetched data from Google Places API.");

    const stores = data.results
      .filter((place: any) => 
        place.name && place.name.toLowerCase().includes(keyword.toLowerCase())
      )
      .map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address_line1: place.vicinity,
        city: null,
        state: null,
        zip_code: null,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        chain: keyword,
        location_id: null,
        store_number: null,
        division_number: null,
        address_line2: null,
        county: null,
        phone: null,
        geolocation: null,
        hours: null,
        departments: null,
        created_at: null,
      }));
    console.log(`Mapped ${stores.length} stores after filtering.`);

    return new Response(JSON.stringify({ stores }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[EdgeFn] error:", err.toString(), err.stack);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
