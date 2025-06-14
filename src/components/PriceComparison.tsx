
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, RefreshCw } from "lucide-react";

interface StoreTotalData {
  store: string;
  storeKey: string;
  subtotal: string;
  taxesAndFees: string;
  total: string;
}

interface PriceComparisonProps {
  storeTotals: StoreTotalData[];
}

export const PriceComparison = ({ storeTotals }: PriceComparisonProps) => {
  // Generate random substitution counts for demo purposes
  const getRandomSubstitutions = () => Math.floor(Math.random() * 3);
  
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
              const substitutions = getRandomSubstitutions();
              const hasSubstitutions = substitutions > 0;
              
              return (
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
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          {substitutions} Sub{substitutions > 1 ? 's' : ''}
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
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-6 flex justify-center">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg">
            <RefreshCw className="h-5 w-5 mr-2" />
            Review Substitutions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
