
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-600" />
          <p className="text-xl text-gray-600 font-medium">Loading products...</p>
          <p className="text-sm text-gray-500 mt-2">Finding the best deals for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-6 text-lg font-medium">Unable to load products</p>
            <p className="text-gray-600 mb-6">Please check your connection and try again</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            >
              Retry
            </Button>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with search */}
      <Header 
        items={items}
        cart={cart}
        onAddToCart={addToCart}
        onCartClick={handleCartClick}
        user={user}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-6 leading-tight">
              Compare. Save. 
              <span className="block text-blue-200">Shop Smart.</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find the best deals across all major stores in one place. Your intelligent shopping companion.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span>Real-time price comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span>Multiple store availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span>Best deals guaranteed</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-slate-50 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Product Feed */}
      <ProductFeed 
        items={items}
        onAddToCart={addToCart}
      />

      {/* Enhanced Cart summary at bottom if there are items */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 text-base">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
                    <div className="text-green-600 font-bold text-lg">${totalValue.toFixed(2)}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
