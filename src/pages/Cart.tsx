import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Store, User, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrices } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { PriceComparison } from "@/components/PriceComparison";
import { IntelligentRecommendation } from "@/components/IntelligentRecommendation";
import ConfettiText from "@/components/ConfettiText";

interface CartPageProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const Cart = ({ cart, onUpdateCart }: CartPageProps) => {
  const navigate = useNavigate();
  const [shoppingType, setShoppingType] = useState<'pickup' | 'delivery' | 'instore'>('pickup');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [substitutionCounts, setSubstitutionCounts] = useState<Record<string, number>>({});
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [previousHealthScore, setPreviousHealthScore] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const calculateCartHealthScore = () => {
    if (cart.length === 0) return 0;
    
    let produceCount = 0;
    let totalItems = 0;
    
    cart.forEach(item => {
      totalItems += item.quantity;
      
      // Count produce items
      const categoryName = item.category.name.toLowerCase();
      const productName = item.name.toLowerCase();
      
      if (categoryName.includes('produce') || 
          categoryName.includes('fruits') || 
          categoryName.includes('vegetables') ||
          productName.includes('organic')) {
        produceCount += item.quantity;
      }
    });
    
    // If cart is ONLY produce, return 100
    if (produceCount === totalItems && produceCount > 0) {
      return 100;
    }
    
    // New produce-based scoring system
    if (produceCount === 0) return 20;
    if (produceCount === 1) return 44;
    if (produceCount === 2) return 57;
    if (produceCount === 3) return 70;
    if (produceCount === 4) return 81;
    if (produceCount === 5) return 92;
    if (produceCount === 6) return 98;
    if (produceCount >= 7) return 100;
    
    return 20; // fallback
  };

  const healthScore = calculateCartHealthScore();

  // Trigger confetti when health score reaches 100
  useEffect(() => {
    if (healthScore === 100 && previousHealthScore !== 100) {
      setConfettiTrigger(true);
      // Reset the trigger after a short delay
      setTimeout(() => setConfettiTrigger(false), 100);
    }
    setPreviousHealthScore(healthScore);
  }, [healthScore, previousHealthScore]);

  // Auto-collapse when cart items reduce below the expand threshold
  useEffect(() => {
    if (cart.length <= 4 && cartExpanded) {
      setCartExpanded(false);
    }
  }, [cart.length, cartExpanded]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-600";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getHealthScoreGradient = (score: number) => {
    if (score >= 85) return "from-green-500 to-green-600";
    if (score >= 70) return "from-yellow-500 to-yellow-600";
    if (score >= 50) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getHealthScoreGlow = (score: number) => {
    if (score >= 85) return "shadow-green-500/20";
    if (score >= 70) return "shadow-yellow-500/20";
    if (score >= 50) return "shadow-orange-500/20";
    return "shadow-red-500/30";
  };

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
      const subtotal = cart.reduce((sum, cartItem) => {
        const price = cartItem[`${store}_price` as keyof ProductWithPrices] as number;
        return sum + (price * cartItem.quantity);
      }, 0);

      const taxesAndFees = subtotal * 0.0875; // 8.75% tax rate

      // Calculate store-specific fees based on shopping type
      let storeFee = 0;
      
      if (shoppingType === 'pickup') {
        switch (store) {
          case 'walmart':
            storeFee = 1.99;
            break;
          case 'sams':
            storeFee = subtotal >= 50 ? 0 : 4.99;
            break;
          case 'heb':
            storeFee = 0; // Free pickup
            break;
          // Aldi, Target, Kroger have no pickup fees mentioned
        }
      } else if (shoppingType === 'delivery') {
        switch (store) {
          case 'walmart':
            storeFee = subtotal >= 35 ? 0 : 7.95;
            break;
          case 'heb':
            storeFee = 4.95;
            break;
          case 'aldi':
            storeFee = subtotal >= 35 ? 0 : 3.99;
            break;
          case 'kroger':
            storeFee = subtotal >= 35 ? 0 : 4.95;
            break;
          case 'target':
            storeFee = subtotal >= 35 ? 0 : 9.99;
            break;
          case 'sams':
            storeFee = subtotal >= 50 ? 0 : 12.00;
            break;
        }
      }
      // In-store shopping has no additional fees

      const totalFeesAndTaxes = taxesAndFees + storeFee;
      const total = subtotal + totalFeesAndTaxes;

      return {
        store: storeNames[store as keyof typeof storeNames],
        storeKey: store,
        subtotal: subtotal.toFixed(2),
        taxesAndFees: totalFeesAndTaxes.toFixed(2),
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

  // Store brand colors
  const storeColors = {
    'H-E-B': '#e31837',
    'Walmart': '#004c91',
    'Target': '#cc0000',
    'Kroger': '#0f4c81',
    'Sam\'s Club': '#00529c',
    'Aldi': '#ff6900'
  };

  // Fixed logic: Always show max 4 items when collapsed, regardless of total count
  const shouldShowExpandButton = cart.length > 4;
  const itemsToShow = cartExpanded ? cart : cart.slice(0, 4);
  const hiddenItemsCount = cart.length - 4;

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

  const cheapestStore = storeTotals[0]; // First one is cheapest due to sorting
  const cheapestStoreColor = storeColors[cheapestStore?.store as keyof typeof storeColors] || '#3b82f6';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            <Card className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <CardTitle>Cart Items ({cart.length})</CardTitle>
                    {/* Health Score Tip - with proper wrapping */}
                    {cart.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2 pr-40">
                        Add healthy foods to increase your cart's health score! (AI generated assessment)
                      </p>
                    )}
                  </div>
                  {/* Expand Button at Top - shows when more than 4 items and currently collapsed */}
                  {shouldShowExpandButton && !cartExpanded && (
                    <Button
                      variant="ghost"
                      onClick={() => setCartExpanded(true)}
                      className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show {hiddenItemsCount} More
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Health Score Container - Top Right Corner with equal spacing */}
              {cart.length > 0 && (
                <div className="absolute top-6 right-6 z-10">
                  <div className={`bg-gradient-to-r ${getHealthScoreGradient(healthScore)} rounded-lg px-4 py-3 shadow-lg ${getHealthScoreGlow(healthScore)} transform hover:scale-105 transition-all duration-300`}>
                    <div className="text-center text-white min-w-[120px]">
                      <p className="text-xs font-medium opacity-90 mb-2">Health Score</p>
                      <ConfettiText trigger={confettiTrigger}>
                        <div className="text-2xl font-bold mb-2">
                          {healthScore}
                        </div>
                      </ConfettiText>
                      <p className="text-sm opacity-90 font-semibold">{getHealthScoreLabel(healthScore)}</p>
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="space-y-4 pt-20">
                {itemsToShow.map((item) => (
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

                {/* Collapse Button at Bottom - shows when expanded and more than 4 items */}
                {shouldShowExpandButton && cartExpanded && (
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCartExpanded(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </Button>
                  </div>
                )}
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

            {/* Combined Checkout & AI Recommendations */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                  onClick={() =>
                    navigate("/health-recommendations", {
                      state: { 
                        shoppingType,
                        cheapestStore: cheapestStore?.store,
                        orderTotal: parseFloat(cheapestStore?.total || '0'),
                        itemCount: cart.length
                      }
                    })
                  }
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Health Recommendations
                </Button>
                
                <p className="text-sm text-gray-600 text-center">
                  Discover affordable and health additions
                </p>
                
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: cheapestStoreColor }}
                  onClick={() =>
                    navigate("/checkout-details", {
                      state: { 
                        shoppingType,
                        cheapestStore: cheapestStore?.store,
                        orderTotal: parseFloat(cheapestStore?.total || '0'),
                        itemCount: cart.length
                      }
                    })
                  }
                >
                  Continue with {cheapestStore?.store}
                </Button>
                {cheapestStore && (
                  <p className="text-sm text-gray-600 text-center">
                    Best price: ${cheapestStore.total}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Comparison Component */}
        <div className="mt-8">
          <PriceComparison 
            storeTotals={storeTotals} 
            cart={cart}
            onUpdateCart={onUpdateCart}
            onSubstitutionCountsChange={setSubstitutionCounts}
          />
        </div>

        {/* Intelligent Recommendation */}
        <div className="mt-8">
          <IntelligentRecommendation 
            storeTotals={storeTotals}
            shoppingType={shoppingType}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
