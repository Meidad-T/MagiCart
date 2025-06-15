
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, MapPin, Clock, Store, User, ChevronDown, ChevronUp, Sparkles, Pencil, CircleDollarSign } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CartPageProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
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
  const [aiRecommendedStore, setAiRecommendedStore] = useState<StoreTotalData | null>(null);
  const [checkoutStore, setCheckoutStore] = useState<StoreTotalData | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Safe cart check to prevent crashes
  const safeCart = cart || [];
  const isCartEmpty = safeCart.length === 0;

  // Calculate store totals with error handling
  const storeTotals = useMemo(() => {
    if (isCartEmpty) return [];
    
    try {
      const stores = ['walmart', 'heb', 'aldi', 'target', 'kroger', 'sams'];
      const storeNames = {
        walmart: 'Walmart',
        heb: 'H-E-B',
        aldi: 'Aldi',
        target: 'Target',
        kroger: 'Kroger',
        sams: "Sam's Club"
      };

      const totals = stores.map(store => {
        const subtotal = safeCart.reduce((sum, cartItem) => {
          const price = cartItem[`${store}_price` as keyof ProductWithPrices] as number;
          return sum + (price * cartItem.quantity);
        }, 0);

        const taxesAndFees = subtotal * 0.0875;
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
              storeFee = 0;
              break;
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

      return totals.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
    } catch (error) {
      console.error('Error calculating store totals:', error);
      return [];
    }
  }, [safeCart, shoppingType, isCartEmpty]);

  // Calculate health score with error handling
  const healthScore = useMemo(() => {
    if (isCartEmpty) return 0;
    
    try {
      let produceCount = 0;
      let totalItems = 0;
      
      safeCart.forEach(item => {
        totalItems += item.quantity;
        
        const categoryName = item.category?.name?.toLowerCase() || '';
        const productName = item.name?.toLowerCase() || '';
        
        if (categoryName.includes('produce') || 
            categoryName.includes('fruits') || 
            categoryName.includes('vegetables') ||
            productName.includes('organic')) {
          produceCount += item.quantity;
        }
      });
      
      if (produceCount === totalItems && produceCount > 0) {
        return 100;
      }
      
      if (produceCount === 0) return 20;
      if (produceCount === 1) return 44;
      if (produceCount === 2) return 57;
      if (produceCount === 3) return 70;
      if (produceCount === 4) return 81;
      if (produceCount === 5) return 92;
      if (produceCount === 6) return 98;
      if (produceCount >= 7) return 100;
      
      return 20;
    } catch (error) {
      console.error('Error calculating health score:', error);
      return 0;
    }
  }, [safeCart, isCartEmpty]);

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

  // Trigger confetti when health score reaches excellent (85+)
  useEffect(() => {
    if (healthScore >= 85 && previousHealthScore < 85) {
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 100);
    }
    setPreviousHealthScore(healthScore);
  }, [healthScore, previousHealthScore]);

  // Auto-collapse when cart items reduce below the expand threshold
  useEffect(() => {
    if (safeCart.length <= 3 && cartExpanded) {
      setCartExpanded(false);
    }
    if (isCartEmpty) {
      setAiRecommendedStore(null);
      setCheckoutStore(null);
    }
  }, [safeCart.length, cartExpanded, isCartEmpty]);

  // Sorted stores for popover with error handling
  const sortedStoresForPopover = useMemo(() => {
    if (isCartEmpty || storeTotals.length === 0) return [];
    
    try {
      const cheapestStore = storeTotals[0];
      if (!cheapestStore) return [];
      
      const storeMap = new Map(storeTotals.map(s => [s.storeKey, {...s, icons: new Set<string>()}]));

      if (cheapestStore) {
        storeMap.get(cheapestStore.storeKey)?.icons.add('money');
      }

      if (aiRecommendedStore) {
          storeMap.get(aiRecommendedStore.storeKey)?.icons.add('sparkles');
      }

      const getScore = (storeKey: string) => {
          const isCheapest = storeKey === cheapestStore?.storeKey;
          const isAI = storeKey === aiRecommendedStore?.storeKey;
          if (isCheapest && isAI) return 3;
          if (isCheapest) return 2;
          if (isAI) return 1;
          return 0;
      };

      const sorted = Array.from(storeMap.values()).sort((a, b) => {
          const scoreA = getScore(a.storeKey);
          const scoreB = getScore(b.storeKey);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return parseFloat(a.total) - parseFloat(b.total);
      });

      return sorted.map(s => ({...s, icons: Array.from(s.icons) as ('money'|'sparkles')[]}));
    } catch (error) {
      console.error('Error sorting stores for popover:', error);
      return [];
    }
  }, [storeTotals, aiRecommendedStore, isCartEmpty]);

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

  const removeFromCart = (itemId: string) => {
    try {
      const updatedCart = safeCart.filter(item => item.id !== itemId);
      onUpdateCart(updatedCart);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      const updatedCart = safeCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      onUpdateCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  // Store brand colors and logos
  const storeColors = {
    'H-E-B': '#e31837',
    'Walmart': '#004c91',
    'Target': '#cc0000',
    'Kroger': '#0f4c81',
    'Sam\'s Club': '#00529c',
    'Aldi': '#ff6900'
  };

  const storeLogos: { [key: string]: string } = {
    'H-E-B': 'https://i.pinimg.com/736x/82/21/0a/82210a6b7169e420956284f80a2f71d0.jpg',
    'Walmart': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSA49zzU6Xh1gUBZdrOVKb6wL0A_Y1zrlmw&s',
    'Target': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtCnXrPfrnBYZU7Vh1km8eJIehxLGbFYgmpA&s',
    'Kroger': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSacwkiztC747C6ZcQVa5_g0iSbq7O0sNEaoQ&s',
    "Sam's Club": 'https://brandlogos.net/wp-content/uploads/2012/11/sams-club-vector-logo.png',
    'Aldi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWykpVvw51CCXNUut3oNfgsJ1T7u9RQBK0bQ&s'
  };

  // Fixed logic: Always show max 3 items when collapsed, regardless of total count
  const shouldShowExpandButton = safeCart.length > 3;
  const itemsToShow = cartExpanded ? safeCart : safeCart.slice(0, 3);
  const hiddenItemsCount = safeCart.length - 3;

  const getUserFirstName = () => {
    if (!userProfile?.full_name) return '';
    return userProfile.full_name.split(' ')[0];
  };

  const cheapestStore = storeTotals.length > 0 ? storeTotals[0] : null;
  const checkoutStoreDetails = checkoutStore || cheapestStore;
  const checkoutStoreColor = checkoutStoreDetails ? (storeColors[checkoutStoreDetails.store as keyof typeof storeColors] || '#3b82f6') : '#3b82f6';

  // Early return for empty cart - but all hooks are called above
  if (isCartEmpty) {
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
              <div className="space-y-4">
                <div className="text-6xl">🛒</div>
                <h2 className="text-xl font-semibold text-gray-800">Nothing in cart</h2>
                <p className="text-gray-600 mb-4">Your cart is empty. Start adding some items!</p>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Start Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                    <CardTitle>Cart Items ({safeCart.length})</CardTitle>
                    {/* Health Score Tip - with proper wrapping and moved down */}
                    {safeCart.length > 0 && (
                      <p className="text-xs text-gray-400 mt-4 pr-40">
                        Add healthy foods to increase your cart's health score! (AI generated assessment)
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Health Score Container - Top Right Corner with equal spacing */}
              {safeCart.length > 0 && (
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

              <CardContent className="space-y-4 pt-16">
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
                        <Badge variant="secondary">{item.category?.name || 'Uncategorized'}</Badge>
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

                {/* Expand/Collapse Button at Bottom */}
                {shouldShowExpandButton && (
                  <div className="text-center pt-4 border-t">
                    {!cartExpanded ? (
                      <Button
                        variant="ghost"
                        onClick={() => setCartExpanded(true)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show {hiddenItemsCount} More Items
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setCartExpanded(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </Button>
                    )}
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
                      Curbside Pick-Up
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
                        itemCount: safeCart.length
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
                
                <div className="flex items-center gap-2">
                  <Button
                    className="flex-grow text-white"
                    style={{ backgroundColor: checkoutStoreColor }}
                    disabled={!checkoutStoreDetails}
                    onClick={() =>
                      navigate("/checkout-details", {
                        state: { 
                          shoppingType,
                          cheapestStore: checkoutStoreDetails?.store,
                          orderTotal: parseFloat(checkoutStoreDetails?.total || '0'),
                          itemCount: safeCart.length
                        }
                      })
                    }
                  >
                    Continue with {checkoutStoreDetails?.store || 'Store'}
                  </Button>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="flex-shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-200">
                        <Pencil className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="end">
                        <div className="grid gap-1 p-1">
                            <p className="font-semibold text-sm px-2 py-1 text-center">Choose a store</p>
                            {sortedStoresForPopover.map((store) => (
                            <Button
                                key={store.storeKey}
                                variant="ghost"
                                className="h-auto py-2 w-full"
                                onClick={() => {
                                  setCheckoutStore(store);
                                  setPopoverOpen(false);
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <img src={storeLogos[store.store as keyof typeof storeLogos]} alt={`${store.store} logo`} className="h-5 w-5 object-contain" />
                                    <span className="font-medium text-sm">{store.store}</span>
                                    <div className="flex items-center gap-1">
                                      {store.icons.includes('money') && <CircleDollarSign className="h-4 w-4 text-green-500" />}
                                      {store.icons.includes('sparkles') && <Sparkles className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-600">${store.total}</span>
                                </div>
                            </Button>
                            ))}
                        </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {checkoutStoreDetails && (
                  <p className="text-sm text-gray-600 text-center">
                    Selected price: ${checkoutStoreDetails.total}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Comparison Component */}
        {storeTotals.length > 0 && (
          <div className="mt-8">
            <PriceComparison 
              storeTotals={storeTotals} 
              cart={safeCart}
              onUpdateCart={onUpdateCart}
              onSubstitutionCountsChange={setSubstitutionCounts}
            />
          </div>
        )}

        {/* Intelligent Recommendation */}
        {storeTotals.length > 0 && (
          <div className="mt-8">
            <IntelligentRecommendation 
              storeTotals={storeTotals}
              shoppingType={shoppingType}
              onRecommendation={setAiRecommendedStore}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
