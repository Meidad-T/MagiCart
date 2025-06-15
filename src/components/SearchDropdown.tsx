
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithPrices } from "@/types/database";

interface SearchDropdownProps {
  items: ProductWithPrices[];
  onAddToCart: (item: ProductWithPrices) => void;
}

const SearchDropdown = ({ items, onAddToCart }: SearchDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<ProductWithPrices[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredItems([]);
      setIsOpen(false);
    }
  }, [searchTerm, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (item: ProductWithPrices, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCart(item);
    setSearchTerm("");
    setIsOpen(false);
  };

  const getBestPrice = (item: ProductWithPrices) => {
    const prices = [
      item.walmart_price,
      item.heb_price,
      item.aldi_price,
      item.target_price,
      item.kroger_price,
      item.sams_price
    ];
    return Math.min(...prices);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-full transition-all duration-300 ${
          isFocused ? 'scale-105 shadow-lg' : 'scale-100'
        }`}></div>
        <div className="relative flex items-center">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 ${
            isFocused ? 'text-blue-300 scale-110' : 'text-gray-400'
          }`} />
          <Sparkles className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-300 transition-all duration-300 ${
            isFocused ? 'opacity-100 scale-110' : 'opacity-0'
          }`} />
          <Input
            placeholder="Search for groceries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-12 pr-12 py-3 h-12 rounded-full border-2 border-white/30 focus:border-white/60 focus:ring-white/20 bg-white/90 backdrop-blur-sm text-gray-800 placeholder:text-gray-500 transition-all duration-300 focus:scale-[1.02]"
          />
        </div>
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-3 max-h-96 overflow-y-auto z-50 shadow-2xl border-0 bg-white/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-0">
            {filteredItems.map(item => {
              const bestPrice = getBestPrice(item);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-b last:border-b-0 transition-all duration-200 hover:scale-[1.01] group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-700 transition-colors duration-200">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                        {item.category.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        From ${bestPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {item.unit}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ml-3 text-xs px-3 py-2 h-8 transition-all duration-200 hover:scale-105 shadow-md"
                    onClick={(e) => handleAddToCart(item, e)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchDropdown;
