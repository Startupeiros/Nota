import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryDistribution } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format-currency";
import { 
  Building, 
  Computer, 
  Wrench, 
  Package, 
  FileBox, 
  LucideIcon 
} from "lucide-react";

interface CategoryChartProps {
  title: string;
  subtitle: string;
  categories: CategoryDistribution[];
  isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "building": Building,
  "computer": Computer,
  "service": Wrench,
  "archive": Package,
  "folder": FileBox
};

export function CategoryChart({ title, subtitle, categories, isLoading = false }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/50 rounded-lg p-4 text-center flex flex-col items-center space-y-2 animate-pulse">
                <div className="bg-primary/20 rounded-full p-3 mb-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-6 w-12 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || FileBox;
              
              return (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                    <Icon className="text-primary h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
                  <p className="mt-1 text-lg font-semibold text-primary">{category.percentage.toFixed(0)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(category.total)}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
