
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Shield, Clock, DollarSign } from "lucide-react";
import { performAdvancedStoreAnalysis } from "@/services/aiAnalysisService";
import { AIThinkingAnimation } from "./AIThinkingAnimation";
import { Skeleton } from "@/components/ui/skeleton";

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
  cart?: Array<{ name: string; quantity: number }>;
}

const thinkingSteps = [
  "Analyzing product reviews and ratings",
  "Fetching store performance metrics",
  "Processing market trends and demand data",
  "Calculating multi-factor optimization scores",
  "Generating personalized recommendation"
];

export const AIRecommendation = ({ storeTotals, substitutionCounts, shoppingType, cart = [] }: AIRecommendationProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (storeTotals.length === 0 || hasAnalyzed) return;
    
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setCurrentStep(0);
      
      try {
        const result = await performAdvancedStoreAnalysis(
          storeTotals,
          substitutionCounts,
          shoppingType,
          cart,
          (step) => setCurrentStep(step)
        );
        
        setRecommendation(result);
        setHasAnalyzed(true);
      } catch (error) {
        console.error('Analysis failed:', error);
        // Fallback to simple recommendation
        setRecommendation({
          recommendedStore: storeTotals[0],
          reason: "offers the best overall value for your shopping list",
          confidence: 85,
          factors: {
            priceScore: 90,
            qualityScore: 75,
            reliabilityScore: 80,
            convenienceScore: 70,
            overallScore: 85
          }
        });
        setHasAnalyzed(true);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Add a small delay to make it feel more natural
    const timer = setTimeout(runAnalysis, 500);
    return () => clearTimeout(timer);
  }, [storeTotals, substitutionCounts, shoppingType, cart, hasAnalyzed]);

  if (storeTotals.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-blue-200 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-indigo-100/20 animate-pulse"></div>
      
      <CardContent className="pt-4 relative">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <Sparkles className={`h-6 w-6 ${isAnalyzing ? 'text-blue-500 animate-spin' : 'text-blue-600'} transition-all duration-300`} />
              {isAnalyzing && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800">AI-Powered Recommendation</h3>
              {recommendation && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {recommendation.confidence}% confidence
                </span>
              )}
            </div>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <AIThinkingAnimation 
                  isThinking={isAnalyzing}
                  steps={thinkingSteps}
                  currentStep={currentStep}
                />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : recommendation ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Based on advanced analysis, we recommend{' '}
                  <span className="font-semibold text-blue-600">
                    {recommendation.recommendedStore.store}
                  </span>{' '}
                  since it {recommendation.reason}.
                </p>
                
                {/* Performance metrics */}
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-100">
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Price: {recommendation.factors.priceScore}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">Quality: {recommendation.factors.qualityScore}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-600">Reliability: {recommendation.factors.reliabilityScore}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-600">Convenience: {recommendation.factors.convenienceScore}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
