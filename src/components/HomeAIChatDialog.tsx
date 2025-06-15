
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Sparkles, Clock } from "lucide-react";
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
}

export const HomeAIChatDialog = ({ cart }: HomeAIChatDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Real-time countdown effect
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
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitEndTime]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 60 seconds ago
    
    // Filter out timestamps older than 1 minute
    const recentMessages = messageTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Update the timestamps array
    setMessageTimestamps(recentMessages);
    
    // Check if we've hit the limit
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

    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add this message timestamp to our tracking
    setMessageTimestamps(prev => [...prev, Date.now()]);

    try {
      // Create a mock health/dietary recommendation context
      const healthContext = {
        userMessage: inputMessage,
        cart: cart.map(item => ({
          name: item.name,
          category: item.category.name,
          quantity: item.quantity
        })),
        chatType: 'health_recommendations'
      };

      // Call Supabase Edge Function for secure AI response
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: healthContext
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help with health and dietary recommendations! Feel free to tell me about any allergies, dietary restrictions, or health goals you have.",
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
          <Sparkles className="h-4 w-4 mr-2 text-green-600" />
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-medium">
            Chat with AI
          </span>
        </Button>
      </DialogTrigger>
      
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
