
interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface RecommendationData {
  store: StoreTotalData;
  reason: string;
  confidence: number;
  metrics: {
    reviewScore: number;
    freshness: number;
    availability: number;
    service: number;
  };
  savings?: string;
}

export const sendPromptToGemini = async (
  userMessage: string,
  recommendation: RecommendationData,
  storeTotals: StoreTotalData[],
  shoppingType: string
): Promise<string> => {
  try {
    // Create a comprehensive context for the AI
    const context = `
You are an AI shopping assistant that helps explain store recommendations. Here's the current context:

RECOMMENDED STORE: ${recommendation.store.store}
TOTAL PRICE: $${recommendation.store.total}
REASON: ${recommendation.reason}
CONFIDENCE: ${recommendation.confidence}%

STORE METRICS:
- Reviews: ${recommendation.metrics.reviewScore}★
- Freshness: ${recommendation.metrics.freshness}★  
- Availability: ${recommendation.metrics.availability}★
- Service: ${recommendation.metrics.service}★

ALL STORE COMPARISONS:
${storeTotals.map(store => `${store.store}: $${store.total}`).join('\n')}

SHOPPING TYPE: ${shoppingType}

${recommendation.savings ? `COST DIFFERENCE: ${recommendation.savings}` : ''}

Please answer the user's question about this recommendation in a helpful, conversational way. Be specific about why this store was chosen and reference the actual data above.
`;

    const fullPrompt = `${context}\n\nUser Question: ${userMessage}`;

    // For now, we'll simulate the Gemini API response
    // In a real implementation, you would use the Firebase Gemini SDK here
    const response = await simulateGeminiResponse(userMessage, recommendation, storeTotals, shoppingType);
    
    return response;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};

// Simulate Gemini API response with intelligent answers
const simulateGeminiResponse = async (
  userMessage: string,
  recommendation: RecommendationData,
  storeTotals: StoreTotalData[],
  shoppingType: string
): Promise<string> => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('why') && lowerMessage.includes('recommend')) {
    const cheapestStore = storeTotals[0];
    const isRecommendedCheapest = recommendation.store.store === cheapestStore.store;
    
    if (isRecommendedCheapest) {
      return `I recommended ${recommendation.store.store} because it offers the best overall value at $${recommendation.store.total}. It's not only the cheapest option, but also maintains excellent quality with ${recommendation.metrics.reviewScore}★ reviews and ${recommendation.metrics.freshness}★ freshness rating. For ${shoppingType} shopping, it provides great convenience and reliability.`;
    } else {
      const priceDiff = (parseFloat(recommendation.store.total) - parseFloat(cheapestStore.total)).toFixed(2);
      return `While ${cheapestStore.store} is cheaper at $${cheapestStore.total}, I recommended ${recommendation.store.store} at $${recommendation.store.total} (just $${priceDiff} more) because of its superior quality metrics: ${recommendation.metrics.reviewScore}★ reviews, ${recommendation.metrics.freshness}★ freshness, and ${recommendation.metrics.service}★ service. The small price difference is worth it for the significantly better shopping experience and product quality.`;
    }
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
    const cheapestStore = storeTotals[0];
    const mostExpensive = storeTotals[storeTotals.length - 1];
    return `Looking at all the prices: ${cheapestStore.store} is cheapest at $${cheapestStore.total}, while ${mostExpensive.store} is highest at $${mostExpensive.total}. I recommended ${recommendation.store.store} at $${recommendation.store.total} because it offers the best value - balancing both price and quality factors like freshness (${recommendation.metrics.freshness}★) and service (${recommendation.metrics.service}★).`;
  }
  
  if (lowerMessage.includes('quality') || lowerMessage.includes('fresh')) {
    return `${recommendation.store.store} excels in quality with ${recommendation.metrics.freshness}★ for freshness and ${recommendation.metrics.reviewScore}★ overall reviews. This means you'll get better produce, fresher items, and higher customer satisfaction compared to other options. Quality matters especially for groceries where freshness directly impacts taste and nutrition.`;
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('staff')) {
    return `${recommendation.store.store} has a ${recommendation.metrics.service}★ service rating, which reflects helpful staff, shorter wait times, and better customer support. For ${shoppingType} shopping, good service means smoother transactions, better assistance finding items, and resolving any issues quickly.`;
  }
  
  if (lowerMessage.includes('delivery') || lowerMessage.includes('pickup')) {
    return `For ${shoppingType} shopping, ${recommendation.store.store} performs well with ${recommendation.metrics.availability}★ availability rating, meaning your items are more likely to be in stock and ready when you need them. They also have reliable fulfillment processes for this shopping method.`;
  }
  
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs')) {
    const comparisons = storeTotals.slice(0, 3).map(store => 
      `${store.store}: $${store.total}${store.store === recommendation.store.store ? ' (recommended)' : ''}`
    ).join(', ');
    return `Here's how the top options compare: ${comparisons}. I chose ${recommendation.store.store} because it provides the optimal balance of price, quality (${recommendation.metrics.reviewScore}★), and convenience for your ${shoppingType} shopping needs.`;
  }
  
  // Default response
  return `${recommendation.store.store} is my top recommendation because ${recommendation.reason}. With ${recommendation.confidence}% confidence, it offers the best combination of value, quality, and convenience for your shopping needs. Is there something specific about this recommendation you'd like me to explain further?`;
};
