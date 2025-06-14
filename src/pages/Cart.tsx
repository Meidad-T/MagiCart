import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Store, User, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrices } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface CartPageProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const Cart = ({ cart, onUpdateCart }: CartPageProps) => {
  const navigate = useNavigate();
  const [shoppingType, setShoppingType] = useState<'pickup' | 'delivery' | 'instore'>('pickup');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  });

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUserProfile(data);
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUserProfile(data);
          });
      } else {
        setUserProfile(null);
      }
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

      const items = cart.map(cartItem => ({
        name: cartItem.name,
        quantity: cartItem.quantity,
        price: cartItem[`${store}_price` as keyof ProductWithPrices] as number,
        total: (cartItem[`${store}_price` as keyof ProductWithPrices] as number) * cartItem.quantity
      }));

      return {
        store: storeNames[store as keyof typeof storeNames],
        storeKey: store,
        total: total.toFixed(2),
        items
      };
    });

    return storeTotals.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
  };

  const toggleStoreExpansion = (storeKey: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeKey]: !prev[storeKey]
    }));
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

  const getUserFirstName = () => {
    if (!userProfile?.full_name) return '';
    return userProfile.full_name.split(' ')[0];
  };

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

        {/* Welcome Message */}
        {user && userProfile && (
          <div className="mb-6">
            <h2 className="text-xl text-gray-700">
              Welcome, {getUserFirstName()}!
            </h2>
          </div>
        )}

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

            {/* Delivery Address Form - only show when delivery is selected */}
            {shoppingType === 'delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Austin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="TX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="78701"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="instructions">Special Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        value={deliveryAddress.instructions}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Leave at front door, ring doorbell, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

            {/* Store Totals with Expandable Items */}
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storeTotals.map((store, index) => (
                  <Collapsible key={store.store}>
                    <div 
                      className={`rounded-lg ${
                        index === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <CollapsibleTrigger 
                        className="w-full p-3 flex justify-between items-center hover:bg-opacity-80 transition-colors"
                        onClick={() => toggleStoreExpansion(store.storeKey)}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{store.store}</span>
                          {index === 0 && (
                            <Badge className="ml-2 bg-green-500 text-white text-xs">
                              Best Price!
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">${store.total}</span>
                          {expandedStores[store.storeKey] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 border-t border-gray-200 mt-2 pt-2">
                          <div className="space-y-2">
                            {store.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  {item.name} x{item.quantity}
                                </span>
                                <div className="text-right">
                                  <div className="text-gray-500">${item.price.toFixed(2)} each</div>
                                  <div className="font-medium">${item.total.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
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
