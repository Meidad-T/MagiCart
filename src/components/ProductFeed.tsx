
import ProductCard from "./ProductCard";

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

interface ProductFeedProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
}

const ProductFeed = ({ items, onAddToCart }: ProductFeedProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Products</h2>
        <p className="text-gray-600">Compare prices across all stores and find the best deals</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductFeed;
