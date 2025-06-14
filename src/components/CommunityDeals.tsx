
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MapPin, Clock } from "lucide-react";

const CommunityDeals = () => {
  const deals = [
    {
      store: "Walmart",
      item: "Ground Turkey (1 lb)",
      originalPrice: "$4.98",
      dealPrice: "$2.99",
      savings: "$1.99",
      verified: true,
      snapEligible: true,
      location: "Main St Store",
      timeAgo: "2 hours ago",
      upvotes: 12
    },
    {
      store: "H-E-B",
      item: "Whole Wheat Bread",
      originalPrice: "$2.48",
      dealPrice: "$1.25",
      savings: "$1.23",
      verified: true,
      snapEligible: true,
      location: "Downtown",
      timeAgo: "4 hours ago",
      upvotes: 8
    },
    {
      store: "Aldi",
      item: "Bananas (3 lbs)",
      originalPrice: "$1.99",
      dealPrice: "$0.99",
      savings: "$1.00",
      verified: false,
      snapEligible: true,
      location: "Westside",
      timeAgo: "6 hours ago",
      upvotes: 15
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Deals</h2>
          <p className="text-gray-600">Real-time deals shared by our community</p>
        </div>
        <Button variant="outline">Submit a Deal</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deals.map((deal, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{deal.item}</CardTitle>
                  <p className="text-sm text-gray-600">{deal.store}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {deal.verified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Verified
                    </Badge>
                  )}
                  {deal.snapEligible && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      SNAP
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        {deal.dealPrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {deal.originalPrice}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      Save {deal.savings}
                    </p>
                  </div>
                  
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {deal.upvotes}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {deal.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {deal.timeAgo}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityDeals;
