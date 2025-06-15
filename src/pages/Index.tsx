
import { Loader, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ProductFeed from "@/components/ProductFeed";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { ProductWithPrices } from "@/types/database";

interface IndexProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const Index = ({ cart, onUpdateCart }: IndexProps) => {
  const { data: items = [], isLoading: productsLoading, error } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    
    const toastInstance = toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart`,
    });
    
    // Dismiss the toast after 2 seconds
    setTimeout(() => {
      toastInstance.dismiss();
    }, 2000);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <div className="absolute inset-0 h-12 w-12 animate-ping mx-auto rounded-full bg-blue-400 opacity-25"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading amazing deals...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">😵</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-6">We couldn't load the products. Please try again.</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Try Again
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with search */}
      <Header 
        items={items}
        cart={cart}
        onAddToCart={addToCart}
        onCartClick={handleCartClick}
        user={user}
      />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Product Feed */}
      <ProductFeed 
        items={items}
        onAddToCart={addToCart}
      />

      {/* Enhanced floating cart summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-500">
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">{totalItems} items</div>
                    <div className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${totalValue.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
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
