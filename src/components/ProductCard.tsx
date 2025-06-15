
import { ShoppingCart, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ProductWithPrices } from "@/types/database";

interface ProductCardProps {
  item: ProductWithPrices;
  onAddToCart: (item: ProductWithPrices) => void;
}

const ProductCard = ({ item, onAddToCart }: ProductCardProps) => {
  const [showAllStores, setShowAllStores] = useState(false);

  // Find the best price for each item
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

  const bestPrice = getBestPrice(item);

  // Get available stores for this product with updated logos
  const getAvailableStores = (item: ProductWithPrices) => {
    const stores = [];
    if (item.walmart_price > 0) stores.push({ 
      name: 'walmart', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSA49zzU6Xh1gUBZdrOVKb6wL0A_Y1zrlmw&s',
      price: item.walmart_price
    });
    if (item.heb_price > 0) stores.push({ 
      name: 'heb', 
      logo: 'https://i.pinimg.com/736x/82/21/0a/82210a6b7169e420956284f80a2f71d0.jpg',
      price: item.heb_price
    });
    if (item.aldi_price > 0) stores.push({ 
      name: 'aldi', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWykpVvw51CCXNUut3oNfgsJ1T7u9RQBK0bQ&s',
      price: item.aldi_price
    });
    if (item.target_price > 0) stores.push({ 
      name: 'target', 
      logo: 'https://corporate.target.com/getmedia/e8be5e84-10ca-4b98-9b6c-eb3ee8cd6d1b/Target_Bullseye-Logo_Red.png',
      price: item.target_price
    });
    if (item.kroger_price > 0) stores.push({ 
      name: 'kroger', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSacwkiztC747C6ZcQVa5_g0iSbq7O0sNEaoQ&s',
      price: item.kroger_price
    });
    if (item.sams_price > 0) stores.push({ 
      name: 'sams', 
      logo: 'https://brandlogos.net/wp-content/uploads/2012/11/sams-club-vector-logo.png',
      price: item.sams_price
    });
    return stores;
  };

  const availableStores = getAvailableStores(item);
  const storesToShow = availableStores.slice(0, 2);
  const remainingCount = availableStores.length - 2;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90 text-gray-700 backdrop-blur-sm"
          >
            {item.category.name}
          </Badge>
          
          {/* Store Availability Logos */}
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-20">
            {storesToShow.map((store, index) => (
              <div
                key={`${store.name}-${index}`}
                className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center"
                title={`Available at ${store.name.charAt(0).toUpperCase() + store.name.slice(1)} - $${store.price.toFixed(2)}`}
              >
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllStores(!showAllStores);
                }}
                className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm border border-gray-200 flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                title={`Click to see all ${availableStores.length} stores`}
              >
                <span className="text-xs font-medium text-white">+{remainingCount}</span>
              </button>
            )}
          </div>

          {/* Dropdown for all stores */}
          {showAllStores && (
            <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 min-w-48">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">All Stores</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllStores(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="h-3 w-3 rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableStores.map((store, index) => (
                  <div
                    key={`${store.name}-dropdown-${index}`}
                    className="flex flex-col items-center space-y-1"
                    title={`${store.name.charAt(0).toUpperCase() + store.name.slice(1)} - $${store.price.toFixed(2)}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                      <img
                        src={store.logo}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-green-600">${store.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-lg font-bold text-green-600">
                From ${bestPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per {item.unit}</p>
            </div>
            <div className="text-xs text-gray-400">
              {availableStores.length} store{availableStores.length !== 1 ? 's' : ''}
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors duration-200"
            onClick={() => onAddToCart(item)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
