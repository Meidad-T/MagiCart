
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface AIRecommendationProps {
  storeTotals: StoreTotalData[];
  substitutionCounts: Record<string, number>;
  shoppingType: 'pickup' | 'delivery' | 'instore';
}

export const AIRecommendation = ({ storeTotals, substitutionCounts, shoppingType }: AIRecommendationProps) => {
  const generateRecommendation = () => {
    if (storeTotals.length === 0) return null;

    const cheapest = storeTotals[0];
    const secondCheapest = storeTotals[1];
    
    // Calculate price difference between cheapest and second cheapest
    const priceDiff = secondCheapest ? 
      (parseFloat(secondCheapest.total) - parseFloat(cheapest.total)) : 0;
    
    // Get substitution counts
    const cheapestSubs = substitutionCounts[cheapest.storeKey] || 0;
    
    // Find store with least substitutions
    const storeWithLeastSubs = storeTotals.reduce((best, current) => {
      const currentSubs = substitutionCounts[current.storeKey] || 0;
      const bestSubs = substitutionCounts[best.storeKey] || 0;
      return currentSubs < bestSubs ? current : best;
    });
    
    const leastSubsCount = substitutionCounts[storeWithLeastSubs.storeKey] || 0;
    const leastSubsPriceDiff = parseFloat(storeWithLeastSubs.total) - parseFloat(cheapest.total);

    // AI decision logic
    let recommendedStore = cheapest;
    let reason = "";

    // If cheapest has no substitutions, recommend it
    if (cheapestSubs === 0) {
      recommendedStore = cheapest;
      reason = "offers the best price with all items available in stock";
    }
    // If cheapest has substitutions but price difference to no-sub store is significant (>$3)
    else if (leastSubsCount === 0 && leastSubsPriceDiff <= 3) {
      recommendedStore = storeWithLeastSubs;
      reason = "offers the best value with all items in stock for just a small price difference";
    }
    // If cheapest has many substitutions (3+) and there's a reasonable alternative
    else if (cheapestSubs >= 3 && leastSubsPriceDiff <= 5) {
      recommendedStore = storeWithLeastSubs;
      reason = "provides better item availability with fewer substitutions for a reasonable price difference";
    }
    // Special logic for shopping types
    else if (shoppingType === 'pickup' && cheapest.store === 'H-E-B') {
      recommendedStore = cheapest;
      reason = "offers free pickup with competitive pricing";
    }
    // Default to cheapest
    else {
      recommendedStore = cheapest;
      if (cheapestSubs > 0) {
        reason = `offers the lowest total cost, though ${cheapestSubs} item${cheapestSubs > 1 ? 's' : ''} may need substitution`;
      } else {
        reason = "offers the best overall value for your shopping list";
      }
    }

    return { store: recommendedStore, reason };
  };

  const recommendation = generateRecommendation();

  if (!recommendation) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">AI Recommendation</h3>
            <p className="text-sm text-gray-700">
              We recommend <span className="font-semibold text-blue-600">{recommendation.store.store}</span> since it {recommendation.reason}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
