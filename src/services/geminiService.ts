
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI("AIzaSyD4of7Cv83E0hLD7WmUw_bwN2fI2AXRZBU");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create context about the recommendation and store data
    const storeComparison = storeTotals.map((store, index) => 
      `${index + 1}. ${store.store}: $${store.total}${store.store === recommendation.store.store ? ' (RECOMMENDED)' : ''}`
    ).join('\n');

    const systemPrompt = `You are a friendly AI shopping assistant helping users understand grocery store recommendations. 

CONTEXT:
- Shopping Type: ${shoppingType}
- Recommended Store: ${recommendation.store.store} at $${recommendation.store.total}
- Recommendation Reason: ${recommendation.reason}
- Store Quality Metrics: Reviews ${recommendation.metrics.reviewScore}★, Freshness ${recommendation.metrics.freshness}★, Availability ${recommendation.metrics.availability}★, Service ${recommendation.metrics.service}★

ALL STORE OPTIONS WITH PRICES:
${storeComparison}

INSTRUCTIONS for responses:
1. Always be helpful and answer the user's question directly first
2. For math questions, solve them accurately 
3. For general questions, provide brief helpful answers
4. For shopping questions, use the specific data provided above
5. ALWAYS tie your response back to the shopping recommendation context
6. Keep responses conversational and under 150 words
7. When users ask about specific stores like "should I go to Aldi instead?", compare that store to the recommended one using the actual price and quality data
8. Be enthusiastic about helping with their shopping decision

Remember: You can chat about anything, but your main job is helping them understand why ${recommendation.store.store} was recommended for their ${shoppingType} shopping trip.`;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Fallback to intelligent simulation if API fails
    return await intelligentFallbackResponse(userMessage, recommendation, storeTotals, shoppingType);
  }
};

// Fallback function in case the API is unavailable
const intelligentFallbackResponse = async (
  userMessage: string,
  recommendation: RecommendationData,
  storeTotals: StoreTotalData[],
  shoppingType: string
): Promise<string> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Handle math questions
  if (lowerMessage.includes('+') || lowerMessage.includes('plus')) {
    const mathResult = tryToSolveMath(userMessage);
    if (mathResult) {
      return `${mathResult} However, my main purpose is to help you understand why I recommended ${recommendation.store.store} for your shopping! Do you have any questions about this recommendation?`;
    }
  }
  
  // Handle specific store questions like "should I go to Aldi instead?"
  const mentionedStore = storeTotals.find(store => 
    lowerMessage.includes(store.store.toLowerCase())
  );
  
  if (mentionedStore && lowerMessage.includes('instead')) {
    if (mentionedStore.store === recommendation.store.store) {
      return `You're already getting the best recommendation! I suggested ${recommendation.store.store} because ${recommendation.reason}. It offers great value at $${recommendation.store.total}.`;
    } else {
      const priceDiff = (parseFloat(mentionedStore.total) - parseFloat(recommendation.store.total)).toFixed(2);
      const comparison = parseFloat(priceDiff) > 0 ? `$${priceDiff} more expensive` : `$${Math.abs(parseFloat(priceDiff)).toFixed(2)} cheaper`;
      
      return `${mentionedStore.store} at $${mentionedStore.total} is ${comparison} than my recommendation of ${recommendation.store.store} at $${recommendation.store.total}. I chose ${recommendation.store.store} because ${recommendation.reason}. The quality metrics (${recommendation.metrics.reviewScore}★ reviews, ${recommendation.metrics.freshness}★ freshness) make it worth considering over ${mentionedStore.store}.`;
    }
  }
  
  // Handle why questions
  if (lowerMessage.includes('why') && (lowerMessage.includes('recommend') || lowerMessage.includes('choose'))) {
    const cheapestStore = storeTotals[0];
    const isRecommendedCheapest = recommendation.store.store === cheapestStore.store;
    
    if (isRecommendedCheapest) {
      return `I recommended ${recommendation.store.store} because it offers the best overall value at $${recommendation.store.total}. It's not only the cheapest option, but also maintains excellent quality with ${recommendation.metrics.reviewScore}★ reviews and ${recommendation.metrics.freshness}★ freshness rating.`;
    } else {
      const priceDiff = (parseFloat(recommendation.store.total) - parseFloat(cheapestStore.total)).toFixed(2);
      return `While ${cheapestStore.store} is cheaper at $${cheapestStore.total}, I recommended ${recommendation.store.store} at $${recommendation.store.total} (just $${priceDiff} more) because of its superior quality: ${recommendation.metrics.reviewScore}★ reviews, ${recommendation.metrics.freshness}★ freshness, and ${recommendation.metrics.service}★ service.`;
    }
  }
  
  // Default response
  return `That's a great question! While I can help with various topics, I'm here to assist with your shopping decision. I recommended ${recommendation.store.store} because ${recommendation.reason}. Would you like to know more about this choice or compare it with other options?`;
};

// Simple math solver for basic operations
const tryToSolveMath = (message: string): string | null => {
  const additionMatch = message.match(/(\d+)\s*\+\s*(\d+)/);
  if (additionMatch) {
    const num1 = parseInt(additionMatch[1]);
    const num2 = parseInt(additionMatch[2]);
    return `${num1} + ${num2} = ${num1 + num2}.`;
  }
  
  const subtractionMatch = message.match(/(\d+)\s*-\s*(\d+)/);
  if (subtractionMatch) {
    const num1 = parseInt(subtractionMatch[1]);
    const num2 = parseInt(subtractionMatch[2]);
    return `${num1} - ${num2} = ${num1 - num2}.`;
  }
  
  return null;
};
