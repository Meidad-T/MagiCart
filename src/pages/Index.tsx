
import { useState } from "react";
import { ShoppingCart, Store, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const stores = ["walmart", "heb", "aldi", "target", "kroger", "sams"];
const storeNames = {
  walmart: "Walmart",
  heb: "H-E-B",
  aldi: "Aldi",
  target: "Target",
  kroger: "Kroger",
  sams: "Sam's Club"
};

const Index = () => {
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState("walmart");

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
      description: `${item.item} added to your shopping list`,
    });
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateTotal = (storeKey) => {
    return cart.reduce((total, item) => {
      return total + (item[`${storeKey}_price`] * item.quantity);
    }, 0);
  };

  const getBestStoreForCart = () => {
    const storeTotals = stores.map(store => ({
      store,
      total: calculateTotal(store)
    }));
    return storeTotals.reduce((best, current) =>
      current.total < best.total ? current : best
    );
  };

  const cartTotal = calculateTotal(selectedStore);
  const bestStore = getBestStoreForCart();
  const potentialSavings = cartTotal - bestStore.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Smart Cart</h1>
                <p className="text-gray-600">Find the best prices across all stores</p>
              </div>
            </div>
            <Button
              className="relative bg-green-500 hover:bg-green-600 px-6 py-3"
              onClick={() => {}}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-6 h-6 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <SearchDropdown 
            items={mockItems}
            onAddToCart={addToCart}
            selectedStore={selectedStore}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Store Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Select Your Preferred Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {stores.map(store => (
                    <Button
                      key={store}
                      variant={selectedStore === store ? "default" : "outline"}
                      onClick={() => setSelectedStore(store)}
                      className={`p-4 h-auto ${selectedStore === store ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{storeNames[store]}</div>
                        {cart.length > 0 && (
                          <div className="text-sm opacity-75">
                            ${calculateTotal(store).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shopping Cart
                  </span>
                  <Badge variant="secondary">{cart.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Search for items above to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.item}</p>
                          <p className="text-xs text-gray-500">
                            ${item[`${selectedStore}_price`].toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total at {storeNames[selectedStore]}:</span>
                        <span className="text-lg">${cartTotal.toFixed(2)}</span>
                      </div>
                      
                      {potentialSavings > 0.01 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700">
                            💰 <strong>Save ${potentialSavings.toFixed(2)}</strong>
                            <br />
                            Shop at {storeNames[bestStore.store]} for ${bestStore.total.toFixed(2)}
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 mt-4"
                        disabled={cart.length === 0}
                        onClick={() => {
                          toast({
                            title: "Checkout Complete! 🎉",
                            description: `Total: $${cartTotal.toFixed(2)} at ${storeNames[selectedStore]}${potentialSavings > 0.01 ? ` (Could save $${potentialSavings.toFixed(2)} at ${storeNames[bestStore.store]})` : ''}`,
                          });
                        }}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Checkout ${cartTotal.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
