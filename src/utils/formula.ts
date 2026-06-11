import type { Character, Enemy, Equipment, StatType } from '@/types/game';
import { EQUIPMENT_SETS } from '@/data/sets';

export const calculateDamage = (
  attacker: { attack: number; critRate: number; critDamage: number },
  defender: { defense: number; dodge: number },
  skillMultiplier: number = 1.0,
  ignoreDefense: number = 0
): { damage: number; isCrit: boolean; isDodge: boolean } => {
  const isDodge = Math.random() < defender.dodge;
  if (isDodge) {
    return { damage: 0, isCrit: false, isDodge: true };
  }

  const effectiveDefense = defender.defense * (1 - ignoreDefense);
  let baseDamage = Math.max(1, attacker.attack * skillMultiplier - effectiveDefense * 0.5);
  
  const isCrit = Math.random() < attacker.critRate;
  if (isCrit) {
    baseDamage = baseDamage * (1.5 + attacker.critDamage);
  }

  const randomFactor = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.floor(baseDamage * randomFactor);

  return { damage: Math.max(1, finalDamage), isCrit, isDodge };
};

export const calculateHeal = (
  healer: { attack: number },
  baseHeal: number,
  target: { maxHp: number }
): number => {
  const healAmount = baseHeal + Math.floor(healer.attack * 0.3);
  return Math.min(healAmount, target.maxHp);
};

export const getExpToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateCharacterStats = (character: Character): Record<StatType, number> => {
  const stats: Record<StatType, number> = {
    attack: character.baseStats.attack,
    defense: character.baseStats.defense,
    hp: character.maxHp,
    mp: character.maxMp,
    speed: character.baseStats.speed,
    critRate: character.baseStats.critRate,
    critDamage: character.baseStats.critDamage,
    dodge: character.baseStats.dodge,
  };

  const equippedSetIds = new Map<string, number>();

  (Object.values(character.equipment) as (Equipment | null)[]).forEach((equipment) => {
    if (!equipment) return;

    Object.entries(equipment.baseStats).forEach(([stat, value]) => {
      if (value !== undefined) {
        stats[stat as StatType] = (stats[stat as StatType] || 0) + value;
      }
    });

    equipment.stats.forEach((stat) => {
      stats[stat.type] = (stats[stat.type] || 0) + stat.value;
    });

    if (equipment.setId) {
      equippedSetIds.set(equipment.setId, (equippedSetIds.get(equipment.setId) || 0) + 1);
    }
  });

  equippedSetIds.forEach((count, setId) => {
    const set = EQUIPMENT_SETS[setId];
    if (!set) return;

    set.bonuses.forEach((bonus) => {
      if (count >= bonus.pieceCount) {
        Object.entries(bonus.stats).forEach(([stat, value]) => {
          if (value !== undefined) {
            if (stat === 'hp' || stat === 'mp') {
              stats[stat as StatType] = Math.floor((stats[stat as StatType] || 0) * (1 + value));
            } else if (stat === 'critRate' || stat === 'critDamage' || stat === 'dodge') {
              stats[stat as StatType] = (stats[stat as StatType] || 0) + value;
            } else {
              stats[stat as StatType] = Math.floor((stats[stat as StatType] || 0) * (1 + value));
            }
          }
        });
      }
    });
  });

  character.statusEffects.forEach((effect) => {
    switch (effect.type) {
      case 'buff_attack':
        stats.attack = Math.floor(stats.attack * (1 + effect.value));
        break;
      case 'buff_defense':
        stats.defense = Math.floor(stats.defense * (1 + effect.value));
        break;
      case 'debuff_attack':
        stats.attack = Math.floor(stats.attack * (1 - effect.value));
        break;
      case 'debuff_defense':
        stats.defense = Math.floor(stats.defense * (1 - effect.value));
        break;
    }
  });

  if (character.isDefending) {
    stats.defense = Math.floor(stats.defense * 1.5);
  }

  return stats;
};

export const calculateEnemyStats = (enemy: Enemy): Record<StatType, number> => {
  const stats: Record<StatType, number> = {
    attack: enemy.attack,
    defense: enemy.defense,
    hp: enemy.maxHp,
    mp: 0,
    speed: enemy.speed,
    critRate: 0.05,
    critDamage: 0.5,
    dodge: 0.03,
  };

  enemy.statusEffects.forEach((effect) => {
    switch (effect.type) {
      case 'buff_attack':
        stats.attack = Math.floor(stats.attack * (1 + effect.value));
        break;
      case 'buff_defense':
        stats.defense = Math.floor(stats.defense * (1 + effect.value));
        break;
      case 'debuff_attack':
        stats.attack = Math.floor(stats.attack * (1 - effect.value));
        break;
      case 'debuff_defense':
        stats.defense = Math.floor(stats.defense * (1 - effect.value));
        break;
    }
  });

  return stats;
};

export const calculateSetBonuses = (equipment: (Equipment | null)[]): {
  setId: string;
  setName: string;
  pieceCount: number;
  activeBonuses: string[];
}[] => {
  const setCounts = new Map<string, number>();
  
  equipment.forEach((eq) => {
    if (eq?.setId) {
      setCounts.set(eq.setId, (setCounts.get(eq.setId) || 0) + 1);
    }
  });

  const results: {
    setId: string;
    setName: string;
    pieceCount: number;
    activeBonuses: string[];
  }[] = [];

  setCounts.forEach((count, setId) => {
    const set = EQUIPMENT_SETS[setId];
    if (!set) return;

    const activeBonuses = set.bonuses
      .filter((bonus) => count >= bonus.pieceCount)
      .map((bonus) => bonus.effect);

    results.push({
      setId,
      setName: set.name,
      pieceCount: count,
      activeBonuses,
    });
  });

  return results;
};
