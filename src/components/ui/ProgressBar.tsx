import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "red" | "blue" | "green" | "gold" | "purple";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ProgressBar = ({
  value,
  max,
  color = "gold",
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const colors = {
    red: "bg-accent-red",
    blue: "bg-accent-blue",
    green: "bg-accent-green",
    gold: "bg-gold-gradient",
    purple: "bg-accent-purple",
  };

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-bg-secondary rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gold-500">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
