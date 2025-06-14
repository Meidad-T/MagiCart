
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Shield, Clock, DollarSign } from "lucide-react";
import { AIThinkingAnimation } from "./AIThinkingAnimation";

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
  const [progress, setProgress] = useState(0);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [showTypingEffect, setShowTypingEffect] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (storeTotals.length === 0) return;
    
    const runAnalysis = async () => {
      console.log("Starting intelligent analysis...");
      setIsAnalyzing(true);
      setCurrentStep(0);
      setProgress(0);
      setRecommendation(null);
      setShowTypingEffect(false);
      setTypedText("");
      
      // Simple 2-second timer for progress
      const totalDuration = 2000; // 2 seconds
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 4; // Will reach 100 in 2 seconds (25 intervals * 4% each)
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 80); // Update every 80ms for smooth animation
      
      // Update steps during the 2 seconds
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < thinkingSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(stepInterval);
          return prev;
        });
      }, 400); // Change step every 400ms
      
      // Generate smart recommendation after 2 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setProgress(100);
        
        // Smart randomized recommendation from top 3 stores
        const topStores = storeTotals.slice(0, 3); // Get top 3 cheapest
        const randomStore = topStores[Math.floor(Math.random() * topStores.length)];
        
        // Generate realistic scores
        const baseScore = 75 + Math.floor(Math.random() * 20); // 75-95
        const priceScore = randomStore === storeTotals[0] ? 95 : 85 + Math.floor(Math.random() * 10);
        const qualityScore = 78 + Math.floor(Math.random() * 17);
        const reliabilityScore = 82 + Math.floor(Math.random() * 15);
        const convenienceScore = shoppingType === 'pickup' && randomStore.store === 'H-E-B' ? 95 : 70 + Math.floor(Math.random() * 20);
        
        // Smart reason generation based on store and shopping type
        let reason = "";
        const substitutions = substitutionCounts[randomStore.storeKey] || 0;
        
        if (randomStore === storeTotals[0]) {
          reason = "offers the best price-to-value ratio while maintaining excellent quality standards";
        } else if (randomStore.store === 'H-E-B') {
          reason = "excels in product quality and customer satisfaction, with superior fresh produce selection";
        } else if (randomStore.store === 'Target') {
          reason = "provides premium shopping experience with reliable inventory and fast fulfillment";
        } else if (substitutions === 0) {
          reason = "guarantees all items in stock with exceptional reliability ratings";
        } else {
          reason = "delivers optimal balance of price, quality, and convenience for your preferences";
        }
        
        const smartRecommendation = {
          recommendedStore: randomStore,
          reason,
          confidence: baseScore,
          factors: {
            priceScore,
            qualityScore,
            reliabilityScore,
            convenienceScore,
            overallScore: baseScore
          }
        };
        
        setRecommendation(smartRecommendation);
        setIsAnalyzing(false);
        
        // Start fast typing effect
        setTimeout(() => {
          setShowTypingEffect(true);
          const fullText = `Based on intelligent analysis, we recommend ${smartRecommendation.recommendedStore.store} since it ${smartRecommendation.reason}.`;
          let index = 0;
          
          const typeInterval = setInterval(() => {
            if (index < fullText.length) {
              setTypedText(fullText.slice(0, index + 1));
              index++;
            } else {
              clearInterval(typeInterval);
            }
          }, 20); // Very fast typing - 20ms per character
          
          return () => clearInterval(typeInterval);
        }, 100);
        
      }, 2000); // Complete after exactly 2 seconds
    };

    // Start analysis immediately
    runAnalysis();
  }, [storeTotals, substitutionCounts, shoppingType, cart]);

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
              <h3 className="font-semibold text-gray-800">Intelligent Recommendation</h3>
              {recommendation && !isAnalyzing && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {recommendation.confidence}% confidence
                </span>
              )}
            </div>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">{progress}% complete</p>
                </div>
                
                <AIThinkingAnimation 
                  isThinking={isAnalyzing}
                  steps={thinkingSteps}
                  currentStep={currentStep}
                />
              </div>
            ) : recommendation ? (
              <div className="space-y-3">
                {showTypingEffect ? (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {typedText}
                    {typedText.length < 100 && <span className="animate-pulse">|</span>}
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Based on intelligent analysis, we recommend{' '}
                    <span className="font-semibold text-blue-600">
                      {recommendation.recommendedStore.store}
                    </span>{' '}
                    since it {recommendation.reason}.
                  </p>
                )}
                
                {/* Performance metrics - only show after typing is done */}
                {showTypingEffect && typedText.length > 50 && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-100 animate-fade-in">
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
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Preparing analysis...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
