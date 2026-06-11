import type { Position, Character, Enemy, GRID_SIZE } from '@/types/game';
import { GRID_SIZE as GRID_SIZE_CONST } from '@/types/game';

export const getManhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const getMoveRange = (
  start: Position,
  moveSpeed: number,
  occupiedPositions: Position[],
  blockedPositions: Position[] = []
): Position[] => {
  const result: Position[] = [];
  const visited = new Set<string>();
  const queue: { pos: Position; steps: number }[] = [{ pos: start, steps: 0 }];
  
  const key = (p: Position) => `${p.x},${p.y}`;
  visited.add(key(start));
  
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.steps > 0) {
      const isOccupied = occupiedPositions.some(
        (p) => p.x === current.pos.x && p.y === current.pos.y
      );
      const isBlocked = blockedPositions.some(
        (p) => p.x === current.pos.x && p.y === current.pos.y
      );
      
      if (!isOccupied && !isBlocked) {
        result.push(current.pos);
      }
    }

    if (current.steps < moveSpeed) {
      for (const dir of directions) {
        const next: Position = {
          x: current.pos.x + dir.x,
          y: current.pos.y + dir.y,
        };
        
        if (
          next.x >= 0 &&
          next.x < GRID_SIZE_CONST &&
          next.y >= 0 &&
          next.y < GRID_SIZE_CONST &&
          !visited.has(key(next))
        ) {
          const isBlocked = blockedPositions.some(
            (p) => p.x === next.x && p.y === next.y
          );
          
          if (!isBlocked || current.steps + 1 <= moveSpeed) {
            visited.add(key(next));
            queue.push({ pos: next, steps: current.steps + 1 });
          }
        }
      }
    }
  }

  return result;
};

export const getAttackRange = (
  start: Position,
  range: number,
  targetPositions: Position[]
): Position[] => {
  return targetPositions.filter(
    (pos) => getManhattanDistance(start, pos) <= range
  );
};

export const getSkillTargetPositions = (
  casterPosition: Position,
  range: number,
  targetType: 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies',
  allEnemies: Enemy[],
  allAllies: Character[]
): Position[] => {
  if (targetType === 'self') {
    return [casterPosition];
  }

  if (targetType === 'all_enemies') {
    return allEnemies.filter((e) => e.hp > 0).map((e) => e.position);
  }

  if (targetType === 'all_allies') {
    return allAllies.filter((a) => a.hp > 0).map((a) => a.position);
  }

  const targets = targetType === 'enemy' ? allEnemies : allAllies;
  
  return targets
    .filter((t) => t.hp > 0)
    .filter((t) => getManhattanDistance(casterPosition, t.position) <= range)
    .map((t) => t.position);
};

export const determineTurnOrder = (characters: Character[], enemies: Enemy[]): string[] => {
  const allUnits: { id: string; speed: number; isPlayer: boolean }[] = [];

  characters.forEach((char) => {
    if (char.hp > 0) {
      allUnits.push({
        id: char.id,
        speed: char.baseStats.speed,
        isPlayer: true,
      });
    }
  });

  enemies.forEach((enemy) => {
    if (enemy.hp > 0) {
      allUnits.push({
        id: enemy.id,
        speed: enemy.speed,
        isPlayer: false,
      });
    }
  });

  allUnits.sort((a, b) => {
    if (b.speed !== a.speed) {
      return b.speed - a.speed;
    }
    return Math.random() - 0.5;
  });

  return allUnits.map((u) => u.id);
};

export const applyStatusEffects = (
  target: Character | Enemy,
  effects: { type: string; value: number; duration: number }[]
): void => {
  effects.forEach((effect) => {
    target.statusEffects.push({
      id: Math.random().toString(36).substr(2, 9),
      type: effect.type as any,
      duration: effect.duration,
      value: effect.value,
    });
  });
};

export const processStatusEffects = (
  target: Character | Enemy
): { damage: number; heal: number; messages: string[] } => {
  const messages: string[] = [];
  let totalDamage = 0;
  let totalHeal = 0;

  target.statusEffects = target.statusEffects.filter((effect) => {
    switch (effect.type) {
      case 'poison':
        const poisonDamage = Math.floor(target.maxHp * 0.08);
        totalDamage += poisonDamage;
        messages.push(`${target.name} 受到 ${poisonDamage} 点中毒伤害`);
        break;
      case 'burn':
        const burnDamage = Math.floor(target.maxHp * 0.06);
        totalDamage += burnDamage;
        messages.push(`${target.name} 受到 ${burnDamage} 点灼烧伤害`);
        break;
      case 'stun':
        messages.push(`${target.name} 处于眩晕状态，无法行动`);
        break;
    }

    effect.duration -= 1;
    return effect.duration > 0;
  });

  if ('hp' in target) {
    target.hp = Math.max(0, target.hp - totalDamage);
  }

  return { damage: totalDamage, heal: totalHeal, messages };
};

export const isStunned = (target: Character | Enemy): boolean => {
  return target.statusEffects.some((e) => e.type === 'stun');
};

export const hasShield = (target: Character | Enemy): number => {
  const shieldEffect = target.statusEffects.find((e) => e.type === 'shield');
  return shieldEffect ? shieldEffect.value : 0;
};

export const getEffectiveMoveRange = (character: Character, moveRange: number): number => {
  const equipmentBonus = Object.values(character.equipment).reduce((bonus, eq) => {
    if (eq?.stats) {
      const speedBonus = eq.stats.find((s) => s.type === 'speed');
      return bonus + (speedBonus ? Math.floor(speedBonus.value / 3) : 0);
    }
    return bonus;
  }, 0);
  
  return Math.max(1, Math.floor(character.baseStats.speed / 4) + 1 + equipmentBonus);
};
