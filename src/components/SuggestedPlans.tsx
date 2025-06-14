
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, DollarSign } from "lucide-react";

const SuggestedPlans = () => {
  const plans = [
    {
      title: "Meals Under $30",
      description: "5 family meals for the whole week",
      price: "$28.50",
      time: "45 min prep",
      people: "Family of 4",
      snapEligible: true,
      popular: true
    },
    {
      title: "Quick Pickup Essentials",
      description: "Grab-and-go items for busy weeks",
      price: "$15.75",
      time: "10 min shop",
      people: "1-2 people",
      snapEligible: true,
      popular: false
    },
    {
      title: "Healthy on a Budget",
      description: "Nutritious meals without breaking the bank",
      price: "$22.30",
      time: "30 min prep",
      people: "2-3 people",
      snapEligible: true,
      popular: true
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Suggested Plans</h2>
        <Button variant="outline">View All Plans</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                {plan.popular && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {plan.price}
                  </div>
                  {plan.snapEligible && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      SNAP Eligible
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {plan.time}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {plan.people}
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Use This Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPlans;
