"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { formatDate } from "@/lib/utils";

interface TimeSeriesPoint {
  date: string;
  clicks: number;
  uniqueVisitors: number;
}

interface ClicksChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  description?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-300 mb-1.5">{formatDate(label)}</p>
        <div className="space-y-1 text-xs">
          <p className="flex items-center gap-2 text-indigo-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Clicks: <span className="font-bold text-white">{payload[0]?.value ?? 0}</span>
          </p>
          {payload[1] && (
            <p className="flex items-center gap-2 text-cyan-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Unique Visitors: <span className="font-bold text-white">{payload[1].value}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function ClicksChart({
  data,
  title = "Clicks Over Time",
  description = "Real-time traffic and unique visitor performance",
}: ClicksChartProps) {
  const [range, setRange] = React.useState<"7d" | "30d" | "all">("30d");

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (range === "7d") return data.slice(-7);
    if (range === "30d") return data.slice(-30);
    return data;
  }, [data, range]);

  return (
    <Card className="p-4 sm:p-5">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
        </div>

        {/* Range Selector */}
        <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs font-medium">
          <button
            onClick={() => setRange("7d")}
            className={`rounded-md px-2 py-0.5 text-xs transition-all ${
              range === "7d"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`rounded-md px-2 py-0.5 text-xs transition-all ${
              range === "30d"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setRange("all")}
            className={`rounded-md px-2 py-0.5 text-xs transition-all ${
              range === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
        </div>
      </CardHeader>

      <div className="h-[200px] sm:h-[220px] w-full pt-2">
        {filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No click data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  try {
                    const d = new Date(val);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  } catch {
                    return val;
                  }
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#clicksGrad)"
                name="Clicks"
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#visitorsGrad)"
                name="Unique Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
