
import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
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
  selectedStore: string;
}

const storeNames = {
  walmart: "Walmart",
  heb: "H-E-B", 
  aldi: "Aldi",
  target: "Target",
  kroger: "Kroger",
  sams: "Sam's Club"
};

const SearchDropdown = ({ items, onAddToCart, selectedStore }: SearchDropdownProps) => {
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

  const handleAddToCart = (item: Item) => {
    onAddToCart(item);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
        <Input
          placeholder="Search for groceries, categories, or brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-4 text-lg h-14 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-lg"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-xl border-2">
          <CardContent className="p-0">
            {filteredItems.map(item => {
              const currentPrice = item[`${selectedStore}_price` as keyof Item] as number;
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                  onClick={() => handleAddToCart(item)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.item}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        ${currentPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        at {storeNames[selectedStore as keyof typeof storeNames]}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
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
