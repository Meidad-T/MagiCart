import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Star, TrendingUp, Shield, Clock } from "lucide-react";
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
}
export const IntelligentRecommendation = ({
  storeTotals,
  shoppingType
}: IntelligentRecommendationProps) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  useEffect(() => {
    if (storeTotals.length === 0) return;

    // Intelligent algorithm to choose store
    const calculateStoreScore = (store: StoreTotalData, index: number) => {
      const price = parseFloat(store.total);
      const cheapestPrice = parseFloat(storeTotals[0].total);
      const priceRatio = price / cheapestPrice;

      // Store-specific data (simulated review scores and metrics)
      const storeMetrics = {
        'H-E-B': {
          reviewScore: 4.6,
          freshness: 4.8,
          availability: 4.5,
          service: 4.7
        },
        'Walmart': {
          reviewScore: 4.1,
          freshness: 4.0,
          availability: 4.6,
          service: 4.0
        },
        'Target': {
          reviewScore: 4.4,
          freshness: 4.2,
          availability: 4.3,
          service: 4.5
        },
        'Kroger': {
          reviewScore: 4.3,
          freshness: 4.4,
          availability: 4.2,
          service: 4.3
        },
        'Aldi': {
          reviewScore: 4.2,
          freshness: 4.3,
          availability: 3.9,
          service: 4.1
        },
        "Sam's Club": {
          reviewScore: 4.0,
          freshness: 4.1,
          availability: 4.4,
          service: 3.9
        }
      };
      const metrics = storeMetrics[store.store as keyof typeof storeMetrics] || {
        reviewScore: 4.0,
        freshness: 4.0,
        availability: 4.0,
        service: 4.0
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
        metrics,
        priceRatio
      };
    };

    // Calculate scores for all stores
    const scoredStores = storeTotals.map(calculateStoreScore);

    // Find the best store
    const bestStore = scoredStores.reduce((best, current) => current.score > best.score ? current : best);

    // Generate reason based on why this store was chosen
    let reason = "";
    const isChepeast = bestStore.store === storeTotals[0];
    const metrics = bestStore.metrics;
    if (isChepeast && bestStore.score > 85) {
      reason = `offers the best overall value with ${metrics.reviewScore}★ reviews and competitive pricing`;
    } else if (!isChepeast && metrics.reviewScore >= 4.4) {
      reason = `excels in customer satisfaction (${metrics.reviewScore}★ rating) and product quality, making it worth the slight premium`;
    } else if (shoppingType === 'pickup' && bestStore.store.store === 'H-E-B') {
      reason = `provides free curbside pickup with excellent fresh produce quality (${metrics.freshness}★ rating)`;
    } else if (shoppingType === 'delivery' && bestStore.store.store === 'Walmart') {
      reason = `delivers consistently with ${metrics.availability}★ availability rating and reliable fulfillment`;
    } else if (metrics.freshness >= 4.5) {
      reason = `guarantees superior freshness quality (${metrics.freshness}★) especially for produce and perishables`;
    } else {
      reason = `provides optimal balance of price, quality (${metrics.reviewScore}★), and ${shoppingType} convenience`;
    }
    setRecommendation({
      store: bestStore.store,
      reason,
      confidence: Math.round(bestStore.score),
      metrics: bestStore.metrics,
      savings: isChepeast ? null : `$${(parseFloat(bestStore.store.total) - parseFloat(storeTotals[0].total)).toFixed(2)} more than cheapest`
    });
  }, [storeTotals, shoppingType]);
  if (!recommendation || storeTotals.length === 0) return null;
  return <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Intelligent Recommendation</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                {recommendation.confidence}% match
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                We recommend{' '}
                <span className="font-semibold text-blue-600">
                  {recommendation.store.store}
                </span>{' '}
                because it {recommendation.reason}.
              </p>
              
              {recommendation.savings && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {recommendation.savings} • Quality justifies the premium
                </p>}
              
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};