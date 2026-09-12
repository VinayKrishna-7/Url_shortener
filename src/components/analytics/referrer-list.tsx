import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Compass, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ReferrerItem {
  source: string;
  clicks: number;
  percentage: number;
}

interface ReferrerListProps {
  data: ReferrerItem[];
}

export function ReferrerList({ data }: ReferrerListProps) {
  const list = data && data.length > 0 ? data : [
    { source: "Google", clicks: 1200, percentage: 35 },
    { source: "X / Twitter", clicks: 850, percentage: 25 },
    { source: "Direct", clicks: 680, percentage: 20 },
    { source: "LinkedIn", clicks: 410, percentage: 12 },
    { source: "GitHub", clicks: 180, percentage: 5 },
  ];

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-indigo-400" />
          <CardTitle className="text-base font-bold">Top Referrers</CardTitle>
        </div>
        <CardDescription className="text-xs">Traffic channels & referring sites</CardDescription>
      </CardHeader>

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div
            key={item.source || idx}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-[11px]">
                {idx + 1}
              </span>
              <span className="font-semibold text-foreground">{item.source}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground font-mono">
                {formatNumber(item.clicks)}
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
