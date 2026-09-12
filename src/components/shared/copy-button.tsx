"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "glow" | "glass";
  size?: "default" | "sm" | "lg" | "icon" | "iconSm";
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  text,
  className,
  variant = "outline",
  size = "iconSm",
  label,
  copiedLabel = "Copied!",
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-https / older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all",
        copied && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
        className
      )}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            {label && <span className="text-xs font-semibold">{copiedLabel}</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            {label && <span className="text-xs">{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
