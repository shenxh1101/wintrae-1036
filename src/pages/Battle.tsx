import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBattleStore } from "@/store/useBattleStore";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { BattleGrid, CharacterCard, SkillButton } from "@/components/game";
import { Button, Card, CardHeader, CardTitle, CardContent, ProgressBar, Badge } from "@/components/ui";
import { getRandomEnemies } from "@/data/enemies";
import { getItems } from "@/data/events";
import type { Position, Character, Enemy, Item } from "@/types/game";
import { CLASS_NAMES, MAX_PARTY_SIZE } from "@/types/game";
import { CLASSES } from "@/data/classes";
import {
  Sword, Shield, Move, Package, SkipForward, Heart, Zap,
  Trophy, Skull, Clock, ScrollText
} from "lucide-react";

const Battle = () => {
  const navigate = useNavigate();
  const {
    playerCharacters,
    enemies,
    turnOrder,
    currentTurnIndex,
    selectedUnitId,
    selectedAction,
    selectedSkillId,
    moveRange,
    attackRange,
    targetablePositions,
    battleLog,
    isPlayerTurn,
    battleEnded,
    battleResult,
    rewards,
    initBattle,
    selectUnit,
    selectAction,
    selectSkill,
    calculateMoveRange,
    calculateAttackRange,
    moveUnit,
    attackTarget,
    useSkill,
    defend,
    useItem,
    endTurn,
    addBattleLog,
    calculateRewards,
    getUnitById,
    isPlayerUnit,
  } = useBattleStore();

  const { towerState, getCurrentRoom, completeRoom, setLastResult } = useGameStore();
  const { characters, addGold, addExp, addEquipment, addItem, addToCodex, inventory, useItem: usePlayerItem } = usePlayerStore();
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentRoom = getCurrentRoom();
  const currentTurnUnitId = turnOrder[currentTurnIndex] || null;
  const currentTurnUnit = currentTurnUnitId ? getUnitById(currentTurnUnitId) : null;

  useEffect(() => {
    if (currentRoom && (currentRoom.type === 'battle' || currentRoom.type === 'elite' || currentRoom.type === 'boss')) {
      const enemyList = getRandomEnemies(
        currentRoom.type === 'boss' ? 1 : currentRoom.type === 'elite' ? 3 : 2,
        towerState.floor,
        currentRoom.type === 'boss',
        currentRoom.type === 'elite'
      );
      initBattle(characters, enemyList);
    }

    return () => {
      useBattleStore.getState().clearBattle();
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  useEffect(() => {
    if (battleEnded && battleResult) {
      handleBattleEnd();
    }
  }, [battleEnded, battleResult]);

  const handleBattleEnd = () => {
    calculateRewards();
    
    const finalPlayerChars = useBattleStore.getState().playerCharacters;
    const { updateCharacter } = usePlayerStore.getState();
    finalPlayerChars.forEach((bc) => {
      updateCharacter(bc.id, {
        hp: bc.hp,
        mp: bc.mp,
        statusEffects: bc.statusEffects,
        level: bc.level,
        exp: bc.exp,
      });
    });
    
    if (battleResult === 'victory') {
      enemies.forEach(enemy => {
        addToCodex('enemies', enemy.type);
      });
      
      const rewardsData = useBattleStore.getState().rewards;
      if (rewardsData) {
        addGold(rewardsData.gold);
        playerCharacters.forEach(char => {
          if (char.hp > 0) {
            addExp(char.id, Math.floor(rewardsData.exp / playerCharacters.filter(c => c.hp > 0).length));
          }
        });
        rewardsData.equipment.forEach(eq => {
          addEquipment(eq);
          addToCodex('equipment', eq.name);
        });
        rewardsData.items.forEach(item => {
          addItem(item.id, 1);
        });
      }

      const finalRewards = useBattleStore.getState().rewards;
      setLastResult({
        type: 'battle',
        success: true,
        rewards: finalRewards,
      });
      
      if (currentRoom) {
        completeRoom(currentRoom.id);
      }
      
      setTimeout(() => navigate('/result'), 1000);
    } else {
      setLastResult({
        type: 'gameover',
        success: false,
      });
      setTimeout(() => navigate('/result'), 1000);
    }
  };

  const handleCellClick = (position: Position) => {
    if (!isPlayerTurn || battleEnded || !selectedUnitId) return;

    if (selectedAction === 'move') {
      if (moveRange.some(p => p.x === position.x && p.y === position.y)) {
        moveUnit(selectedUnitId, position);
        selectAction(null);
      }
    } else if (selectedAction === 'attack') {
      if (targetablePositions.some(p => p.x === position.x && p.y === position.y)) {
        attackTarget(selectedUnitId, position);
        selectAction(null);
      }
    } else if (selectedAction === 'skill' && selectedSkillId) {
      if (targetablePositions.some(p => p.x === position.x && p.y === position.y)) {
        const character = playerCharacters.find(c => c.id === selectedUnitId);
        const skill = character?.skills.find(s => s.id === selectedSkillId);
        if (skill) {
          useSkill(selectedUnitId, skill, position);
          selectSkill(null);
          selectAction(null);
        }
      }
    }
  };

  const handleUnitClick = (unitId: string, isEnemy: boolean) => {
    if (!isPlayerTurn || battleEnded) return;

    if (isEnemy && selectedAction === 'attack') {
      const enemy = enemies.find(e => e.id === unitId);
      if (enemy && targetablePositions.some(p => p.x === enemy.position.x && p.y === enemy.position.y)) {
        attackTarget(selectedUnitId!, enemy.position);
        selectAction(null);
      }
    } else if (isEnemy && selectedAction === 'skill' && selectedSkillId) {
      const enemy = enemies.find(e => e.id === unitId);
      if (enemy && targetablePositions.some(p => p.x === enemy.position.x && p.y === enemy.position.y)) {
        const character = playerCharacters.find(c => c.id === selectedUnitId);
        const skill = character?.skills.find(s => s.id === selectedSkillId);
        if (skill) {
          useSkill(selectedUnitId!, skill, enemy.position);
          selectSkill(null);
          selectAction(null);
        }
      }
    } else if (!isEnemy) {
      selectUnit(unitId);
      selectAction(null);
    }
  };

  const handleActionSelect = (action: 'move' | 'attack' | 'defend' | 'item') => {
    if (!selectedUnitId || !isPlayerTurn || battleEnded) return;

    const character = playerCharacters.find(c => c.id === selectedUnitId);
    if (!character || character.hasActed || character.hp <= 0) return;

    if (action === 'move') {
      selectAction('move');
      calculateMoveRange();
    } else if (action === 'attack') {
      selectAction('attack');
      calculateAttackRange();
    } else if (action === 'defend') {
      defend(selectedUnitId);
      addBattleLog(`${character.name} 进入守备状态，防御力提升`);
      selectAction(null);
    } else if (action === 'item') {
      setShowItemModal(true);
    }
  };

  const handleSkillSelect = (skillId: string) => {
    if (!selectedUnitId || !isPlayerTurn || battleEnded) return;
    
    const character = playerCharacters.find(c => c.id === selectedUnitId);
    if (!character || character.hasActed || character.hp <= 0) return;

    selectSkill(skillId);
  };

  const handleEndTurn = () => {
    if (!isPlayerTurn || battleEnded) return;
    
    endTurn();
    selectAction(null);
    selectUnit(null);
  };

  const handleUseItem = (item: Item, targetId: string) => {
    const battleSuccess = useItem(item.id, targetId);
    if (battleSuccess) {
      usePlayerItem(item.id, targetId);
      useBattleStore.setState((state) => ({
        playerCharacters: state.playerCharacters.map((c) =>
          c.id === selectedUnitId ? { ...c, hasActed: true } : c
        ),
        selectedAction: null,
      }));
      setShowItemModal(false);
      setSelectedItem(null);
    }
  };

  const getSelectedCharacter = (): Character | undefined => {
    return playerCharacters.find(c => c.id === selectedUnitId);
  };

  const selectedCharacter = getSelectedCharacter();
  const consumableItems = getItems().filter(item => {
    const invItem = inventory.items.find(i => i.id === item.id);
    return item.type === 'consumable' && invItem && invItem.quantity > 0;
  });

  if (playerCharacters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold title-text">
            <Sword className="inline w-7 h-7 mr-2 text-accent-red" />
            {currentRoom?.type === 'boss' ? 'Boss战' : 
             currentRoom?.type === 'elite' ? '精英战斗' : '战斗'}
            <span className="text-lg text-gold-500 ml-3">第 {towerState.floor} 层</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <Badge variant={isPlayerTurn ? 'success' : 'warning'}>
              <Clock className="w-3 h-3 mr-1" />
              {isPlayerTurn ? '玩家回合' : '敌人回合'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>我方队伍</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {playerCharacters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => !char.hasActed && char.hp > 0 && handleUnitClick(char.id, false)}
                    className={`
                      p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${selectedUnitId === char.id 
                        ? 'border-gold-400 bg-gold-700/20 shadow-gold-sm' 
                        : char.hp <= 0
                        ? 'border-gold-800/30 opacity-50'
                        : 'border-gold-800/50 hover:border-gold-600/50'
                      }
                      ${char.hasActed && char.hp > 0 ? 'opacity-70' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{CLASSES[char.class].icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gold-300 text-sm truncate">
                            {char.name}
                          </span>
                          {char.isDefending && (
                            <Shield className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                        <ProgressBar value={char.hp} max={char.maxHp} color="green" size="sm" />
                        <ProgressBar value={char.mp} max={char.maxMp} color="blue" size="sm" className="mt-1" />
                      </div>
                    </div>
                    {char.statusEffects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {char.statusEffects.slice(0, 3).map((effect) => (
                          <Badge
                            key={effect.id}
                            variant={effect.type.includes('debuff') || effect.type === 'poison' || effect.type === 'burn' ? 'danger' : 'success'}
                            className="text-[10px]"
                          >
                            {effect.type.slice(0, 2)}({effect.duration})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>敌人</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${enemy.hp <= 0 ? 'opacity-30' : 'border-accent-red/30'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {enemy.isBoss ? '👹' : enemy.type === 'undead' ? '👻' : enemy.type === 'construct' ? '🗿' : '🕷️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent-red text-sm truncate">
                            {enemy.name}
                          </span>
                          {enemy.isBoss && (
                            <Badge variant="danger" className="text-[10px]">BOSS</Badge>
                          )}
                        </div>
                        <ProgressBar value={enemy.hp} max={enemy.maxHp} color="red" size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-center">
              <BattleGrid
                playerCharacters={playerCharacters}
                enemies={enemies}
                selectedUnitId={selectedUnitId}
                selectedAction={selectedAction}
                moveRange={moveRange}
                attackRange={attackRange}
                targetablePositions={targetablePositions}
                onCellClick={handleCellClick}
                onUnitClick={handleUnitClick}
                currentTurnUnitId={currentTurnUnitId}
              />
            </div>

            {currentTurnUnit && isPlayerTurn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge variant="success" className="text-base px-4 py-1">
                  当前回合: {currentTurnUnit.name}
                </Badge>
              </motion.div>
            )}

            {selectedCharacter && isPlayerTurn && selectedCharacter.hp > 0 && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-gold-300">
                        {selectedCharacter.name} 的行动
                      </h3>
                      {selectedCharacter.hasActed && (
                        <Badge variant="warning">已行动</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedAction === 'move' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleActionSelect('move')}
                        disabled={selectedCharacter.hasActed}
                      >
                        <Move className="w-4 h-4 mr-1" />
                        移动
                      </Button>
                      <Button
                        variant={selectedAction === 'attack' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleActionSelect('attack')}
                        disabled={selectedCharacter.hasActed}
                      >
                        <Sword className="w-4 h-4 mr-1" />
                        攻击
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActionSelect('defend')}
                        disabled={selectedCharacter.hasActed || selectedCharacter.isDefending}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        守备
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActionSelect('item')}
                        disabled={selectedCharacter.hasActed || consumableItems.length === 0}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        道具
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gold-500 mb-2">技能</div>
                    <div className="flex gap-3 flex-wrap">
                      {selectedCharacter.skills.map((skill) => (
                        <SkillButton
                          key={skill.id}
                          skill={skill}
                          onClick={() => handleSkillSelect(skill.id)}
                          selected={selectedSkillId === skill.id}
                          disabled={
                            selectedCharacter.hasActed ||
                            skill.currentCooldown > 0 ||
                            selectedCharacter.mp < skill.mpCost
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={handleEndTurn}
                      className="text-gold-500"
                    >
                      <SkipForward className="w-4 h-4 mr-1" />
                      结束回合
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4" />
                  战斗日志
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={logRef}
                  className="h-64 overflow-y-auto space-y-1 text-sm"
                >
                  {battleLog.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        py-1 px-2 rounded
                        ${log.includes('暴击') ? 'text-accent-orange' : ''}
                        ${log.includes('闪避') ? 'text-accent-blue' : ''}
                        ${log.includes('击败') ? 'text-accent-green' : ''}
                        ${log.includes('被击败') ? 'text-accent-red' : ''}
                      `}
                    >
                      {log}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>回合顺序</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {turnOrder.map((unitId, idx) => {
                    const unit = getUnitById(unitId);
                    const isPlayer = isPlayerUnit(unitId);
                    const isCurrent = idx === currentTurnIndex;
                    if (!unit) return null;

                    return (
                      <div
                        key={unitId}
                        className={`
                          flex items-center gap-2 p-2 rounded-lg text-sm
                          ${isCurrent ? 'bg-gold-700/30 border border-gold-500' : 'bg-bg-secondary/50'}
                          ${unit.hp <= 0 ? 'opacity-30' : ''}
                        `}
                      >
                        <span className="text-gold-500 w-5">{idx + 1}.</span>
                        <span className="text-lg">
                          {isPlayer ? CLASSES[(unit as Character).class]?.icon : '👹'}
                        </span>
                        <span className={isPlayer ? 'text-gold-300' : 'text-accent-red'}>
                          {unit.name}
                        </span>
                        {isCurrent && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="ml-auto w-2 h-2 rounded-full bg-gold-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {battleEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
            >
              {battleResult === 'victory' ? (
                <>
                  <Trophy className="w-24 h-24 mx-auto text-gold-400 mb-4 animate-bounce" />
                  <h2 className="text-4xl font-bold text-gold-400 mb-2">胜利！</h2>
                  <p className="text-gold-500">正在计算奖励...</p>
                </>
              ) : (
                <>
                  <Skull className="w-24 h-24 mx-auto text-accent-red mb-4" />
                  <h2 className="text-4xl font-bold text-accent-red mb-2">战败</h2>
                  <p className="text-gold-500">队伍全灭...</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowItemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-gradient rounded-xl border border-gold-700/50 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gold-300 mb-4">选择道具</h3>
              
              {consumableItems.length === 0 ? (
                <p className="text-gold-500 text-center py-4">没有可用的道具</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {consumableItems.map((item) => {
                    const quantity = inventory.items.find(i => i.id === item.id)?.quantity || 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (selectedItem?.id === item.id) {
                            setSelectedItem(item);
                          } else {
                            setSelectedItem(item);
                          }
                        }}
                        className={`
                          w-full p-3 rounded-lg border-2 text-left transition-all
                          flex items-center justify-between
                          ${selectedItem?.id === item.id
                            ? 'border-gold-400 bg-gold-700/20'
                            : 'border-gold-800/50 hover:border-gold-600/50'
                          }
                        `}
                      >
                        <div>
                          <div className="font-bold text-gold-300">{item.name}</div>
                          <div className="text-xs text-gold-500">{item.description}</div>
                        </div>
                        <Badge variant="default">x{quantity}</Badge>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedItem && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gold-500">选择使用目标:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {playerCharacters.filter(c => c.hp > 0).map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleUseItem(selectedItem, char.id)}
                        className="p-2 rounded-lg border border-gold-700/50 hover:border-gold-500/50 transition-all text-center"
                      >
                        <div className="text-xl">{CLASSES[char.class].icon}</div>
                        <div className="text-xs text-gold-400 truncate">{char.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowItemModal(false);
                    setSelectedItem(null);
                  }}
                >
                  取消
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Battle;
