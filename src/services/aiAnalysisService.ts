
import { fetchProductReviews, fetchStoreMetrics, analyzeMarketTrends, StoreMetrics, ProductReview } from './mockDataService';

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface AnalysisResult {
  recommendedStore: StoreTotalData;
  reason: string;
  confidence: number;
  factors: {
    priceScore: number;
    qualityScore: number;
    reliabilityScore: number;
    convenienceScore: number;
    overallScore: number;
  };
}

export const performAdvancedStoreAnalysis = async (
  storeTotals: StoreTotalData[],
  substitutionCounts: Record<string, number>,
  shoppingType: 'pickup' | 'delivery' | 'instore',
  cartItems: Array<{ name: string; quantity: number }>,
  onProgressUpdate: (step: number) => void
): Promise<AnalysisResult> => {
  
  // Step 1: Fetch product reviews - very fast
  onProgressUpdate(0);
  const productNames = cartItems.map(item => item.name);
  const reviews = await fetchProductReviews(productNames);
  await new Promise(resolve => setTimeout(resolve, 200)); // Quick delay
  
  // Step 2: Fetch store metrics
  onProgressUpdate(1);
  const storeMetrics = await fetchStoreMetrics();
  await new Promise(resolve => setTimeout(resolve, 200)); // Quick delay
  
  // Step 3: Analyze market trends
  onProgressUpdate(2);
  const marketData = await analyzeMarketTrends(storeTotals.map(s => s.store));
  await new Promise(resolve => setTimeout(resolve, 300)); // Quick delay
  
  // Step 4: Calculate complex scoring algorithm
  onProgressUpdate(3);
  await new Promise(resolve => setTimeout(resolve, 200)); // Quick delay
  
  const storeScores = storeTotals.map(store => {
    const metrics = storeMetrics.find(m => m.name === store.store);
    const substitutions = substitutionCounts[store.storeKey] || 0;
    const price = parseFloat(store.total);
    const minPrice = Math.min(...storeTotals.map(s => parseFloat(s.total)));
    
    // Complex scoring algorithm
    const priceScore = Math.max(0, 100 - ((price - minPrice) / minPrice) * 100);
    const qualityScore = metrics ? metrics.productQuality * 25 : 50;
    const reliabilityScore = metrics ? 
      (metrics.deliveryReliability * 50) - (substitutions * 10) : 
      Math.max(0, 50 - (substitutions * 10));
    
    let convenienceScore = 50;
    if (shoppingType === 'pickup' && store.store === 'H-E-B') convenienceScore += 20; // Free pickup
    if (shoppingType === 'delivery') {
      const avgTime = metrics?.avgDeliveryTime || 60;
      convenienceScore = Math.max(0, 100 - (avgTime - 30));
    }
    
    // Market trend bonus
    const trendBonus = marketData.trending.includes(store.store) ? 10 : 0;
    const demandBonus = (marketData.demandScore[store.store] || 0.5) * 20;
    
    // Weighted overall score
    const overallScore = (
      priceScore * 0.35 +
      qualityScore * 0.25 +
      reliabilityScore * 0.25 +
      convenienceScore * 0.15 +
      trendBonus +
      demandBonus
    );
    
    return {
      store,
      scores: {
        priceScore: Math.round(priceScore),
        qualityScore: Math.round(qualityScore),
        reliabilityScore: Math.round(reliabilityScore),
        convenienceScore: Math.round(convenienceScore),
        overallScore: Math.round(overallScore)
      },
      metrics
    };
  });
  
  // Step 5: Generate recommendation
  onProgressUpdate(4);
  await new Promise(resolve => setTimeout(resolve, 100)); // Final quick delay
  
  // Find the best scoring store
  const bestStore = storeScores.reduce((best, current) => 
    current.scores.overallScore > best.scores.overallScore ? current : best
  );
  
  // Generate sophisticated reason
  let reason = "";
  const scores = bestStore.scores;
  const store = bestStore.store;
  const subs = substitutionCounts[store.storeKey] || 0;
  
  if (scores.overallScore >= 80) {
    reason = `excels across all metrics with ${scores.overallScore}% confidence, offering optimal value considering price, quality, and reliability`;
  } else if (scores.priceScore >= scores.qualityScore && scores.priceScore >= scores.reliabilityScore) {
    reason = `provides the best price-to-value ratio while maintaining acceptable quality standards`;
  } else if (scores.qualityScore >= 80) {
    reason = `offers superior product quality (${scores.qualityScore}% rating) and reliability, justifying the slight price premium`;
  } else if (scores.reliabilityScore >= 80 && subs === 0) {
    reason = `guarantees all items in stock with ${scores.reliabilityScore}% reliability rating, eliminating substitution concerns`;
  } else {
    reason = `provides the optimal balance of price, quality, and convenience for your shopping preferences`;
  }
  
  return {
    recommendedStore: store,
    reason,
    confidence: Math.round(bestStore.scores.overallScore),
    factors: bestStore.scores
  };
};
