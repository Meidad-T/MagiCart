
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

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
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
            className="absolute top-2 left-2 bg-white/90 text-gray-700"
          >
            {item.category.name}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-green-600">
                From ${bestPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per {item.unit}</p>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-blue-500 hover:bg-blue-600"
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
