import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import SearchDropdown from "@/components/SearchDropdown";

// Real data from your Excel file
const mockItems = [
  {
    id: 1,
    item: "1 Gallon Whole Milk",
    category: "dairy",
    walmart_price: 2.62,
    heb_price: 3.19,
    aldi_price: 2.59,
    target_price: 3.59,
    kroger_price: 3.09,
    sams_price: 3.52,
    unit: "each"
  },
  {
    id: 2,
    item: "Eggs 12 count",
    category: "dairy",
    walmart_price: 2.72,
    heb_price: 3.56,
    aldi_price: 5.29,
    target_price: 3.49,
    kroger_price: 2.99,
    sams_price: 5.94,
    unit: "each"
  },
  {
    id: 3,
    item: "White Bread Loaf",
    category: "bakery",
    walmart_price: 1.42,
    heb_price: 1.3,
    aldi_price: 1.55,
    target_price: 1.49,
    kroger_price: 1.99,
    sams_price: 2.38,
    unit: "each"
  },
  {
    id: 4,
    item: "Bananas",
    category: "produce",
    walmart_price: 0.54,
    heb_price: 0.56,
    aldi_price: 0.33,
    target_price: 0.32,
    kroger_price: 0.59,
    sams_price: 0.66,
    unit: "lb"
  },
  {
    id: 5,
    item: "Tomatoes",
    category: "produce",
    walmart_price: 0.98,
    heb_price: 0.8,
    aldi_price: 2.19,
    target_price: 0.44,
    kroger_price: 0.3,
    sams_price: 1.37,
    unit: "lb"
  },
  {
    id: 6,
    item: "Apples",
    category: "produce",
    walmart_price: 0.82,
    heb_price: 0.7,
    aldi_price: 0.67,
    target_price: 1.59,
    kroger_price: 1.5,
    sams_price: 0.7,
    unit: "each"
  },
  {
    id: 7,
    item: "Oranges",
    category: "produce",
    walmart_price: 0.79,
    heb_price: 0.52,
    aldi_price: 0.67,
    target_price: 0.89,
    kroger_price: 0.99,
    sams_price: 0.89,
    unit: "each"
  },
  {
    id: 8,
    item: "Lettuce",
    category: "produce",
    walmart_price: 1.58,
    heb_price: 1.61,
    aldi_price: 1.89,
    target_price: 1.3,
    kroger_price: 1.69,
    sams_price: 1.09,
    unit: "each"
  },
  {
    id: 9,
    item: "Potatoes",
    category: "produce",
    walmart_price: 0.83,
    heb_price: 1.01,
    aldi_price: 0.8,
    target_price: 0.89,
    kroger_price: 0.74,
    sams_price: 0.77,
    unit: "each"
  },
  {
    id: 10,
    item: "Onions",
    category: "produce",
    walmart_price: 0.94,
    heb_price: 1.54,
    aldi_price: 1.1,
    target_price: 1.19,
    kroger_price: 0.8,
    sams_price: 0.7,
    unit: "each"
  },
  {
    id: 11,
    item: "Mozzarella Cheese 8 oz",
    category: "dairy",
    walmart_price: 1.97,
    heb_price: 2.05,
    aldi_price: 2.05,
    target_price: 1.99,
    kroger_price: 2.29,
    sams_price: 2.05,
    unit: "each"
  },
  {
    id: 12,
    item: "Chedder Cheese 8 oz",
    category: "dairy",
    walmart_price: 1.97,
    heb_price: 2.05,
    aldi_price: 2.05,
    target_price: 1.99,
    kroger_price: 2.29,
    sams_price: 2.05,
    unit: "each"
  },
  {
    id: 13,
    item: "Salted Butter",
    category: "dairy",
    walmart_price: 3.96,
    heb_price: 5.08,
    aldi_price: 4.15,
    target_price: 5.39,
    kroger_price: 4.29,
    sams_price: 4.4,
    unit: "pack of 4 sticks"
  },
  {
    id: 14,
    item: "Unsalted Butter",
    category: "dairy",
    walmart_price: 3.96,
    heb_price: 5.08,
    aldi_price: 4.15,
    target_price: 5.39,
    kroger_price: 4.29,
    sams_price: 4.4,
    unit: "pack of 4 sticks"
  },
  {
    id: 15,
    item: "Bacon",
    category: "meat",
    walmart_price: 3.97,
    heb_price: 4.49,
    aldi_price: 4.75,
    target_price: 5.49,
    kroger_price: 4.99,
    sams_price: 4.99,
    unit: "12 Oz"
  },
  {
    id: 16,
    item: "White Rice",
    category: "pantry",
    walmart_price: 1.77,
    heb_price: 1.85,
    aldi_price: 4.15,
    target_price: 3.49,
    kroger_price: 2.39,
    sams_price: 3.56,
    unit: "32 Oz"
  },
  {
    id: 17,
    item: "Brown Rice",
    category: "pantry",
    walmart_price: 1.87,
    heb_price: 1.97,
    aldi_price: 4.15,
    target_price: 3.49,
    kroger_price: 2.49,
    sams_price: 3.56,
    unit: "32 Oz"
  },
  {
    id: 18,
    item: "Pasta",
    category: "pantry",
    walmart_price: 0.98,
    heb_price: 1.02,
    aldi_price: 1.09,
    target_price: 1.89,
    kroger_price: 1.25,
    sams_price: 1.2,
    unit: "16 Oz"
  },
  {
    id: 19,
    item: "Flour",
    category: "pantry",
    walmart_price: 1.32,
    heb_price: 1.37,
    aldi_price: 2.59,
    target_price: 3.99,
    kroger_price: 1.49,
    sams_price: 2.1,
    unit: "2 lb"
  },
  {
    id: 20,
    item: "White Sugar",
    category: "pantry",
    walmart_price: 3.14,
    heb_price: 3.27,
    aldi_price: 3.65,
    target_price: 4.89,
    kroger_price: 3.19,
    sams_price: 3.3,
    unit: "4 lb"
  },
  {
    id: 21,
    item: "Brown Sugar",
    category: "pantry",
    walmart_price: 3.14,
    heb_price: 3.27,
    aldi_price: 3.65,
    target_price: 4.89,
    kroger_price: 3.19,
    sams_price: 3.3,
    unit: "4 lb"
  },
  {
    id: 22,
    item: "Peanut Butter 16 ounce",
    category: "pantry",
    walmart_price: 3.12,
    heb_price: 3.24,
    aldi_price: 2.99,
    target_price: 3.29,
    kroger_price: 3.19,
    sams_price: 3.99,
    unit: "each"
  },
  {
    id: 23,
    item: "Grape Jelly 18 ounce",
    category: "pantry",
    walmart_price: 1.98,
    heb_price: 2.06,
    aldi_price: 2.45,
    target_price: 1.99,
    kroger_price: 3.69,
    sams_price: 3.2,
    unit: "each"
  },
  {
    id: 24,
    item: "Strawberry Jelly 18 ounce",
    category: "pantry",
    walmart_price: 1.98,
    heb_price: 2.06,
    aldi_price: 2.45,
    target_price: 1.99,
    kroger_price: 3.69,
    sams_price: 3.2,
    unit: "each"
  },
  {
    id: 25,
    item: "3 Liter Coke Bottle",
    category: "drink",
    walmart_price: 2.97,
    heb_price: 3.24,
    aldi_price: 2.5,
    target_price: 3.25,
    kroger_price: 2.99,
    sams_price: 2.99,
    unit: "each"
  },
  {
    id: 26,
    item: "3 Liter Sprite Bottle",
    category: "drink",
    walmart_price: 2.97,
    heb_price: 3.24,
    aldi_price: 2.5,
    target_price: 3.25,
    kroger_price: 2.99,
    sams_price: 2.99,
    unit: "each"
  },
  {
    id: 27,
    item: "3 Liter Dr Pepper Bottle",
    category: "drink",
    walmart_price: 2.97,
    heb_price: 3.24,
    aldi_price: 2.5,
    target_price: 3.25,
    kroger_price: 2.99,
    sams_price: 2.99,
    unit: "each"
  },
  {
    id: 28,
    item: "Bottled water 1 Gallon",
    category: "drink",
    walmart_price: 1.23,
    heb_price: 1.28,
    aldi_price: 1.49,
    target_price: 2.49,
    kroger_price: 1.49,
    sams_price: 1.55,
    unit: "each"
  },
  {
    id: 29,
    item: "Dortios Cool Ranch 14.5 Oz Bag",
    category: "chips",
    walmart_price: 6.99,
    heb_price: 5.2,
    aldi_price: 5.25,
    target_price: 6.69,
    kroger_price: 6.49,
    sams_price: 6.3,
    unit: "each"
  },
  {
    id: 30,
    item: "Dortios BBQ 14.5 Oz Bag",
    category: "chips",
    walmart_price: 6.99,
    heb_price: 5.2,
    aldi_price: 5.25,
    target_price: 6.69,
    kroger_price: 6.49,
    sams_price: 6.3,
    unit: "each"
  },
  {
    id: 31,
    item: "Dortios Nacho Cheese 14.5 Oz Bag",
    category: "chips",
    walmart_price: 6.99,
    heb_price: 5.2,
    aldi_price: 5.25,
    target_price: 6.69,
    kroger_price: 6.49,
    sams_price: 6.3,
    unit: "each"
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
