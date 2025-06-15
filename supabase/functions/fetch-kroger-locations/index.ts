
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
    // Accept either POST JSON or x-www-form-urlencoded
    const { token, limit = 10, zipCode = "45039" } =
      req.headers.get("content-type")?.includes("application/json")
        ? await req.json()
        : Object.fromEntries(new URLSearchParams(await req.text()));

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Kroger API token required in the 'token' property" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Make Kroger API call
    const url = `https://api.kroger.com/v1/locations?limit=${limit}&filter.zipCode.near=${zipCode}`;
    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!apiRes.ok) {
      const errMsg = await apiRes.text();
      return new Response(
        JSON.stringify({ error: "Error from Kroger API", message: errMsg }),
        { status: apiRes.status, headers: corsHeaders }
      );
    }

    const krogerData = await apiRes.json();

    // Parse locations and prepare for insert
    const locations = (krogerData.data ?? []).map((item: any) => ({
      chain: item.chain || "KROGER",
      name: item.name || "",
      location_id: item.locationId || "",
      store_number: item.storeNumber || "",
      division_number: item.divisionNumber || "",
      address_line1: item.address?.addressLine1 || "",
      address_line2: item.address?.addressLine2 || "",
      city: item.address?.city || "",
      county: item.address?.county || "",
      state: item.address?.state || "",
      zip_code: item.address?.zipCode || "",
      phone: item.phone || "",
      latitude: item.geolocation?.latitude || null,
      longitude: item.geolocation?.longitude || null,
      geolocation:
        item.geolocation?.latitude && item.geolocation?.longitude
          ? `(${item.geolocation.latitude},${item.geolocation.longitude})`
          : null,
      hours: item.hours ? JSON.stringify(item.hours) : null,
      departments: item.departments ? JSON.stringify(item.departments) : null,
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
    return new Response(JSON.stringify({ inserted }), { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("[EdgeFn] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
