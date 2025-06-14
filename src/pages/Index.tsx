
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import SearchDropdown from "@/components/SearchDropdown";

// Mock data structure matching your Excel format
const mockItems = [
  {
    id: 1,
    item: "Bananas (1 lb)",
    category: "Produce",
    walmart_price: 0.58,
    heb_price: 0.68,
    aldi_price: 0.44,
    target_price: 0.79,
    kroger_price: 0.69,
    sams_price: 0.98,
    unit: "lb"
  },
  {
    id: 2,
    item: "Milk (1 gallon)",
    category: "Dairy",
    walmart_price: 3.64,
    heb_price: 3.78,
    aldi_price: 2.89,
    target_price: 3.99,
    kroger_price: 3.49,
    sams_price: 3.28,
    unit: "gallon"
  },
  {
    id: 3,
    item: "Bread (White Loaf)",
    category: "Bakery",
    walmart_price: 1.28,
    heb_price: 1.48,
    aldi_price: 0.89,
    target_price: 1.79,
    kroger_price: 1.39,
    sams_price: 2.48,
    unit: "loaf"
  },
  {
    id: 4,
    item: "Ground Beef (1 lb)",
    category: "Meat",
    walmart_price: 5.48,
    heb_price: 5.98,
    aldi_price: 4.99,
    target_price: 6.29,
    kroger_price: 5.79,
    sams_price: 4.78,
    unit: "lb"
  },
  {
    id: 5,
    item: "Eggs (12 count)",
    category: "Dairy",
    walmart_price: 2.42,
    heb_price: 2.78,
    aldi_price: 1.89,
    target_price: 2.99,
    kroger_price: 2.59,
    sams_price: 4.98,
    unit: "dozen"
  },
  {
    id: 6,
    item: "Chicken Breast (1 lb)",
    category: "Meat",
    walmart_price: 4.98,
    heb_price: 5.49,
    aldi_price: 4.29,
    target_price: 5.99,
    kroger_price: 5.29,
    sams_price: 4.68,
    unit: "lb"
  },
  {
    id: 7,
    item: "Apples (3 lb bag)",
    category: "Produce",
    walmart_price: 2.98,
    heb_price: 3.49,
    aldi_price: 2.49,
    target_price: 3.99,
    kroger_price: 3.29,
    sams_price: 4.98,
    unit: "3 lb bag"
  }
];

const Index = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
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
      description: `${item.item} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Google-style clean header */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Smart Cart</h1>
        
        {/* Cart button */}
        <Button variant="ghost" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white min-w-5 h-5 flex items-center justify-center text-xs">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Main content - Google style */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center mb-12">
          <h2 className="text-6xl font-normal text-gray-900 mb-8">Smart Cart</h2>
          <p className="text-xl text-gray-600 mb-12">Find the best grocery prices across all stores</p>
        </div>

        {/* Big search bar */}
        <div className="w-full max-w-2xl">
          <SearchDropdown 
            items={mockItems}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Cart summary at bottom if there are items */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{cart.length} items in cart</span>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
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
