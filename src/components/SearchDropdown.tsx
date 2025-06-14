
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react";
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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search for groceries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-2 h-10 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-2xl border bg-white">
          <CardContent className="p-0">
            {filteredItems.map(item => {
              const bestPrice = getBestPrice(item);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        From ${bestPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {item.unit}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 ml-3 text-xs px-2 py-1 h-7"
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
