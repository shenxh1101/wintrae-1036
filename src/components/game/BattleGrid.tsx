import { motion, AnimatePresence } from "framer-motion";
import type { Character, Enemy, Position, ActionType } from "@/types/game";
import { GRID_SIZE } from "@/types/game";
import { CLASSES } from "@/data/classes";
import { cn } from "@/lib/utils";
import { Sword, Shield, Heart } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";

interface BattleGridProps {
  playerCharacters: Character[];
  enemies: Enemy[];
  selectedUnitId: string | null;
  selectedAction: ActionType;
  moveRange: Position[];
  attackRange: Position[];
  targetablePositions: Position[];
  onCellClick: (position: Position) => void;
  onUnitClick: (unitId: string, isEnemy: boolean) => void;
  currentTurnUnitId: string | null;
}

const BattleGrid = ({
  playerCharacters,
  enemies,
  selectedUnitId,
  selectedAction,
  moveRange,
  attackRange,
  targetablePositions,
  onCellClick,
  onUnitClick,
  currentTurnUnitId,
}: BattleGridProps) => {
  const isInMoveRange = (x: number, y: number) =>
    moveRange.some((p) => p.x === x && p.y === y);

  const isInAttackRange = (x: number, y: number) =>
    attackRange.some((p) => p.x === x && p.y === y);

  const isTargetable = (x: number, y: number) =>
    targetablePositions.some((p) => p.x === x && p.y === y);

  const getUnitAtPosition = (x: number, y: number) => {
    const player = playerCharacters.find(
      (c) => c.position.x === x && c.position.y === y && c.hp > 0
    );
    if (player) return { unit: player, isEnemy: false };

    const enemy = enemies.find(
      (e) => e.position.x === x && e.position.y === y && e.hp > 0
    );
    if (enemy) return { unit: enemy, isEnemy: true };

    return null;
  };

  const getCellStyle = (x: number, y: number) => {
    const baseClass = "grid-cell relative flex items-center justify-center";

    if (isTargetable(x, y)) {
      return cn(
        baseClass,
        "bg-accent-red/30 border-accent-red/50 cursor-crosshair hover:bg-accent-red/50"
      );
    }

    if (selectedAction === "move" && isInMoveRange(x, y)) {
      return cn(
        baseClass,
        "bg-accent-blue/30 border-accent-blue/50 cursor-pointer hover:bg-accent-blue/50"
      );
    }

    if (selectedAction === "attack" && isInAttackRange(x, y)) {
      return cn(
        baseClass,
        "bg-accent-red/20 border-accent-red/30 cursor-pointer hover:bg-accent-red/40"
      );
    }

    return baseClass;
  };

  const renderUnit = (unit: Character | Enemy, isEnemy: boolean) => {
    const isPlayer = "class" in unit;
    const isSelected = selectedUnitId === unit.id;
    const isCurrentTurn = currentTurnUnitId === unit.id;
    const classData = isPlayer ? CLASSES[unit.class] : null;
    const hpPercentage = (unit.hp / unit.maxHp) * 100;

    return (
      <motion.div
        key={unit.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => {
          e.stopPropagation();
          onUnitClick(unit.id, isEnemy);
        }}
        className={cn(
          "absolute inset-1 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
          isEnemy
            ? "bg-gradient-to-br from-accent-red/40 to-accent-red/20 border-2 border-accent-red/50"
            : "bg-gradient-to-br from-accent-blue/40 to-accent-blue/20 border-2 border-accent-blue/50",
          isSelected && "ring-2 ring-gold-400 shadow-gold-sm scale-105",
          isCurrentTurn && "animate-pulse-slow",
          (unit as Character).isDefending && "border-yellow-400"
        )}
      >
        <div className="text-2xl">
          {isPlayer ? classData?.icon : "👹"}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-1">
          <ProgressBar
            value={unit.hp}
            max={unit.maxHp}
            color={isEnemy ? "red" : "green"}
            size="sm"
          />
        </div>

        {isCurrentTurn && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: -5, opacity: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <span className="text-xs bg-gold-500 text-black px-1.5 py-0.5 rounded font-bold">
              当前
            </span>
          </motion.div>
        )}

        {(unit as Character).isDefending && (
          <div className="absolute top-0 right-0">
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
        )}

        {isTargetable(unit.position.x, unit.position.y) && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 rounded-lg border-2 border-accent-red"
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <div
        className="grid gap-1 p-4 bg-bg-card rounded-xl border border-gold-800/50 shadow-card"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          aspectRatio: "1",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const unitData = getUnitAtPosition(x, y);

          return (
            <motion.div
              key={`${x}-${y}`}
              className={getCellStyle(x, y)}
              onClick={() => onCellClick({ x, y })}
              whileHover={
                (isInMoveRange(x, y) || isTargetable(x, y))
                  ? { scale: 1.05 }
                  : {}
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (x + y) * 0.02 }}
            >
              <AnimatePresence>
                {unitData &&
                  renderUnit(unitData.unit, unitData.isEnemy)}
              </AnimatePresence>

              {isInMoveRange(x, y) && !unitData && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-accent-blue/60"
                />
              )}

              {isInAttackRange(x, y) && !unitData && selectedAction === "attack" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-accent-red/60"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 flex items-center justify-center text-xs text-gold-500"
            style={{ aspectRatio: "1" }}
          >
            {GRID_SIZE - i}
          </div>
        ))}
      </div>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 flex items-center justify-center text-xs text-gold-500"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleGrid;
