import * as React from "react";
import { Card } from "../ui/card";
import { MetricCountUp } from "../shared/metric-countup";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  period?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function KpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  period = "vs last 30 days",
  icon: Icon,
  iconColor = "text-primary bg-primary/10",
}: KpiCardProps) {
  const isPositive = typeof change === "number" && change >= 0;

  return (
    <Card className="p-5 relative overflow-hidden transition-all hover:border-primary/40 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          <MetricCountUp value={value} prefix={prefix} suffix={suffix} />
        </div>

        {typeof change === "number" && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
            </span>
            <span className="text-muted-foreground">{period}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
