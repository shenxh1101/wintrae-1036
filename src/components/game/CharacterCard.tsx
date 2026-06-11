import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { CLASSES } from "@/data/classes";
import { CLASS_NAMES } from "@/types/game";
import type { Character } from "@/types/game";
import { Heart, Zap, Sword, Shield, Wind, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

const CharacterCard = ({
  character,
  selected = false,
  onClick,
  showDetails = true,
  size = "md",
}: CharacterCardProps) => {
  const classData = CLASSES[character.class];

  const sizes = {
    sm: "w-32 p-3",
    md: "w-48 p-4",
    lg: "w-64 p-5",
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const nameSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.03 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          sizes[size],
          "transition-all duration-300",
          selected && "ring-2 ring-gold-400 shadow-gold",
          onClick && "cursor-pointer"
        )}
      >
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full bg-gold-700/30 flex items-center justify-center border border-gold-600/50",
              iconSizes[size]
            )}>
              {classData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-bold text-gold-300 truncate", nameSizes[size])}>
                {character.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {CLASS_NAMES[character.class]}
                </Badge>
                <span className="text-xs text-gold-500">Lv.{character.level}</span>
              </div>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-accent-red" />
                  <ProgressBar
                    value={character.hp}
                    max={character.maxHp}
                    color="red"
                    showLabel
                    size="sm"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-blue" />
                  <ProgressBar
                    value={character.mp}
                    max={character.maxMp}
                    color="blue"
                    showLabel
                    size="sm"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div className="bg-bg-secondary/50 rounded p-1">
                  <Sword className="w-3 h-3 mx-auto text-gold-400" />
                  <span className="text-gold-300">{character.baseStats.attack}</span>
                </div>
                <div className="bg-bg-secondary/50 rounded p-1">
                  <Shield className="w-3 h-3 mx-auto text-gold-400" />
                  <span className="text-gold-300">{character.baseStats.defense}</span>
                </div>
                <div className="bg-bg-secondary/50 rounded p-1">
                  <Wind className="w-3 h-3 mx-auto text-gold-400" />
                  <span className="text-gold-300">{character.baseStats.speed}</span>
                </div>
                <div className="bg-bg-secondary/50 rounded p-1">
                  <Sparkles className="w-3 h-3 mx-auto text-gold-400" />
                  <span className="text-gold-300">{Math.round(character.baseStats.critRate * 100)}%</span>
                </div>
              </div>

              {character.statusEffects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {character.statusEffects.map((effect) => (
                    <Badge
                      key={effect.id}
                      variant={
                        effect.type === "poison" || effect.type === "burn"
                          ? "danger"
                          : effect.type === "stun"
                          ? "warning"
                          : "success"
                      }
                      className="text-[10px]"
                    >
                      {effect.type === "poison" && "中毒"}
                      {effect.type === "burn" && "灼烧"}
                      {effect.type === "stun" && "眩晕"}
                      {effect.type === "shield" && "护盾"}
                      {effect.type === "buff_attack" && "攻击+"}
                      {effect.type === "buff_defense" && "防御+"}
                      {effect.type === "debuff_attack" && "攻击-"}
                      {effect.type === "debuff_defense" && "防御-"}
                      <span className="ml-1 opacity-70">({effect.duration})</span>
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CharacterCard;
