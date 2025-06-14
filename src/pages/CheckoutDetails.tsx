
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Map } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type ShoppingType = 'pickup' | 'delivery' | 'instore';

interface LocationState {
  shoppingType?: ShoppingType;
  // Optionally pass cart/other stuff if wanted
}

const mockStoreAddresses = [
  "1234 Main St, Austin, TX",
  "2000 Helpful Ave, H-E-B City, TX",
  "8900 Superstore Blvd, Retail Park, TX"
];

export default function CheckoutDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const shoppingType: ShoppingType = state?.shoppingType || 'delivery';

  // Form fields
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [storeStreet, setStoreStreet] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [storeState, setStoreState] = useState("");
  const [storeZip, setStoreZip] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");

  // Mock user location for the map (static for now)
  const userAddress = "Your Home, TX";
  const canProceed = shoppingType === "delivery"
    ? !!deliveryAddress
    : !!(storeStreet && storeCity && storeState && storeZip && pickupTime);

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
              <Label htmlFor="store-street">Store Address</Label>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="store-street"
                  placeholder="Street Address"
                  value={storeStreet}
                  onChange={e => setStoreStreet(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={storeCity}
                    onChange={e => setStoreCity(e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={storeState}
                    onChange={e => setStoreState(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="ZIP Code"
                  value={storeZip}
                  onChange={e => setStoreZip(e.target.value)}
                />
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
            </>
          )}

          {/* Simple Map with Route Visualization */}
          <div>
            <Label>Map Preview</Label>
            <div className="rounded-xl overflow-hidden border bg-white p-3 my-2 flex flex-col items-center">
              {/* For demonstration, we use a static placeholder image for the map.
                  You can later swap in a Mapbox or Google Maps widget easily. */}
              <div className="relative w-full h-48 flex items-center justify-center bg-blue-50">
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=Downtown+Austin,TX&zoom=11&size=600x200&maptype=roadmap&markers=color:blue%7Clabel:H%7C30.2672,-97.7431&markers=color:green%7Clabel:S%7C30.3136,-97.7431&key=AIzaSyD-PLACEHOLDER"
                  alt="Route Map"
                  className="w-full h-48 object-cover"
                  style={{ filter: "saturate(1.1) blur(0.5px)" }}
                  draggable={false}
                />
                <Map className="absolute left-3 top-3 h-6 w-6 text-blue-500 bg-white rounded-full p-1 shadow" />
              </div>
              <div className="text-sm text-gray-700 pt-2">
                Route from <span className="font-medium">{userAddress}</span> to{" "}
                <span className="font-medium">
                  {shoppingType === "delivery" 
                    ? "Your Address" 
                    : (storeStreet && storeCity ? `${storeStreet}, ${storeCity}` : "Selected Store")}
                </span>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={!canProceed}
            onClick={() => navigate("/")}
          >
            Place Order
          </Button>
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={() => navigate("/cart")}>
        ← Back to Cart
      </Button>
    </div>
  );
}
