
import { ShoppingCart, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SearchDropdown from "./SearchDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { ProductWithPrices } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  items: ProductWithPrices[];
  cart: Array<ProductWithPrices & { quantity: number }>;
  onAddToCart: (item: ProductWithPrices) => void;
  onCartClick: () => void;
  user?: SupabaseUser | null;
}

const Header = ({ items, cart, onAddToCart, onCartClick, user }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-4 text-gray-900 hover:bg-gray-100/50 transition-colors px-3 h-auto rounded-xl"
            >
              <img 
                src="/lovable-uploads/81065ad7-a689-4ec6-aa59-520f3ed2aa9c.png" 
                alt="MagiCart Logo" 
                className="h-12 w-12"
              />
              <span className="text-3xl font-playfair font-bold gradient-text">MagiCart</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchDropdown 
              items={items}
              onAddToCart={onAddToCart}
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative text-gray-700 hover:bg-gray-100 rounded-full w-12 h-12 transition-colors duration-200">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-xl rounded-xl">
                  <DropdownMenuItem disabled className="text-gray-600">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleSignIn} 
                className="text-gray-700 bg-gray-100 hover:bg-gray-200 border-0 rounded-xl px-6 py-2 font-medium transition-colors duration-200"
              >
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <Button 
              variant="ghost" 
              className="relative text-gray-700 hover:bg-gray-100 rounded-full w-12 h-12 transition-colors duration-200"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white min-w-6 h-6 flex items-center justify-center text-xs p-1 font-bold border-2 border-white shadow-lg">
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
