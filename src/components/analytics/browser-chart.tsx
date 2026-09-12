"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Globe } from "lucide-react";

interface BrowserData {
  name: string;
  value: number;
  percentage: number;
}

interface BrowserChartProps {
  data: BrowserData[];
}

const BAR_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

export function BrowserChart({ data }: BrowserChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { name: "Chrome", value: 60, percentage: 60 },
    { name: "Safari", value: 22, percentage: 22 },
    { name: "Firefox", value: 10, percentage: 10 },
    { name: "Edge", value: 8, percentage: 8 },
  ];

  return (
    <Card className="p-6 flex flex-col justify-between">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-indigo-400" />
          <CardTitle className="text-base font-bold">Browsers</CardTitle>
        </div>
        <CardDescription className="text-xs">Client software distribution</CardDescription>
      </CardHeader>

      <div className="h-44 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value} clicks`, "Traffic"]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                color: "#fff",
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5 mt-2 pt-2 border-t border-border/60">
        {chartData.slice(0, 3).map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-bold text-foreground">
              {item.percentage ? `${item.percentage.toFixed(1)}%` : `${item.value}`}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
