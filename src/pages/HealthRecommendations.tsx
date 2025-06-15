
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Apple, Heart, TrendingUp, CheckCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import type { ProductWithPrices } from "@/types/database";

interface CartItem extends ProductWithPrices {
  quantity: number;
}

interface HealthRecommendation {
  product: {
    name: string;
    category: string;
    price: number;
    image_url: string;
    benefits: string[];
  };
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
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const { shoppingType, cheapestStore, orderTotal, itemCount } = location.state || {};

  useEffect(() => {
    generateHealthRecommendations();
  }, [cart]);

  const generateHealthRecommendations = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Analyze cart for patterns
    const cartAnalysis = analyzeCart(cart);
    const healthRecs = generateSmartRecommendations(cartAnalysis);
    
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

  const generateSmartRecommendations = (analysis: any): HealthRecommendation[] => {
    const recs: HealthRecommendation[] = [];

    // Smart recommendations based on cart analysis
    if (analysis.hasFruits && analysis.fruitCount >= 2) {
      recs.push({
        product: {
          name: "Organic Spinach (5 oz)",
          category: "Vegetables",
          price: 2.98,
          image_url: "/lovable-uploads/spinach.jpg",
          benefits: ["Iron-rich", "Vitamin K", "Folate", "Antioxidants"]
        },
        reason: `I noticed you're getting ${analysis.fruitCount} fruit items! Adding leafy greens would create the perfect nutritional balance.`,
        healthScore: 95,
        priceJustification: `At $2.98, this fits perfectly within your average item budget of $${analysis.avgItemPrice.toFixed(2)}`,
        personalizedMessage: `Perfect complement to your fruit choices - the iron in spinach helps your body absorb vitamin C from fruits better! 🌟`
      });
    }

    if (analysis.hasVegetables && !analysis.hasFruits) {
      recs.push({
        product: {
          name: "Organic Blueberries (6 oz)",
          category: "Fruits",
          price: 3.98,
          image_url: "/lovable-uploads/blueberries.jpg",
          benefits: ["Antioxidants", "Vitamin C", "Fiber", "Brain health"]
        },
        reason: `Great vegetable choices! Adding antioxidant-rich blueberries would boost your immune system.`,
        healthScore: 92,
        priceJustification: `Premium superfood at just $3.98 - excellent value for the health benefits`,
        personalizedMessage: `Your veggie-forward cart shows you care about health. Blueberries are nature's brain food! 🧠`
      });
    }

    if (!analysis.hasVegetables && !analysis.hasFruits) {
      recs.push({
        product: {
          name: "Organic Bananas (bunch)",
          category: "Fruits",
          price: 1.98,
          image_url: "/lovable-uploads/bananas.jpg",
          benefits: ["Potassium", "Vitamin B6", "Energy", "Heart health"]
        },
        reason: `Your cart could use some fresh produce! Bananas are an easy, healthy addition.`,
        healthScore: 88,
        priceJustification: `Just $1.98 for nature's energy bar - incredible value!`,
        personalizedMessage: `Starting your healthy journey? Bananas are the perfect first step - convenient and nutritious! 🍌`
      });

      recs.push({
        product: {
          name: "Baby Carrots (1 lb)",
          category: "Vegetables",
          price: 1.28,
          image_url: "/lovable-uploads/carrots.jpg",
          benefits: ["Beta-carotene", "Vitamin A", "Fiber", "Eye health"]
        },
        reason: `Add some crunch and nutrition with these convenient, ready-to-eat vegetables.`,
        healthScore: 90,
        priceJustification: `At $1.28, this adds serious nutrition without breaking your budget`,
        personalizedMessage: `Perfect for snacking - no prep needed! Your future self will thank you. 🥕`
      });
    }

    if (analysis.totalSpent > 50 && analysis.avgItemPrice > 3) {
      recs.push({
        product: {
          name: "Organic Avocados (2 pack)",
          category: "Fruits",
          price: 3.48,
          image_url: "/lovable-uploads/avocados.jpg",
          benefits: ["Healthy fats", "Potassium", "Fiber", "Heart health"]
        },
        reason: `Your premium shopping choices deserve premium nutrition - avocados are packed with healthy fats.`,
        healthScore: 94,
        priceJustification: `Fits your spending pattern perfectly at $3.48 for two premium avocados`,
        personalizedMessage: `I can see you value quality! These creamy superfruits will elevate any meal. 🥑`
      });
    }

    return recs.slice(0, 3); // Return top 3 recommendations
  };

  const addToCart = (recommendation: HealthRecommendation) => {
    // Create a mock product to add to cart
    const newProduct: CartItem = {
      id: `health-rec-${Date.now()}`,
      name: recommendation.product.name,
      walmart_price: recommendation.product.price,
      heb_price: recommendation.product.price * 1.1,
      aldi_price: recommendation.product.price * 0.9,
      target_price: recommendation.product.price * 1.05,
      kroger_price: recommendation.product.price * 1.08,
      sams_price: recommendation.product.price * 0.95,
      unit: "each",
      image_url: recommendation.product.image_url,
      category: { 
        id: `category-${Date.now()}`,
        name: recommendation.product.category,
        created_at: new Date().toISOString()
      },
      category_id: `category-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      prices: {
        'Walmart': recommendation.product.price,
        'H-E-B': recommendation.product.price * 1.1,
        'Aldi': recommendation.product.price * 0.9,
        'Target': recommendation.product.price * 1.05,
        'Kroger': recommendation.product.price * 1.08,
        "Sam's Club": recommendation.product.price * 0.95
      },
      quantity: 1
    };

    onUpdateCart([...cart, newProduct]);
    setAddedItems(prev => new Set([...prev, recommendation.product.name]));
  };

  const continueToCheckout = () => {
    navigate("/checkout-details", {
      state: { 
        shoppingType,
        cheapestStore,
        orderTotal,
        itemCount: cart.length
      }
    });
  };

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  // Store brand colors
  const storeColors = {
    'H-E-B': '#e31837',
    'Walmart': '#004c91',
    'Target': '#cc0000',
    'Kroger': '#0f4c81',
    'Sam\'s Club': '#00529c',
    'Aldi': '#ff6900'
  };

  const cheapestStoreColor = storeColors[cheapestStore as keyof typeof storeColors] || '#3b82f6';

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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 mr-4">
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
              const isAdded = addedItems.has(rec.product.name);
              
              return (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          {rec.product.category === 'Fruits' ? (
                            <Apple className="h-12 w-12 text-green-500" />
                          ) : (
                            <Heart className="h-12 w-12 text-red-500" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{rec.product.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{rec.product.category}</Badge>
                              <Badge className="bg-green-100 text-green-700">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {rec.healthScore}% Health Score
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${rec.product.price}</p>
                            <p className="text-sm text-gray-500">{rec.priceJustification}</p>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 font-medium mb-2">{rec.reason}</p>
                          <p className="text-blue-700 text-sm italic">{rec.personalizedMessage}</p>
                        </div>

                        {/* Benefits */}
                        <div className="flex flex-wrap gap-2">
                          {rec.product.benefits.map((benefit, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border">
                              {benefit}
                            </span>
                          ))}
                        </div>

                        {/* Add Button */}
                        <Button
                          onClick={() => addToCart(rec)}
                          disabled={isAdded}
                          className={`w-full ${isAdded ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Added to Cart
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
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
