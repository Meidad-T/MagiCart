
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600/95 via-blue-700/95 to-blue-900/95 backdrop-blur-md border-b border-blue-400/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Animated Logo */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105 px-2 h-auto group"
            >
              <div className="relative">
                <img 
                  src="/lovable-uploads/81065ad7-a689-4ec6-aa59-520f3ed2aa9c.png" 
                  alt="MagiCart Logo" 
                  className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                MagiCart
              </span>
            </Button>
          </div>

          {/* Enhanced Search Bar with animations */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative transform transition-all duration-300 group-hover:scale-[1.02]">
                <SearchDropdown 
                  items={items}
                  onAddToCart={onAddToCart}
                />
              </div>
            </div>
          </div>

          {/* Right side actions with animations */}
          <div className="flex items-center space-x-3">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative text-white hover:bg-white/15 rounded-full w-11 h-11 transition-all duration-300 hover:scale-110 group">
                    <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-in slide-in-from-top-2 duration-200">
                  <DropdownMenuItem disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleSignIn} 
                className="text-white bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Sign In
              </Button>
            )}

            {/* Animated Cart Button */}
            <Button 
              variant="ghost" 
              className="relative text-white hover:bg-white/15 rounded-full w-11 h-11 transition-all duration-300 hover:scale-110 group"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white min-w-5 h-5 flex items-center justify-center text-xs p-1 animate-pulse shadow-lg">
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
