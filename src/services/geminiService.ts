
import { initializeApp } from 'firebase/app';

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
    // For now, we'll use a more intelligent simulation that actually reads the user's question
    // To use real Firebase Gemini API, you would need to add the Firebase AI Logic SDK
    // and replace this with actual API calls
    
    const response = await intelligentAIResponse(userMessage, recommendation, storeTotals, shoppingType);
    return response;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};

// Intelligent AI response that can handle any question while staying on topic
const intelligentAIResponse = async (
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
      return `${mathResult} However, my main purpose is to help you understand why I recommended ${recommendation.store.store} for your shopping! Do you have any questions about this recommendation that I'd love to answer?`;
    }
  }
  
  // Handle general questions while redirecting to shopping
  if (lowerMessage.includes('what is') || lowerMessage.includes('how do') || lowerMessage.includes('tell me about')) {
    const generalAnswer = getGeneralAnswer(userMessage);
    return `${generalAnswer} However, I'm specifically here to help explain my shopping recommendation! I chose ${recommendation.store.store} because ${recommendation.reason}. Would you like to know more about this choice?`;
  }
  
  // Handle greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI shopping assistant. I recommended ${recommendation.store.store} at $${recommendation.store.total} because ${recommendation.reason}. What would you like to know about this recommendation?`;
  }
  
  // Handle shopping-specific questions (existing logic but improved)
  if (lowerMessage.includes('why') && (lowerMessage.includes('recommend') || lowerMessage.includes('choose'))) {
    const cheapestStore = storeTotals[0];
    const isRecommendedCheapest = recommendation.store.store === cheapestStore.store;
    
    if (isRecommendedCheapest) {
      return `I recommended ${recommendation.store.store} because it offers the best overall value at $${recommendation.store.total}. It's not only the cheapest option, but also maintains excellent quality with ${recommendation.metrics.reviewScore}★ reviews and ${recommendation.metrics.freshness}★ freshness rating. For ${shoppingType} shopping, it provides great convenience and reliability.`;
    } else {
      const priceDiff = (parseFloat(recommendation.store.total) - parseFloat(cheapestStore.total)).toFixed(2);
      return `While ${cheapestStore.store} is cheaper at $${cheapestStore.total}, I recommended ${recommendation.store.store} at $${recommendation.store.total} (just $${priceDiff} more) because of its superior quality metrics: ${recommendation.metrics.reviewScore}★ reviews, ${recommendation.metrics.freshness}★ freshness, and ${recommendation.metrics.service}★ service. The small price difference is worth it for the significantly better shopping experience and product quality.`;
    }
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
    const cheapestStore = storeTotals[0];
    const mostExpensive = storeTotals[storeTotals.length - 1];
    return `Looking at all the prices: ${cheapestStore.store} is cheapest at $${cheapestStore.total}, while ${mostExpensive.store} is highest at $${mostExpensive.total}. I recommended ${recommendation.store.store} at $${recommendation.store.total} because it offers the best value - balancing both price and quality factors like freshness (${recommendation.metrics.freshness}★) and service (${recommendation.metrics.service}★).`;
  }
  
  if (lowerMessage.includes('quality') || lowerMessage.includes('fresh') || lowerMessage.includes('food')) {
    return `${recommendation.store.store} excels in quality with ${recommendation.metrics.freshness}★ for freshness and ${recommendation.metrics.reviewScore}★ overall reviews. This means you'll get better produce, fresher items, and higher customer satisfaction compared to other options. Quality matters especially for groceries where freshness directly impacts taste and nutrition.`;
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('staff') || lowerMessage.includes('customer')) {
    return `${recommendation.store.store} has a ${recommendation.metrics.service}★ service rating, which reflects helpful staff, shorter wait times, and better customer support. For ${shoppingType} shopping, good service means smoother transactions, better assistance finding items, and resolving any issues quickly.`;
  }
  
  if (lowerMessage.includes('delivery') || lowerMessage.includes('pickup') || lowerMessage.includes('available')) {
    return `For ${shoppingType} shopping, ${recommendation.store.store} performs well with ${recommendation.metrics.availability}★ availability rating, meaning your items are more likely to be in stock and ready when you need them. They also have reliable fulfillment processes for this shopping method.`;
  }
  
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
    const comparisons = storeTotals.slice(0, 3).map(store => 
      `${store.store}: $${store.total}${store.store === recommendation.store.store ? ' (recommended)' : ''}`
    ).join(', ');
    return `Here's how the top options compare: ${comparisons}. I chose ${recommendation.store.store} because it provides the optimal balance of price, quality (${recommendation.metrics.reviewScore}★), and convenience for your ${shoppingType} shopping needs.`;
  }
  
  // For any other question, provide a helpful but redirecting response
  return `That's an interesting question! While I can chat about various topics, I'm specifically designed to help you understand my shopping recommendations. I chose ${recommendation.store.store} because ${recommendation.reason}. Is there anything specific about this recommendation or the store comparison you'd like me to explain?`;
};

// Simple math solver for basic addition
const tryToSolveMath = (message: string): string | null => {
  // Look for simple addition patterns like "5+5", "what is 5 + 5", etc.
  const additionMatch = message.match(/(\d+)\s*\+\s*(\d+)/);
  if (additionMatch) {
    const num1 = parseInt(additionMatch[1]);
    const num2 = parseInt(additionMatch[2]);
    return `${num1} + ${num2} = ${num1 + num2}.`;
  }
  
  // Look for simple subtraction
  const subtractionMatch = message.match(/(\d+)\s*-\s*(\d+)/);
  if (subtractionMatch) {
    const num1 = parseInt(subtractionMatch[1]);
    const num2 = parseInt(subtractionMatch[2]);
    return `${num1} - ${num2} = ${num1 - num2}.`;
  }
  
  return null;
};

// General knowledge responses (basic ones)
const getGeneralAnswer = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('weather')) {
    return "I don't have access to current weather data, but you can check your local weather app!";
  }
  
  if (lowerMessage.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  }
  
  if (lowerMessage.includes('date')) {
    return `Today's date is ${new Date().toLocaleDateString()}.`;
  }
  
  return "That's a great question!";
};
