"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("ZapLink runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="p-8 max-w-md w-full text-center backdrop-blur-xl border-border shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 ring-8 ring-rose-500/5">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl font-bold">Something went wrong</CardTitle>
        <CardDescription className="text-xs mt-2 leading-relaxed">
          An unexpected system error occurred while processing your request.
        </CardDescription>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => reset()} className="w-full gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
          <Link href="/" className="w-full">
            <Button variant="glow" className="w-full gap-2 text-xs">
              <Home className="h-3.5 w-3.5" />
              <span>Back Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
