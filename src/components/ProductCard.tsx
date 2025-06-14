
import { ShoppingCart } from "lucide-react";
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

interface ProductCardProps {
  item: Item;
  onAddToCart: (item: Item) => void;
}

const ProductCard = ({ item, onAddToCart }: ProductCardProps) => {
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

  // Generate placeholder image based on category
  const getPlaceholderImage = (category: string) => {
    const imageMap = {
      'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      'produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'bakery': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop',
      'meat': 'https://images.unsplash.com/photo-1448907503123-67254d59ca4f?w=300&h=200&fit=crop',
      'pantry': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
      'drink': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=300&h=200&fit=crop',
      'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop'
    };
    return imageMap[category as keyof typeof imageMap] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop';
  };

  const bestPrice = getBestPrice(item);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={getPlaceholderImage(item.category)}
            alt={item.item}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90 text-gray-700"
          >
            {item.category}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {item.item}
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
