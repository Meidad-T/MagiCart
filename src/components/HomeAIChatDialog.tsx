import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithPrices } from "@/types/database";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface HomeAIChatDialogProps {
  cart: Array<ProductWithPrices & { quantity: number }>;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

// Types reused from AIChatDialog
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

export const HomeAIChatDialog = ({ cart, isOpen, setIsOpen }: HomeAIChatDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleOpenChange = setIsOpen ? setIsOpen : setInternalOpen;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your personal shopping assistant. I can help you with product recommendations based on your dietary restrictions, allergies, or health goals. I can also analyze your current cart and suggest healthier alternatives. What would you like to know?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // We'll use 'pickup' as the shoppingType default for the home dialog
  const shoppingType = "pickup";

  // -- START: storeTotals and recommendation logic (copied/adapted from Cart) --

  const storeNames = {
    walmart: 'Walmart',
    heb: 'H-E-B',
    aldi: 'Aldi',
    target: 'Target',
    kroger: 'Kroger',
    sams: "Sam's Club"
  };

  // Compute store totals for all available stores in exactly the same way as Cart page
  const storeTotals: StoreTotalData[] = useMemo(() => {
    if (!cart || cart.length === 0) return [];
    const stores = ['walmart', 'heb', 'aldi', 'target', 'kroger', 'sams'];
    return stores.map(store => {
      const subtotal = cart.reduce((sum, item) => {
        const price = item[`${store}_price` as keyof ProductWithPrices] as number;
        return sum + (price * item.quantity);
      }, 0);
      const taxesAndFees = subtotal * 0.0875; // 8.75% tax rate
      // Only 'pickup' fees for home dialog (like Cart default)
      let storeFee = 0;
      if (shoppingType === 'pickup') {
        if (store === 'walmart') storeFee = 1.99;
        if (store === 'sams') storeFee = subtotal >= 50 ? 0 : 4.99;
        if (store === 'heb') storeFee = 0;
      }
      // In-store/delivery logic omitted on home page
      const total = subtotal + taxesAndFees + storeFee;
      return {
        store: storeNames[store as keyof typeof storeNames],
        storeKey: store,
        subtotal: subtotal.toFixed(2),
        taxesAndFees: (taxesAndFees + storeFee).toFixed(2),
        total: total.toFixed(2)
      };
    }).sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
  }, [cart]);

  // Simple inference: recommend the store with the lowest total, explain why (like Cart page does)
  const recommendedStore = storeTotals.length > 0 ? storeTotals[0] : null;

  // Example static store quality metrics (since we have no real reviews here)
  const storeMetrics = {
    reviewScore: 4.6,
    freshness: 4.4,
    availability: 4.2,
    service: 4.3,
  };

  // Fallback reason explanation
  const reason = recommendedStore
    ? `it offers the best value for this cart with strong quality ratings`
    : "I analyzed your cart items and chose the best fit.";

  // The Cart page includes some confidence/savings logic, but it's not visible to user or Gemini. We'll match the type:
  const recommendation: RecommendationData = recommendedStore
    ? {
        store: recommendedStore,
        reason,
        confidence: 0.85,
        metrics: storeMetrics,
        savings: undefined
      }
    : // fallback for empty cart so Gemini doesn't fail
      {
        store: {
          store: "",
          storeKey: "",
          subtotal: "0",
          taxesAndFees: "0",
          total: "0"
        },
        reason: "",
        confidence: 0.5,
        metrics: storeMetrics
      };

  // -- END: storeTotals and recommendation logic --

  // Real-time countdown effect for rate limits (unchanged)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rateLimitEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((rateLimitEndTime - now) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          setRateLimitEndTime(null);
          setCountdown(0);
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [rateLimitEndTime]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 60 seconds ago
    const recentMessages = messageTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    setMessageTimestamps(recentMessages);
    if (recentMessages.length >= 4) {
      const oldestRecentMessage = Math.min(...recentMessages);
      const endTime = oldestRecentMessage + 60000;
      setRateLimitEndTime(endTime);
      setCountdown(Math.ceil((endTime - now) / 1000));
      return false;
    }
    return true;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!checkRateLimit()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setMessageTimestamps(prev => [...prev, Date.now()]);
    try {
      // IMPORTANT: Update the API call for Home page dietary AI to suppress store explanation and focus on health/diet advice
      // Instead of sending full store totals, instruct the backend to answer ONLY with dietary/health recs
      // Pass a special flag or override recommendation/reason for the home chat so Gemini will not reference store recs

      // Compose a very focused context about cart + "answer dietary/health only" instruction
      const dietaryContextMessage =
        `Act as a helpful nutrition and health assistant. The user may have allergies, dietary restrictions, or health goals. Based on the current cart items, suggest healthier alternatives or tips related to nutrition, fruits, vegetables, or diet. Ignore store prices or quality ratings; do NOT explain store recommendations or mention store names. Just answer the user's dietary/health question in a concise, friendly way.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          userMessage: `${dietaryContextMessage}\n\nUser: ${inputMessage}`,
          // Pass in an empty recommendation and storeTotals so Gemini cannot compare or cite them
          recommendation: {
            store: { store: '', storeKey: '', subtotal: '0', taxesAndFees: '0', total: '0' },
            reason: '',
            confidence: 0,
            metrics: { reviewScore: 0, freshness: 0, availability: 0, service: 0 },
            savings: undefined,
          },
          storeTotals: [],
          shoppingType,
        }
      });
      if (error || !data?.response) throw error || new Error('No AI response');
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help with health recommendations! You can ask me about dietary alternatives, allergy-friendly products, or nutrition tips based on your cart items.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isRateLimited = rateLimitEndTime !== null && countdown > 0;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {/* --- Removed Chat with AI Button/DialogTrigger for main page --- */}
      {/* The main page will now only show the dialog when triggered by "Get AI Health Recommendations" */}
      {/* DialogTrigger is now omitted */}
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0 bg-gradient-to-br from-slate-50 to-green-50/50">
        <DialogHeader className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
          <DialogTitle className="flex items-center text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mr-3">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
              Health Assistant
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ml-auto'
                      : 'bg-white border border-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.isUser ? 'text-green-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-500 shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {isRateLimited && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 shadow-sm">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 shadow-sm">
                  <p className="text-sm text-orange-800">
                    Rate limit reached. Please wait {countdown} second{countdown !== 1 ? 's' : ''} before sending another message.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex space-x-3 p-4 bg-white/80 backdrop-blur-sm border-t">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about dietary recommendations..."
            disabled={isLoading || isRateLimited}
            className="flex-1 border-gray-200 focus:border-green-400 focus:ring-green-400/20 rounded-xl"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isLoading || isRateLimited}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-4 shadow-sm transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeAIChatDialog;
