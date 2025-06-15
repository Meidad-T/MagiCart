
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create context about the recommendation and store data
    const storeComparison = storeTotals.map((store: any, index: number) => 
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

    console.log('Calling Gemini API with prompt:', fullPrompt);

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
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
