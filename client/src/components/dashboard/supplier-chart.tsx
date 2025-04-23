import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TopSupplier } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format-currency";

interface SupplierChartProps {
  title: string;
  subtitle: string;
  suppliers: TopSupplier[];
  isLoading?: boolean;
}

export function SupplierChart({ title, subtitle, suppliers, isLoading = false }: SupplierChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-foreground">{supplier.name}</div>
                  <div className="text-sm font-medium text-foreground">
                    {formatCurrency(supplier.total)}
                  </div>
                </div>
                <Progress value={supplier.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
