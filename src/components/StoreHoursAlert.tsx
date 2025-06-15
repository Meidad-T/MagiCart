
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { validateStoreHours, type AlertType } from "@/utils/storeHours";

interface StoreHoursAlertProps {
  storeName: string;
  pickupTime: string;
}

export default function StoreHoursAlert({ storeName, pickupTime }: StoreHoursAlertProps) {
  const validation = validateStoreHours(storeName, pickupTime);

  if (!validation.message) {
    return null;
  }

  const getAlertVariant = (alertType: AlertType) => {
    switch (alertType) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (alertType: AlertType) => {
    switch (alertType) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getAlertStyles = (alertType: AlertType) => {
    switch (alertType) {
      case 'success':
        return "border-green-200 bg-green-50 text-green-800";
      case 'warning':
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case 'error':
        return "border-red-200 bg-red-50 text-red-800";
    }
  };

  return (
    <Alert 
      variant={getAlertVariant(validation.alertType)} 
      className={getAlertStyles(validation.alertType)}
    >
      {getAlertIcon(validation.alertType)}
      <AlertDescription className="ml-2">
        {validation.message}
      </AlertDescription>
    </Alert>
  );
}

export { validateStoreHours };
