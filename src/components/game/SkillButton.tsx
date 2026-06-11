import { motion } from "framer-motion";
import type { Skill } from "@/types/game";
import Tooltip from "@/components/ui/Tooltip";
import Badge from "@/components/ui/Badge";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillButtonProps {
  skill: Skill;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

const SkillButton = ({
  skill,
  onClick,
  disabled = false,
  selected = false,
  size = "md",
}: SkillButtonProps) => {
  const isOnCooldown = skill.currentCooldown > 0;

  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-base",
    lg: "w-16 h-16 text-lg",
  };

  const typeColors = {
    damage: "from-accent-red/30 to-accent-red/10 border-accent-red/50",
    heal: "from-accent-green/30 to-accent-green/10 border-accent-green/50",
    buff: "from-gold-500/30 to-gold-500/10 border-gold-500/50",
    debuff: "from-accent-purple/30 to-accent-purple/10 border-accent-purple/50",
    aoe: "from-accent-orange/30 to-accent-orange/10 border-accent-orange/50",
  };

  const typeBadgeColors = {
    damage: "danger",
    heal: "success",
    buff: "default",
    debuff: "info",
    aoe: "warning",
  } as const;

  const typeNames = {
    damage: "伤害",
    heal: "治疗",
    buff: "增益",
    debuff: "减益",
    aoe: "范围",
  };

  const tooltipContent = (
    <div className="space-y-2 text-left min-w-64">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gold-300">{skill.name}</h4>
        <Badge variant={typeBadgeColors[skill.type]}>{typeNames[skill.type]}</Badge>
      </div>
      <p className="text-sm text-gold-400">{skill.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 text-accent-blue">
          <Zap className="w-3 h-3" />
          消耗: {skill.mpCost} MP
        </span>
        <span className="text-gold-500">冷却: {skill.cooldown}回合</span>
        <span className="text-gold-500">范围: {skill.range}格</span>
      </div>
      {isOnCooldown && (
        <div className="text-accent-red text-sm">
          冷却中: 还需 {skill.currentCooldown} 回合
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <motion.button
        whileHover={!disabled && !isOnCooldown ? { scale: 1.1 } : {}}
        whileTap={!disabled && !isOnCooldown ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={disabled || isOnCooldown}
        className={cn(
          sizes[size],
          "relative rounded-xl border-2 flex items-center justify-center font-bold",
          "bg-gradient-to-br transition-all duration-200",
          typeColors[skill.type],
          selected && "ring-2 ring-gold-400 shadow-gold-sm scale-110",
          (disabled || isOnCooldown) && "opacity-50 cursor-not-allowed grayscale",
          !disabled && !isOnCooldown && "cursor-pointer hover:shadow-gold-sm"
        )}
      >
        <span className={cn(isOnCooldown && "line-through opacity-50")}>
          {skill.name.charAt(0)}
        </span>
        {isOnCooldown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <span className="text-xl font-bold text-accent-red">
              {skill.currentCooldown}
            </span>
          </div>
        )}
      </motion.button>
    </Tooltip>
  );
};

export default SkillButton;
