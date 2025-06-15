
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithPrices } from "@/types/database";

interface ProductCardProps {
  item: ProductWithPrices;
  onAddToCart: (item: ProductWithPrices) => void;
}

const ProductCard = ({ item, onAddToCart }: ProductCardProps) => {
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
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSA49zzU6Xh1gUBZdrOVKb6wL0A_Y1zrlmw&s' 
    });
    if (item.heb_price > 0) stores.push({ 
      name: 'heb', 
      logo: 'data:image/png;base64,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' 
    });
    if (item.aldi_price > 0) stores.push({ 
      name: 'aldi', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWykpVvw51CCXNUut3oNfgsJ1T7u9RQBK0bQ&s' 
    });
    if (item.target_price > 0) stores.push({ 
      name: 'target', 
      logo: 'https://gimgs2.nohat.cc/thumb/f/640/target-logo-target-corporation-logo-retail-bullseye-sales-target-logo-transparent-background-png-clipart--comhiclipartigfyx.jpg' 
    });
    if (item.kroger_price > 0) stores.push({ 
      name: 'kroger', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSacwkiztC747C6ZcQVa5_g0iSbq7O0sNEaoQ&s' 
    });
    if (item.sams_price > 0) stores.push({ 
      name: 'sams', 
      logo: 'https://brandlogos.net/wp-content/uploads/2012/11/sams-club-vector-logo.png' 
    });
    return stores;
  };

  // Randomize and limit stores to display
  const getRandomizedStores = (stores: Array<{name: string, logo: string}>) => {
    // Create a copy and shuffle
    const shuffled = [...stores].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const availableStores = getAvailableStores(item);
  const randomizedStores = getRandomizedStores(availableStores);
  const storesToShow = randomizedStores.slice(0, 2);
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
          
          {/* Store Availability Logos - Randomized with max 2 + "+X" */}
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-20">
            {storesToShow.map((store, index) => (
              <div
                key={`${store.name}-${index}`}
                className="w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center"
                title={`Available at ${store.name.charAt(0).toUpperCase() + store.name.slice(1)}`}
              >
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="w-4 h-4 object-contain"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <div 
                className="w-6 h-6 rounded-full bg-gray-100 shadow-sm border border-gray-200 flex items-center justify-center"
                title={`Available at ${remainingCount} more store${remainingCount !== 1 ? 's' : ''}`}
              >
                <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
              </div>
            )}
          </div>
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
