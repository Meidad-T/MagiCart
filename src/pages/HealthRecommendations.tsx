
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Plus, CheckCircle, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import type { ProductWithPrices } from "@/types/database";

interface CartItem extends ProductWithPrices {
  quantity: number;
}

interface HealthRecommendation {
  product: ProductWithPrices;
  reason: string;
  healthScore: number;
  priceJustification: string;
  personalizedMessage: string;
}

interface HealthRecommendationsProps {
  cart: CartItem[];
  onUpdateCart: (updatedCart: CartItem[]) => void;
}

const HealthRecommendations = ({ cart, onUpdateCart }: HealthRecommendationsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [addedItems, setAddedItems] = useState<Record<string, number>>({});

  const { shoppingType, cheapestStore, orderTotal, itemCount } = location.state || {};

  useEffect(() => {
    if (products && !productsLoading) {
      generateHealthRecommendations();
    }
  }, [cart, products, productsLoading]);

  const generateHealthRecommendations = async () => {
    if (!products) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get only produce items from our actual database
    const produceItems = products.filter(product => 
      product.category.name.toLowerCase().includes('fruit') || 
      product.category.name.toLowerCase().includes('vegetable') ||
      product.category.name.toLowerCase().includes('produce')
    );

    // Analyze cart for patterns
    const cartAnalysis = analyzeCart(cart);
    const healthRecs = generateSmartRecommendations(cartAnalysis, produceItems);
    
    setRecommendations(healthRecs);
    setIsAnalyzing(false);
  };

  const analyzeCart = (cartItems: CartItem[]) => {
    const categories = cartItems.reduce((acc, item) => {
      const category = item.category.name.toLowerCase();
      acc[category] = (acc[category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = cartItems.reduce((sum, item) => {
      return sum + (item.walmart_price * item.quantity);
    }, 0);

    const avgItemPrice = totalSpent / cartItems.length;
    
    return {
      categories,
      totalItems: cartItems.length,
      totalSpent,
      avgItemPrice,
      hasVegetables: categories.vegetables > 0,
      hasFruits: categories.fruits > 0,
      hasProteins: categories.meat > 0 || categories.dairy > 0,
      vegetableCount: categories.vegetables || 0,
      fruitCount: categories.fruits || 0
    };
  };

  const generateSmartRecommendations = (analysis: any, availableProducts: ProductWithPrices[]): HealthRecommendation[] => {
    const recs: HealthRecommendation[] = [];

    // Filter out items already in cart
    const cartProductNames = cart.map(item => item.name.toLowerCase());
    const availableForRecommendation = availableProducts.filter(product => 
      !cartProductNames.includes(product.name.toLowerCase())
    );

    // Smart recommendations based on cart analysis
    if (analysis.hasFruits && analysis.fruitCount >= 2) {
      const leafyGreens = availableForRecommendation.filter(p => 
        p.name.toLowerCase().includes('spinach') || 
        p.name.toLowerCase().includes('lettuce') ||
        p.name.toLowerCase().includes('kale')
      );
      
      if (leafyGreens.length > 0) {
        const product = leafyGreens[0];
        recs.push({
          product,
          reason: `I noticed you're getting ${analysis.fruitCount} fruit items! Adding leafy greens would create the perfect nutritional balance.`,
          healthScore: 95,
          priceJustification: `At $${product.walmart_price.toFixed(2)}, this fits perfectly within your average item budget of $${analysis.avgItemPrice.toFixed(2)}`,
          personalizedMessage: `Perfect complement to your fruit choices - the iron in leafy greens helps your body absorb vitamin C from fruits better! 🌟`
        });
      }
    }

    if (analysis.hasVegetables && !analysis.hasFruits) {
      const berries = availableForRecommendation.filter(p => 
        p.name.toLowerCase().includes('berries') || 
        p.name.toLowerCase().includes('blueberr') ||
        p.name.toLowerCase().includes('strawberr')
      );
      
      if (berries.length > 0) {
        const product = berries[0];
        recs.push({
          product,
          reason: `Great vegetable choices! Adding antioxidant-rich berries would boost your immune system.`,
          healthScore: 92,
          priceJustification: `Premium superfood at just $${product.walmart_price.toFixed(2)} - excellent value for the health benefits`,
          personalizedMessage: `Your veggie-forward cart shows you care about health. Berries are nature's brain food! 🧠`
        });
      }
    }

    if (!analysis.hasVegetables && !analysis.hasFruits) {
      const bananas = availableForRecommendation.filter(p => 
        p.name.toLowerCase().includes('banana')
      );
      
      if (bananas.length > 0) {
        const product = bananas[0];
        recs.push({
          product,
          reason: `Your cart could use some fresh produce! Bananas are an easy, healthy addition.`,
          healthScore: 88,
          priceJustification: `Just $${product.walmart_price.toFixed(2)} for nature's energy bar - incredible value!`,
          personalizedMessage: `Starting your healthy journey? Bananas are the perfect first step - convenient and nutritious! 🍌`
        });
      }

      const carrots = availableForRecommendation.filter(p => 
        p.name.toLowerCase().includes('carrot')
      );
      
      if (carrots.length > 0) {
        const product = carrots[0];
        recs.push({
          product,
          reason: `Add some crunch and nutrition with these convenient, ready-to-eat vegetables.`,
          healthScore: 90,
          priceJustification: `At $${product.walmart_price.toFixed(2)}, this adds serious nutrition without breaking your budget`,
          personalizedMessage: `Perfect for snacking - no prep needed! Your future self will thank you. 🥕`
        });
      }
    }

    // If we still don't have enough recommendations, add some general healthy options
    if (recs.length < 3) {
      const remainingProducts = availableForRecommendation.filter(p => 
        !recs.some(rec => rec.product.id === p.id)
      );
      
      remainingProducts.slice(0, 3 - recs.length).forEach(product => {
        recs.push({
          product,
          reason: `This nutritious option would be a great addition to your healthy lifestyle.`,
          healthScore: 85,
          priceJustification: `At $${product.walmart_price.toFixed(2)}, it's a smart investment in your health`,
          personalizedMessage: `A healthy choice that fits perfectly with your shopping preferences! 🌱`
        });
      });
    }

    return recs.slice(0, 3); // Return top 3 recommendations
  };

  const addToCart = (recommendation: HealthRecommendation, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.id === recommendation.product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      onUpdateCart(updatedCart);
    } else {
      // Add new item
      const newProduct: CartItem = {
        ...recommendation.product,
        quantity: quantity
      };
      onUpdateCart([...cart, newProduct]);
    }
    
    setAddedItems(prev => ({
      ...prev,
      [recommendation.product.name]: (prev[recommendation.product.name] || 0) + quantity
    }));
  };

  const updateRecommendationQuantity = (recommendation: HealthRecommendation, newQuantity: number) => {
    if (newQuantity <= 0) {
      setAddedItems(prev => {
        const updated = { ...prev };
        delete updated[recommendation.product.name];
        return updated;
      });
      
      // Also remove from cart
      const updatedCart = cart.filter(item => item.id !== recommendation.product.id);
      onUpdateCart(updatedCart);
    } else {
      setAddedItems(prev => ({
        ...prev,
        [recommendation.product.name]: newQuantity
      }));
      
      // Update cart
      const existingItemIndex = cart.findIndex(item => item.id === recommendation.product.id);
      if (existingItemIndex >= 0) {
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity = newQuantity;
        onUpdateCart(updatedCart);
      }
    }
  };

  const calculateNewCartTotal = () => {
    const addedProductsTotal = recommendations
      .filter(rec => addedItems[rec.product.name])
      .reduce((sum, rec) => sum + (rec.product.walmart_price * addedItems[rec.product.name]), 0);
    
    return (orderTotal || 0) + addedProductsTotal;
  };

  const continueToCheckout = () => {
    navigate("/checkout-details", {
      state: { 
        shoppingType,
        cheapestStore,
        orderTotal: calculateNewCartTotal(),
        itemCount: cart.length
      }
    });
  };

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cart')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </Button>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mr-4">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Health Recommendations
              </h1>
              <p className="text-gray-600">Personalized suggestions to boost your nutrition</p>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">Current Cart: ${orderTotal?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600">{cart.length} items</p>
              </div>
              {Object.keys(addedItems).length > 0 && (
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    New Total: ${calculateNewCartTotal().toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">+{Object.keys(addedItems).length} healthy additions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Analyzing your cart...</p>
                  <p className="text-sm text-blue-600">Finding the perfect healthy additions for you</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {!isAnalyzing && recommendations.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Smart Recommendations Just for You
              </h2>
              <p className="text-gray-600">
                Based on your current cart, here's how to maximize your nutrition
              </p>
            </div>

            {recommendations.map((rec, index) => {
              const addedQuantity = addedItems[rec.product.name] || 0;
              const isAdded = addedQuantity > 0;
              
              return (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={rec.product.image_url}
                          alt={rec.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{rec.product.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{rec.product.category.name}</Badge>
                              <Badge className="bg-green-100 text-green-700">
                                {rec.healthScore}% Health Score
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ${rec.product.walmart_price.toFixed(2)}
                              <span className="text-sm font-normal text-gray-500 ml-1">
                                {rec.product.unit}
                              </span>
                            </p>
                            <p className="text-sm text-gray-500">{rec.priceJustification}</p>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 font-medium mb-2">{rec.reason}</p>
                          <p className="text-blue-700 text-sm italic">{rec.personalizedMessage}</p>
                        </div>

                        {/* Add Button or Quantity Controls */}
                        {!isAdded ? (
                          <Button
                            onClick={() => addToCart(rec, 1)}
                            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart - ${rec.product.walmart_price.toFixed(2)}
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Added
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateRecommendationQuantity(rec, addedQuantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{addedQuantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateRecommendationQuantity(rec, addedQuantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                              ${(rec.product.walmart_price * addedQuantity).toFixed(2)} total
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button 
            onClick={continueToCheckout}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 text-lg"
          >
            Continue to Checkout
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HealthRecommendations;
