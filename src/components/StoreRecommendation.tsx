
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Tag } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type StoreLocation = Database['public']['Tables']['store_locations']['Row'];
type StoreWithDistance = StoreLocation & { distance: number };

interface StoreRecommendationProps {
  store: StoreWithDistance;
  onModify: () => void;
  otherStoresCount: number;
  onClick?: () => void;
}

export const StoreRecommendation = ({ store, onModify, otherStoresCount, onClick }: StoreRecommendationProps) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "border-blue-200 bg-blue-50 animate-fade-in",
        onClick && "cursor-pointer hover:border-blue-300 transition-colors"
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-gray-800">Intelligent Recommendation</h3>
            <p className="text-sm text-gray-700">
              Based on your route, we recommend this as the most convenient stop.
            </p>
            
            <div className="p-3 border border-blue-200 rounded-lg bg-white mt-2">
              <div className="font-semibold">{store.name}</div>
              <div className="text-sm text-gray-500">{store.address_line1}</div>
              <div className="text-sm font-medium text-primary mt-1">{store.distance.toFixed(1)} miles away</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-blue-100 mt-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Closest to you</span>
              </div>
              {otherStoresCount > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onModify();
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Pick another location
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
