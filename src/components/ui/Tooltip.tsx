import { cn } from "@/lib/utils";
import { useState } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip = ({
  content, children, position = "top", className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gold-700",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gold-700",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gold-700",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gold-700",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm bg-bg-card border border-gold-700/50 rounded-lg shadow-gold-sm whitespace-nowrap animate-fade-in",
            positions[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrowPositions[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
