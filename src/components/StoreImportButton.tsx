
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { importHebStores } from "@/utils/importHebStores";

export const StoreImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importHebStores();
      toast.success(`Successfully imported ${result.count} H-E-B stores!`);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import H-E-B stores. Check console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={isImporting}
      variant="outline"
    >
      {isImporting ? 'Importing H-E-B Stores...' : 'Import H-E-B Stores'}
    </Button>
  );
};
