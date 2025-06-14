
import { Search, User, ShoppingCart, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface LandingHeaderProps {
  cart: Array<any>;
  onCartClick: () => void;
  isLoading: boolean;
}

const LandingHeader = ({ cart, onCartClick, isLoading }: LandingHeaderProps) => {
  const [snapOnly, setSnapOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-green-600">Smart Cart</h1>
            <p className="text-xs text-gray-500">Save More, Shop Smarter</p>
          </div>

          {/* Search Bar with SNAP Toggle */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search groceries, meals, or stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            {/* SNAP Toggle */}
            <div className="flex items-center mt-2 ml-4">
              <Switch
                checked={snapOnly}
                onCheckedChange={setSnapOnly}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">SNAP/EBT eligible only</span>
              {snapOnly && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                  SNAP Active
                </Badge>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <User className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartClick}
              disabled={isLoading}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white min-w-5 h-5 flex items-center justify-center text-xs">
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

export default LandingHeader;
