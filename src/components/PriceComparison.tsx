import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, RefreshCw, Check, X } from "lucide-react";

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface PriceComparisonProps {
  storeTotals: StoreTotalData[];
  cart: Array<any>;
  onUpdateCart: (updatedCart: Array<any>) => void;
}

interface SubstitutionItem {
  originalItem: string;
  substituteItem: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const PriceComparison = ({ storeTotals, cart, onUpdateCart }: PriceComparisonProps) => {
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [showRejectWarning, setShowRejectWarning] = useState<string | null>(null);
  const [substitutions, setSubstitutions] = useState<Record<string, SubstitutionItem[]>>({});

  // Define which items are unavailable at which stores and their substitutes
  const getUnavailableItems = (storeKey: string) => {
    // Get all Great Value items from cart (these are Walmart exclusive)
    const greatValueItems = cart
      .filter(item => item.name.toLowerCase().includes('great value'))
      .map(item => item.name);

    const storeSpecificUnavailable: Record<string, string[]> = {
      'aldi': [
        'DiGiorno Rising Crust Three Meat Pizza', 
        'Stouffers Lasagna with Meat & Sauce',
        'Hungry-Man Boneless Fried Chicken',
        'Marie Callenders Chicken Pot Pie'
      ],
      'sams': [
        'DiGiorno Rising Crust Three Meat Pizza', 
        'Farm Rich Mozzarella Sticks',
        'Lean Cuisine Chicken Fettuccine Alfredo',
        'Healthy Choice Cafe Steamers Grilled Chicken Marinara'
      ],
      'heb': [
        'DiGiorno Rising Crust Four Cheese Pizza', 
        'Farm Rich Mozzarella Sticks', 
        'Hungry-Man Boneless Fried Chicken'
      ],
      'kroger': [
        'DiGiorno Rising Crust Four Cheese Pizza',
        'DiGiorno Stuffed Crust Pepperoni Pizza',
        'Amys Mexican Casserole Bowl'
      ],
      'target': [
        'Red Baron Four Meat Classic Crust Pizza',
        'Devour Sweet & Smoky BBQ Meatballs'
      ],
      'walmart': [] // Walmart has everything including Great Value
    };

    // For non-Walmart stores, Great Value items are ALWAYS unavailable
    if (storeKey !== 'walmart') {
      const unavailable = new Set([...(storeSpecificUnavailable[storeKey] || []), ...greatValueItems]);
      return Array.from(unavailable);
    }
    return storeSpecificUnavailable[storeKey] || [];
  };

  // Define substitution mappings for items that are unavailable
  const getSubstituteItem = (originalItem: string, storeKey: string) => {
    // Handle Great Value substitutions first (for non-Walmart stores)
    if (originalItem.toLowerCase().includes('great value') && storeKey !== 'walmart') {
      // Use one SENSIBLE fallback substitute for all Great Value items:
      // If a specific mapping, use it, otherwise default
      const greatValueSubstitutions: Record<string, string> = {
        'Great Value Chicken Alfredo Pasta': 'Stouffers Lasagna with Meat & Sauce',
        'Great Value Enchiladas & Spanish Rice': 'Amys Mexican Casserole Bowl',
        'Great Value Onion Rings': 'Ore-Ida Golden Crinkles French Fries'
      };
      return greatValueSubstitutions[originalItem] || 'Stouffers Lasagna with Meat & Sauce';
    }

    // Store-specific substitution mappings for non-Great Value items
    const substituteMappings: Record<string, Record<string, string>> = {
      'aldi': {
        'DiGiorno Rising Crust Three Meat Pizza': 'DiGiorno Rising Crust Pepperoni Pizza',
        'Stouffers Lasagna with Meat & Sauce': 'Lean Cuisine Chicken Fettuccine Alfredo',
        'Hungry-Man Boneless Fried Chicken': 'Banquet Mega Bowls Buffalo Chicken Mac & Cheese',
        'Marie Callenders Chicken Pot Pie': 'Healthy Choice Cafe Steamers Grilled Chicken Marinara'
      },
      'sams': {
        'DiGiorno Rising Crust Three Meat Pizza': 'DiGiorno Rising Crust Four Cheese Pizza',
        'Farm Rich Mozzarella Sticks': 'TGI Fridays Loaded Potato Skins',
        'Lean Cuisine Chicken Fettuccine Alfredo': 'Stouffers Lasagna with Meat & Sauce',
        'Healthy Choice Cafe Steamers Grilled Chicken Marinara': 'Marie Callenders Chicken Pot Pie'
      },
      'heb': {
        'DiGiorno Rising Crust Four Cheese Pizza': 'DiGiorno Rising Crust Three Meat Pizza',
        'Farm Rich Mozzarella Sticks': 'TGI Fridays Loaded Potato Skins',
        'Hungry-Man Boneless Fried Chicken': 'Banquet Mega Bowls Buffalo Chicken Mac & Cheese'
      },
      'kroger': {
        'DiGiorno Rising Crust Four Cheese Pizza': 'Red Baron Four Cheese Classic Crust Pizza',
        'DiGiorno Stuffed Crust Pepperoni Pizza': 'DiGiorno Rising Crust Pepperoni Pizza',
        'Amys Mexican Casserole Bowl': 'Devour Sweet & Smoky BBQ Meatballs'
      },
      'target': {
        'Red Baron Four Meat Classic Crust Pizza': 'Red Baron Four Cheese Classic Crust Pizza',
        'Devour Sweet & Smoky BBQ Meatballs': 'Banquet Mega Bowls Buffalo Chicken Mac & Cheese'
      },
      'walmart': {}
    };
    return substituteMappings[storeKey]?.[originalItem] || originalItem;
  };

  // Generate substitutions for stores based on actual cart items
  const generateSubstitutions = (storeKey: string): SubstitutionItem[] => {
    if (substitutions[storeKey]) return substitutions[storeKey];

    const unavailableAtStore = getUnavailableItems(storeKey);
    const cartItemNames = cart.map(item => item.name);
    
    const storeSubstitutions: SubstitutionItem[] = [];
    
    // Only create substitutions for items that are both in the cart AND unavailable at this store
    unavailableAtStore.forEach(unavailableItem => {
      if (cartItemNames.includes(unavailableItem)) {
        const substitute = getSubstituteItem(unavailableItem, storeKey);
        storeSubstitutions.push({
          originalItem: unavailableItem,
          substituteItem: substitute,
          status: 'pending'
        });
      }
    });

    setSubstitutions(prev => ({ ...prev, [storeKey]: storeSubstitutions }));
    return storeSubstitutions;
  };

  const getSubstitutionCount = (storeKey: string) => {
    const subs = generateSubstitutions(storeKey);
    return subs.filter(sub => sub.status === 'pending').length;
  };

  const handleSubstitutionAction = (storeKey: string, index: number, action: 'accept' | 'reject') => {
    if (action === 'reject') {
      setShowRejectWarning(`${storeKey}-${index}`);
      return;
    }

    setSubstitutions(prev => ({
      ...prev,
      [storeKey]: prev[storeKey].map((sub, i) => 
        i === index ? { ...sub, status: 'accepted' as const } : sub
      )
    }));
  };

  const handleRejectConfirm = (storeKey: string, index: number, confirm: boolean) => {
    if (confirm) {
      const substitution = substitutions[storeKey][index];
      
      // Remove item from cart
      const updatedCart = cart.filter(item => item.name !== substitution.originalItem);
      onUpdateCart(updatedCart);
      
      // Mark substitution as rejected
      setSubstitutions(prev => ({
        ...prev,
        [storeKey]: prev[storeKey].map((sub, i) => 
          i === index ? { ...sub, status: 'rejected' as const } : sub
        )
      }));
    }
    
    setShowRejectWarning(null);
  };

  const handleStoreExpand = (storeKey: string) => {
    const subs = getSubstitutionCount(storeKey);
    if (subs > 0) {
      setExpandedStore(expandedStore === storeKey ? null : storeKey);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Store</TableHead>
              <TableHead className="font-semibold">Subtotal</TableHead>
              <TableHead className="font-semibold">Taxes & Fees</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeTotals.map((store, index) => {
              const substitutionCount = getSubstitutionCount(store.storeKey);
              const hasSubstitutions = substitutionCount > 0;
              const storeSubstitutions = substitutions[store.storeKey] || [];
              const isExpanded = expandedStore === store.storeKey;
              
              return (
                <>
                  <TableRow key={store.storeKey} className={index === 0 ? "bg-green-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {store.store}
                        {index === 0 && (
                          <Badge className="ml-2 bg-green-500 text-white text-xs">
                            Best Price!
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-lg">
                      ${store.subtotal}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      ${store.taxesAndFees}
                    </TableCell>
                    <TableCell>
                      {hasSubstitutions ? (
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 text-yellow-500 mr-2" />
                          <Badge 
                            variant="outline" 
                            className="text-yellow-600 border-yellow-300 cursor-pointer hover:bg-yellow-50"
                            onClick={() => handleStoreExpand(store.storeKey)}
                          >
                            {substitutionCount} Sub{substitutionCount > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            In Stock
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded substitution details */}
                  {isExpanded && hasSubstitutions && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-gray-50 p-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 mb-3">Substitution Details:</h4>
                          {storeSubstitutions.map((sub, subIndex) => (
                            <div key={subIndex} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex-1">
                                <div className="text-sm">
                                  <span className="text-red-600 line-through">{sub.originalItem}</span>
                                  <span className="mx-2">→</span>
                                  <span className="text-green-600">{sub.substituteItem}</span>
                                </div>
                              </div>
                              
                              {sub.status === 'pending' && (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => handleSubstitutionAction(store.storeKey, subIndex, 'accept')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleSubstitutionAction(store.storeKey, subIndex, 'reject')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              
                              {sub.status === 'accepted' && (
                                <span className="text-sm text-green-600 font-medium">Substitution Accepted</span>
                              )}
                              
                              {sub.status === 'rejected' && (
                                <span className="text-sm text-red-600 font-medium">Item Removed</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
        
        {/* Reject Warning Modal */}
        {showRejectWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Warning!</h3>
              <p className="text-gray-700 mb-6">
                If you reject this substitution, the item will be removed from your cart.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const [storeKey, index] = showRejectWarning.split('-');
                    handleSubstitutionAction(storeKey, parseInt(index), 'accept');
                    setShowRejectWarning(null);
                  }}
                  className="flex-1"
                >
                  Accept Substitution
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const [storeKey, index] = showRejectWarning.split('-');
                    handleRejectConfirm(storeKey, parseInt(index), true);
                  }}
                  className="flex-1"
                >
                  Reject Anyway
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
