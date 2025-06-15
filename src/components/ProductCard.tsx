
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
      logo: 'https://i.pinimg.com/736x/82/21/0a/82210a6b7169e420956284f80a2f71d0.jpg' 
    });
    if (item.aldi_price > 0) stores.push({ 
      name: 'aldi', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWykpVvw51CCXNUut3oNfgsJ1T7u9RQBK0bQ&s' 
    });
    if (item.target_price > 0) stores.push({ 
      name: 'target', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKNmB5nJUsmZrzYReef02aW3lauKEKeAYAyw&s' 
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
    <Card className="group card-hover relative overflow-hidden bg-white border-0 shadow-md rounded-2xl">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <img 
            src={item.image_url}
            alt={item.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Badge 
            variant="secondary" 
            className="absolute top-4 left-4 bg-white/95 text-gray-700 backdrop-blur-sm border-0 shadow-md font-medium px-3 py-1 rounded-full"
          >
            {item.category.name}
          </Badge>
          
          {/* Store Availability Logos - Randomized with max 2 + "+X" */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-2 max-w-20">
            {storesToShow.map((store, index) => (
              <div
                key={`${store.name}-${index}`}
                className="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
                title={`Available at ${store.name.charAt(0).toUpperCase() + store.name.slice(1)}`}
              >
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg border-2 border-white flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
                title={`Available at ${remainingCount} more store${remainingCount !== 1 ? 's' : ''}`}
              >
                <span className="text-xs font-bold text-white">+{remainingCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="font-playfair font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] text-lg leading-tight group-hover:text-blue-700 transition-colors duration-200">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <p className="text-2xl font-bold text-green-600 mb-1">
                ${bestPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 font-medium">per {item.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Available at</p>
              <p className="text-sm font-semibold text-gray-600">
                {availableStores.length} store{availableStores.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 group-hover:from-indigo-600 group-hover:to-indigo-700"
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
