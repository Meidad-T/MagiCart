
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-gray-900 hover:bg-transparent"
            >
              Smart Cart
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
                  <Button variant="ghost" className="relative">
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
              <Button variant="ghost" onClick={handleSignIn}>
                <User className="h-6 w-6 mr-2" />
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <Button 
              variant="ghost" 
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
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
