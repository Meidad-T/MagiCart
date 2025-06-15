import { Loader, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ProductFeed from "@/components/ProductFeed";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { ProductWithPrices } from "@/types/database";
import HeroBanner from "@/components/HeroBanner";
import { useState } from "react";

interface IndexProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const Index = ({ cart, onUpdateCart }: IndexProps) => {
  const { data: items = [], isLoading: productsLoading, error } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const addToCart = (item: ProductWithPrices) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      onUpdateCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      onUpdateCart([...cart, { ...item, quantity: 1 }]);
    }
    
    setShowToast(true);
    const toastInstance = toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart`,
    });
    
    // Dismiss the toast after 2 seconds
    setTimeout(() => {
      toastInstance.dismiss();
      setShowToast(false);
    }, 2000);
  };

  const handleCartClick = () => {
    navigate('/cart');
    // Scroll to top will be handled by the Cart component
  };

  const handleExploreClick = () => {
    // Scroll to product feed section with offset for navbar
    const productFeed = document.getElementById('product-feed');
    if (productFeed) {
      const navbarHeight = 80; // Height of the sticky navbar
      const elementPosition = productFeed.offsetTop - navbarHeight;
      window.scrollTo({ 
        top: elementPosition, 
        behavior: 'smooth' 
      });
    }
  };

  const handleHealthRecommendationsClick = () => {
    navigate('/health-recommendations');
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products. Please try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => {
    const bestPrice = Math.min(
      item.walmart_price,
      item.heb_price,
      item.aldi_price,
      item.target_price,
      item.kroger_price,
      item.sams_price
    );
    return sum + (bestPrice * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search */}
      <Header 
        items={items}
        cart={cart}
        onAddToCart={addToCart}
        onCartClick={handleCartClick}
        user={user}
      />

      {/* Hero Banner */}
      <HeroBanner onExploreClick={handleExploreClick} />

      {/* Health Recommendations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Health Recommendations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get AI-powered suggestions for healthier alternatives based on your dietary 
                preferences, allergies, and health goals. Let our smart assistant help you 
                make better choices for your wellness journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleHealthRecommendationsClick}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-normal text-center leading-tight"
              >
                Get AI Health Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Feed */}
      <div id="product-feed">
        <ProductFeed 
          items={items}
          onAddToCart={addToCart}
        />
      </div>

      {/* Enhanced Cart summary at bottom if there are items */}
      {cart.length > 0 && (
        <div 
          className={`fixed right-6 z-50 transition-all duration-300 ease-in-out ${
            showToast ? 'bottom-28' : 'bottom-6'
          }`}
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{totalItems} items</div>
                    <div className="text-green-600 font-semibold">${totalValue.toFixed(2)}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
                  onClick={handleCartClick}
                >
                  View Cart
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
