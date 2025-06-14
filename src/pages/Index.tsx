import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LandingHeader from "@/components/LandingHeader";
import WelcomeBanner from "@/components/WelcomeBanner";
import QuickActions from "@/components/QuickActions";
import SuggestedPlans from "@/components/SuggestedPlans";
import CommunityDeals from "@/components/CommunityDeals";
import LandingFooter from "@/components/LandingFooter";
import ProductFeed from "@/components/ProductFeed";
import { useProducts } from "@/hooks/useProducts";
import type { ProductWithPrices } from "@/types/database";

const Index = () => {
  const { data: items = [], isLoading: productsLoading, error } = useProducts();
  const [cart, setCart] = useState<Array<ProductWithPrices & { quantity: number }>>([]);
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductFeed, setShowProductFeed] = useState(false);

  const addToCart = (item: ProductWithPrices) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart`,
    });
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

  const handleCartClick = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Add some items to your cart first!",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowCartSummary(true);
    }, 2000);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading products. Please try again.</p>
        </div>
      </div>
    );
  }

  const storeTotals = calculateStoreTotals();

  return (
    <div className="min-h-screen bg-white">
      {/* New Landing Header */}
      <LandingHeader 
        cart={cart}
        onCartClick={handleCartClick}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showProductFeed ? (
          <>
            {/* Welcome Banner */}
            <div className="mb-12">
              <WelcomeBanner />
            </div>

            {/* Quick Actions */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <QuickActions />
            </div>

            {/* Suggested Plans */}
            <div className="mb-16">
              <SuggestedPlans />
            </div>

            {/* Community Deals */}
            <div className="mb-16">
              <CommunityDeals />
            </div>

            {/* Browse Products Button */}
            <div className="text-center mb-16">
              <button
                onClick={() => setShowProductFeed(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Browse All Products
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Back to Landing Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowProductFeed(false)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to Home
              </button>
            </div>

            {/* Product Feed */}
            <ProductFeed 
              items={items}
              onAddToCart={addToCart}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Cart Summary Modal */}
      {showCartSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Cart Summary</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCartSummary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              {/* Cart Items */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Items in your cart:</h4>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="text-sm">{item.name}</span>
                      <span className="text-gray-500 ml-2">×{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Totals */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Total cost by store:</h4>
                <div className="space-y-3">
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cart summary at bottom if there are items */}
      {cart.length > 0 && !showCartSummary && (
        <div className="fixed bottom-6 right-6">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{cart.length} items in cart</span>
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleCartClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "View Cart"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
