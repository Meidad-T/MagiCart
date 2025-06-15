
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PickupMap from "@/components/PickupMap"; // NEW

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
  const [storeLoc, setStoreLoc] = useState<[number, number] | null>(null);

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

  // Geocode store address (placeholder - will be updated with actual store locations)
  useEffect(() => {
    async function geocodeStoreAddress() {
      if (shoppingType === "pickup" || shoppingType === "instore") {
        // Placeholder store location - this will be updated with actual store data
        // For now, using a central Austin location
        setStoreLoc([30.2672, -97.7431]);
      }
    }
    geocodeStoreAddress();
  }, [shoppingType, cheapestStore]);

  const canProceed = shoppingType === "delivery"
    ? !!deliveryAddress
    : !!(workStreet && workCity && workState && workZip && 
         homeStreet && homeCity && homeState && homeZip && pickupTime);

  const handlePlaceOrder = () => {
    const workAddress = `${workStreet}, ${workCity}, ${workState} ${workZip}`;
    const homeAddress = `${homeStreet}, ${homeCity}, ${homeState} ${homeZip}`;
    
    navigate("/order-summary", {
      state: {
        shoppingType,
        storeName: cheapestStore,
        workAddress: shoppingType === "delivery" ? undefined : workAddress,
        homeAddress: shoppingType === "delivery" ? undefined : homeAddress,
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
              ? "Store Pickup Details"
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
              <Label htmlFor="delivery-notes">Delivery Notes (optional)</Label>
              <Textarea
                id="delivery-notes"
                placeholder="Gate code, dropoff instructions, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </>
          ) : (
            <>
              {/* Work Address Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="work-street">Work Address</Label>
                  <p className="text-sm text-gray-600 mb-2">Enter your work location for route optimization</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="work-street"
                    placeholder="Work Street Address"
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
                  <Label htmlFor="home-street">Home Address</Label>
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
              
              <Label htmlFor="pickup-time" className="pt-2">Pickup Time</Label>
              <Input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={e => setPickupTime(e.target.value)}
              />
              <Label htmlFor="pickup-notes">Pickup Notes (optional)</Label>
              <Textarea
                id="pickup-notes"
                placeholder="Anything to help the store staff?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              {/* Route optimization map */}
              <div>
                <PickupMap 
                  start={workLoc} 
                  dest={homeLoc} 
                  storeLocation={storeLoc}
                  storeName={cheapestStore}
                />
                <p className="text-xs text-gray-400 text-center mt-1">
                  <span role="img" aria-label="info">🗺️</span> Optimized route: Work → {cheapestStore} (best price) → Home
                </p>
              </div>
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
