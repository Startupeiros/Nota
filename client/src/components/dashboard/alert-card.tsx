import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AlertItem {
  icon: LucideIcon;
  message: string;
  variant: "danger" | "warning" | "info";
}

interface AlertCardProps {
  title: string;
  alerts: AlertItem[];
}

export function AlertCard({ title, alerts }: AlertCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const { icon: Icon, message, variant } = alert;
          
          return (
            <div 
              key={index} 
              className={cn(
                "p-4 border-l-4",
                variant === "danger" && "bg-destructive/10 border-destructive",
                variant === "warning" && "bg-amber-500/10 border-amber-500",
                variant === "info" && "bg-primary/10 border-primary"
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <Icon className={cn(
                    "h-5 w-5",
                    variant === "danger" && "text-destructive",
                    variant === "warning" && "text-amber-500",
                    variant === "info" && "text-primary"
                  )} />
                </div>
                <div className="ml-3">
                  <p className={cn(
                    "text-sm",
                    variant === "danger" && "text-destructive-foreground",
                    variant === "warning" && "text-amber-700",
                    variant === "info" && "text-primary-foreground"
                  )}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
