import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useShoppingPlans } from "@/hooks/useShoppingPlans";
import type { ShoppingPlan } from "@/types/database";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EditPlanDialogProps {
  plan: ShoppingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlanItemInDialog {
  id: string;
  name: string;
  quantity: number;
  image_url?: string;
  price: number;
  [key: string]: any;
}

export default function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
  const { updatePlan } = useShoppingPlans();
  const [planName, setPlanName] = useState("");
  const [frequency, setFrequency] = useState<'none' | 'monthly' | 'weekly' | 'bi-weekly' | 'custom'>('none');
  const [customDays, setCustomDays] = useState<string>('30');
  const [loading, setLoading] = useState(false);
  const [planItems, setPlanItems] = useState<PlanItemInDialog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (plan) {
      setPlanName(plan.name);
      setFrequency(plan.frequency);
      setCustomDays(String(plan.custom_frequency_days || 30));

      if (Array.isArray(plan.items)) {
        const itemsWithPrices = plan.items.map((item: any) => {
          const storePrice = item.prices?.[plan.store_name] ?? 0;
          return {
            ...item,
            price: storePrice,
          };
        });
        setPlanItems(itemsWithPrices);
      } else {
        setPlanItems([]);
      }
    }
  }, [plan]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setPlanItems(planItems.filter(item => item.id !== itemId));
    } else {
      setPlanItems(planItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setPlanItems(planItems.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return planItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
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

    setLoading(true);
    try {
      // Before saving, strip the temporary `price` property from each item.
      const itemsToSave = planItems.map(({ price, ...restOfItem }) => restOfItem);

      const updates = {
        name: planName.trim(),
        frequency,
        custom_frequency_days: frequency === 'custom' ? parseInt(customDays) || 30 : null,
        estimated_total: calculateTotal(),
        item_count: planItems.reduce((sum, item) => sum + item.quantity, 0),
        items: itemsToSave,
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

  const renderItemCard = (item: PlanItemInDialog) => (
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
  );

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
            <Label className="text-base font-medium">Items in Plan</Label>
            <div className="space-y-3 mt-2">
              {planItems.slice(0, 3).map(renderItemCard)}

              {planItems.length > 3 && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
                  <CollapsibleContent className="space-y-3">
                    {planItems.slice(3).map(renderItemCard)}
                  </CollapsibleContent>
                  <div className="flex justify-center mt-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full text-sm flex items-center">
                        {isExpanded ? "Show Less" : `Show ${planItems.length - 3} More Items`}
                        {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </Collapsible>
              )}
              
              {planItems.length === 0 && (
                <p className="text-gray-500 text-center py-4">No items in this plan.</p>
              )}
              
              {planItems.length > 0 && (
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
