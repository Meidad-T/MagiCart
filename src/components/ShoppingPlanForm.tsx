
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import { ShoppingPlan } from "@/types/database";

interface ShoppingPlanFormProps {
  orderData: {
    storeName: string;
    storeAddress?: string;
    shoppingType: 'pickup' | 'delivery' | 'instore';
    deliveryAddress?: string;
    pickupTime?: string;
    orderTotal: number;
    itemCount: number;
  };
  onPlanCreated?: (plan: ShoppingPlan) => void;
}

export default function ShoppingPlanForm({ orderData, onPlanCreated }: ShoppingPlanFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [planName, setPlanName] = useState("");
  const [frequency, setFrequency] = useState<'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom'>('none');
  const [customDays, setCustomDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const { createPlan } = useShoppingPlans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const planData = {
        name: planName.trim(),
        items: [], // In a real app, this would contain the cart items
        frequency,
        custom_frequency_days: frequency === 'custom' ? customDays : null,
        store_name: orderData.storeName,
        store_address: orderData.storeAddress,
        shopping_type: orderData.shoppingType,
        delivery_address: orderData.deliveryAddress,
        pickup_time: orderData.pickupTime,
        estimated_total: orderData.orderTotal,
        item_count: orderData.itemCount,
        is_active: true,
      };

      const createdPlan = await createPlan(planData);
      
      toast({
        title: "Shopping plan created!",
        description: `Your plan "${planName}" has been saved successfully.`,
      });

      // Reset form
      setPlanName("");
      setFrequency('none');
      setCustomDays(30);
      setShowForm(false);

      onPlanCreated?.(createdPlan);
    } catch (error) {
      toast({
        title: "Error creating plan",
        description: "There was an error saving your shopping plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-plan"
            checked={showForm}
            onCheckedChange={(checked) => setShowForm(!!checked)}
          />
          <Label htmlFor="save-plan" className="text-base font-medium">
            Save as Shopping Plan
          </Label>
        </div>
        <p className="text-sm text-gray-600">
          Create a recurring shopping plan to get notified when it's time to reorder
        </p>
      </CardHeader>

      {showForm && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                type="text"
                placeholder="e.g., Weekly Groceries"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                required
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
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Plan"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
