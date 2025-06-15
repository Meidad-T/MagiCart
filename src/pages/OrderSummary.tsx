
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Clock, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ShoppingPlanForm from "@/components/ShoppingPlanForm";

type ShoppingType = 'pickup' | 'delivery' | 'instore';

interface LocationState {
  shoppingType?: ShoppingType;
  storeName?: string;
  storeAddress?: string;
  deliveryAddress?: string;
  pickupTime?: string;
  orderTotal?: number;
  itemCount?: number;
}

// Store brand colors
const storeColors = {
  'H-E-B': '#e31837',
  'Walmart': '#004c91',
  'Target': '#cc0000',
  'Kroger': '#0f4c81',
  'Costco': '#00529c',
  'Whole Foods': '#00a844',
  'Trader Joes': '#d2202b',
  'Safeway': '#ff6900',
  'Publix': '#008542',
  'Wegmans': '#ff6900'
};

// Fallback addresses for each store in Austin area
const fallbackAddresses = {
  'H-E-B': '1000 E 41st St, Austin, TX 78751',
  'Walmart': '2700 S Lamar Blvd, Austin, TX 78704',
  'Target': '1000 Research Blvd, Austin, TX 78759',
  'Kroger': '9070 Research Blvd, Austin, TX 78758',
  'Costco': '4301 W William Cannon Dr, Austin, TX 78749',
  'Whole Foods': '525 N Lamar Blvd, Austin, TX 78703',
  'Trader Joes': '2525 W Anderson Ln, Austin, TX 78757',
  'Safeway': '1000 E 12th St, Austin, TX 78702',
  'Publix': '2200 Ranch Road 620 S, Austin, TX 78734',
  'Wegmans': '11066 Pecan Park Blvd, Austin, TX 78750'
};

export default function OrderSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState | null;
  
  const shoppingType: ShoppingType = state?.shoppingType || 'delivery';
  const storeName = state?.storeName || 'H-E-B';
  const deliveryAddress = state?.deliveryAddress || 'Your Address';
  const pickupTime = state?.pickupTime || 'ASAP';
  const orderTotal = state?.orderTotal || 45.67;
  const itemCount = state?.itemCount || 8;
  
  const [storeAddress, setStoreAddress] = useState(state?.storeAddress || '');
  
  const storeColor = storeColors[storeName as keyof typeof storeColors] || '#e31837';
  const storeSite = storeName.toLowerCase().replace(/[^a-z]/g, '') + '.com';

  // Fetch actual store address from database
  useEffect(() => {
    async function fetchStoreAddress() {
      if (shoppingType === 'delivery') return; // No store address needed for delivery
      
      try {
        const { data: storeData, error } = await supabase
          .from('store_locations')
          .select('address_line1, city, state, zip_code')
          .ilike('name', `%${storeName}%`)
          .not('address_line1', 'is', null)
          .limit(1)
          .single();

        if (error || !storeData) {
          console.log('No store found in database, using fallback address');
          setStoreAddress(fallbackAddresses[storeName as keyof typeof fallbackAddresses] || '1234 Main St, Austin, TX');
          return;
        }

        // Build full address from database data
        const fullAddress = `${storeData.address_line1}, ${storeData.city}, ${storeData.state} ${storeData.zip_code}`;
        setStoreAddress(fullAddress);
        console.log('Found store address in database:', fullAddress);
      } catch (error) {
        console.error('Error fetching store address:', error);
        setStoreAddress(fallbackAddresses[storeName as keyof typeof fallbackAddresses] || '1234 Main St, Austin, TX');
      }
    }
    
    fetchStoreAddress();
  }, [storeName, shoppingType]);

  const orderData = {
    storeName,
    storeAddress,
    shoppingType,
    deliveryAddress,
    pickupTime,
    orderTotal,
    itemCount,
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50 flex flex-col items-center">
      <Card className="w-full max-w-2xl mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            Order Ready!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your order summary is ready for checkout
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Order Type:</span>
              <span className="capitalize">
                {shoppingType === 'pickup' ? 'Curbside Pick-Up' : shoppingType}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Store:</span>
              <span>{storeName}</span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {shoppingType === 'delivery' ? 'Delivery to:' : shoppingType === 'pickup' ? 'Pick-up at:' : 'Store Address:'}
              </span>
              <span className="text-right">
                {shoppingType === 'delivery' ? deliveryAddress : storeAddress}
              </span>
            </div>
            
            {shoppingType !== 'delivery' && (
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {shoppingType === 'pickup' ? 'Pick-up Time:' : 'Pickup Time:'}
                </span>
                <span>{pickupTime}</span>
              </div>
            )}
            
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-medium flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" />
                Items:
              </span>
              <span>{itemCount} items</span>
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Estimated Total:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Final total may vary based on store prices and availability
            </p>
          </div>

          {/* Shopping Plan Form - Only show for authenticated users */}
          {user && (
            <ShoppingPlanForm 
              cart={[]}  // TODO: Replace with actual cart data as needed
              storeName={storeName}
              storeAddress={storeAddress}
              shoppingType={shoppingType}
              deliveryAddress={deliveryAddress}
              pickupTime={pickupTime}
              open={false} // TODO: Control this with state if you want to show as dialog
              onOpenChange={() => {}} // No-op for now; set if you want to open/close dialog
              onPlanSaved={() => {
                // You can add your code here e.g. show a message if needed
                console.log("Plan saved!");
              }}
            />
          )}

          {/* Store Order Button */}
          <div className="text-center space-y-4">
            <Button
              className="w-full py-4 text-lg font-semibold rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: storeColor }}
              onClick={() => {
                // In a real app, this would redirect to the store's website
                window.open(`https://${storeSite}`, '_blank');
              }}
            >
              Order at {storeName}
            </Button>
            
            <p className="text-sm text-gray-600 px-4">
              By clicking "Order at {storeName}", you will be redirected to {storeSite} 
              where all your items will already be in the cart ready for checkout.
            </p>
            
            <p className="text-xs text-gray-500 px-4">
              * This is an affiliate link
            </p>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/cart")}
              className="w-full"
            >
              Edit Cart
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/checkout-details", { 
                state: { 
                  ...state,
                  fromOrderSummary: true 
                } 
              })}
              className="w-full"
            >
              Edit Details
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Button variant="ghost" onClick={() => navigate("/")}>
        ← Back to Shopping
      </Button>
    </div>
  );
}
