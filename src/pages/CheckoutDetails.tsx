import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import PickupMap from "@/components/PickupMap";
import { supabase } from "@/integrations/supabase/client";
import StoreHoursAlert, { validateStoreHours } from "@/components/StoreHoursAlert";
import { getDistance } from "@/utils/geo";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ShoppingType = 'pickup' | 'delivery' | 'instore';

interface LocationState {
  shoppingType?: ShoppingType;
  cheapestStore?: string;
  orderTotal?: number;
  itemCount?: number;
  storeName?: string;
  storeAddress?: string;
  deliveryAddress?: string;
  pickupTime?: string;
  fromOrderSummary?: boolean;
}

type StoreLocation = Database['public']['Tables']['store_locations']['Row'];
type StoreWithDistance = StoreLocation & { distance: number };

export default function CheckoutDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const shoppingType: ShoppingType = state?.shoppingType || 'delivery';
  const cheapestStore = state?.cheapestStore || state?.storeName || 'H-E-B';
  const orderTotal = state?.orderTotal || 45.67;
  const itemCount = state?.itemCount || 8;
  const fromOrderSummary = state?.fromOrderSummary || false;

  // Form fields - pre-populate if coming from order summary
  const [deliveryAddress, setDeliveryAddress] = useState(state?.deliveryAddress || "");
  
  // Route optimization toggle
  const [routeOptimization, setRouteOptimization] = useState(false);
  
  // Single address fields (when route optimization is off)
  const [singleStreet, setSingleStreet] = useState("");
  const [singleCity, setSingleCity] = useState("");
  const [singleState, setSingleState] = useState("");
  const [singleZip, setSingleZip] = useState("");
  
  // Work address fields
  const [workStreet, setWorkStreet] = useState("");
  const [workCity, setWorkCity] = useState("");
  const [workState, setWorkState] = useState("");
  const [workZip, setWorkZip] = useState("");
  
  // Home address fields
  const [homeStreet, setHomeStreet] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [homeState, setHomeState] = useState("");
  const [homeZip, setHomeZip] = useState("");
  
  const [pickupTime, setPickupTime] = useState(state?.pickupTime || "");
  const [notes, setNotes] = useState("");

  // Map geocoding and geolocation
  const [workLoc, setWorkLoc] = useState<[number, number] | null>(null);
  const [homeLoc, setHomeLoc] = useState<[number, number] | null>(null);
  const [singleLoc, setSingleLoc] = useState<[number, number] | null>(null);
  const [storeLoc, setStoreLoc] = useState<[number, number] | null>(null);
  const [actualStoreName, setActualStoreName] = useState<string>(cheapestStore);

  // New state for nearby stores
  const [isFetchingStores, setIsFetchingStores] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreWithDistance | null>(null);

  // Geocode single address (when route optimization is off)
  useEffect(() => {
    async function geocodeSingleAddress() {
      if (shoppingType === "pickup" || shoppingType === "instore") {
        const address = `${singleStreet}, ${singleCity}, ${singleState} ${singleZip}`;
        if (singleStreet && singleCity && singleState && singleZip) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const results = await res.json();
            if (Array.isArray(results) && results.length > 0) {
              setSingleLoc([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
            }
          } catch {
            setSingleLoc(null);
          }
        } else {
          setSingleLoc(null);
        }
      }
    }
    geocodeSingleAddress();
  }, [singleStreet, singleCity, singleState, singleZip, shoppingType]);

  // Geocode work address
  useEffect(() => {
    async function geocodeWorkAddress() {
      if (shoppingType === "pickup" || shoppingType === "instore") {
        const address = `${workStreet}, ${workCity}, ${workState} ${workZip}`;
        if (workStreet && workCity && workState && workZip) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const results = await res.json();
            if (Array.isArray(results) && results.length > 0) {
              setWorkLoc([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
            }
          } catch {
            setWorkLoc(null);
          }
        } else {
          setWorkLoc(null);
        }
      }
    }
    geocodeWorkAddress();
  }, [workStreet, workCity, workState, workZip, shoppingType]);

  // Geocode home address
  useEffect(() => {
    async function geocodeHomeAddress() {
      if (shoppingType === "pickup" || shoppingType === "instore") {
        const address = `${homeStreet}, ${homeCity}, ${homeState} ${homeZip}`;
        if (homeStreet && homeCity && homeState && homeZip) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const results = await res.json();
            if (Array.isArray(results) && results.length > 0) {
              setHomeLoc([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
            }
          } catch {
            setHomeLoc(null);
          }
        } else {
          setHomeLoc(null);
        }
      }
    }
    geocodeHomeAddress();
  }, [homeStreet, homeCity, homeState, homeZip, shoppingType]);

  // Fetch closest recommended store location from database
  useEffect(() => {
    const userLoc = routeOptimization ? workLoc : singleLoc;

    const getChainName = (storeName: string): string => {
      const upperCaseName = storeName.toUpperCase();
      if (upperCaseName.includes("H-E-B") || upperCaseName.includes("HEB")) return "HEB";
      if (upperCaseName.includes("WALMART")) return "WALMART";
      if (upperCaseName.includes("TARGET")) return "TARGET";
      if (upperCaseName.includes("KROGER")) return "KROGER";
      return upperCaseName;
    };

    async function fetchRecommendedStore() {
      if ((shoppingType === "pickup" || shoppingType === "instore") && userLoc) {
        setStoreLoc(null); // Reset store location
        setSelectedStore(null);
        setNearbyStores([]);
        setIsFetchingStores(true);

        try {
          const chainName = getChainName(cheapestStore);
          console.log(`Searching for nearby stores for chain: ${chainName} near ${userLoc}`);

          const { data: allStores, error } = await supabase
            .from('store_locations')
            .select('id, name, address_line1, city, state, zip_code, latitude, longitude')
            .eq('chain', chainName)
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);
          
          if (error) {
            console.error('Error fetching store locations:', error);
            return;
          }

          if (allStores && allStores.length > 0) {
            const userLat = userLoc[0];
            const userLon = userLoc[1];

            const storesWithDistance = allStores
              .map(store => {
                if (store.latitude && store.longitude) {
                  const distance = getDistance(userLat, userLon, store.latitude, store.longitude);
                  return { ...store, distance };
                }
                return null;
              })
              .filter((s): s is StoreWithDistance => s !== null);

            storesWithDistance.sort((a, b) => a.distance - b.distance);
            
            const nearby = storesWithDistance.slice(0, 5);
            setNearbyStores(nearby);
            console.log(`Found ${nearby.length} nearby stores.`);
          } else {
            console.warn(`No stores found for chain: ${chainName}.`);
          }
        } catch (error) {
          console.error('Error in fetchRecommendedStore:', error);
        } finally {
          setIsFetchingStores(false);
        }
      }
    }
    fetchRecommendedStore();
  }, [shoppingType, cheapestStore, workLoc, singleLoc, routeOptimization]);

  const handleSelectStore = (store: StoreWithDistance) => {
    setSelectedStore(store);
    if (store.latitude && store.longitude) {
      setStoreLoc([store.latitude, store.longitude]);
      setActualStoreName(store.name);
    }
  };

  const storeHoursValidation = validateStoreHours(actualStoreName, pickupTime);

  const canProceed = shoppingType === "delivery"
    ? !!deliveryAddress
    : routeOptimization 
      ? !!(workStreet && workCity && workState && workZip && 
           homeStreet && homeCity && homeState && homeZip && pickupTime &&
           storeHoursValidation.canProceed && selectedStore)
      : !!(singleStreet && singleCity && singleState && singleZip && pickupTime && storeHoursValidation.canProceed && selectedStore);

  const handlePlaceOrder = () => {
    const workAddress = `${workStreet}, ${workCity}, ${workState} ${workZip}`;
    const homeAddress = `${homeStreet}, ${homeCity}, ${homeState} ${homeZip}`;
    
    const storeFullAddress = selectedStore
      ? `${selectedStore.address_line1}, ${selectedStore.city}, ${selectedStore.state} ${selectedStore.zip_code}`
      : undefined;

    navigate("/order-summary", {
      state: {
        shoppingType,
        storeName: actualStoreName,
        workAddress: shoppingType === "delivery" ? undefined : (routeOptimization ? workAddress : undefined),
        homeAddress: shoppingType === "delivery" ? undefined : (routeOptimization ? homeAddress : undefined),
        storeAddress: storeFullAddress,
        deliveryAddress: shoppingType === "delivery" ? deliveryAddress : undefined,
        pickupTime,
        orderTotal,
        itemCount
      }
    });
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50 flex flex-col items-center">
      <Card className="w-full max-w-2xl mb-6">
        <CardHeader>
          <CardTitle>
            {shoppingType === "delivery"
              ? "Delivery Details"
              : shoppingType === "pickup"
              ? "Curbside Pick-Up Details"
              : "In-Store Shopping Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {shoppingType === "delivery" ? (
            <>
              <Label htmlFor="delivery-adr">Delivery Address</Label>
              <Input
                id="delivery-adr"
                placeholder="Enter your delivery address"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
              />
              <div className="pt-4">
                <Label htmlFor="delivery-notes">Delivery Notes (optional)</Label>
                <Textarea
                  id="delivery-notes"
                  placeholder="Gate code, dropoff instructions, etc."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Route Optimization Toggle */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="route-optimization" className="text-blue-800 font-medium">
                      Route Optimization
                    </Label>
                    <p className="text-sm text-blue-600">
                      Integrate shopping into your daily life by optimizing your route
                    </p>
                  </div>
                  <Switch
                    id="route-optimization"
                    checked={routeOptimization}
                    onCheckedChange={setRouteOptimization}
                  />
                </div>
              </div>

              {!routeOptimization ? (
                /* Single Address Fields */
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="single-street">Your Address</Label>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      id="single-street"
                      placeholder="Street Address"
                      value={singleStreet}
                      onChange={e => setSingleStreet(e.target.value)}
                    />
                    <Input
                      placeholder="City"
                      value={singleCity}
                      onChange={e => setSingleCity(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="ZIP Code"
                        value={singleZip}
                        onChange={e => setSingleZip(e.target.value)}
                      />
                      <Input
                        placeholder="State"
                        value={singleState}
                        onChange={e => setSingleState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Starting Location Section */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="work-street">Starting Location</Label>
                      <p className="text-sm text-gray-600 mb-2">Enter your starting point (e.g., work, university, gym) for route optimization</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        id="work-street"
                        placeholder="Starting Location Street Address"
                        value={workStreet}
                        onChange={e => setWorkStreet(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City"
                          value={workCity}
                          onChange={e => setWorkCity(e.target.value)}
                        />
                        <Input
                          placeholder="State"
                          value={workState}
                          onChange={e => setWorkState(e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="ZIP Code"
                        value={workZip}
                        onChange={e => setWorkZip(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Home Address Section */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="home-street">Destination (Home)</Label>
                      <p className="text-sm text-gray-600 mb-2">Enter your home location for route optimization</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        id="home-street"
                        placeholder="Home Street Address"
                        value={homeStreet}
                        onChange={e => setHomeStreet(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City"
                          value={homeCity}
                          onChange={e => setHomeCity(e.target.value)}
                        />
                        <Input
                          placeholder="State"
                          value={homeState}
                          onChange={e => setHomeState(e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="ZIP Code"
                        value={homeZip}
                        onChange={e => setHomeZip(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Nearby Stores Selection */}
              {(singleLoc || workLoc) && (
                <div className="space-y-4 pt-4">
                  <Label>Select a Store</Label>
                  {isFetchingStores ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Finding nearby stores...</span>
                    </div>
                  ) : nearbyStores.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">We found these stores near you. Please select one.</p>
                      {nearbyStores.map(store => (
                        <div 
                          key={store.id}
                          onClick={() => handleSelectStore(store)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedStore?.id === store.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="font-semibold">{store.name}</div>
                          <div className="text-sm text-gray-500">{store.address_line1}, {store.city}</div>
                          <div className="text-sm font-medium text-primary">{store.distance.toFixed(1)} miles away</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No stores found for {cheapestStore} near the provided address. Please try a different address.</p>
                  )}
                </div>
              )}
              
              <div className="pt-4">
                <Label htmlFor="pickup-time">
                  {shoppingType === "pickup" ? "Pick-up Time" : "Pickup Time"}
                </Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                />
              </div>
              
              {pickupTime && selectedStore && (
                <StoreHoursAlert 
                  storeName={actualStoreName} 
                  pickupTime={pickupTime} 
                />
              )}
              
              <div className="pt-4">
                <Label htmlFor="pickup-notes">
                  {shoppingType === "pickup" ? "Pick-up Notes (optional)" : "Pickup Notes (optional)"}
                </Label>
                <Textarea
                  id="pickup-notes"
                  placeholder="Anything to help the store staff?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              
              {/* Map - show for both route optimization modes */}
              {((routeOptimization && workLoc && homeLoc && storeLoc) || 
                (!routeOptimization && singleLoc && storeLoc)) && selectedStore && (
                <div>
                  <PickupMap 
                    start={routeOptimization ? workLoc : singleLoc} 
                    dest={routeOptimization ? homeLoc : singleLoc} 
                    storeLocation={storeLoc}
                    storeName={actualStoreName}
                  />
                  <p className="text-xs text-gray-400 text-center mt-1">
                    <span role="img" aria-label="info">🗺️</span> {routeOptimization 
                      ? `Optimized route: Starting Location → ${actualStoreName} → Home`
                      : `Route: Your Location → ${actualStoreName} → Your Location`
                    }
                  </p>
                </div>
              )}
            </>
          )}

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={!canProceed}
            onClick={handlePlaceOrder}
          >
            Continue to Order Summary
          </Button>
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={() => navigate("/cart")}>
        ← Back to Cart
      </Button>
    </div>
  );
}
