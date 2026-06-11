import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { CharacterCard } from "@/components/game";
import { RARITY_COLORS, RARITY_NAMES, DIFFICULTY_NAMES } from "@/types/game";
import type { Equipment, Item } from "@/types/game";
import {
  Trophy, Skull, ArrowRight, Home, RotateCcw, Coins, Sparkles,
  Heart, Zap, Sword, Shield, Star, ChevronDown, ChevronUp
} from "lucide-react";

const Result = () => {
  const navigate = useNavigate();
  const { lastResult, towerState, goToNextFloor, setGamePhase, resetGame } = useGameStore();
  const { gold, characters, addGold, resetAll } = usePlayerStore();
  const [showDetails, setShowDetails] = useState(false);
  const [keptResources, setKeptResources] = useState<{
    gold: number;
    equipmentCount: number;
    itemCount: number;
  } | null>(null);

  useEffect(() => {
    if (!lastResult) {
      navigate("/");
    }
  }, [lastResult, navigate]);

  const handleContinue = () => {
    if (lastResult?.type === "gameover") {
      const keptGold = Math.floor(gold * 0.3);
      const keptEquipments = characters.flatMap(c => 
        Object.values(c.equipment).filter(Boolean)
      ).slice(0, 3).length;
      const keptItems = Math.floor(
        usePlayerStore.getState().inventory.items.reduce((sum, i) => sum + i.quantity, 0) * 0.3
      );
      
      setKeptResources({
        gold: keptGold,
        equipmentCount: keptEquipments,
        itemCount: keptItems,
      });

      resetGame(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
      return;
    }

    if (lastResult?.type === "victory") {
      resetGame(false);
      navigate("/");
      return;
    }

    if (lastResult?.type === "floor") {
      goToNextFloor();
    }

    setGamePhase("exploring");
    navigate("/exploring");
  };

  const handleReturnToMenu = () => {
    if (lastResult?.type === "gameover" && !keptResources) {
      const keptGold = Math.floor(gold * 0.3);
      const keptEquipments = characters.flatMap(c => 
        Object.values(c.equipment).filter(Boolean)
      ).slice(0, 3).length;
      const keptItems = Math.floor(
        usePlayerStore.getState().inventory.items.reduce((sum, i) => sum + i.quantity, 0) * 0.3
      );
      
      setKeptResources({
        gold: keptGold,
        equipmentCount: keptEquipments,
        itemCount: keptItems,
      });

      resetGame(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
      return;
    }

    resetGame(false);
    navigate("/");
  };

  if (!lastResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-400 text-xl">加载中...</div>
      </div>
    );
  }

  const isVictory = lastResult.success;
  const rewards = lastResult.rewards;

  const getResultIcon = () => {
    if (lastResult.type === "gameover") {
      return <Skull className="w-24 h-24 text-accent-red" />;
    }
    if (lastResult.type === "victory") {
      return <Trophy className="w-24 h-24 text-gold-400" />;
    }
    if (lastResult.type === "battle") {
      return isVictory ? 
        <Trophy className="w-20 h-20 text-gold-400" /> : 
        <Skull className="w-20 h-20 text-accent-red" />;
    }
    if (lastResult.type === "floor") {
      return <Star className="w-20 h-20 text-accent-purple" />;
    }
    return <Sparkles className="w-20 h-20 text-gold-400" />;
  };

  const getResultTitle = () => {
    if (lastResult.type === "gameover") return "挑战失败";
    if (lastResult.type === "victory") return "通关成功！";
    if (lastResult.type === "floor") return `第 ${towerState.floor} 层完成`;
    if (lastResult.type === "battle") return isVictory ? "战斗胜利" : "战斗失败";
    return isVictory ? "事件完成" : "事件失败";
  };

  const getResultMessage = () => {
    if (lastResult.type === "gameover") {
      return "你的队伍在机关塔中倒下了...但你的部分资源得以保留。";
    }
    if (lastResult.type === "victory") {
      return "恭喜！你成功征服了古代机关塔！新的难度已解锁。";
    }
    if (rewards?.message) {
      return rewards.message;
    }
    if (isVictory) {
      return "成功完成！获得以下奖励：";
    }
    return "未能完成，下次再接再厉。";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float ${
            isVictory ? "bg-gold-500/10" : "bg-accent-red/10"
          }`} 
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float ${
            isVictory ? "bg-gold-700/10" : "bg-accent-red/10"
          }`} 
          style={{ animationDelay: "1.5s" }} 
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full space-y-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            animate={{ 
              rotate: isVictory ? [0, -10, 10, -10, 0] : 0,
              scale: isVictory ? [1, 1.1, 1] : 1,
            }}
            transition={{ 
              duration: 0.5, 
              repeat: isVictory ? Infinity : 0,
              repeatDelay: 2,
            }}
            className="inline-block"
          >
            {getResultIcon()}
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <h1 
            className={`text-4xl md:text-5xl font-bold mb-3 title-text ${
              isVictory ? "text-gold-400" : "text-accent-red"
            }`}
          >
            {getResultTitle()}
          </h1>
          <p className="text-gold-500 text-lg">{getResultMessage()}</p>
        </motion.div>

        {lastResult.type === "victory" && rewards?.newDifficulty && (
          <motion.div variants={itemVariants}>
            <Card className="border-accent-purple/50">
              <CardContent className="text-center py-6">
                <Badge variant="info" className="mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  新难度解锁
                </Badge>
                <div className="text-2xl font-bold text-accent-purple">
                  {DIFFICULTY_NAMES[rewards.newDifficulty] || "未知难度"}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {keptResources && (
          <motion.div variants={itemVariants}>
            <Card className="border-gold-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-gold-400" />
                  保留资源（30%）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gold-800/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gold-400" />
                    <span className="text-gold-300">金币</span>
                  </div>
                  <span className="text-gold-400 font-bold">+{keptResources.gold}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gold-800/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sword className="w-5 h-5 text-accent-blue" />
                    <span className="text-gold-300">装备</span>
                  </div>
                  <span className="text-accent-blue font-bold">{keptResources.equipmentCount} 件</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gold-800/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-purple" />
                    <span className="text-gold-300">道具</span>
                  </div>
                  <span className="text-accent-purple font-bold">{keptResources.itemCount} 个</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {rewards && lastResult.type === "battle" && isVictory && (
          <motion.div variants={itemVariants} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold-400" />
                  战斗奖励
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {rewards.gold > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gold-800/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-gold-400" />
                        <span className="text-gold-300">金币</span>
                      </div>
                      <span className="text-gold-400 font-bold">+{rewards.gold}</span>
                    </div>
                  )}
                  {rewards.exp > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gold-800/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-accent-purple" />
                        <span className="text-gold-300">经验值</span>
                      </div>
                      <span className="text-accent-purple font-bold">+{rewards.exp}</span>
                    </div>
                  )}
                </div>

                {rewards.equipment && rewards.equipment.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full flex items-center justify-between p-3 bg-gold-800/20 rounded-lg mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Sword className="w-5 h-5 text-accent-blue" />
                        <span className="text-gold-300">装备 ({rewards.equipment.length} 件)</span>
                      </div>
                      {showDetails ? 
                        <ChevronUp className="w-5 h-5 text-gold-500" /> : 
                        <ChevronDown className="w-5 h-5 text-gold-500" />
                      }
                    </button>
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 ml-4">
                            {rewards.equipment.map((eq: Equipment, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg border"
                                style={{ borderColor: RARITY_COLORS[eq.rarity] }}
                              >
                                <div className="flex items-center justify-between">
                                  <span style={{ color: RARITY_COLORS[eq.rarity] }} className="font-bold">
                                    {eq.name}
                                  </span>
                                  <Badge 
                                    variant="rarity" 
                                    rarity={eq.rarity}
                                  >
                                    {RARITY_NAMES[eq.rarity]}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gold-500 mt-1">
                                  {eq.stats.map((s, i) => (
                                    <span key={i} className="mr-2">
                                      {s.type}: +{s.value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {rewards.items && rewards.items.length > 0 && (
                  <div>
                    <div className="p-3 bg-gold-800/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-purple" />
                        <span className="text-gold-300">道具</span>
                        <span className="text-accent-purple font-bold ml-auto">
                          {rewards.items.length} 个
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent-red" />
                  队伍状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {characters.map((char) => (
                    <CharacterCard key={char.id} character={char} size="sm" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-4">
          {lastResult.type !== "gameover" && lastResult.type !== "victory" && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleContinue}
            >
              {lastResult.type === "floor" ? (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  进入下一层
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  继续探索
                </>
              )}
            </Button>
          )}
          
          {lastResult.type === "gameover" && !keptResources && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleContinue}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始（保留30%资源）
            </Button>
          )}

          {lastResult.type === "victory" && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleContinue}
            >
              <Trophy className="w-4 h-4 mr-2" />
              返回主菜单
            </Button>
          )}

          {keptResources && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full"
            >
              <div className="text-gold-500 mb-3">资源已保留，正在返回主菜单...</div>
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full"
                />
              </div>
            </motion.div>
          )}

          {!keptResources && lastResult.type !== "victory" && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleReturnToMenu}
            >
              <Home className="w-4 h-4 mr-2" />
              返回主菜单
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Result;
