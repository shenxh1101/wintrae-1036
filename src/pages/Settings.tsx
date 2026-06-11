import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useGameStore } from "@/store/useGameStore";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal } from "@/components/ui";
import { saveSettings, deleteSave, loadSettings } from "@/utils/storage";
import type { GameSettings } from "@/types/game";
import {
  Settings as SettingsIcon, ChevronLeft, Volume2, VolumeX, Music,
  Zap, Grid3X3, Trash2, Download, Upload, AlertTriangle,
  Check, X, Info
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, setSettings } = usePlayerStore();
  const { setGamePhase, resetGame } = useGameStore();
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedSettings = loadSettings();
    setLocalSettings(savedSettings);
  }, []);

  useEffect(() => {
    const isChanged = 
      localSettings.soundEnabled !== settings.soundEnabled ||
      localSettings.musicVolume !== settings.musicVolume ||
      localSettings.effectVolume !== settings.effectVolume ||
      localSettings.animationSpeed !== settings.animationSpeed ||
      localSettings.gridSize !== settings.gridSize;
    setHasChanges(isChanged);
  }, [localSettings, settings]);

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("有未保存的更改，确定要离开吗？")) {
        setGamePhase("menu");
        navigate("/");
      }
    } else {
      setGamePhase("menu");
      navigate("/");
    }
  };

  const handleSave = () => {
    setSettings(localSettings);
    saveSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    deleteSave();
    resetGame(false);
    setShowResetConfirm(false);
    navigate("/");
  };

  const handleExport = () => {
    const saveData = localStorage.getItem("mechanic_tower_save");
    if (saveData) {
      const blob = new Blob([saveData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mechanic_tower_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert("没有可导出的存档数据");
    }
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      if (data.version && data.playerState && data.characters) {
        localStorage.setItem("mechanic_tower_save", importText);
        setImportStatus("success");
        setTimeout(() => {
          setShowImportModal(false);
          setImportText("");
          setImportStatus("idle");
          alert("导入成功！请重新加载游戏");
        }, 1500);
      } else {
        setImportStatus("error");
      }
    } catch {
      setImportStatus("error");
    }
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
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
              <SettingsIcon className="inline w-7 h-7 mr-2 text-gold-400" />
              设置
            </h1>
          </div>

          {hasChanges && (
            <Badge variant="warning" className="animate-pulse">
              未保存更改
            </Badge>
          )}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gold-400" />
                  音频设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {localSettings.soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-gold-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gold-600" />
                    )}
                    <span className="text-gold-300">音效总开关</span>
                  </div>
                  <button
                    onClick={() => setLocalSettings({
                      ...localSettings,
                      soundEnabled: !localSettings.soundEnabled
                    })}
                    className={`
                      relative w-14 h-7 rounded-full transition-colors duration-300
                      ${localSettings.soundEnabled ? "bg-gold-500" : "bg-gold-800"}
                    `}
                  >
                    <motion.div
                      animate={{ x: localSettings.soundEnabled ? 28 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-accent-purple" />
                    <span className="text-gold-300 text-sm">
                      音乐音量: {Math.round(localSettings.musicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localSettings.musicVolume}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      musicVolume: parseFloat(e.target.value)
                    })}
                    disabled={!localSettings.soundEnabled}
                    className="w-full h-2 bg-gold-800 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-gold-400
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg
                      disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-accent-blue" />
                    <span className="text-gold-300 text-sm">
                      音效音量: {Math.round(localSettings.effectVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localSettings.effectVolume}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      effectVolume: parseFloat(e.target.value)
                    })}
                    disabled={!localSettings.soundEnabled}
                    className="w-full h-2 bg-gold-800 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-gold-400
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg
                      disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold-400" />
                  游戏设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-orange" />
                      <span className="text-gold-300 text-sm">动画速度</span>
                    </div>
                    <select
                      value={localSettings.animationSpeed}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        animationSpeed: parseFloat(e.target.value)
                      })}
                      className="bg-gold-800/50 border border-gold-700/50 rounded-lg px-3 py-1 text-gold-300
                        focus:outline-none focus:border-gold-500"
                    >
                      <option value={0.5}>0.5x (慢速)</option>
                      <option value={0.75}>0.75x (较慢)</option>
                      <option value={1}>1x (正常)</option>
                      <option value={1.5}>1.5x (较快)</option>
                      <option value={2}>2x (快速)</option>
                    </select>
                  </div>
                  <p className="text-xs text-gold-500">
                    调整战斗和界面动画的播放速度
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4 text-accent-blue" />
                      <span className="text-gold-300 text-sm">战斗网格大小</span>
                    </div>
                    <select
                      value={localSettings.gridSize}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        gridSize: parseInt(e.target.value)
                      })}
                      className="bg-gold-800/50 border border-gold-700/50 rounded-lg px-3 py-1 text-gold-300
                        focus:outline-none focus:border-gold-500"
                    >
                      <option value={4}>4x4 (小型)</option>
                      <option value={5}>5x5 (中型)</option>
                      <option value={6}>6x6 (标准)</option>
                      <option value={7}>7x7 (大型)</option>
                      <option value={8}>8x8 (超大型)</option>
                    </select>
                  </div>
                  <p className="text-xs text-gold-500">
                    调整战斗棋盘的大小，影响移动和战术选择
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gold-400" />
                  存档管理
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleExport}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出存档
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowImportModal(true)}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    导入存档
                  </Button>
                </div>

                <Button
                  variant="danger"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  重置游戏
                </Button>

                <div className="flex items-start gap-2 p-3 bg-gold-800/20 rounded-lg">
                  <Info className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gold-500">
                    重置游戏将删除所有进度，但会保留图鉴记录。失败时会保留30%资源。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1"
              disabled={!hasChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              保存设置
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-accent-red">
            <AlertTriangle className="w-8 h-8" />
            <h3 className="text-xl font-bold">确认重置</h3>
          </div>
          <p className="text-gold-500">
            确定要重置游戏吗？这将删除所有存档进度，但图鉴记录会被保留。
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              确认重置
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText("");
          setImportStatus("idle");
        }}
        size="lg"
      >
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gold-300">导入存档</h3>
          <p className="text-gold-500 text-sm">
            粘贴存档数据到下方文本框中，然后点击导入按钮。
          </p>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportStatus("idle");
            }}
            placeholder='{"version": "1.0.0", ...}'
            className="w-full h-40 bg-gold-800/30 border border-gold-700/50 rounded-lg p-3
              text-gold-300 font-mono text-sm resize-none
              focus:outline-none focus:border-gold-500"
          />
          {importStatus === "error" && (
            <div className="flex items-center gap-2 text-accent-red text-sm">
              <X className="w-4 h-4" />
              存档格式无效，请检查数据是否正确
            </div>
          )}
          {importStatus === "success" && (
            <div className="flex items-center gap-2 text-accent-green text-sm">
              <Check className="w-4 h-4" />
              导入成功！
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportModal(false);
                setImportText("");
                setImportStatus("idle");
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!importText.trim() || importStatus === "success"}
            >
              <Upload className="w-4 h-4 mr-2" />
              导入
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
