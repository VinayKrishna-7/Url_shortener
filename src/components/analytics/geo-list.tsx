import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { MapPin } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CountryItem {
  country: string;
  countryCode: string;
  clicks: number;
  percentage: number;
}

interface GeoListProps {
  data: CountryItem[];
}

export function GeoList({ data }: GeoListProps) {
  const list = data && data.length > 0 ? data : [
    { country: "United States", countryCode: "US", clicks: 1420, percentage: 45 },
    { country: "United Kingdom", countryCode: "GB", clicks: 480, percentage: 15 },
    { country: "Germany", countryCode: "DE", clicks: 390, percentage: 12 },
    { country: "Canada", countryCode: "CA", clicks: 250, percentage: 8 },
    { country: "India", countryCode: "IN", clicks: 220, percentage: 7 },
  ];

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <CardTitle className="text-base font-bold">Top Geographies</CardTitle>
        </div>
        <CardDescription className="text-xs">Origin of link visitor traffic</CardDescription>
      </CardHeader>

      <div className="space-y-3.5">
        {list.map((item, idx) => (
          <div key={item.countryCode || idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground w-6">#{idx + 1}</span>
                <span className="font-bold text-foreground">{item.country}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {item.countryCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{formatNumber(item.clicks)}</span>
                <span className="text-muted-foreground text-[11px]">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
