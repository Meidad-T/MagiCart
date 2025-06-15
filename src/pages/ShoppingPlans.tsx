import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Edit, Loader, Trash2 } from "lucide-react";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingPlan, setEditingPlan] = useState<ShoppingPlan | null>(null);

  // Mock items data for the header search (in a real app, this would come from a global state or API)
  const items: ProductWithPrices[] = [];

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

  const handleAddPlanToCart = (plan: ShoppingPlan) => {
    const planItems = Array.isArray(plan.items) ? plan.items : [];
    
    if (planItems.length === 0) {
      toast({
        title: "No items in plan",
        description: "This plan doesn't contain any items to add to cart.",
        variant: "destructive",
      });
      return;
    }

    let updatedCart = [...cart];
    
    planItems.forEach((planItem: any) => {
      // Convert plan item back to full ProductWithPrices format using stored data
      const cartItem: ProductWithPrices & { quantity: number } = {
        id: planItem.id,
        name: planItem.name,
        description: planItem.description || '',
        image_url: planItem.image_url || '/placeholder.svg',
        unit: planItem.unit || 'each',
        category_id: planItem.category_id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: planItem.category || {
          id: planItem.category_id || '',
          name: 'General',
          created_at: new Date().toISOString()
        },
        prices: planItem.prices || {},
        // Use the stored price information from when the plan was created
        walmart_price: planItem.walmart_price || 0,
        heb_price: planItem.heb_price || 0,
        aldi_price: planItem.aldi_price || 0,
        target_price: planItem.target_price || 0,
        kroger_price: planItem.kroger_price || 0,
        sams_price: planItem.sams_price || 0,
        quantity: planItem.quantity || 1
      };

      // Check if item already exists in cart
      const existingItemIndex = updatedCart.findIndex(item => item.id === cartItem.id);
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + cartItem.quantity
        };
      } else {
        // Add new item to cart
        updatedCart.push(cartItem);
      }
    });

    // Update cart with all items at once
    onUpdateCart(updatedCart);

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
    // Store logos and display names
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
                      {storeInfo.logo.startsWith('/') ? (
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
