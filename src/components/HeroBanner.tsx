
import { ShoppingCart, Star, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='27' cy='7' r='2'/%3E%3Ccircle cx='47' cy='7' r='2'/%3E%3Ccircle cx='7' cy='27' r='2'/%3E%3Ccircle cx='27' cy='27' r='2'/%3E%3Ccircle cx='47' cy='27' r='2'/%3E%3Ccircle cx='7' cy='47' r='2'/%3E%3Ccircle cx='27' cy='47' r='2'/%3E%3Ccircle cx='47' cy='47' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Zap className="h-5 w-5" />
                <span>Smart Shopping Made Simple</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find the{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Best Deals
                </span>{" "}
                Across All Stores
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Compare prices from Walmart, Target, HEB, ALDI, Kroger, and Sam's Club all in one place. Save time and money with every purchase.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Best Prices</div>
                  <div className="text-sm text-gray-600">Always lowest</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">6 Stores</div>
                  <div className="text-sm text-gray-600">One search</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Save More</div>
                  <div className="text-sm text-gray-600">Every time</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Shopping Now
                <ShoppingCart className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-400 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-in slide-in-from-right duration-700">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
                alt="Shopping cart with groceries"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-3 shadow-lg animate-pulse">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>

            {/* Stats */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl p-6 border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Stores</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">30%</div>
                  <div className="text-sm text-gray-600">Avg Savings</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10k+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
