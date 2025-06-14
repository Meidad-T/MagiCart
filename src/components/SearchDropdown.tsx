
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Item {
  id: number;
  item: string;
  category: string;
  walmart_price: number;
  heb_price: number;
  aldi_price: number;
  target_price: number;
  kroger_price: number;
  sams_price: number;
  unit: string;
}

interface SearchDropdownProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
}

const SearchDropdown = ({ items, onAddToCart }: SearchDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = items.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddToCart = (item: Item, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCart(item);
  };

  // Find the best price for each item
  const getBestPrice = (item: Item) => {
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
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
        <Input
          placeholder="Search for groceries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-16 pr-6 py-6 text-lg h-16 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-lg bg-white"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-4 max-h-96 overflow-y-auto z-50 shadow-2xl border-2 bg-white">
          <CardContent className="p-0">
            {filteredItems.map(item => {
              const bestPrice = getBestPrice(item);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{item.item}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-green-600">
                        From ${bestPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {item.unit}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 ml-4 rounded-full"
                    onClick={(e) => handleAddToCart(item, e)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
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
