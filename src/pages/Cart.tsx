
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Store, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrices } from "@/types/database";
import type { User } from "@supabase/supabase-js";

interface CartPageProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const Cart = ({ cart, onUpdateCart }: CartPageProps) => {
  const navigate = useNavigate();
  const [shoppingType, setShoppingType] = useState<'pickup' | 'delivery' | 'instore'>('pickup');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const calculateStoreTotals = () => {
    const stores = ['walmart', 'heb', 'aldi', 'target', 'kroger', 'sams'];
    const storeNames = {
      walmart: 'Walmart',
      heb: 'H-E-B',
      aldi: 'Aldi',
      target: 'Target',
      kroger: 'Kroger',
      sams: "Sam's Club"
    };

    const storeTotals = stores.map(store => {
      const total = cart.reduce((sum, cartItem) => {
        const price = cartItem[`${store}_price` as keyof ProductWithPrices] as number;
        return sum + (price * cartItem.quantity);
      }, 0);

      return {
        store: storeNames[store as keyof typeof storeNames],
        total: total.toFixed(2)
      };
    });

    return storeTotals.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    onUpdateCart(updatedCart);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    onUpdateCart(updatedCart);
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const storeTotals = calculateStoreTotals();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Shopping
            </Button>
            <h1 className="text-2xl font-bold">Your Cart</h1>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.unit}</p>
                        <Badge variant="secondary">{item.category.name}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Shopping Options & Summary */}
          <div className="space-y-6">
            {/* Shopping Type */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Options</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shoppingType} onValueChange={(value) => setShoppingType(value as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center cursor-pointer">
                      <Store className="h-4 w-4 mr-2" />
                      Store Pickup
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex items-center cursor-pointer">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instore" id="instore" />
                    <Label htmlFor="instore" className="flex items-center cursor-pointer">
                      <Clock className="h-4 w-4 mr-2" />
                      In-Store Shopping
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Sign In Prompt */}
            {!user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Sync Your Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to save your cart and sync across devices
                  </p>
                  <Button onClick={handleSignIn} className="w-full">
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Store Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storeTotals.map((store, index) => (
                  <div 
                    key={store.store}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{store.store}</span>
                      {index === 0 && (
                        <Badge className="ml-2 bg-green-500 text-white text-xs">
                          Best Price!
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-semibold">${store.total}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Continue to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
