import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeButton?: boolean;
}

const sizeClasses = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = "md",
      closeButton = true,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
          document.removeEventListener("keydown", handleEscape);
          document.body.style.overflow = "unset";
        };
      }
    }, [isOpen, onClose]);

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                "bg-white rounded-lg shadow-lg",
                sizeClasses[size]
              )}
              {...props}
            >
              {/* Header */}
              {(title || closeButton) && (
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                  {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
                  {!title && <div />}
                  {closeButton && (
                    <button
                      onClick={onClose}
                      className="rounded-md p-1 hover:bg-slate-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5 text-slate-500" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = "Modal";
