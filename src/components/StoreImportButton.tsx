
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { importHebStores } from "@/utils/importHebStores";
import { importWalmartStores } from "@/utils/importWalmartStores";

export const StoreImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);

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

  return (
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
  );
};
