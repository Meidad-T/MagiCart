
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

  // Get available stores for this product
  const getAvailableStores = (item: ProductWithPrices) => {
    const stores = [];
    if (item.walmart_price > 0) stores.push({ name: 'walmart', logo: 'https://logos-world.net/wp-content/uploads/2020/08/Walmart-Logo.png' });
    if (item.heb_price > 0) stores.push({ name: 'heb', logo: 'https://logos-world.net/wp-content/uploads/2021/03/HEB-Logo.png' });
    if (item.aldi_price > 0) stores.push({ name: 'aldi', logo: 'https://logos-world.net/wp-content/uploads/2020/12/Aldi-Logo.png' });
    if (item.target_price > 0) stores.push({ name: 'target', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Target-Logo.png' });
    if (item.kroger_price > 0) stores.push({ name: 'kroger', logo: 'https://logos-world.net/wp-content/uploads/2020/09/Kroger-Logo.png' });
    if (item.sams_price > 0) stores.push({ name: 'sams', logo: 'https://logos-world.net/wp-content/uploads/2020/09/Sams-Club-Logo.png' });
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
