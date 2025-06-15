import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { importHebStores } from "@/utils/importHebStores";
import { importWalmartStores } from "@/utils/importWalmartStores";
import { importTargetStores } from "@/utils/importTargetStores";

export const StoreImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [zipcode, setZipcode] = useState("78701"); // Default Austin zipcode
  const [radius, setRadius] = useState("50");

  const handleHebImport = async () => {
    setIsImporting(true);
    try {
      const result = await importHebStores();
      toast.success(`Successfully imported ${result.count} H-E-B stores!`);
    } catch (error) {
      console.error('H-E-B Import failed:', error);
      toast.error('Failed to import H-E-B stores. Check console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleWalmartImport = async () => {
    setIsImporting(true);
    try {
      const result = await importWalmartStores();
      toast.success(`Successfully imported ${result.count} Walmart stores!`);
    } catch (error) {
      console.error('Walmart Import failed:', error);
      toast.error('Failed to import Walmart stores. Check console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleTargetImport = async () => {
    if (!zipcode.trim()) {
      toast.error('Please enter a zipcode for Target store search');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importTargetStores({
        zipcode: zipcode.trim(),
        radius: parseInt(radius) || 50
      });
      toast.success(`Successfully imported ${result.count} Target stores!`);
    } catch (error) {
      console.error('Target Import failed:', error);
      toast.error('Failed to import Target stores. Check console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Target Import Section */}
      <div className="border p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Import Target Stores</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="zipcode">ZIP Code</Label>
            <Input
              id="zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="78701"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="radius">Radius (miles)</Label>
            <Input
              id="radius"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="50"
              type="number"
            />
          </div>
        </div>
        <Button 
          onClick={handleTargetImport} 
          disabled={isImporting}
          variant="outline"
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Import Target Stores'}
        </Button>
      </div>

      {/* Other Store Imports */}
      <div className="flex gap-2">
        <Button 
          onClick={handleHebImport} 
          disabled={isImporting}
          variant="outline"
        >
          {isImporting ? 'Importing...' : 'Import H-E-B Stores'}
        </Button>
        
        <Button 
          onClick={handleWalmartImport} 
          disabled={isImporting}
          variant="outline"
        >
          {isImporting ? 'Importing...' : 'Import Walmart Stores'}
        </Button>
      </div>
    </div>
  );
};
