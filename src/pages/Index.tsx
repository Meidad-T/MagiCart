
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
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart`,
    });
  };

  const handleCartClick = () => {
    navigate('/cart');
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

      {/* Product Feed */}
      <ProductFeed 
        items={items}
        onAddToCart={addToCart}
      />

      {/* Cart summary at bottom if there are items */}
      {cart.length > 0 && (
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
