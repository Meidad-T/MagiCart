
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [storeStreet, setStoreStreet] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [storeState, setStoreState] = useState("");
  const [storeZip, setStoreZip] = useState("");
  const [pickupTime, setPickupTime] = useState(state?.pickupTime || "");
  const [notes, setNotes] = useState("");

  // Parse existing store address if coming from order summary
  useEffect(() => {
    if (fromOrderSummary && state?.storeAddress) {
      const addressParts = state.storeAddress.split(', ');
      if (addressParts.length >= 3) {
        setStoreStreet(addressParts[0]);
        setStoreCity(addressParts[1]);
        const stateZip = addressParts[2].split(' ');
        if (stateZip.length >= 2) {
          setStoreState(stateZip[0]);
          setStoreZip(stateZip[1]);
        }
      }
    }
  }, [fromOrderSummary, state?.storeAddress]);

  const canProceed = shoppingType === "delivery"
    ? !!deliveryAddress
    : !!(storeStreet && storeCity && storeState && storeZip && pickupTime);

  const handlePlaceOrder = () => {
    const storeAddress = `${storeStreet}, ${storeCity}, ${storeState} ${storeZip}`;
    
    navigate("/order-summary", {
      state: {
        shoppingType,
        storeName: cheapestStore,
        storeAddress: shoppingType === "delivery" ? undefined : storeAddress,
        deliveryAddress: shoppingType === "delivery" ? deliveryAddress : undefined,
        pickupTime,
        orderTotal,
        itemCount
      }
    });
  };

  // If coming from order summary and all details are already filled, skip to order summary
  if (fromOrderSummary && canProceed) {
    const storeAddress = `${storeStreet}, ${storeCity}, ${storeState} ${storeZip}`;
    
    navigate("/order-summary", {
      state: {
        shoppingType,
        storeName: cheapestStore,
        storeAddress: shoppingType === "delivery" ? undefined : storeAddress,
        deliveryAddress: shoppingType === "delivery" ? deliveryAddress : undefined,
        pickupTime,
        orderTotal,
        itemCount
      },
      replace: true
    });
    
    return <div className="p-10 text-center text-gray-700">Loading…</div>;
  }

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
