
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "@/integrations/supabase/types";

type StoreLocationWithDistance = Database['public']['Tables']['store_locations']['Row'] & { distance: number };

interface StoreLocationPickerProps {
  locations: StoreLocationWithDistance[];
  onSelectLocation: (location: StoreLocationWithDistance) => void;
  triggerButton: React.ReactNode;
}

export const StoreLocationPicker = ({ locations, onSelectLocation, triggerButton }: StoreLocationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (location: StoreLocationWithDistance) => {
    onSelectLocation(location);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a different location</DialogTitle>
          <DialogDescription>
            Here are other nearby locations for this store. Select one to update your pickup spot.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
          {locations.length > 0 ? (
            locations.map((location) => (
              <div
                key={location.id}
                className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleSelect(location)}
              >
                <div className="font-semibold">{location.name}</div>
                <div className="text-sm text-muted-foreground">{location.address_line1}</div>
                <div className="text-sm font-medium text-primary mt-1">{location.distance.toFixed(1)} miles away</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No other locations found nearby.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
