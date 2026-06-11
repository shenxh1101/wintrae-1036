import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Button } from "@/components/ui";
import { loadGame } from "@/utils/storage";
import { Play, BookOpen, Settings, LogOut, ArrowRight, Swords } from "lucide-react";

const MainMenu = () => {
  const navigate = useNavigate();
  const { setGamePhase, initNewGame, loadSavedGame } = useGameStore();
  const { gold, unlockedDifficulties } = usePlayerStore();
  const [hasSave, setHasSave] = useState(false);
  const [showNewGame, setShowNewGame] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);

  useEffect(() => {
    setHasSave(!!loadGame());
  }, []);

  const handleNewGame = () => {
    setShowNewGame(true);
  };

  const handleContinue = () => {
    if (loadSavedGame()) {
      navigate("/exploring");
    }
  };

  const handleStartNewGame = () => {
    setGamePhase("team_setup");
    useGameStore.getState().setTransitioning(true, { difficulty: selectedDifficulty });
    navigate("/team-setup");
  };

  const handleCodex = () => {
    setGamePhase("codex");
    navigate("/codex");
  };

  const handleSettings = () => {
    setGamePhase("settings");
    navigate("/settings");
  };

  const handleExit = () => {
    if (confirm("确定要退出游戏吗？")) {
      window.location.reload();
    }
  };

  const difficultyNames: Record<number, string> = {
    1: "简单",
    2: "普通",
    3: "困难",
    4: "噩梦",
    5: "地狱",
  };

  const difficultyColors: Record<number, string> = {
    1: "text-rarity-uncommon border-rarity-uncommon",
    2: "text-rarity-common border-rarity-common",
    3: "text-rarity-rare border-rarity-rare",
    4: "text-rarity-epic border-rarity-epic",
    5: "text-rarity-legendary border-rarity-legendary",
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-700/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Swords className="w-12 h-12 text-gold-500" />
            <h1 className="text-5xl md:text-7xl font-bold title-text glow-text font-serif">
              机关塔
            </h1>
            <Swords className="w-12 h-12 text-gold-500" />
          </div>
          <p className="text-xl text-gold-500 font-serif">
            探索古代机关，揭开尘封的秘密
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gold-600">
            <span>当前金币: </span>
            <span className="text-gold-400 font-bold">{gold}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 max-w-sm mx-auto">
          {!showNewGame ? (
            <>
              <Button
                onClick={handleNewGame}
                size="lg"
                className="w-full text-lg"
              >
                <Play className="w-5 h-5" />
                开始新游戏
              </Button>

              <Button
                onClick={handleContinue}
                variant="secondary"
                size="lg"
                className="w-full text-lg"
                disabled={!hasSave}
              >
                <ArrowRight className="w-5 h-5" />
                继续游戏
              </Button>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={handleCodex}
                  variant="secondary"
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4" />
                  图鉴
                </Button>

                <Button
                  onClick={handleSettings}
                  variant="secondary"
                  className="w-full"
                >
                  <Settings className="w-4 h-4" />
                  设置
                </Button>
              </div>

              <Button
                onClick={handleExit}
                variant="ghost"
                className="w-full text-accent-red hover:text-accent-red"
              >
                <LogOut className="w-4 h-4" />
                退出
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gold-300">选择难度</h3>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => unlockedDifficulties.includes(diff) && setSelectedDifficulty(diff)}
                    disabled={!unlockedDifficulties.includes(diff)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200
                      ${selectedDifficulty === diff 
                        ? `${difficultyColors[diff]} bg-current/10 scale-110 shadow-gold-sm` 
                        : 'border-gold-800/50 text-gold-600 hover:border-gold-600/50'
                      }
                      ${!unlockedDifficulties.includes(diff) && 'opacity-30 cursor-not-allowed'}
                    `}
                  >
                    <div className="text-lg font-bold">{diff}</div>
                    <div className="text-xs">{difficultyNames[diff]}</div>
                    {!unlockedDifficulties.includes(diff) && (
                      <div className="text-xs mt-1">🔒</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-sm text-gold-500">
                难度越高，敌人越强，但奖励也越丰厚
              </div>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowNewGame(false)}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button
                  onClick={handleStartNewGame}
                  className="flex-1"
                >
                  下一步
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 text-sm text-gold-700"
      >
        版本 1.0.0 | 古代机关塔探索游戏
      </motion.div>
    </div>
  );
};

export default MainMenu;
