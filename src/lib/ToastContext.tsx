import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500); // Auto close after 4.5s
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-[350px] pointer-events-none">
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-blue-500" />;
          let borderClass = "border-blue-100";
          let bgClass = "bg-white/95 border-l-4 border-l-blue-500 shadow-blue-500/5";
          
          if (toast.type === "success") {
            icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
            borderClass = "border-emerald-100";
            bgClass = "bg-white/95 border-l-4 border-l-emerald-500 shadow-emerald-500/5";
          } else if (toast.type === "error") {
            icon = <AlertCircle className="w-5 h-5 text-red-500" />;
            borderClass = "border-red-100";
            bgClass = "bg-white/95 border-l-4 border-l-red-500 shadow-red-500/5";
          } else if (toast.type === "warning") {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            borderClass = "border-amber-100";
            bgClass = "bg-white/95 border-l-4 border-l-amber-500 shadow-amber-500/5";
          }

          return (
            <div
              key={toast.id}
              className={`animate-toast-in pointer-events-auto flex items-start gap-3 p-4 rounded-r-xl rounded-l-md border ${borderClass} ${bgClass} backdrop-blur-md shadow-lg text-slate-800 transition-all duration-300`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-semibold leading-relaxed break-words pr-2">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
