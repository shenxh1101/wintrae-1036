import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CharacterCard, EquipmentSlot } from "@/components/game";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ROOM_TYPE_NAMES, TOTAL_FLOORS } from "@/types/game";
import type { Room } from "@/types/game";
import { Sword, Star, Skull, HelpCircle, Coffee, Gift, Coins, Backpack, Map } from "lucide-react";

const Exploring = () => {
  const navigate = useNavigate();
  const { towerState, gamePhase, getAvailableRooms, enterRoom, goToNextFloor } = useGameStore();
  const { characters, gold, inventory } = usePlayerStore();

  useEffect(() => {
    if (gamePhase !== "exploring") {
      navigate("/");
    }
  }, [gamePhase, navigate]);

  const availableRooms = getAvailableRooms();
  const allRoomsCleared = towerState.rooms.every((r) => r.cleared);

  const handleEnterRoom = (roomId: string) => {
    enterRoom(roomId);
    const room = towerState.rooms.find((r) => r.id === roomId);
    
    if (room?.type === "battle" || room?.type === "elite" || room?.type === "boss") {
      navigate("/battle");
    } else if (room?.type === "event") {
      navigate("/event");
    }
  };

  const handleNextFloor = () => {
    goToNextFloor();
    navigate("/result");
  };

  const handleOpenInventory = () => {
    useGameStore.getState().setGamePhase("inventory");
    navigate("/inventory");
  };

  const getRoomIcon = (room: Room) => {
    switch (room.type) {
      case "battle":
        return <Sword className="w-8 h-8 text-accent-red" />;
      case "elite":
        return <Star className="w-8 h-8 text-accent-orange" />;
      case "boss":
        return <Skull className="w-8 h-8 text-accent-purple" />;
      case "event":
        return <HelpCircle className="w-8 h-8 text-accent-blue" />;
      case "rest":
        return <Coffee className="w-8 h-8 text-accent-green" />;
      case "treasure":
        return <Gift className="w-8 h-8 text-gold-400" />;
      default:
        return <HelpCircle className="w-8 h-8" />;
    }
  };

  const getRoomColor = (room: Room) => {
    switch (room.type) {
      case "battle":
        return "border-accent-red/50 hover:border-accent-red hover:bg-accent-red/10";
      case "elite":
        return "border-accent-orange/50 hover:border-accent-orange hover:bg-accent-orange/10";
      case "boss":
        return "border-accent-purple/50 hover:border-accent-purple hover:bg-accent-purple/10";
      case "event":
        return "border-accent-blue/50 hover:border-accent-blue hover:bg-accent-blue/10";
      case "rest":
        return "border-accent-green/50 hover:border-accent-green hover:bg-accent-green/10";
      case "treasure":
        return "border-gold-500/50 hover:border-gold-400 hover:bg-gold-500/10";
      default:
        return "border-gold-800/50";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold title-text">
              <Map className="inline w-8 h-8 mr-3 text-gold-500" />
              机关塔 第 {towerState.floor} 层
            </h1>
            <span className="text-gold-500">
              ({towerState.floor} / {TOTAL_FLOORS})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gold-400">
              <Coins className="w-5 h-5" />
              <span className="font-bold">{gold}</span>
            </div>
            <Button variant="secondary" onClick={handleOpenInventory}>
              <Backpack className="w-4 h-4 mr-2" />
              背包 ({inventory.equipment.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>队伍状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    size="sm"
                    showDetails={true}
                    onClick={() => {}}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>选择房间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {towerState.rooms.map((room, index) => {
                    const isAvailable = availableRooms.some((r) => r.id === room.id);
                    const isCleared = room.cleared;

                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => isAvailable && !isCleared && handleEnterRoom(room.id)}
                          disabled={!isAvailable || isCleared}
                          className={`
                            w-full p-6 rounded-xl border-2 bg-bg-card
                            flex flex-col items-center gap-3 transition-all duration-300
                            ${isCleared
                              ? "border-gold-800/30 opacity-40 cursor-not-allowed"
                              : isAvailable
                              ? `${getRoomColor(room)} cursor-pointer`
                              : "border-gold-800/20 opacity-30 cursor-not-allowed"
                            }
                          `}
                        >
                          <div
                            className={`
                              w-16 h-16 rounded-full flex items-center justify-center
                              ${isCleared ? "bg-gold-800/20" : "bg-bg-secondary"}
                            `}
                          >
                            {isCleared ? (
                              <span className="text-2xl">✓</span>
                            ) : (
                              getRoomIcon(room)
                            )}
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gold-300">
                              {ROOM_TYPE_NAMES[room.type]}
                            </div>
                            <div className="text-xs text-gold-500">
                              房间 #{index + 1}
                            </div>
                          </div>
                          {isAvailable && !isCleared && (
                            <div className="text-xs text-gold-400 animate-pulse">
                              点击进入
                            </div>
                          )}
                          {isCleared && (
                            <div className="text-xs text-gold-600">
                              已清理
                            </div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {allRoomsCleared && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 text-center"
                  >
                    <Card className="inline-block border-gold-500/50 shadow-gold">
                      <CardContent className="space-y-4">
                        <p className="text-gold-300 font-bold">
                          所有房间已清理完毕！
                        </p>
                        <Button onClick={handleNextFloor} size="lg">
                          前往第 {towerState.floor + 1} 层
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="text-sm text-gold-500">战斗房间</div>
                  <div className="text-xs text-gold-600">击败敌人获取奖励</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-sm text-gold-500">精英战斗</div>
                  <div className="text-xs text-gold-600">更强敌人，更好奖励</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">💀</div>
                  <div className="text-sm text-gold-500">Boss战</div>
                  <div className="text-xs text-gold-600">击败Boss进入下一层</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">❓</div>
                  <div className="text-sm text-gold-500">事件房间</div>
                  <div className="text-xs text-gold-600">解谜、交易、风险</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">☕</div>
                  <div className="text-sm text-gold-500">休整营地</div>
                  <div className="text-xs text-gold-600">恢复生命和法力</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <div className="text-sm text-gold-500">宝箱房间</div>
                  <div className="text-xs text-gold-600">获得金币和装备</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exploring;
