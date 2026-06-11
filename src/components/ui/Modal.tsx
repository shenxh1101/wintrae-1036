import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hideCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  hideCloseButton = false,
}: ModalProps) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full bg-card-gradient rounded-xl border border-gold-700/50 shadow-gold-sm z-10 overflow-hidden",
              sizes[size],
              className
            )}
          >
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-gold-800/30">
                {title && (
                  <h2 className="text-xl font-bold text-gold-300 font-serif">{title}</h2>
                )}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-gold-500 hover:text-gold-300 hover:bg-gold-700/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
