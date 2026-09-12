"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: {
    type?: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    ({
      type = "info",
      title,
      description,
      duration = 4000,
    }: {
      type?: ToastType;
      title: string;
      description?: string;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = React.useCallback(
    (title: string, description?: string) => addToast({ type: "success", title, description }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, description?: string) => addToast({ type: "error", title, description }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, description?: string) => addToast({ type: "info", title, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-lg",
                item.type === "success" &&
                  "border-emerald-500/30 bg-emerald-950/80 text-emerald-100",
                item.type === "error" &&
                  "border-rose-500/30 bg-rose-950/80 text-rose-100",
                item.type === "info" &&
                  "border-indigo-500/30 bg-slate-900/90 text-slate-100"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {item.type === "success" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
                {item.type === "error" && (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                )}
                {item.type === "info" && (
                  <Info className="h-5 w-5 text-indigo-400" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs opacity-80 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
