import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  footerText?: string;
  footerLink?: string;
  footerLinkColor?: string;
  onFooterClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-primary/20",
  iconColor = "text-primary",
  footerText,
  footerLink,
  footerLinkColor = "text-primary hover:text-primary-600",
  onFooterClick,
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
          </div>
        </div>
      </CardContent>
      {(footerText || footerLink) && (
        <CardFooter className="bg-muted/50 p-4">
          <div className="text-sm w-full">
            {footerLink ? (
              <button 
                onClick={onFooterClick} 
                className={cn("font-medium w-full text-left", footerLinkColor)}
              >
                {footerLink}
              </button>
            ) : (
              <span className="text-muted-foreground">{footerText}</span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
