
import { useState } from "react";
import { ShoppingCart, Plus, Search, Calculator, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState("walmart");
  const [showCart, setShowCart] = useState(false);

  const filteredItems = mockItems.filter(item =>
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getBestPrice = (item) => {
    const prices = stores.map(store => ({
      store,
      price: item[`${store}_price`]
    }));
    return prices.reduce((best, current) =>
      current.price < best.price ? current : best
    );
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Cart</h1>
                <p className="text-sm text-gray-600">Compare prices, save money</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-green-500 hover:bg-green-600"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for items or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-lg py-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const bestPrice = getBestPrice(item);
                const currentPrice = item[`${selectedStore}_price`];
                const savings = currentPrice - bestPrice.price;
                
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.item}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            ${currentPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            at {storeNames[selectedStore]}
                          </span>
                        </div>
                        
                        {savings > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-700">
                              💡 Best price: ${bestPrice.price.toFixed(2)} at {storeNames[bestPrice.store]}
                              <br />
                              <span className="font-semibold">Save ${savings.toFixed(2)}!</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart and Store Selection */}
          <div className="space-y-6">
            {/* Store Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Select Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {stores.map(store => (
                    <Button
                      key={store}
                      variant={selectedStore === store ? "default" : "outline"}
                      onClick={() => setSelectedStore(store)}
                      className="text-xs"
                    >
                      {storeNames[store]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shopping Cart
                  </span>
                  <Badge>{cart.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your cart is empty. Add some items!
                  </p>
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
                        <div className="bg-green-50 border border-green-200 rounded p-3">
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
                        Checkout
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
