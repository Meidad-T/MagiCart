
import { ShoppingCart, Star, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface HeroBannerProps {
  onExploreClick: () => void;
}

const HeroBanner = ({ onExploreClick }: HeroBannerProps) => {
  const handleViewDeals = () => {
    toast({
      title: "Best Deals!",
      description: "Showing you the lowest prices across all stores",
    });
    onExploreClick();
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
                <Star className="h-4 w-4 mr-2" />
                Smart Shopping Experience
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Best Deals
                </span>{" "}
                Across All Stores
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Compare prices instantly from Walmart, Target, HEB, Aldi, Kroger, and Sam's Club. 
                Save money on every grocery trip with our intelligent price comparison.
              </p>
            </div>

            {/* Action Buttons and Text */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={handleViewDeals}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Explore Best Deals
              </Button>
              
              <div className="text-lg text-green-600 font-semibold mt-2">
                🥗 Healthy Choices Available
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">6+</div>
                <div className="text-sm text-gray-600">Major Stores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">30%</div>
                <div className="text-sm text-gray-600">Avg. Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">1000+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Section */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                <Zap className="h-6 w-6" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                <TrendingUp className="h-6 w-6" />
              </div>

              {/* Main Visual */}
              <div className="text-center space-y-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <ShoppingCart className="h-16 w-16 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800">
                  Smart Price Comparison
                </h3>
                
                <p className="text-gray-600">
                  Our AI analyzes prices across all major grocery stores to find you the best deals instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
