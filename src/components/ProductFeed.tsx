
import ProductCard from "./ProductCard";
import type { ProductWithPrices } from "@/types/database";
import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFeedProps {
  items: ProductWithPrices[];
  onAddToCart: (item: ProductWithPrices) => void;
}

const ProductFeed = ({ items, onAddToCart }: ProductFeedProps) => {
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">("price-asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for header animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  // Get unique categories with proper capitalization
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(item => item.category.name)));
    return uniqueCategories.sort().map(category => 
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    );
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        (item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1).toLowerCase()) === selectedCategory
      );
    }

    // Sort items by price only
    const sorted = [...filtered].sort((a, b) => {
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

      const priceA = getBestPrice(a);
      const priceB = getBestPrice(b);

      if (sortBy === "price-asc") {
        return priceA - priceB;
      } else if (sortBy === "price-desc") {
        return priceB - priceA;
      }

      return 0;
    });

    return sorted;
  }, [items, sortBy, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div 
        ref={headerRef}
        className={`mb-8 flex justify-between items-center transform transition-all duration-700 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Products</h2>
          <p className="text-gray-600">Compare prices across all stores and find the best deals</p>
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">
                Sort {sortBy === "price-asc" ? "↑" : "↓"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredAndSortedItems.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      
      {filteredAndSortedItems.length === 0 && (
        <div className="text-center py-12 animate-in fade-in-0 duration-500">
          <p className="text-gray-500 text-lg">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ProductFeed;
