
import ProductCard from "./ProductCard";
import type { ProductWithPrices } from "@/types/database";

interface ProductFeedProps {
  items: ProductWithPrices[];
  onAddToCart: (item: ProductWithPrices) => void;
}

const ProductFeed = ({ items, onAddToCart }: ProductFeedProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16 text-center animate-slide-up">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
          Discover Amazing 
          <span className="gradient-text block mt-2">Deals & Products</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Compare prices across all major stores and find the best deals on quality products
        </p>
        <div className="mt-8 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard
              item={item}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <h3 className="text-2xl font-playfair font-semibold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or check back later for new arrivals.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFeed;
