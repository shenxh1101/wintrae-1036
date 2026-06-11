import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { generateRandomEquipment } from "@/data/equipment";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { GameEvent, EventOption } from "@/types/game";
import {
  HelpCircle, Coins, Heart, Sparkles, Skull, ShoppingBag,
  Coffee, Dice6, Check, X, ArrowRight, Trophy
} from "lucide-react";

const EventRoom = () => {
  const navigate = useNavigate();
  const { currentEvent, gamePhase, completeRoom, getCurrentRoom, setLastResult } = useGameStore();
  const { gold, spendGold, addGold, healAllCharacters, damageCharacter, addEquipment, addItem, characters } = usePlayerStore();
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    value: number;
    type: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentRoom = getCurrentRoom();

  useEffect(() => {
    if (gamePhase !== "event" || !currentEvent) {
      navigate("/");
    }
  }, [gamePhase, currentEvent, navigate]);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "puzzle":
        return <HelpCircle className="w-8 h-8 text-accent-blue" />;
      case "trade":
        return <ShoppingBag className="w-8 h-8 text-accent-orange" />;
      case "rest":
        return <Coffee className="w-8 h-8 text-accent-green" />;
      case "gamble":
        return <Dice6 className="w-8 h-8 text-accent-purple" />;
      default:
        return <HelpCircle className="w-8 h-8 text-gold-500" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "puzzle":
        return "border-accent-blue/50";
      case "trade":
        return "border-accent-orange/50";
      case "rest":
        return "border-accent-green/50";
      case "gamble":
        return "border-accent-purple/50";
      default:
        return "border-gold-700/50";
    }
  };

  const getResultIcon = (type: string, success: boolean) => {
    if (!success) return <X className="w-12 h-12 text-accent-red" />;
    
    switch (type) {
      case "gold":
        return <Coins className="w-12 h-12 text-gold-400" />;
      case "hp":
      case "heal":
        return <Heart className="w-12 h-12 text-accent-green" />;
      case "equipment":
        return <Trophy className="w-12 h-12 text-gold-400" />;
      case "item":
        return <Sparkles className="w-12 h-12 text-accent-purple" />;
      case "mp":
        return <Sparkles className="w-12 h-12 text-accent-blue" />;
      case "exp":
        return <Sparkles className="w-12 h-12 text-gold-400" />;
      case "damage":
        return <Skull className="w-12 h-12 text-accent-red" />;
      default:
        return <Check className="w-12 h-12 text-accent-green" />;
    }
  };

  const handleOptionSelect = (option: EventOption) => {
    if (isProcessing || result) return;

    if (option.text.includes("购买") && option.result.type === "item") {
      const priceMatch = option.text.match(/(\d+)金币/);
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;
      if (price > 0 && gold < price) {
        setResult({
          success: false,
          message: "金币不足！",
          value: 0,
          type: "gold",
        });
        return;
      }
      if (price > 0) {
        spendGold(price);
      }
    }

    setSelectedOption(option);
    setIsProcessing(true);

    setTimeout(() => {
      const successRate = option.result.successRate ?? 1;
      const success = Math.random() < successRate;
      let message = "";

      if (success) {
        switch (option.result.type) {
          case "gold":
            addGold(option.result.value);
            message = option.result.value > 0 
              ? `获得了 ${option.result.value} 金币！` 
              : "什么也没发生...";
            break;
          case "hp":
            healAllCharacters(option.result.value / 100);
            message = `队伍恢复了 ${option.result.value}% 生命值！`;
            break;
          case "mp":
            healAllCharacters(0);
            message = `队伍恢复了 ${option.result.value}% 法力值！`;
            break;
          case "equipment":
            const equipment = generateRandomEquipment();
            addEquipment(equipment);
            message = `获得了 ${equipment.name}！`;
            break;
          case "item":
            const itemId = option.result.itemId || "hp_potion_small";
            addItem(itemId, 1);
            message = "获得了物品！";
            break;
          case "exp":
            message = `获得了 ${option.result.value} 经验值！`;
            break;
          case "damage":
            const randomChar = characters[Math.floor(Math.random() * characters.length)];
            damageCharacter(randomChar.id, option.result.value);
            message = `${randomChar.name} 受到了 ${option.result.value} 点伤害！`;
            break;
          default:
            message = "什么也没发生...";
        }
      } else {
        switch (option.result.type) {
          case "damage":
            message = "幸运地避开了陷阱！";
            break;
          case "gold":
          case "equipment":
          case "item":
            message = "失败了，什么也没得到...";
            break;
          default:
            message = "失败了！";
        }
      }

      setResult({
        success,
        message,
        value: option.result.value,
        type: option.result.type,
      });
      setIsProcessing(false);

      setLastResult({
        type: "event",
        success,
        rewards: {
          message,
          type: option.result.type,
          value: option.result.value,
        },
      });
    }, 1000);
  };

  const handleContinue = () => {
    if (currentRoom) {
      completeRoom(currentRoom.id);
    }
    navigate("/exploring");
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className={`border-2 ${getEventTypeColor(currentEvent.type)}`}>
          <CardHeader>
            <div className="flex items-center gap-4">
              {getEventTypeIcon(currentEvent.type)}
              <div>
                <CardTitle className="text-2xl">{currentEvent.title}</CardTitle>
                <Badge variant="info" className="mt-1">
                  {currentEvent.type === "puzzle" && "解谜"}
                  {currentEvent.type === "trade" && "交易"}
                  {currentEvent.type === "rest" && "休整"}
                  {currentEvent.type === "gamble" && "风险"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gold-300 leading-relaxed"
            >
              {currentEvent.description}
            </motion.p>

            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {currentEvent.options.map((option, idx) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isProcessing}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-300
                        ${selectedOption?.id === option.id
                          ? 'border-gold-400 bg-gold-700/20'
                          : 'border-gold-800/50 hover:border-gold-500/50 hover:bg-gold-700/10'
                        }
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gold-200">{option.text}</span>
                        {option.result.successRate !== undefined && (
                          <Badge variant={option.result.successRate > 0.5 ? "success" : "warning"}>
                            {Math.round(option.result.successRate * 100)}%
                          </Badge>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="mb-4"
                  >
                    {getResultIcon(result.type, result.success)}
                  </motion.div>
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-2xl font-bold mb-2 ${
                      result.success ? "text-gold-300" : "text-accent-red"
                    }`}
                  >
                    {result.success ? "成功！" : "失败..."}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gold-400 text-lg"
                  >
                    {result.message}
                  </motion.p>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                  >
                    <Button onClick={handleContinue} size="lg">
                      继续探索
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-gold-500">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <span className="font-bold text-gold-400">{gold}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventRoom;
