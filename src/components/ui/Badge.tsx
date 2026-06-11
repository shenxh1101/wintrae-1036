import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "rarity";
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  className?: string;
}

const Badge = ({ children, variant = "default", rarity, className }: BadgeProps) => {
  const variants = {
    default: "bg-gold-700/30 text-gold-300 border-gold-600/50",
    success: "bg-accent-green/20 text-accent-green border-accent-green/50",
    warning: "bg-accent-orange/20 text-accent-orange border-accent-orange/50",
    danger: "bg-accent-red/20 text-accent-red border-accent-red/50",
    info: "bg-accent-blue/20 text-accent-blue border-accent-blue/50",
    rarity: "",
  };

  const rarityColors = {
    common: "bg-rarity-common/20 text-rarity-common border-rarity-common/50",
    uncommon: "bg-rarity-uncommon/20 text-rarity-uncommon border-rarity-uncommon/50",
    rare: "bg-rarity-rare/20 text-rarity-rare border-rarity-rare/50",
    epic: "bg-rarity-epic/20 text-rarity-epic border-rarity-epic/50",
    legendary: "bg-rarity-legendary/20 text-rarity-legendary border-rarity-legendary/50",
  };

  const bgClass = variant === "rarity" && rarity 
    ? rarityColors[rarity] 
    : variants[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border",
        bgClass,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
