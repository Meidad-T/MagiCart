
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
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
      name: 'Walmart', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSA49zzU6Xh1gUBZdrOVKb6wL0A_Y1zrlmw&s',
      price: item.walmart_price
    });
    if (item.heb_price > 0) stores.push({ 
      name: 'HEB', 
      logo: 'https://i.pinimg.com/736x/82/21/0a/82210a6b7169e420956284f80a2f71d0.jpg',
      price: item.heb_price
    });
    if (item.aldi_price > 0) stores.push({ 
      name: 'ALDI', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWykpVvw51CCXNUut3oNfgsJ1T7u9RQBK0bQ&s',
      price: item.aldi_price
    });
    if (item.target_price > 0) stores.push({ 
      name: 'Target', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKNmB5nJUsmZrzYReef02aW3lauKEKeAYAyw&s',
      price: item.target_price
    });
    if (item.kroger_price > 0) stores.push({ 
      name: 'Kroger', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSacwkiztC747C6ZcQVa5_g0iSbq7O0sNEaoQ&s',
      price: item.kroger_price
    });
    if (item.sams_price > 0) stores.push({ 
      name: "Sam's Club", 
      logo: 'https://brandlogos.net/wp-content/uploads/2012/11/sams-club-vector-logo.png',
      price: item.sams_price
    });
    return stores.sort((a, b) => a.price - b.price); // Sort by price
  };

  const availableStores = getAvailableStores(item);
  const storesToShow = showAllStores ? availableStores : availableStores.slice(0, 2);
  const remainingCount = availableStores.length - 2;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden hover:scale-[1.02] border-0 shadow-md">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-white/95 text-gray-700 backdrop-blur-sm border-0 shadow-md"
          >
            {item.category.name}
          </Badge>
          
          {/* Enhanced Store Availability with gradient +X */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-20">
            {storesToShow.map((store, index) => (
              <div
                key={`${store.name}-${index}`}
                className="w-7 h-7 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center hover:scale-110 transition-transform duration-200"
                title={`${store.name}: $${store.price.toFixed(2)}`}
              >
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && !showAllStores && (
              <button
                onClick={() => setShowAllStores(true)}
                className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-all duration-200 text-white text-xs font-bold"
                title={`Show ${remainingCount} more store${remainingCount !== 1 ? 's' : ''}`}
              >
                +{remainingCount}
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700 transition-colors duration-200">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                From ${bestPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per {item.unit}</p>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span>{availableStores.length} store{availableStores.length !== 1 ? 's' : ''}</span>
              {availableStores.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllStores(!showAllStores)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  {showAllStores ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>

          {/* Store prices when expanded */}
          {showAllStores && availableStores.length > 2 && (
            <div className="space-y-2 pt-3 border-t border-gray-100 animate-in slide-in-from-top duration-300">
              {availableStores.slice(2).map((store, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img src={store.logo} alt={store.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-gray-600">{store.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">${store.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
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
