import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/useGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CLASSES } from "@/data/classes";
import { SKILLS } from "@/data/skills";
import { CLASS_NAMES, MAX_PARTY_SIZE } from "@/types/game";
import type { CharacterClass, Skill } from "@/types/game";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { SkillButton } from "@/components/game";
import { ArrowLeft, ArrowRight, Users, Info, RotateCcw } from "lucide-react";

const TeamSetup = () => {
  const navigate = useNavigate();
  const { transitionData, initNewGame, setGamePhase } = useGameStore();
  const [selectedClasses, setSelectedClasses] = useState<(CharacterClass | null)[]>(
    Array(MAX_PARTY_SIZE).fill(null)
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
  ]);
  const [showSkillDetails, setShowSkillDetails] = useState<Skill | null>(null);

  const difficulty = transitionData?.difficulty || 1;

  useEffect(() => {
    if (!transitionData) {
      navigate("/");
    }
  }, [transitionData, navigate]);

  const classList = Object.values(CLASSES);

  const handleSelectClass = (classId: CharacterClass) => {
    if (selectedSlot === null) return;
    if (selectedClasses.includes(classId)) {
      alert("每个职业只能选择一次！");
      return;
    }

    const newClasses = [...selectedClasses];
    newClasses[selectedSlot] = classId;
    setSelectedClasses(newClasses);
    setSelectedSlot(null);
  };

  const handleRemoveClass = (index: number) => {
    const newClasses = [...selectedClasses];
    newClasses[index] = null;
    setSelectedClasses(newClasses);
  };

  const handleMovePosition = (index: number, direction: "up" | "down") => {
    const newPositions = [...positions];
    const currentY = newPositions[index].y;
    
    if (direction === "up" && currentY > 0) {
      newPositions[index] = { ...newPositions[index], y: currentY - 1 };
    } else if (direction === "down" && currentY < 5) {
      newPositions[index] = { ...newPositions[index], y: currentY + 1 };
    }
    
    setPositions(newPositions);
  };

  const handleReset = () => {
    setSelectedClasses(Array(MAX_PARTY_SIZE).fill(null));
    setPositions([
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ]);
    setSelectedSlot(null);
  };

  const handleStartGame = () => {
    const filledClasses = selectedClasses.filter(
      (c): c is CharacterClass => c !== null
    );
    if (filledClasses.length !== MAX_PARTY_SIZE) {
      alert(`请选择 ${MAX_PARTY_SIZE} 个职业！`);
      return;
    }

    const charactersWithPositions = filledClasses.map((classId, index) => ({
      classId,
      position: positions[index],
    }));

    const finalPositions = charactersWithPositions.map(c => c.position);
    initNewGame(difficulty, filledClasses);

    const { characters } = usePlayerStore.getState();
    const updatedCharacters = characters.map((char, index) => ({
      ...char,
      position: finalPositions[index],
    }));
    usePlayerStore.getState().setCharacters(updatedCharacters);

    navigate("/exploring");
  };

  const handleBack = () => {
    setGamePhase("menu");
    navigate("/");
  };

  const getCharacterSkills = (classId: CharacterClass) => {
    const classData = CLASSES[classId];
    return classData.skillIds
      .map((id) => SKILLS[id])
      .filter(Boolean)
      .map((skill) => ({ ...skill, currentCooldown: 0 }));
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold title-text text-center">
            <Users className="inline w-8 h-8 mr-3 text-gold-500" />
            队伍编成
          </h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>选择队员位置（左侧3x2区域）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div
                    className="grid gap-1 p-4 bg-bg-secondary/50 rounded-xl"
                    style={{
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gridTemplateRows: "repeat(6, 1fr)",
                      aspectRatio: "2/6",
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const x = idx % 2;
                      const y = Math.floor(idx / 2);
                      const charIndex = positions.findIndex(
                        (p) => p.x === x && p.y === y
                      );
                      const classId = charIndex >= 0 ? selectedClasses[charIndex] : null;
                      const classData = classId ? CLASSES[classId] : null;

                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`
                            grid-cell rounded-lg flex items-center justify-center
                            ${x === 0 ? 'bg-accent-blue/10 border-accent-blue/30' : 'bg-bg-tertiary/30'}
                            ${charIndex >= 0 ? 'cursor-pointer' : ''}
                          `}
                          onClick={() => {
                            if (charIndex >= 0) {
                              setSelectedSlot(charIndex);
                            }
                          }}
                        >
                          {classData && (
                            <motion.div
                              layout
                              className="text-center"
                            >
                              <div className="text-2xl">{classData.icon}</div>
                              <div className="text-[10px] text-gold-400">
                                {CLASS_NAMES[classId!]}
                              </div>
                              <div className="text-[9px] text-gold-600">
                                #{charIndex + 1}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold text-gold-300">调整站位</h3>
                    <p className="text-sm text-gold-500">
                      点击左侧格子选中角色，然后使用下方按钮调整位置
                    </p>

                    <div className="space-y-3">
                      {selectedClasses.map((classId, index) => {
                        const classData = classId ? CLASSES[classId] : null;
                        const isSelected = selectedSlot === index;

                        return (
                          <motion.div
                            key={index}
                            layout
                            className={`
                              p-4 rounded-xl border-2 transition-all duration-200
                              ${isSelected
                                ? 'border-gold-400 bg-gold-700/20 shadow-gold-sm'
                                : 'border-gold-800/50 bg-bg-card'
                              }
                            `}
                            onClick={() => setSelectedSlot(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gold-500">
                                  #{index + 1}
                                </span>
                                {classData ? (
                                  <>
                                    <div className="text-3xl">{classData.icon}</div>
                                    <div>
                                      <div className="font-bold text-gold-300">
                                        {CLASS_NAMES[classId!]}
                                      </div>
                                      <div className="text-xs text-gold-500">
                                        {classData.description.slice(0, 20)}...
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-gold-600">
                                    点击选择职业
                                  </div>
                                )}
                              </div>

                              {classId && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMovePosition(index, "up");
                                    }}
                                    disabled={positions[index].y <= 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMovePosition(index, "down");
                                    }}
                                    disabled={positions[index].y >= 5}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveClass(index);
                                    }}
                                    className="text-accent-red"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              )}
                            </div>

                            {classId && (
                              <div className="mt-3 pt-3 border-t border-gold-800/30">
                                <div className="text-xs text-gold-500 mb-2">技能</div>
                                <div className="flex gap-2">
                                  {getCharacterSkills(classId).map((skill) => (
                                    <SkillButton
                                      key={skill.id}
                                      skill={skill}
                                      size="sm"
                                      onClick={() => setShowSkillDetails(skill)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>可选职业</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classList.map((classData) => {
                    const isSelected = selectedClasses.includes(classData.id);
                    return (
                      <motion.button
                        key={classData.id}
                        whileHover={!isSelected ? { scale: 1.02 } : {}}
                        whileTap={!isSelected ? { scale: 0.98 } : {}}
                        onClick={() => handleSelectClass(classData.id)}
                        disabled={isSelected || selectedSlot === null}
                        className={`
                          w-full p-3 rounded-lg border-2 text-left transition-all duration-200
                          flex items-center gap-3
                          ${isSelected
                            ? 'border-gold-600/30 bg-gold-700/10 opacity-50 cursor-not-allowed'
                            : selectedSlot !== null
                            ? 'border-gold-700/50 bg-bg-secondary hover:border-gold-500 hover:bg-gold-700/20 cursor-pointer'
                            : 'border-gold-800/30 bg-bg-secondary/50 opacity-60 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="text-3xl">{classData.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gold-300">
                            {classData.name}
                          </div>
                          <div className="text-xs text-gold-500 truncate">
                            {classData.description}
                          </div>
                          <div className="flex gap-2 mt-1 text-[10px] text-gold-600">
                            <span>HP:{classData.baseHp}</span>
                            <span>攻:{classData.baseAttack}</span>
                            <span>防:{classData.baseDefense}</span>
                            <span>速:{classData.baseSpeed}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-gold-500">已选择</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm text-gold-500">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    选择 {MAX_PARTY_SIZE} 个不同职业的角色组成队伍。
                    调整他们的初始站位以获得战术优势。
                    不同职业有不同的技能和属性，合理搭配是胜利的关键！
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleStartGame}
                    disabled={selectedClasses.filter(Boolean).length !== MAX_PARTY_SIZE}
                  >
                    开始冒险
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showSkillDetails && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSkillDetails(null)}
        >
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{showSkillDetails.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gold-400">{showSkillDetails.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-bg-secondary/50 p-2 rounded">
                  <span className="text-gold-500">类型: </span>
                  <span className="text-gold-300">{showSkillDetails.type}</span>
                </div>
                <div className="bg-bg-secondary/50 p-2 rounded">
                  <span className="text-gold-500">范围: </span>
                  <span className="text-gold-300">{showSkillDetails.range}格</span>
                </div>
                <div className="bg-bg-secondary/50 p-2 rounded">
                  <span className="text-gold-500">消耗: </span>
                  <span className="text-accent-blue">{showSkillDetails.mpCost} MP</span>
                </div>
                <div className="bg-bg-secondary/50 p-2 rounded">
                  <span className="text-gold-500">冷却: </span>
                  <span className="text-gold-300">{showSkillDetails.cooldown}回合</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setShowSkillDetails(null)}
              >
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamSetup;
