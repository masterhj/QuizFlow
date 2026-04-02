import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
}

const typeConfig = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, type, message, onClose }, ref) => {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20, x: 100 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 100 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        className={cn(
          "flex items-center gap-3 rounded-lg border p-4",
          config.bg,
          config.border
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />
        <span className="flex-1 text-sm font-medium text-slate-900">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-black/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        )}
      </motion.div>
    );
  }
);

Toast.displayName = "Toast";

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={() => onClose(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

ToastContainer.displayName = "ToastContainer";
