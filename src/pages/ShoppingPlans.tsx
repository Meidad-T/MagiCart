import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Edit, Loader, Trash2 } from "lucide-react";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import EditPlanDialog from "@/components/EditPlanDialog";
import type { ProductWithPrices } from "@/types/database";
import type { ShoppingPlan } from "@/types/database";

interface ShoppingPlansProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  onUpdateCart: (updatedCart: Array<ProductWithPrices & { quantity: number }>) => void;
}

const ShoppingPlans = ({ cart, onUpdateCart }: ShoppingPlansProps) => {
  const { plans, loading, deletePlan } = useShoppingPlans();
  const { data: products } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingPlan, setEditingPlan] = useState<ShoppingPlan | null>(null);
  const [storeLogos, setStoreLogos] = useState<Record<string, string>>({});

  // Mock items data for the header search (in a real app, this would come from a global state or API)
  const items: ProductWithPrices[] = [];

  // Fetch store logos from database
  useEffect(() => {
    const fetchStoreLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('name, logo_url');
        
        if (error) {
          console.error('Error fetching store logos:', error);
          return;
        }

        const logoMap: Record<string, string> = {};
        data?.forEach((store) => {
          if (store.logo_url) {
            logoMap[store.name] = store.logo_url;
          }
        });
        setStoreLogos(logoMap);
      } catch (error) {
        console.error('Error fetching store logos:', error);
      }
    };

    fetchStoreLogos();
  }, []);

  const addToCart = (item: ProductWithPrices) => {
    // Handle adding items to cart from header search
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
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const getStoreKey = (storeName: string): string => {
    if (!storeName) return '';
    const lowerCaseName = storeName.toLowerCase();
    if (lowerCaseName.includes("h-e-b") || lowerCaseName.includes("heb")) return "heb";
    if (lowerCaseName.includes("sam's club") || lowerCaseName.includes("sams")) return "sams";
    if (lowerCaseName.includes("walmart")) return "walmart";
    if (lowerCaseName.includes("target")) return "target";
    if (lowerCaseName.includes("kroger")) return "kroger";
    if (lowerCaseName.includes("aldi")) return "aldi";
    return lowerCaseName;
  };

  const handleAddPlanToCart = (plan: ShoppingPlan) => {
    if (!products) {
      toast({
        title: "Product data is still loading",
        description: "Please wait a moment and try again.",
        variant: "default",
      });
      return;
    }

    // Use Array.isArray to confirm proper structure
    const planItems = Array.isArray(plan.items) ? plan.items : [];
    if (!planItems.length) {
      toast({
        title: "No items in plan",
        description: `This shopping plan doesn't contain any items.`,
        variant: "destructive",
      });
      return;
    }

    const storeKey = getStoreKey(plan.store_name);

    // Add each plan item. The items in the plan should have the same structure as cart items.
    let newCart = [...cart];
    planItems.forEach((planItem: any) => {
      const fullProductInfo = products.find((p) => p.id === planItem.id);
      
      if (!fullProductInfo) {
        console.warn(`Product with ID ${planItem.id} not found.`);
        return; // Skip if product info not found
      }

      // Get the price for the specific store of the plan.
      const storePrice = fullProductInfo.prices?.[storeKey] ?? 0;

      // Check if this item is already in cart
      const existingItem = newCart.find((i) => i.id === planItem.id);
      
      if (existingItem) {
        // If already in cart, add its quantity.
        existingItem.quantity += planItem.quantity || 1;
      } else {
        // Add the item from the plan, ensuring it has a quantity and the correct price.
        newCart.push({ ...fullProductInfo, quantity: planItem.quantity || 1, price: storePrice });
      }
    });

    onUpdateCart(newCart);

    toast({
      title: "Plan added to cart!",
      description: `${planItems.length} items from "${plan.name}" have been added to your cart.`,
    });
  };

  const handleEditPlan = (plan: ShoppingPlan) => {
    setEditingPlan(plan);
  };

  const handleDeletePlan = async (plan: ShoppingPlan) => {
    try {
      await deletePlan(plan.id);
      toast({
        title: "Plan deleted",
        description: `"${plan.name}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting plan",
        description: "There was an error deleting your shopping plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStoreInfo = (storeName: string) => {
    // First check if we have a logo from the database
    const dbLogo = storeLogos[storeName];
    if (dbLogo) {
      return { logo: dbLogo, displayName: storeName };
    }

    // Fallback to hardcoded logos for stores not in database
    const stores = {
      'Walmart': { logo: '/lovable-uploads/626c14cb-fdb3-4472-8f02-7f33de90f3e0.png', displayName: 'Walmart' },
      'H-E-B': { logo: '/lovable-uploads/9b4bb088-c2c8-4cdf-90f7-bd262770965e.png', displayName: 'H-E-B' },
      'HEB': { logo: '/lovable-uploads/9b4bb088-c2c8-4cdf-90f7-bd262770965e.png', displayName: 'H-E-B' },
      'Target': { logo: '🎯', displayName: 'Target' },
      'Kroger': { logo: '🛍️', displayName: 'Kroger' },
      'Aldi': { logo: '🏪', displayName: 'Aldi' },
      'Sams': { logo: '🏢', displayName: "Sam's Club" },
      "Sam's Club": { logo: '🏢', displayName: "Sam's Club" }
    };
    return stores[storeName as keyof typeof stores] || { logo: '🏪', displayName: storeName };
  };

  const getFrequencyDisplay = (frequency: string, customDays?: number) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'custom': return `Every ${customDays} days`;
      default: return 'No repeat';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          items={items}
          cart={cart}
          onAddToCart={addToCart}
          onCartClick={handleCartClick}
          user={user}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your shopping plans.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          items={items}
          cart={cart}
          onAddToCart={addToCart}
          onCartClick={handleCartClick}
          user={user}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your shopping plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        items={items}
        cart={cart}
        onAddToCart={addToCart}
        onCartClick={handleCartClick}
        user={user}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Plans</h1>
          <p className="text-gray-600">Manage your saved shopping lists and recurring orders ({plans.length}/10 plans)</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No shopping plans yet</h3>
            <p className="text-gray-600 mb-6">Create your first shopping plan by completing an order and saving it as a plan.</p>
            <Button onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const storeInfo = getStoreInfo(plan.store_name);
              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      {storeInfo.logo.startsWith('/') || storeInfo.logo.startsWith('http') ? (
                        <img src={storeInfo.logo} alt={storeInfo.displayName} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">{storeInfo.logo}</span>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{storeInfo.displayName}</h3>
                        <p className="text-sm text-gray-500">{plan.store_address}</p>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Items:</span>
                        <span className="font-medium">{plan.item_count}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-bold text-green-600">${plan.estimated_total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <Badge variant="outline">
                          {getFrequencyDisplay(plan.frequency, plan.custom_frequency_days)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Type:</span>
                        <Badge variant="secondary">
                          {plan.shopping_type.charAt(0).toUpperCase() + plan.shopping_type.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-4">
                        <Button 
                          onClick={() => handleAddPlanToCart(plan)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => handleEditPlan(plan)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeletePlan(plan)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editingPlan && (
        <EditPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
        />
      )}
    </div>
  );
};

export default ShoppingPlans;
