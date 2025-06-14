
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BarChart3, BookOpen, MapPin } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      title: "Start New Plan",
      description: "Create a shopping list and meal plan",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: BarChart3,
      title: "Compare Stores",
      description: "See prices across local grocery stores",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: BookOpen,
      title: "Saved Plans",
      description: "View your previous shopping plans",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: MapPin,
      title: "Find Stores",
      description: "Locate nearby SNAP-accepting stores",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className={`inline-flex p-3 rounded-full ${action.color} text-white mb-4`}>
              <action.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickActions;
