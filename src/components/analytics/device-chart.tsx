"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Laptop, Smartphone, Tablet } from "lucide-react";

interface DeviceData {
  name: string;
  value: number;
  percentage: number;
}

interface DeviceChartProps {
  data: DeviceData[];
}

const COLORS = ["#6366f1", "#06b6d4", "#f59e0b"];

export function DeviceChart({ data }: DeviceChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { name: "Desktop", value: 65, percentage: 65 },
    { name: "Mobile", value: 30, percentage: 30 },
    { name: "Tablet", value: 5, percentage: 5 },
  ];

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-cyan-400" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-amber-400" />;
      default:
        return <Laptop className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <Card className="p-6 flex flex-col justify-between">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-base font-bold">Devices</CardTitle>
        <CardDescription className="text-xs">Visitor hardware breakdown</CardDescription>
      </CardHeader>

      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} clicks`, name]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                color: "#fff",
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-2 pt-2 border-t border-border/60">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                {getIcon(item.name)}
                {item.name}
              </span>
            </div>
            <span className="font-bold text-foreground">
              {item.percentage ? `${item.percentage.toFixed(1)}%` : `${item.value}`}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
