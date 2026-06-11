import { create } from 'zustand';
import type { BattleState, Character, Enemy, Position, ActionType, Skill, Equipment, Item } from '@/types/game';
import { determineTurnOrder, getMoveRange, getSkillTargetPositions, processStatusEffects, isStunned, getEffectiveMoveRange } from '@/utils/battle';
import { calculateDamage, calculateHeal, calculateCharacterStats, calculateEnemyStats } from '@/utils/formula';
import { generateRewardEquipment } from '@/utils/random';
import { ENEMY_SKILLS } from '@/data/enemies';
import { getItemById } from '@/data/events';

interface BattleStore extends BattleState {
  initBattle: (playerCharacters: Character[], enemies: Enemy[]) => void;
  selectUnit: (unitId: string | null) => void;
  selectAction: (action: ActionType) => void;
  selectSkill: (skillId: string | null) => void;
  calculateMoveRange: () => void;
  calculateAttackRange: () => void;
  calculateSkillRange: (skill: Skill) => void;
  moveUnit: (unitId: string, position: Position) => void;
  attackTarget: (attackerId: string, targetPosition: Position) => { damage: number; isCrit: boolean; isDodge: boolean } | null;
  useSkill: (casterId: string, skill: Skill, targetPosition: Position) => void;
  defend: (unitId: string) => void;
  useItem: (itemId: string, targetId: string) => boolean;
  endTurn: () => void;
  executeEnemyTurn: () => void;
  addBattleLog: (message: string) => void;
  clearBattle: () => void;
  setBattleResult: (result: 'victory' | 'defeat') => void;
  checkBattleEnd: () => void;
  calculateRewards: () => void;
  isPlayerUnit: (unitId: string) => boolean;
  getUnitById: (unitId: string) => Character | Enemy | undefined;
  processTurnStart: (unitId: string) => string[];
  processTurnEnd: (unitId: string) => void;
}

const initialState: BattleState = {
  playerCharacters: [],
  enemies: [],
  turnOrder: [],
  currentTurnIndex: 0,
  selectedUnitId: null,
  selectedAction: null,
  selectedSkillId: null,
  moveRange: [],
  attackRange: [],
  targetablePositions: [],
  battleLog: [],
  isPlayerTurn: true,
  battleEnded: false,
  battleResult: null,
  rewards: null,
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...initialState,

  initBattle: (playerCharacters, enemies) => {
    const battleCharacters = playerCharacters.map((c) => ({
      ...c,
      isDefending: false,
      hasActed: false,
      skills: c.skills.map((s) => ({ ...s, currentCooldown: 0 })),
    }));

    const turnOrder = determineTurnOrder(battleCharacters, enemies);
    const firstIsPlayer = battleCharacters.some((c) => c.id === turnOrder[0]);

    set({
      playerCharacters: battleCharacters,
      enemies,
      turnOrder,
      currentTurnIndex: 0,
      selectedUnitId: turnOrder[0] || null,
      selectedAction: null,
      selectedSkillId: null,
      moveRange: [],
      attackRange: [],
      targetablePositions: [],
      battleLog: ['战斗开始！'],
      isPlayerTurn: firstIsPlayer,
      battleEnded: false,
      battleResult: null,
      rewards: null,
    });

    if (!firstIsPlayer) {
      setTimeout(() => {
        if (!get().battleEnded) {
          get().executeEnemyTurn();
        }
      }, 700);
    }
  },

  selectUnit: (unitId) => set({ selectedUnitId: unitId }),

  selectAction: (action) => set({ selectedAction: action, selectedSkillId: null }),

  selectSkill: (skillId) => {
    const { selectedUnitId, playerCharacters, enemies } = get();
    if (!selectedUnitId || !skillId) {
      set({ selectedSkillId: null, targetablePositions: [] });
      return;
    }

    const character = playerCharacters.find((c) => c.id === selectedUnitId);
    if (!character) return;

    const skill = character.skills.find((s) => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || character.mp < skill.mpCost) return;

    set({ selectedAction: 'skill', selectedSkillId: skillId });
    get().calculateSkillRange(skill);
  },

  calculateMoveRange: () => {
    const { selectedUnitId, playerCharacters, enemies } = get();
    if (!selectedUnitId) return;

    const character = playerCharacters.find((c) => c.id === selectedUnitId);
    if (!character || character.hasActed) {
      set({ moveRange: [] });
      return;
    }

    const occupiedPositions = [
      ...playerCharacters.filter((c) => c.id !== selectedUnitId && c.hp > 0).map((c) => c.position),
      ...enemies.filter((e) => e.hp > 0).map((e) => e.position),
    ];

    const moveSpeed = getEffectiveMoveRange(character, 3);
    const moveRange = getMoveRange(character.position, moveSpeed, occupiedPositions);

    set({ moveRange });
  },

  calculateAttackRange: () => {
    const { selectedUnitId, playerCharacters, enemies } = get();
    if (!selectedUnitId) return;

    const character = playerCharacters.find((c) => c.id === selectedUnitId);
    if (!character) return;

    const enemyPositions = enemies.filter((e) => e.hp > 0).map((e) => e.position);
    const attackRange = enemyPositions.filter(
      (pos) => Math.abs(pos.x - character.position.x) + Math.abs(pos.y - character.position.y) <= 1
    );

    set({ attackRange, targetablePositions: attackRange });
  },

  calculateSkillRange: (skill) => {
    const { selectedUnitId, playerCharacters, enemies } = get();
    if (!selectedUnitId) return;

    const character = playerCharacters.find((c) => c.id === selectedUnitId);
    if (!character) return;

    const targetablePositions = getSkillTargetPositions(
      character.position,
      skill.range,
      skill.targetType,
      enemies,
      playerCharacters
    );

    set({ targetablePositions });
  },

  moveUnit: (unitId, position) => {
    set((state) => ({
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === unitId ? { ...c, position, hasActed: true } : c
      ),
      moveRange: [],
      selectedAction: null,
    }));
    get().addBattleLog(`${get().getUnitById(unitId)?.name} 移动到了 (${position.x + 1}, ${position.y + 1})`);
  },

  attackTarget: (attackerId, targetPosition) => {
    const { playerCharacters, enemies } = get();
    const attacker = playerCharacters.find((c) => c.id === attackerId);
    const target = enemies.find(
      (e) => e.hp > 0 && e.position.x === targetPosition.x && e.position.y === targetPosition.y
    );

    if (!attacker || !target) return null;

    const attackerStats = calculateCharacterStats(attacker);
    const targetStats = calculateEnemyStats(target);

    const result = calculateDamage(attackerStats, targetStats);

    if (result.isDodge) {
      get().addBattleLog(`${target.name} 闪避了攻击！`);
    } else {
      const finalDamage = result.isCrit ? result.damage : result.damage;
      target.hp = Math.max(0, target.hp - finalDamage);
      
      const critText = result.isCrit ? '暴击！' : '';
      get().addBattleLog(`${attacker.name} 攻击 ${target.name}，${critText}造成 ${finalDamage} 点伤害`);

      if (target.hp <= 0) {
        get().addBattleLog(`${target.name} 被击败了！`);
      }
    }

    set((state) => ({
      enemies: state.enemies.map((e) => (e.id === target.id ? { ...target } : e)),
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === attackerId ? { ...c, hasActed: true } : c
      ),
      selectedAction: null,
      attackRange: [],
      targetablePositions: [],
    }));

    get().checkBattleEnd();
    return result;
  },

  useSkill: (casterId, skill, targetPosition) => {
    const { playerCharacters, enemies } = get();
    const caster = playerCharacters.find((c) => c.id === casterId);
    if (!caster || caster.mp < skill.mpCost) return;

    caster.mp -= skill.mpCost;

    const casterStats = calculateCharacterStats(caster);

    if (skill.type === 'damage' || skill.type === 'aoe') {
      const targets: Enemy[] = [];
      
      if (skill.targetType === 'all_enemies') {
        targets.push(...enemies.filter((e) => e.hp > 0));
      } else {
        const target = enemies.find(
          (e) => e.hp > 0 && e.position.x === targetPosition.x && e.position.y === targetPosition.y
        );
        if (target) targets.push(target);
      }

      targets.forEach((target) => {
        const targetStats = calculateEnemyStats(target);
        const result = calculateDamage(casterStats, targetStats, skill.damage || 1);
        
        if (!result.isDodge) {
          target.hp = Math.max(0, target.hp - result.damage);
          const critText = result.isCrit ? '暴击！' : '';
          get().addBattleLog(`${skill.name} 命中 ${target.name}，${critText}造成 ${result.damage} 点伤害`);
          
          if (target.hp <= 0) {
            get().addBattleLog(`${target.name} 被击败了！`);
          }
        } else {
          get().addBattleLog(`${target.name} 闪避了 ${skill.name}！`);
        }
      });
    } else if (skill.type === 'heal') {
      const targets: Character[] = [];
      
      if (skill.targetType === 'all_allies') {
        targets.push(...playerCharacters.filter((c) => c.hp > 0));
      } else if (skill.targetType === 'self') {
        targets.push(caster);
      } else {
        const target = playerCharacters.find(
          (c) => c.hp > 0 && c.position.x === targetPosition.x && c.position.y === targetPosition.y
        );
        if (target) targets.push(target);
      }

      targets.forEach((target) => {
        const healAmount = calculateHeal(casterStats, skill.heal || 0, target);
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        get().addBattleLog(`${skill.name} 恢复了 ${target.name} ${healAmount} 点生命值`);
      });
    } else if (skill.type === 'buff') {
      const targets: Character[] = [];
      
      if (skill.targetType === 'all_allies') {
        targets.push(...playerCharacters.filter((c) => c.hp > 0));
      } else if (skill.targetType === 'self') {
        targets.push(caster);
      } else {
        const target = playerCharacters.find(
          (c) => c.hp > 0 && c.position.x === targetPosition.x && c.position.y === targetPosition.y
        );
        if (target) targets.push(target);
      }

      targets.forEach((target) => {
        target.statusEffects.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'buff_attack',
          duration: 3,
          value: 0.3,
        });
        get().addBattleLog(`${target.name} 获得了 ${skill.name} 效果`);
      });
    } else if (skill.type === 'debuff') {
      const target = enemies.find(
        (e) => e.hp > 0 && e.position.x === targetPosition.x && e.position.y === targetPosition.y
      );
      if (target) {
        target.statusEffects.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'debuff_defense',
          duration: 3,
          value: 0.3,
        });
        get().addBattleLog(`${target.name} 被施加了 ${skill.name} 效果`);
      }
    }

    caster.skills = caster.skills.map((s) =>
      s.id === skill.id ? { ...s, currentCooldown: skill.cooldown } : s
    );

    set((state) => ({
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === casterId ? { ...caster, hasActed: true } : c
      ),
      enemies: [...enemies],
      selectedAction: null,
      selectedSkillId: null,
      targetablePositions: [],
    }));

    get().checkBattleEnd();
  },

  defend: (unitId) => {
    set((state) => ({
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === unitId ? { ...c, isDefending: true, hasActed: true } : c
      ),
      selectedAction: null,
    }));
    get().addBattleLog(`${get().getUnitById(unitId)?.name} 进入防御姿态`);
  },

  useItem: (itemId, targetId) => {
    const { playerCharacters } = get();
    const target = playerCharacters.find((c) => c.id === targetId);
    const item = getItemById(itemId);
    
    if (!target || !item) return false;

    let success = false;

    switch (item.effect.type) {
      case 'heal':
        if (target.hp < target.maxHp) {
          target.hp = Math.min(target.maxHp, target.hp + item.effect.value);
          get().addBattleLog(`使用 ${item.name}，恢复 ${target.name} ${item.effect.value} 点生命值`);
          success = true;
        }
        break;
      case 'restore_mp':
        if (target.mp < target.maxMp) {
          target.mp = Math.min(target.maxMp, target.mp + item.effect.value);
          get().addBattleLog(`使用 ${item.name}，恢复 ${target.name} ${item.effect.value} 点法力值`);
          success = true;
        }
        break;
      case 'revive':
        if (target.hp <= 0) {
          target.hp = Math.floor(target.maxHp * (item.effect.value / 100));
          target.statusEffects = [];
          get().addBattleLog(`使用 ${item.name}，复活了 ${target.name}`);
          success = true;
        }
        break;
    }

    if (success) {
      set({
        playerCharacters: [...playerCharacters],
        selectedAction: null,
      });
    }

    return success;
  },

  endTurn: () => {
    const { currentTurnIndex, turnOrder, playerCharacters, enemies } = get();
    
    const currentUnitId = turnOrder[currentTurnIndex];
    get().processTurnEnd(currentUnitId);

    let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    let attempts = 0;
    
    while (attempts < turnOrder.length) {
      const nextUnitId = turnOrder[nextIndex];
      const unit = get().getUnitById(nextUnitId);
      
      if (unit && unit.hp > 0) {
        break;
      }
      nextIndex = (nextIndex + 1) % turnOrder.length;
      attempts++;
    }

    if (attempts >= turnOrder.length) {
      return;
    }

    const nextUnitId = turnOrder[nextIndex];
    const nextUnit = get().getUnitById(nextUnitId);
    const isPlayerTurn = playerCharacters.some((c) => c.id === nextUnitId);

    const startMessages = get().processTurnStart(nextUnitId);
    startMessages.forEach((msg) => get().addBattleLog(msg));

    if (nextUnit && isStunned(nextUnit)) {
      get().addBattleLog(`${nextUnit.name} 处于眩晕状态，跳过回合`);
      get().endTurn();
      return;
    }

    set((state) => ({
      currentTurnIndex: nextIndex,
      selectedUnitId: nextUnitId,
      isPlayerTurn,
      selectedAction: null,
      selectedSkillId: null,
      moveRange: [],
      attackRange: [],
      targetablePositions: [],
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === nextUnitId ? { ...c, isDefending: false, hasActed: false } : c
      ),
    }));

    if (!isPlayerTurn && !get().battleEnded) {
      setTimeout(() => {
        get().executeEnemyTurn();
      }, 700);
    }
  },

  executeEnemyTurn: () => {
    const { selectedUnitId, enemies, playerCharacters } = get();
    if (!selectedUnitId) return;

    const enemy = enemies.find((e) => e.id === selectedUnitId && e.hp > 0);
    if (!enemy) {
      get().endTurn();
      return;
    }

    const aliveCharacters = playerCharacters.filter((c) => c.hp > 0);
    if (aliveCharacters.length === 0) {
      get().checkBattleEnd();
      return;
    }

    const enemyStats = calculateEnemyStats(enemy);

    let closestTarget = aliveCharacters[0];
    let minDistance = Infinity;

    aliveCharacters.forEach((c) => {
      const distance = Math.abs(c.position.x - enemy.position.x) + Math.abs(c.position.y - enemy.position.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = c;
      }
    });

    if (minDistance <= 1) {
      const targetStats = calculateCharacterStats(closestTarget);
      const result = calculateDamage(enemyStats, targetStats);

      if (result.isDodge) {
        get().addBattleLog(`${closestTarget.name} 闪避了 ${enemy.name} 的攻击！`);
      } else {
        const shieldValue = closestTarget.statusEffects.find((e) => e.type === 'shield')?.value || 0;
        let damage = result.damage;
        
        if (shieldValue > 0) {
          const absorbed = Math.min(shieldValue, damage);
          damage -= absorbed;
          closestTarget.statusEffects = closestTarget.statusEffects.map((e) =>
            e.type === 'shield' ? { ...e, value: e.value - absorbed } : e
          ).filter((e) => e.value > 0);
          get().addBattleLog(`护盾吸收了 ${absorbed} 点伤害`);
        }

        closestTarget.hp = Math.max(0, closestTarget.hp - damage);
        const critText = result.isCrit ? '暴击！' : '';
        get().addBattleLog(`${enemy.name} 攻击 ${closestTarget.name}，${critText}造成 ${damage} 点伤害`);

        if (closestTarget.hp <= 0) {
          get().addBattleLog(`${closestTarget.name} 倒下了！`);
        }
      }
    } else {
      const occupiedPositions = [
        ...playerCharacters.filter((c) => c.hp > 0).map((c) => c.position),
        ...enemies.filter((e) => e.id !== enemy.id && e.hp > 0).map((e) => e.position),
      ];

      const moveRange = getMoveRange(enemy.position, 2, occupiedPositions);
      
      let bestMove = enemy.position;
      let bestDistance = minDistance;

      moveRange.forEach((pos) => {
        const distance = Math.abs(pos.x - closestTarget.position.x) + Math.abs(pos.y - closestTarget.position.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMove = pos;
        }
      });

      if (bestMove !== enemy.position) {
        enemy.position = bestMove;
        get().addBattleLog(`${enemy.name} 移动到了 (${bestMove.x + 1}, ${bestMove.y + 1})`);
      }
    }

    set({
      enemies: [...enemies],
      playerCharacters: [...playerCharacters],
    });

    get().checkBattleEnd();

    if (!get().battleEnded) {
      setTimeout(() => {
        get().endTurn();
      }, 500);
    }
  },

  addBattleLog: (message) =>
    set((state) => ({
      battleLog: [...state.battleLog, message].slice(-50),
    })),

  clearBattle: () => set(initialState),

  setBattleResult: (result) => set({ battleEnded: true, battleResult: result }),

  checkBattleEnd: () => {
    const { playerCharacters, enemies } = get();
    
    const allEnemiesDead = enemies.every((e) => e.hp <= 0);
    const allPlayersDead = playerCharacters.every((c) => c.hp <= 0);

    if (allEnemiesDead) {
      get().setBattleResult('victory');
      get().calculateRewards();
      get().addBattleLog('战斗胜利！');
    } else if (allPlayersDead) {
      get().setBattleResult('defeat');
      get().addBattleLog('战斗失败...');
    }
  },

  calculateRewards: () => {
    const { enemies, playerCharacters } = get();
    
    let totalGold = 0;
    let totalExp = 0;
    const items: Item[] = [];
    const equipment: Equipment[] = [];

    enemies.forEach((enemy) => {
      totalGold += enemy.goldReward;
      totalExp += enemy.expReward;

      enemy.lootTable.forEach((loot) => {
        if (Math.random() < loot.chance) {
          const item = getItemById(loot.itemId);
          if (item) items.push(item);
        }
      });
    });

    if (enemies.some((e) => e.isBoss) || Math.random() < 0.3) {
      const isBoss = enemies.some((e) => e.isBoss);
      const floor = playerCharacters[0]?.level || 1;
      equipment.push(generateRewardEquipment(floor, isBoss));
    }

    set({
      rewards: {
        gold: totalGold,
        exp: totalExp,
        items,
        equipment,
      },
    });
  },

  isPlayerUnit: (unitId) => {
    return get().playerCharacters.some((c) => c.id === unitId);
  },

  getUnitById: (unitId) => {
    const { playerCharacters, enemies } = get();
    return (
      playerCharacters.find((c) => c.id === unitId) ||
      enemies.find((e) => e.id === unitId)
    );
  },

  processTurnStart: (unitId) => {
    const unit = get().getUnitById(unitId);
    if (!unit) return [];

    const { messages } = processStatusEffects(unit);
    
    if ('hp' in unit && unit.hp <= 0) {
      messages.push(`${unit.name} 因持续伤害倒下了！`);
    }

    return messages;
  },

  processTurnEnd: (unitId) => {
    const { playerCharacters } = get();
    
    set((state) => ({
      playerCharacters: state.playerCharacters.map((c) =>
        c.id === unitId
          ? {
              ...c,
              skills: c.skills.map((s) => ({
                ...s,
                currentCooldown: Math.max(0, s.currentCooldown - 1),
              })),
            }
          : c
      ),
    }));
  },
}));
