import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, recommendation, storeTotals, shoppingType } = await req.json();
    
    // Get API key from environment (Supabase secrets)
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }

    console.log('Using API key:', apiKey ? 'Key found' : 'Key missing');

    const storeComparison = storeTotals.map((store: any) => {
      const reviewData = storeReviewData[store.store as keyof typeof storeReviewData];
      if (!reviewData) {
        return `- ${store.store}: $${store.total}${store.store === recommendation.store.store ? ' (RECOMMENDED)' : ''}`;
      }
      return `
- **${store.store}**: $${store.total}${store.store === recommendation.store.store ? ' (RECOMMENDED)' : ''}
  - **Reviews**: ${reviewData.reviewScore}★ - _${reviewData.reviewReasoning}_
  - **Freshness**: ${reviewData.freshness}★ - _${reviewData.freshnessReasoning}_
  - **Availability**: ${reviewData.availability}★ - _${reviewData.availabilityReasoning}_
  - **Service**: ${reviewData.service}★ - _${reviewData.serviceReasoning}_`.trim();
    }).join('\n');

    const systemPrompt = `You are a friendly AI shopping assistant helping users understand grocery store recommendations. You have access to detailed review data. Use it to provide insightful answers.

CONTEXT:
- Shopping Type: ${shoppingType}
- Recommended Store: ${recommendation.store.store}
- Why it was recommended: ${recommendation.reason}

FULL STORE COMPARISON (PRICE & REVIEWS):
${storeComparison}

INSTRUCTIONS for responses:
1. Always be helpful and answer the user's question directly first.
2. For math questions, solve them accurately.
3. For general questions, provide brief helpful answers.
4. For shopping questions, use the specific data and reasoning provided in the 'FULL STORE COMPARISON' section. Be specific. For example, if a user asks about Walmart's freshness, mention its low score (1.9★) and the common issues with produce.
5. ALWAYS tie your response back to the shopping recommendation context.
6. Keep responses conversational and under 150 words.
7. When users ask about specific stores like "should I go to Aldi instead?", compare that store to the recommended one using the actual price and the detailed quality/reasoning data.
8. Be enthusiastic about helping with their shopping decision.

Remember: Your main job is helping them understand why ${recommendation.store.store} was recommended. Use the detailed review data to give them confidence in the choice or to help them explore tradeoffs with other stores.

User Question: ${userMessage}`;

    console.log('Calling Gemini API with prompt:', systemPrompt);

    // Use the correct Gemini API endpoint with the API key as a query parameter
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Call Gemini API with proper headers including referer
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://xuwfaljqzvjbxhhrjara.supabase.co',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
