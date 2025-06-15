
export interface StoreHours {
  open: string;
  close: string;
}

export const STORE_HOURS: Record<string, StoreHours> = {
  'Target': { open: '08:00', close: '22:00' },
  'H-E-B': { open: '06:00', close: '23:00' },
  'HEB': { open: '06:00', close: '23:00' },
  'Sams': { open: '10:00', close: '18:00' },
  "Sam's Club": { open: '10:00', close: '18:00' },
  'Aldi': { open: '09:00', close: '20:00' },
  'Kroger': { open: '06:00', close: '23:00' },
  'Walmart': { open: '08:00', close: '20:00' },
};

export type AlertType = 'success' | 'warning' | 'error';

export interface StoreHoursValidation {
  isOpen: boolean;
  alertType: AlertType;
  message: string;
  canProceed: boolean;
}

export function validateStoreHours(storeName: string, pickupTime: string): StoreHoursValidation {
  // Find matching store hours (case-insensitive partial match)
  const storeKey = Object.keys(STORE_HOURS).find(key => 
    storeName.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(storeName.toLowerCase())
  );
  
  if (!storeKey || !pickupTime) {
    return {
      isOpen: true,
      alertType: 'success',
      message: '',
      canProceed: true
    };
  }

  const hours = STORE_HOURS[storeKey];
  const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
  const [openHour, openMinute] = hours.open.split(':').map(Number);
  const [closeHour, closeMinute] = hours.close.split(':').map(Number);

  const pickupMinutes = pickupHour * 60 + pickupMinute;
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  // Check if before opening
  if (pickupMinutes < openMinutes) {
    const minutesUntilOpen = openMinutes - pickupMinutes;
    if (minutesUntilOpen <= 30) {
      return {
        isOpen: false,
        alertType: 'warning',
        message: `Store opens in ${minutesUntilOpen} minutes. Your pickup time is close to opening.`,
        canProceed: true
      };
    } else {
      return {
        isOpen: false,
        alertType: 'error',
        message: `Store will be closed at your pickup time. ${storeKey} opens at ${formatTime(hours.open)}.`,
        canProceed: false
      };
    }
  }

  // Check if after closing
  if (pickupMinutes > closeMinutes) {
    return {
      isOpen: false,
      alertType: 'error',
      message: `Store will be closed at your pickup time. ${storeKey} closes at ${formatTime(hours.close)}.`,
      canProceed: false
    };
  }

  // Check if close to closing
  const minutesUntilClose = closeMinutes - pickupMinutes;
  if (minutesUntilClose <= 30) {
    return {
      isOpen: true,
      alertType: 'warning',
      message: `Store closes in ${minutesUntilClose} minutes. Your pickup time is close to closing.`,
      canProceed: true
    };
  }

  // All good
  return {
    isOpen: true,
    alertType: 'success',
    message: "You don't have to worry about the store closing. Plenty of time for your pickup!",
    canProceed: true
  };
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}
