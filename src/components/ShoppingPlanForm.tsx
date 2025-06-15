
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import type { ProductWithPrices } from "@/types/database";

interface ShoppingPlanFormProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  storeName: string;
  storeAddress?: string;
  shoppingType: 'pickup' | 'delivery' | 'instore';
  deliveryAddress?: string;
  pickupTime?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanSaved?: () => void;
}

export default function ShoppingPlanForm({
  cart,
  storeName,
  storeAddress,
  shoppingType,
  deliveryAddress,
  pickupTime,
  open,
  onOpenChange,
  onPlanSaved
}: ShoppingPlanFormProps) {
  const { createPlan } = useShoppingPlans();
  const [planName, setPlanName] = useState('');
  const [frequency, setFrequency] = useState<'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom'>('none');
  const [customDays, setCustomDays] = useState<string>('30');
  const [loading, setLoading] = useState(false);
  
  const [cartItems, setCartItems] = useState(cart);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      // Get the price for the current store
      let price = 0;
      const storeKey = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (storeKey === 'walmart') price = item.walmart_price;
      else if (storeKey === 'heb' || storeKey === 'h-e-b') price = item.heb_price;
      else if (storeKey === 'aldi') price = item.aldi_price;
      else if (storeKey === 'target') price = item.target_price;
      else if (storeKey === 'kroger') price = item.kroger_price;
      else if (storeKey === 'sams' || storeKey === "sam's club") price = item.sams_price;
      else price = item.prices[storeName] || 0;
      
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDays(value);
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your shopping plan",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "No items in cart",
        description: "Please add items to your cart before saving a plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Save complete product information including all necessary fields for proper display and pricing
      const planItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        unit: item.unit,
        category_id: item.category_id,
        quantity: item.quantity,
        // Store all price information
        walmart_price: item.walmart_price,
        heb_price: item.heb_price,
        aldi_price: item.aldi_price,
        target_price: item.target_price,
        kroger_price: item.kroger_price,
        sams_price: item.sams_price,
        prices: item.prices,
        // Store the current price for this specific store
        price: (() => {
          const storeKey = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (storeKey === 'walmart') return item.walmart_price;
          if (storeKey === 'heb' || storeKey === 'h-e-b') return item.heb_price;
          if (storeKey === 'aldi') return item.aldi_price;
          if (storeKey === 'target') return item.target_price;
          if (storeKey === 'kroger') return item.kroger_price;
          if (storeKey === 'sams' || storeKey === "sam's club") return item.sams_price;
          return item.prices[storeName] || 0;
        })(),
        category: item.category
      }));

      const planData = {
        name: planName.trim(),
        items: planItems,
        frequency,
        custom_frequency_days: frequency === 'custom' ? parseInt(customDays) || 30 : null,
        store_name: storeName,
        store_address: storeAddress || '',
        shopping_type: shoppingType,
        delivery_address: deliveryAddress || null,
        pickup_time: pickupTime || null,
        estimated_total: calculateTotal(),
        item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        is_active: true,
      };

      await createPlan(planData);
      
      toast({
        title: "Plan saved!",
        description: `Your plan "${planName}" has been saved successfully.`,
      });

      onOpenChange(false);
      onPlanSaved?.();
    } catch (error) {
      toast({
        title: "Error saving plan",
        description: "There was an error saving your shopping plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save Shopping Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Name */}
          <div>
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
            />
          </div>

          {/* Cart Items */}
          <div>
            <Label className="text-base font-medium">Cart Items</Label>
            <div className="space-y-3 mt-2">
              {cartItems.map((item) => {
                // Get the price for the current store
                let price = 0;
                const storeKey = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                if (storeKey === 'walmart') price = item.walmart_price;
                else if (storeKey === 'heb' || storeKey === 'h-e-b') price = item.heb_price;
                else if (storeKey === 'aldi') price = item.aldi_price;
                else if (storeKey === 'target') price = item.target_price;
                else if (storeKey === 'kroger') price = item.kroger_price;
                else if (storeKey === 'sams' || storeKey === "sam's club") price = item.sams_price;
                else price = item.prices[storeName] || 0;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">${price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-12 text-center">{item.quantity}</span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right min-w-20">
                          <p className="font-medium">${(price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {cartItems.length === 0 && (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              )}
              
              {cartItems.length > 0 && (
                <div className="text-right pt-4 border-t">
                  <p className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Frequency */}
          <div>
            <Label htmlFor="frequency">Purchase Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              You will be notified by email when it's time to reorder
            </p>
          </div>

          {frequency === 'custom' && (
            <div>
              <Label htmlFor="custom-days">Custom Frequency (Days)</Label>
              <Input
                id="custom-days"
                type="number"
                min="1"
                value={customDays}
                onChange={handleCustomDaysChange}
                placeholder="30"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
