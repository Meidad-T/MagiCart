
import { ShoppingCart, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchDropdown from "./SearchDropdown";
import type { ProductWithPrices } from "@/types/database";

interface HeaderProps {
  items: ProductWithPrices[];
  cart: Array<ProductWithPrices & { quantity: number }>;
  onAddToCart: (item: ProductWithPrices) => void;
  onCartClick: () => void;
  isLoading: boolean;
}

const Header = ({ items, cart, onAddToCart, onCartClick, isLoading }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Smart Cart</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchDropdown 
              items={items}
              onAddToCart={onAddToCart}
            />
          </div>

          {/* Cart Button */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              className="relative"
              onClick={onCartClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                <ShoppingCart className="h-6 w-6" />
              )}
              {cart.length > 0 && !isLoading && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white min-w-5 h-5 flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
