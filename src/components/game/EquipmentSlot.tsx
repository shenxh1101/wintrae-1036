import { useState } from "react";
import { motion } from "framer-motion";
import type { Equipment, EquipmentSlot as EquipmentSlotType } from "@/types/game";
import { SLOT_NAMES, RARITY_NAMES, STAT_NAMES } from "@/types/game";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { getSet } from "@/data/sets";
import { cn } from "@/lib/utils";
import { Sword, Shield, Crown, Footprints, Gem } from "lucide-react";

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  equipment: Equipment | null;
  onClick?: () => void;
  onUnequip?: () => void;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

const slotIcons: Record<EquipmentSlotType, React.ReactNode> = {
  weapon: <Sword className="w-5 h-5" />,
  armor: <Shield className="w-5 h-5" />,
  helmet: <Crown className="w-5 h-5" />,
  boots: <Footprints className="w-5 h-5" />,
  accessory: <Gem className="w-5 h-5" />,
};

const EquipmentSlot = ({
  slot,
  equipment,
  onClick,
  onUnequip,
  size = "md",
}: EquipmentSlotProps) => {
  const [showModal, setShowModal] = useState(false);

  const sizes = {
    sm: "w-14 h-14",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const rarityBorder = equipment
    ? {
        common: "border-rarity-common",
        uncommon: "border-rarity-uncommon",
        rare: "border-rarity-rare",
        epic: "border-rarity-epic",
        legendary: "border-rarity-legendary animate-glow",
      }[equipment.rarity]
    : "border-gold-800/50";

  const setData = equipment?.setId ? getSet(equipment.setId) : null;

  return (
    <>
      <motion.div
        whileHover={{ scale: onClick ? 1.05 : 1 }}
        whileTap={{ scale: onClick ? 0.95 : 1 }}
      >
        <div
          onClick={() => {
            if (equipment) {
              setShowModal(true);
            } else {
              onClick?.();
            }
          }}
          className={cn(
            sizes[size],
            "rounded-lg border-2 bg-bg-secondary/50 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
            rarityBorder,
            equipment && "bg-bg-card"
          )}
        >
          {equipment ? (
            <div className={cn(iconSizes[size])}>
              {slotIcons[slot]}
            </div>
          ) : (
            <div className={cn(iconSizes[size], "text-gold-700/50")}>
              {slotIcons[slot]}
            </div>
          )}
          <span className="text-[10px] text-gold-500 mt-1">{SLOT_NAMES[slot]}</span>
        </div>
      </motion.div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={equipment?.name || SLOT_NAMES[slot]}
        size="sm"
      >
        {equipment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="rarity" rarity={equipment.rarity}>
                {RARITY_NAMES[equipment.rarity]}
              </Badge>
              {setData && (
                <Badge variant="info">{setData.name} 套装</Badge>
              )}
            </div>

            {equipment.description && (
              <p className="text-sm text-gold-400">{equipment.description}</p>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gold-300">属性加成</h4>
              <div className="grid grid-cols-2 gap-2">
                {equipment.stats.map((stat, idx) => (
                  <div key={idx} className="text-sm text-gold-400">
                    <span className="text-gold-500">{STAT_NAMES[stat.type]}:</span>
                    <span className="ml-1 text-accent-green">+{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {setData && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gold-300">套装效果</h4>
                {setData.bonuses.map((bonus, idx) => (
                  <div key={idx} className="text-sm text-gold-400">
                    <span className="text-gold-500">[{bonus.pieceCount}件]</span>
                    <span className="ml-1">{bonus.effect}</span>
                  </div>
                ))}
              </div>
            )}

            {onUnequip && (
              <button
                onClick={() => {
                  onUnequip();
                  setShowModal(false);
                }}
                className="w-full btn-secondary"
              >
                卸下装备
              </button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default EquipmentSlot;
