
import { useState } from "react";
import { ShoppingCart, Loader } from "lucide-react";
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
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        const price = cartItem[`${store}_price`];
        return sum + (price * cartItem.quantity);
      }, 0);

      return {
        store: storeNames[store],
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

  const storeTotals = calculateStoreTotals();

  return (
    <div className="min-h-screen bg-white">
      {/* Google-style clean header */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Smart Cart</h1>
        
        {/* Cart button */}
        <Button 
          variant="ghost" 
          className="relative"
          onClick={handleCartClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            <ShoppingCart className="h-6 w-6" />
          )}
          {cart.length > 0 && !isLoading && (
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
                      <span className="text-sm">{item.item}</span>
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
