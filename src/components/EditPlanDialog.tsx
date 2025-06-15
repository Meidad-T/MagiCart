
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import type { ShoppingPlan } from "@/types/database";

interface EditPlanDialogProps {
  plan: ShoppingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export default function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
  const { updatePlan } = useShoppingPlans();
  const [planName, setPlanName] = useState(plan.name);
  const [frequency, setFrequency] = useState<'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom'>(plan.frequency);
  const [customDays, setCustomDays] = useState<string>(String(plan.custom_frequency_days || 30));
  const [loading, setLoading] = useState(false);
  
  // Mock cart items - in a real app, this would come from the plan.items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Organic Bananas',
      price: 2.99,
      quantity: 2,
      image_url: '/lovable-uploads/35666c20-41be-4ef8-86aa-a37780ca99aa.png'
    },
    {
      id: '2', 
      name: 'Whole Milk (1 Gallon)',
      price: 3.49,
      quantity: 1,
      image_url: '/lovable-uploads/4e5632ea-f067-443b-b9a9-f6406dfbb683.png'
    },
    {
      id: '3',
      name: 'Bread - Whole Wheat',
      price: 2.79,
      quantity: 1,
      image_url: '/lovable-uploads/81065ad7-a689-4ec6-aa59-520f3ed2aa9c.png'
    }
  ]);

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
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setCustomDays(value);
    }
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

    setLoading(true);
    try {
      const updates = {
        name: planName.trim(),
        frequency,
        custom_frequency_days: frequency === 'custom' ? parseInt(customDays) || 30 : null,
        estimated_total: calculateTotal(),
        item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        // In a real app, you would also update the items array
        items: cartItems
      };

      await updatePlan(plan.id, updates);
      
      toast({
        title: "Plan updated!",
        description: `Your plan "${planName}" has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error updating plan",
        description: "There was an error updating your shopping plan. Please try again.",
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
          <DialogTitle>Edit Shopping Plan</DialogTitle>
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
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
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
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
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
                type="text"
                inputMode="numeric"
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
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
