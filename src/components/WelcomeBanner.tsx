
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign } from "lucide-react";

const WelcomeBanner = () => {
  const hasActivePlan = false; // This would come from user state

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-none shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Smart Cart! 👋
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Compare prices across stores, plan SNAP-friendly meals, and save money on every trip.
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <DollarSign className="h-5 w-5 mr-1" />
              <span>Average savings: $47/month</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            {hasActivePlan ? (
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Continue Your Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Planning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <p className="text-sm text-gray-500 text-center">
              Free to use • SNAP/EBT friendly
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
