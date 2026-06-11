import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useGameStore } from "@/store/useGameStore";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal } from "@/components/ui";
import { ENEMY_TEMPLATES, ENEMY_SKILLS } from "@/data/enemies";
import { BASE_EQUIPMENT_LIST } from "@/data/equipment";
import { RARITY_COLORS, RARITY_NAMES, SLOT_NAMES, STAT_NAMES } from "@/types/game";
import type { Equipment } from "@/types/game";
import {
  BookOpen, Sword, Skull, Home, ChevronLeft, Lock, Eye,
  Heart, Zap, Shield, Star, Coins, Sparkles
} from "lucide-react";

type CodexTab = "enemies" | "equipment";

const Codex = () => {
  const navigate = useNavigate();
  const { codex } = usePlayerStore();
  const { setGamePhase } = useGameStore();
  const [activeTab, setActiveTab] = useState<CodexTab>("enemies");
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ENEMY_TEMPLATES[0] | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const handleBack = () => {
    setGamePhase("menu");
    navigate("/");
  };

  const isEnemyUnlocked = (type: string) => {
    return codex.enemies.includes(type);
  };

  const isEquipmentUnlocked = (name: string) => {
    return codex.equipment.includes(name);
  };

  const getEnemyIcon = (type: string) => {
    switch (type) {
      case "mech":
        return "🕷️";
      case "construct":
        return "🗿";
      case "undead":
        return "👻";
      case "elemental":
        return "🔥";
      case "humanoid":
        return "🥷";
      case "eldritch":
        return "👹";
      default:
        return "👾";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gold-500"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              返回
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold title-text">
              <BookOpen className="inline w-7 h-7 mr-2 text-gold-400" />
              图鉴
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info">
              <Skull className="w-3 h-3 mr-1" />
              敌人 {codex.enemies.length}/{ENEMY_TEMPLATES.length}
            </Badge>
            <Badge variant="info">
              <Sword className="w-3 h-3 mr-1" />
              装备 {codex.equipment.length}/{BASE_EQUIPMENT_LIST.length}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "enemies" ? "primary" : "secondary"}
            onClick={() => setActiveTab("enemies")}
          >
            <Skull className="w-4 h-4 mr-2" />
            敌人图鉴
          </Button>
          <Button
            variant={activeTab === "equipment" ? "primary" : "secondary"}
            onClick={() => setActiveTab("equipment")}
          >
            <Sword className="w-4 h-4 mr-2" />
            装备图鉴
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "enemies" && (
            <motion.div
              key="enemies"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {ENEMY_TEMPLATES.map((enemy, idx) => {
                const unlocked = isEnemyUnlocked(enemy.type);
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    onClick={() => unlocked && setSelectedEnemy(enemy)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${unlocked 
                        ? enemy.isBoss 
                          ? "border-accent-red/50 hover:border-accent-red/80 bg-gradient-to-br from-accent-red/10 to-transparent" 
                          : "border-gold-700/50 hover:border-gold-500/50 bg-card-gradient"
                        : "border-gold-800/30 bg-bg-secondary/50 cursor-not-allowed"
                      }
                    `}
                  >
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
                        <Lock className="w-8 h-8 text-gold-600" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {unlocked ? getEnemyIcon(enemy.type) : "❓"}
                      </div>
                      <div className="font-bold text-gold-300 mb-1">
                        {unlocked ? enemy.name : "???"}
                      </div>
                      {unlocked && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {enemy.isBoss && (
                            <Badge variant="danger" className="text-[10px]">
                              BOSS
                            </Badge>
                          )}
                          <Badge variant="default" className="text-[10px]">
                            {enemy.type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {unlocked && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <Heart className="w-3 h-3 mx-auto text-accent-red mb-1" />
                          <div className="text-gold-400">{enemy.maxHp}</div>
                        </div>
                        <div className="text-center">
                          <Sword className="w-3 h-3 mx-auto text-accent-orange mb-1" />
                          <div className="text-gold-400">{enemy.attack}</div>
                        </div>
                        <div className="text-center">
                          <Shield className="w-3 h-3 mx-auto text-accent-blue mb-1" />
                          <div className="text-gold-400">{enemy.defense}</div>
                        </div>
                      </div>
                    )}

                    {unlocked && (
                      <div className="absolute top-2 right-2">
                        <Eye className="w-4 h-4 text-gold-500" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "equipment" && (
            <motion.div
              key="equipment"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {BASE_EQUIPMENT_LIST.map((equipment, idx) => {
                const unlocked = isEquipmentUnlocked(equipment.name);
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    onClick={() => unlocked && setSelectedEquipment(equipment as Equipment)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${unlocked 
                        ? "bg-card-gradient" 
                        : "border-gold-800/30 bg-bg-secondary/50 cursor-not-allowed"
                      }
                    `}
                    style={{
                      borderColor: unlocked ? RARITY_COLORS[equipment.rarity] + "80" : undefined,
                    }}
                  >
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
                        <Lock className="w-8 h-8 text-gold-600" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {unlocked ? (
                          equipment.slot === "weapon" ? "⚔️" :
                          equipment.slot === "armor" ? "🛡️" :
                          equipment.slot === "helmet" ? "⛑️" :
                          equipment.slot === "boots" ? "👢" :
                          "💍"
                        ) : "❓"}
                      </div>
                      <div 
                        className="font-bold mb-1"
                        style={{ color: unlocked ? RARITY_COLORS[equipment.rarity] : undefined }}
                      >
                        {unlocked ? equipment.name : "???"}
                      </div>
                      {unlocked && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Badge 
                            variant="rarity" 
                            rarity={equipment.rarity}
                            className="text-[10px]"
                          >
                            {RARITY_NAMES[equipment.rarity]}
                          </Badge>
                          <Badge variant="default" className="text-[10px]">
                            {SLOT_NAMES[equipment.slot]}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {unlocked && (
                      <div className="absolute top-2 right-2">
                        <Eye className="w-4 h-4 text-gold-500" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedEnemy && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedEnemy(null)}
            size="lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-6xl">
                  {getEnemyIcon(selectedEnemy.type)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gold-300">
                    {selectedEnemy.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedEnemy.isBoss && (
                      <Badge variant="danger">BOSS</Badge>
                    )}
                    <Badge variant="default">{selectedEnemy.type}</Badge>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent-red" />
                    基础属性
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gold-800/20 rounded-lg">
                      <Heart className="w-5 h-5 mx-auto text-accent-red mb-1" />
                      <div className="text-xs text-gold-500">生命值</div>
                      <div className="text-lg font-bold text-gold-300">{selectedEnemy.maxHp}</div>
                    </div>
                    <div className="text-center p-3 bg-gold-800/20 rounded-lg">
                      <Sword className="w-5 h-5 mx-auto text-accent-orange mb-1" />
                      <div className="text-xs text-gold-500">攻击力</div>
                      <div className="text-lg font-bold text-gold-300">{selectedEnemy.attack}</div>
                    </div>
                    <div className="text-center p-3 bg-gold-800/20 rounded-lg">
                      <Shield className="w-5 h-5 mx-auto text-accent-blue mb-1" />
                      <div className="text-xs text-gold-500">防御力</div>
                      <div className="text-lg font-bold text-gold-300">{selectedEnemy.defense}</div>
                    </div>
                    <div className="text-center p-3 bg-gold-800/20 rounded-lg">
                      <Zap className="w-5 h-5 mx-auto text-accent-purple mb-1" />
                      <div className="text-xs text-gold-500">速度</div>
                      <div className="text-lg font-bold text-gold-300">{selectedEnemy.speed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-400" />
                    奖励
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gold-800/20 rounded-lg">
                      <Coins className="w-6 h-6 text-gold-400" />
                      <div>
                        <div className="text-xs text-gold-500">金币奖励</div>
                        <div className="font-bold text-gold-300">{selectedEnemy.goldReward}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gold-800/20 rounded-lg">
                      <Sparkles className="w-6 h-6 text-accent-purple" />
                      <div>
                        <div className="text-xs text-gold-500">经验奖励</div>
                        <div className="font-bold text-gold-300">{selectedEnemy.expReward}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-orange" />
                    技能
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedEnemy.skills.map((skillId, idx) => {
                    const skill = ENEMY_SKILLS[skillId];
                    if (!skill) return null;
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-gold-800/20 rounded-lg border border-gold-700/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gold-300">{skill.name}</span>
                          <Badge variant="default" className="text-[10px]">
                            冷却: {skill.cooldown} 回合
                          </Badge>
                        </div>
                        <div className="text-sm text-gold-500">{skill.description}</div>
                        {skill.damage && (
                          <div className="text-xs text-accent-orange mt-1">
                            伤害倍率: {skill.damage}x
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEnemy(null)}
                >
                  关闭
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}

        {selectedEquipment && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedEquipment(null)}
            size="lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="text-6xl p-4 rounded-xl border-2"
                  style={{ borderColor: RARITY_COLORS[selectedEquipment.rarity] }}
                >
                  {selectedEquipment.slot === "weapon" ? "⚔️" :
                   selectedEquipment.slot === "armor" ? "🛡️" :
                   selectedEquipment.slot === "helmet" ? "⛑️" :
                   selectedEquipment.slot === "boots" ? "👢" :
                   "💍"}
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: RARITY_COLORS[selectedEquipment.rarity] }}
                  >
                    {selectedEquipment.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="rarity" 
                      rarity={selectedEquipment.rarity}
                    >
                      {RARITY_NAMES[selectedEquipment.rarity]}
                    </Badge>
                    <Badge variant="default">
                      {SLOT_NAMES[selectedEquipment.slot]}
                    </Badge>
                  </div>
                  {selectedEquipment.description && (
                    <p className="text-sm text-gold-500 mt-2">
                      {selectedEquipment.description}
                    </p>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-400" />
                    属性
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gold-500 mb-2">基础属性</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(selectedEquipment.baseStats).map(([stat, value]) => (
                        <div
                          key={stat}
                          className="p-2 bg-gold-800/20 rounded-lg text-center"
                        >
                          <div className="text-xs text-gold-500">
                            {STAT_NAMES[stat as keyof typeof STAT_NAMES]}
                          </div>
                          <div className="font-bold text-gold-300">+{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gold-500 mb-2">额外词条</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedEquipment.stats.map((stat, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-accent-blue/10 rounded-lg text-center border border-accent-blue/30"
                        >
                          <div className="text-xs text-accent-blue">
                            {STAT_NAMES[stat.type]}
                          </div>
                          <div className="font-bold text-accent-blue">+{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedEquipment.setId && (
                <Card className="border-accent-purple/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent-purple">
                      <Sparkles className="w-4 h-4" />
                      套装效果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gold-500 text-sm">
                      此装备属于某个套装。收集更多套装部件可触发额外效果。
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEquipment(null)}
                >
                  关闭
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Codex;
