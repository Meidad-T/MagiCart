import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { ProductWithPrices } from "@/types/database";

interface OrderData {
  storeName: string;
  storeAddress: string;
  shoppingType: 'pickup' | 'delivery' | 'instore';
  deliveryAddress?: string;
  pickupTime?: string;
  orderTotal: number;
  itemCount: number;
}

interface ShoppingPlanFormProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  orderData: OrderData;
  onPlanCreated?: (plan: any) => void;
}

export default function ShoppingPlanForm({ cart, orderData, onPlanCreated }: ShoppingPlanFormProps) {
  const { createPlan, plans } = useShoppingPlans();
  const { user } = useAuth();
  const [savePlan, setSavePlan] = useState(false);
  const [planName, setPlanName] = useState("");
  const [frequency, setFrequency] = useState<'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom'>('none');
  const [customDays, setCustomDays] = useState<string>("30");
  const [loading, setLoading] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);

  // Check if plan limit is reached
  const planLimitReached = plans.length >= 10;

  // Mock cart items - in a real app, this would come from the actual cart
  const mockCartItems = [
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
  ];

  const handleSavePlan = async () => {
    if (!savePlan || !planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your shopping plan",
        variant: "destructive",
      });
      return;
    }
    
    if (!cart || cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "You cannot save an empty shopping plan.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save shopping plans",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a full copy of cart items to save in the plan
      const planItems = cart.map(item => ({...item}));

      const planData = {
        name: planName.trim(),
        items: planItems, // Save the real cart items array
        frequency,
        custom_frequency_days: frequency === 'custom' ? parseInt(customDays) || 30 : null,
        store_name: orderData.storeName,
        store_address: orderData.storeAddress,
        shopping_type: orderData.shoppingType,
        delivery_address: orderData.deliveryAddress || null,
        pickup_time: orderData.pickupTime || null,
        estimated_total: orderData.orderTotal,
        item_count: orderData.itemCount,
        is_active: true,
      };

      const result = await createPlan(planData);
      
      setPlanSaved(true);
      toast({
        title: "Plan saved!",
        description: `Your plan "${planName}" has been saved successfully.`,
      });

      if (onPlanCreated) {
        onPlanCreated(result);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error saving plan",
        description: "There was an error saving your shopping plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setCustomDays(value);
    }
  };

  if (planSaved) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-blue-600">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Plan Saved Successfully!</p>
              <p className="text-sm text-blue-500">Your shopping plan "{planName}" has been saved and can be found in your Shopping Plans.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (planLimitReached && user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-medium">Plan Limit Reached!</p>
              <p className="text-sm text-red-500">You have reached the maximum of 10 saved plans. Please go back and delete some plans to save new ones.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">Save as Shopping Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-plan"
            checked={savePlan}
            onCheckedChange={(checked) => setSavePlan(!!checked)}
          />
          <Label htmlFor="save-plan" className="text-sm font-medium">
            Save this order as a recurring shopping plan
          </Label>
        </div>

        {savePlan && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-100">
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

            <Button 
              onClick={handleSavePlan}
              disabled={loading || !planName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
