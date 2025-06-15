import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, TrendingUp, Shield, Clock, MapPin } from "lucide-react";
import { AIChatDialog } from "./AIChatDialog";
import { StoreLocationPicker } from "./StoreLocationPicker";
import { Database } from "@/integrations/supabase/types";

type StoreLocationWithDistance = Database['public']['Tables']['store_locations']['Row'] & { distance: number };

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface IntelligentRecommendationProps {
  storeTotals: StoreTotalData[];
  shoppingType: 'pickup' | 'delivery' | 'instore';
  otherLocations?: StoreLocationWithDistance[];
  onSelectLocation?: (location: StoreLocationWithDistance) => void;
  onRecommendation?: (store: StoreTotalData) => void;
}

export const IntelligentRecommendation = ({
  storeTotals,
  shoppingType,
  otherLocations = [],
  onSelectLocation = () => {},
  onRecommendation,
}: IntelligentRecommendationProps) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const hasSetRecommendation = useRef(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [updatedLocation, setUpdatedLocation] = useState<StoreLocationWithDistance | null>(null);

  useEffect(() => {
    // Only calculate recommendation if we haven't set one yet
    if (storeTotals.length === 0 || hasSetRecommendation.current) return;

    const storeReviewData = {
      'H-E-B': {
        reviewScore: 4.5,
        reviewReasoning: "Excellent private label products and high-quality meat department.",
        freshness: 4.8,
        freshnessReasoning: "Signature strength; consistently high-quality produce and meat.",
        availability: 4.2,
        availabilityReasoning: "Accurate in-app stock reporting, but some out-of-stocks for online orders.",
        service: 4.3,
        serviceReasoning: "Friendly in-store service, but digital/delivery support can be frustrating."
      },
      'Kroger': {
        reviewScore: 4.1,
        reviewReasoning: "Satisfaction guarantee on its extensive private label brands.",
        freshness: 4.0,
        freshnessReasoning: "Strong commitment to quality with its 'Freshness Guarantee'.",
        availability: 4.0,
        availabilityReasoning: "Consistent and reliable stock levels for a full-service grocer.",
        service: 4.2,
        serviceReasoning: "Robust customer service with 'super friendly' and helpful staff."
      },
      'Target': {
        reviewScore: 4.4,
        reviewReasoning: "Products perceived as very high quality.",
        freshness: 4.1,
        freshnessReasoning: "Strong brand perception for freshness, despite isolated incidents.",
        availability: 4.5,
        availabilityReasoning: "Excels with powerful, user-friendly tools to check real-time stock.",
        service: 2.8,
        serviceReasoning: "Significant service gap; frustrating online order fulfillment and unhelpful representatives."
      },
      "Sam's Club": {
        reviewScore: 3.2,
        reviewReasoning: "Good value on Member's Mark brand, but inconsistent quality.",
        freshness: 2.5,
        freshnessReasoning: "Frequent complaints about spoiled or moldy produce.",
        availability: 3.0,
        availabilityReasoning: "Limited selection due to bulk-item warehouse model.",
        service: 1.8,
        serviceReasoning: "Major customer frustration; lack of staff, over-reliance on self-checkout."
      },
      'Walmart': {
        reviewScore: 2.1,
        reviewReasoning: "Low quality score, particularly for groceries.",
        freshness: 1.9,
        freshnessReasoning: "Significant weakness; consistent issues with moldy or damaged produce.",
        availability: 4.6,
        availabilityReasoning: "Key strength; vast product selection and high availability.",
        service: 2.2,
        serviceReasoning: "Poor online order picking and unhelpful support."
      },
      'Aldi': {
        reviewScore: 3.3,
        reviewReasoning: "Value-driven, but some notable complaints about items like packaged chicken.",
        freshness: 3.1,
        freshnessReasoning: "Inconsistent; some customers find it excellent, others are disappointed.",
        availability: 2.4,
        availabilityReasoning: "Frequent out-of-stock items are a widely reported issue.",
        service: 2.9,
        serviceReasoning: "High-efficiency model leads to long checkout lines and lack of floor staff."
      }
    };

    // Intelligent algorithm to choose store
    const calculateStoreScore = (store: StoreTotalData, index: number) => {
      const price = parseFloat(store.total);
      
      const metrics = storeReviewData[store.store as keyof typeof storeReviewData] || {
        reviewScore: 4.0, freshness: 4.0, availability: 4.0, service: 4.0
      };

      // Complex scoring algorithm
      let score = 0;

      // Price factor (40% weight) - favor cheaper but not always cheapest
      if (index === 0) score += 40; // Cheapest gets full points
      else if (index === 1) score += 35; // Second cheapest gets good points
      else if (index === 2) score += 25; // Third gets decent points
      else score += Math.max(0, 20 - index * 5);

      // Review score factor (25% weight)
      score += metrics.reviewScore / 5 * 25;

      // Shopping type specific bonuses (20% weight)
      if (shoppingType === 'pickup') {
        if (store.store === 'H-E-B') score += 20; // Free pickup
        else if (store.store === 'Target') score += 15; // Good pickup experience
        else score += 10;
      } else if (shoppingType === 'delivery') {
        if (store.store === 'Walmart') score += 18; // Good delivery network
        else if (store.store === 'Target') score += 16; // Reliable delivery
        else score += 12;
      } else {
        score += 15; // Base in-store score
      }

      // Quality factors (15% weight)
      score += (metrics.freshness + metrics.availability + metrics.service) / 3 / 5 * 15;

      // Random factor to add variety (small influence)
      score += Math.random() * 5;

      return {
        store,
        score,
        metrics
      };
    };

    // Calculate scores for all stores
    const scoredStores = storeTotals.map(calculateStoreScore);

    // Find the best store
    const bestStore = scoredStores.reduce((best, current) => current.score > best.score ? current : best);

    // Generate reason based on why this store was chosen
    let reason = "";
    const isCheapest = bestStore.store.store === storeTotals[0].store;
    const metrics = bestStore.metrics;

    if (isCheapest && metrics.reviewScore > 4.0 && metrics.freshness > 4.0) {
      reason = `offers the best overall value with excellent reviews (${metrics.reviewScore}★) and freshness (${metrics.freshness}★).`;
    } else if (metrics.freshness >= 4.5) {
      reason = `is highly recommended for its exceptional freshness (${metrics.freshness}★), perfect for produce lovers.`;
    } else if (metrics.availability >= 4.5) {
      reason = `has outstanding item availability (${metrics.availability}★), so you're likely to find everything on your list.`;
    } else if (metrics.reviewScore >= 4.4 && !isCheapest) {
      reason = `is worth the slight premium for its superior product quality and customer ratings (${metrics.reviewScore}★).`;
    } else if (isCheapest) {
        reason = `is the most affordable option, while maintaining a reasonable quality rating of ${metrics.reviewScore}★.`;
    } else {
      reason = `provides an optimal balance of price and quality, with a solid ${metrics.reviewScore}★ review score.`;
    }

    const priceDifference = parseFloat(bestStore.store.total) - parseFloat(storeTotals[0].total);

    setRecommendation({
      store: bestStore.store,
      reason,
      confidence: 97, // Fixed at 97%
      metrics: bestStore.metrics,
      savings: isCheapest ? null : `$${priceDifference.toFixed(2)} more than cheapest`,
      isCheapest
    });

    if (onRecommendation) {
      onRecommendation(bestStore.store);
    }

    // Mark that we've set the recommendation - never change it again
    hasSetRecommendation.current = true;
  }, [storeTotals, shoppingType, onRecommendation]);

  const handleLocationSelect = (location: StoreLocationWithDistance) => {
    onSelectLocation(location);
    setUpdatedLocation(location);
    setIsMinimized(true);
  };

  if (isMinimized && updatedLocation) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Location Updated</h3>
                <p className="text-sm text-gray-700">
                  Switched to {updatedLocation.name} at {updatedLocation.address_line1}.
                </p>
              </div>
            </div>
            <Button variant="link" onClick={() => setIsMinimized(false)}>
              Show Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation || storeTotals.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Intelligent Recommendation</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                97% match
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                We recommend{' '}
                <span className="font-semibold text-blue-600">
                  {recommendation.store.store}
                </span>{' '}
                because it {recommendation.reason}.
              </p>
              
              {recommendation.savings && !recommendation.isCheapest && (
                <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {recommendation.savings} • Quality justifies the premium
                </p>
              )}
              
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-100">
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">Reviews: {recommendation.metrics.reviewScore}★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Freshness: {recommendation.metrics.freshness}★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">Availability: {recommendation.metrics.availability}★</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-600">Service: {recommendation.metrics.service}★</span>
                </div>
              </div>

              {/* Continue with recommended store button */}
              <div className="flex justify-between items-center pt-3 border-t border-blue-100">
                {otherLocations.length > 0 ? (
                  <StoreLocationPicker
                      locations={otherLocations}
                      onSelectLocation={handleLocationSelect}
                      triggerButton={
                          <Button variant="outline">
                              <MapPin className="mr-2 h-4 w-4" />
                              Pick another location
                          </Button>
                      }
                  />
                ) : <div />}
                
                <AIChatDialog 
                  recommendation={recommendation}
                  storeTotals={storeTotals}
                  shoppingType={shoppingType}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
