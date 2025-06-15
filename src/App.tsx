
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import type { ProductWithPrices } from "@/types/database";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import HealthRecommendations from "./pages/HealthRecommendations";
import CheckoutDetails from "./pages/CheckoutDetails";
import OrderSummary from "./pages/OrderSummary";
import ShoppingPlans from "./pages/ShoppingPlans";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [cart, setCart] = useState<Array<ProductWithPrices & { quantity: number }>>([]);

  const updateCart = (updatedCart: Array<ProductWithPrices & { quantity: number }>) => {
    setCart(updatedCart);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index cart={cart} onUpdateCart={updateCart} />} />
            <Route path="/cart" element={<Cart cart={cart} onUpdateCart={updateCart} />} />
            <Route path="/health-recommendations" element={<HealthRecommendations cart={cart} onUpdateCart={updateCart} />} />
            <Route path="/checkout-details" element={<CheckoutDetails />} />
            <Route path="/order-summary" element={<OrderSummary cart={cart} />} />
            <Route path="/shopping-plans" element={<ShoppingPlans cart={cart} onUpdateCart={updateCart} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
