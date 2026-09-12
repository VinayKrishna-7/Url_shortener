"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="iconSm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 hover:-rotate-12 transition-transform" />
      )}
    </Button>
  );
}
