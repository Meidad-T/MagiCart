
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-blue-800/80 backdrop-blur border-b border-blue-400/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-white hover:bg-white/10 hover:text-blue-100 transition-colors px-2 h-auto"
            >
              <img 
                src="/lovable-uploads/626c14cb-fdb3-4472-8f02-7f33de90f3e0.png" 
                alt="MagiCart Logo" 
                className="h-12 w-12 transform scale-x-[-1]"
                loading="eager"
              />
              <span className="text-3xl font-bold">MagiCart</span>
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
          <div className="flex items-center space-x-2">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative text-white hover:bg-white/10 rounded-full w-10 h-10">
                    <User className="h-5 w-5" />
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
              <Button onClick={handleSignIn} className="text-white bg-white/10 hover:bg-white/20">
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <Button 
              variant="ghost" 
              className="relative text-white hover:bg-white/10 rounded-full w-10 h-10"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white min-w-5 h-5 flex items-center justify-center text-xs p-1">
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
