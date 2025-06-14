
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MapboxMap from "@/components/MapboxMap";

type ShoppingType = 'pickup' | 'delivery' | 'instore';

interface LocationState {
  shoppingType?: ShoppingType;
  // Optionally pass cart/other stuff if wanted
}

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
  const [routeInfo, setRouteInfo] = useState({ distance: "", duration: "" });

  // Mock user location for the map
  const userAddress = "Your Home, Austin, TX";
  const canProceed = shoppingType === "delivery"
    ? !!deliveryAddress
    : !!(storeStreet && storeCity && storeState && storeZip && pickupTime);

  const handlePlaceOrder = () => {
    const storeAddress = `${storeStreet}, ${storeCity}, ${storeState} ${storeZip}`;
    
    navigate("/order-summary", {
      state: {
        shoppingType,
        storeName: "H-E-B", // This could be dynamic based on selection
        storeAddress: shoppingType === "delivery" ? undefined : storeAddress,
        deliveryAddress: shoppingType === "delivery" ? deliveryAddress : undefined,
        pickupTime,
        orderTotal: 45.67, // This would come from cart
        itemCount: 8 // This would come from cart
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

          {/* Interactive Map */}
          <div>
            <MapboxMap
              origin={userAddress}
              destination={
                shoppingType === "delivery" 
                  ? deliveryAddress || "Austin, TX"
                  : (storeStreet && storeCity ? `${storeStreet}, ${storeCity}` : "Austin, TX")
              }
              onRouteCalculated={(distance, duration) => {
                setRouteInfo({ distance, duration });
              }}
            />
            {routeInfo.distance && (
              <div className="text-sm text-gray-700 pt-2 text-center">
                Distance: <span className="font-medium">{routeInfo.distance}</span> • 
                Duration: <span className="font-medium">{routeInfo.duration}</span>
              </div>
            )}
          </div>

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
