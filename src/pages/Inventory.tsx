import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CharacterCard, EquipmentSlot, SkillButton } from "@/components/game";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal } from "@/components/ui";
import type { Equipment, Item } from "@/types/game";
import { RARITY_NAMES, SLOT_NAMES, STAT_NAMES } from "@/types/game";
import { getSet } from "@/data/sets";
import { getItems, getItemById } from "@/data/events";
import { CLASSES } from "@/data/classes";
import {
  ArrowLeft, Backpack, Coins, Sword, Shield, Crown, Footprints, Gem,
  Package, Sparkles, Trash2
} from "lucide-react";

type TabType = "equipment" | "items" | "characters";

const Inventory = () => {
  const navigate = useNavigate();
  const { gamePhase, setGamePhase } = useGameStore();
  const {
    characters,
    gold,
    inventory,
    equipItem,
    unequipItem,
    useItem,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<TabType>("equipment");
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]?.id || null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);

  useEffect(() => {
    if (gamePhase !== "inventory" && gamePhase !== "exploring") {
      navigate("/");
    }
  }, [gamePhase, navigate]);

  const handleBack = () => {
    setGamePhase("exploring");
    navigate("/exploring");
  };

  const handleEquip = (equipment: Equipment) => {
    if (!selectedCharacter) return;
    equipItem(selectedCharacter, equipment);
    setShowEquipModal(false);
    setSelectedEquipment(null);
  };

  const handleUnequip = (characterId: string, slot: string) => {
    unequipItem(characterId, slot);
  };

  const handleUseItem = (item: Item) => {
    if (!selectedCharacter) return;
    if (useItem(item.id, selectedCharacter)) {
      // 使用成功
    }
  };

  const currentCharacter = characters.find((c) => c.id === selectedCharacter);

  const slotIcons = {
    weapon: <Sword className="w-4 h-4" />,
    armor: <Shield className="w-4 h-4" />,
    helmet: <Crown className="w-4 h-4" />,
    boots: <Footprints className="w-4 h-4" />,
    accessory: <Gem className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold title-text">
            <Backpack className="inline w-8 h-8 mr-3 text-gold-500" />
            战利品背包
          </h1>
          <div className="flex items-center gap-2 text-gold-400">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{gold}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center border-b border-gold-800/30">
          {[
            { id: "equipment", label: "装备", icon: <Sword className="w-4 h-4" /> },
            { id: "items", label: "道具", icon: <Package className="w-4 h-4" /> },
            { id: "characters", label: "角色", icon: <Sparkles className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                px-6 py-3 flex items-center gap-2 border-b-2 transition-all
                ${activeTab === tab.id
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-gold-500 hover:text-gold-300"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>选择角色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => setSelectedCharacter(character.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedCharacter === character.id
                        ? "border-gold-400 bg-gold-700/20"
                        : "border-gold-800/50 hover:border-gold-600/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{CLASSES[character.class].icon}</div>
                      <div>
                        <div className="font-bold text-gold-300">{character.name}</div>
                        <div className="text-sm text-gold-500">
                          Lv.{character.level}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {currentCharacter && (
              <Card>
                <CardHeader>
                  <CardTitle>装备栏</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-start-2">
                      <EquipmentSlot
                        slot="helmet"
                        equipment={currentCharacter.equipment.helmet}
                        onUnequip={() => handleUnequip(currentCharacter.id, "helmet")}
                      />
                    </div>
                    <div className="col-start-1">
                      <EquipmentSlot
                        slot="weapon"
                        equipment={currentCharacter.equipment.weapon}
                        onUnequip={() => handleUnequip(currentCharacter.id, "weapon")}
                      />
                    </div>
                    <div className="col-start-2">
                      <EquipmentSlot
                        slot="armor"
                        equipment={currentCharacter.equipment.armor}
                        onUnequip={() => handleUnequip(currentCharacter.id, "armor")}
                      />
                    </div>
                    <div className="col-start-3">
                      <EquipmentSlot
                        slot="accessory"
                        equipment={currentCharacter.equipment.accessory}
                        onUnequip={() => handleUnequip(currentCharacter.id, "accessory")}
                      />
                    </div>
                    <div className="col-start-2">
                      <EquipmentSlot
                        slot="boots"
                        equipment={currentCharacter.equipment.boots}
                        onUnequip={() => handleUnequip(currentCharacter.id, "boots")}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gold-800/30">
                    <h4 className="text-sm font-semibold text-gold-300 mb-3">技能</h4>
                    <div className="flex gap-2 justify-center">
                      {currentCharacter.skills.map((skill) => (
                        <SkillButton
                          key={skill.id}
                          skill={skill}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            {activeTab === "equipment" && (
              <Card>
                <CardHeader>
                  <CardTitle>装备列表 ({inventory.equipment.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventory.equipment.length === 0 ? (
                    <div className="text-center py-12 text-gold-500">
                      <Backpack className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>还没有装备</p>
                      <p className="text-sm">击败敌人或开启宝箱获取装备</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                      {inventory.equipment.map((equipment) => {
                        const setData = equipment.setId ? getSet(equipment.setId) : null;
                        return (
                          <motion.div
                            key={equipment.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => {
                              setSelectedEquipment(equipment);
                              setShowEquipModal(true);
                            }}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${equipment.rarity === 'legendary' ? 'border-rarity-legendary animate-glow' : `border-rarity-${equipment.rarity}/50`}
                              hover:scale-[1.02]
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                w-12 h-12 rounded-lg flex items-center justify-center
                                bg-rarity-${equipment.rarity}/20
                                border border-rarity-${equipment.rarity}/30
                              `}>
                                {slotIcons[equipment.slot]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-rarity-${equipment.rarity}`}>
                                    {equipment.name}
                                  </span>
                                  <Badge variant="rarity" rarity={equipment.rarity} className="text-[10px]">
                                    {RARITY_NAMES[equipment.rarity]}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gold-500 mt-1">
                                  {SLOT_NAMES[equipment.slot]}
                                  {setData && ` · ${setData.name}套装`}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {equipment.stats.slice(0, 3).map((stat, idx) => (
                                    <span key={idx} className="text-xs text-gold-400">
                                      {STAT_NAMES[stat.type]} +{stat.value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "items" && (
              <Card>
                <CardHeader>
                  <CardTitle>道具列表</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventory.items.length === 0 ? (
                    <div className="text-center py-12 text-gold-500">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>还没有道具</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                      {inventory.items.map((invItem) => {
                        const item = getItemById(invItem.id);
                        if (!item) return null;

                        return (
                          <motion.div
                            key={invItem.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-lg border-2 border-gold-800/50 hover:border-gold-600/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gold-300">{item.name}</div>
                                <div className="text-xs text-gold-500 mt-1">
                                  {item.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="default" className="mb-2">
                                  x{invItem.quantity}
                                </Badge>
                                {item.type === "consumable" && currentCharacter && currentCharacter.hp > 0 && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleUseItem(item)}
                                  >
                                    使用
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "characters" && currentCharacter && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentCharacter.name} 详情</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">{CLASSES[currentCharacter.class].icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gold-300">
                        {currentCharacter.name}
                      </h3>
                      <div className="text-gold-500">
                        Lv.{currentCharacter.level} {CLASSES[currentCharacter.class].name}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gold-500 mb-1">经验值</div>
                        <div className="w-48">
                          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-gradient transition-all"
                              style={{
                                width: `${(currentCharacter.exp / currentCharacter.expToNextLevel) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gold-500 mt-1">
                            {currentCharacter.exp} / {currentCharacter.expToNextLevel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent-red">
                        {currentCharacter.maxHp}
                      </div>
                      <div className="text-xs text-gold-500">最大生命</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent-blue">
                        {currentCharacter.maxMp}
                      </div>
                      <div className="text-xs text-gold-500">最大法力</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {currentCharacter.baseStats.attack}
                      </div>
                      <div className="text-xs text-gold-500">攻击力</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {currentCharacter.baseStats.defense}
                      </div>
                      <div className="text-xs text-gold-500">防御力</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {currentCharacter.baseStats.speed}
                      </div>
                      <div className="text-xs text-gold-500">速度</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {Math.round(currentCharacter.baseStats.critRate * 100)}%
                      </div>
                      <div className="text-xs text-gold-500">暴击率</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {Math.round(currentCharacter.baseStats.critDamage * 100)}%
                      </div>
                      <div className="text-xs text-gold-500">暴击伤害</div>
                    </div>
                    <div className="bg-bg-secondary/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gold-300">
                        {Math.round(currentCharacter.baseStats.dodge * 100)}%
                      </div>
                      <div className="text-xs text-gold-500">闪避率</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gold-300 mb-3">技能详情</h4>
                    <div className="space-y-3">
                      {currentCharacter.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-4 bg-bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-gold-300">{skill.name}</div>
                            <Badge
                              variant={
                                skill.type === "damage"
                                  ? "danger"
                                  : skill.type === "heal"
                                  ? "success"
                                  : skill.type === "buff"
                                  ? "default"
                                  : "info"
                              }
                            >
                              {skill.type === "damage" && "伤害"}
                              {skill.type === "heal" && "治疗"}
                              {skill.type === "buff" && "增益"}
                              {skill.type === "debuff" && "减益"}
                              {skill.type === "aoe" && "范围"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gold-400 mt-2">{skill.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gold-500">
                            <span>消耗: {skill.mpCost} MP</span>
                            <span>冷却: {skill.cooldown}回合</span>
                            <span>范围: {skill.range}格</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEquipModal}
        onClose={() => {
          setShowEquipModal(false);
          setSelectedEquipment(null);
        }}
        title={selectedEquipment?.name || "装备详情"}
        size="md"
      >
        {selectedEquipment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="rarity" rarity={selectedEquipment.rarity}>
                {RARITY_NAMES[selectedEquipment.rarity]}
              </Badge>
              <Badge variant="default">{SLOT_NAMES[selectedEquipment.slot]}</Badge>
            </div>

            {selectedEquipment.description && (
              <p className="text-gold-400">{selectedEquipment.description}</p>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gold-300">属性加成</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedEquipment.stats.map((stat, idx) => (
                  <div key={idx} className="text-sm text-gold-400">
                    <span className="text-gold-500">{STAT_NAMES[stat.type]}:</span>
                    <span className="ml-1 text-accent-green">+{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedEquipment.setId && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gold-300">套装效果</h4>
                {getSet(selectedEquipment.setId)?.bonuses.map((bonus, idx) => (
                  <div key={idx} className="text-sm text-gold-400">
                    <span className="text-gold-500">[{bonus.pieceCount}件]</span>
                    <span className="ml-1">{bonus.effect}</span>
                  </div>
                ))}
              </div>
            )}

            {currentCharacter && (
              <div className="pt-4 border-t border-gold-800/30">
                <p className="text-sm text-gold-500 mb-3">
                  装备给: {currentCharacter.name}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowEquipModal(false);
                      setSelectedEquipment(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleEquip(selectedEquipment)}
                  >
                    装备
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
