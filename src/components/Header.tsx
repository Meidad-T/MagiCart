
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 border-b border-blue-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-white hover:bg-blue-400/20 transition-colors"
            >
              <img 
                src="/lovable-uploads/4e5632ea-f067-443b-b9a9-f6406dfbb683.png" 
                alt="MagiCart Logo" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold">MagiCart</span>
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
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative text-white hover:bg-blue-400/20">
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
              <Button variant="ghost" onClick={handleSignIn} className="text-white hover:bg-blue-400/20">
                <User className="h-6 w-6 mr-2" />
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <Button 
              variant="ghost" 
              className="relative text-white hover:bg-blue-400/20"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white min-w-5 h-5 flex items-center justify-center text-xs">
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
