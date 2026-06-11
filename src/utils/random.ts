import type { Rarity, Room, RoomType, CharacterClass, Character, EquipmentSlot, Equipment, StatType } from '@/types/game';
import { CLASSES } from '@/data/classes';
import { getSkillsByIds } from '@/data/skills';
import { BASE_EQUIPMENT_LIST, createEquipment } from '@/data/equipment';
import { getExpToNextLevel } from './formula';

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const weightedRandomChoice = <T>(items: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateCharacter = (
  classId: CharacterClass,
  name: string,
  position: { x: number; y: number }
): Character => {
  const classData = CLASSES[classId];
  
  return {
    id: generateId(),
    name,
    class: classId,
    level: 1,
    exp: 0,
    expToNextLevel: getExpToNextLevel(1),
    hp: classData.baseHp,
    maxHp: classData.baseHp,
    mp: classData.baseMp,
    maxMp: classData.baseMp,
    baseStats: {
      attack: classData.baseAttack,
      defense: classData.baseDefense,
      speed: classData.baseSpeed,
      critRate: classData.baseCritRate,
      critDamage: classData.baseCritDamage,
      dodge: classData.baseDodge,
    },
    position,
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      accessory: null,
    },
    skills: getSkillsByIds(classData.skillIds),
    statusEffects: [],
    isDefending: false,
    hasActed: false,
  };
};

export const generateRandomStat = (type: StatType, rarity: Rarity): number => {
  const ranges: Record<Rarity, Record<StatType, [number, number]>> = {
    common: {
      attack: [2, 5],
      defense: [2, 4],
      hp: [10, 20],
      mp: [5, 15],
      speed: [1, 2],
      critRate: [0.02, 0.05],
      critDamage: [0.05, 0.1],
      dodge: [0.02, 0.04],
    },
    uncommon: {
      attack: [4, 8],
      defense: [3, 6],
      hp: [15, 30],
      mp: [10, 25],
      speed: [2, 3],
      critRate: [0.04, 0.08],
      critDamage: [0.08, 0.15],
      dodge: [0.04, 0.07],
    },
    rare: {
      attack: [7, 12],
      defense: [5, 9],
      hp: [25, 50],
      mp: [20, 40],
      speed: [3, 5],
      critRate: [0.07, 0.12],
      critDamage: [0.12, 0.2],
      dodge: [0.06, 0.1],
    },
    epic: {
      attack: [10, 18],
      defense: [8, 14],
      hp: [40, 80],
      mp: [35, 60],
      speed: [4, 7],
      critRate: [0.1, 0.18],
      critDamage: [0.18, 0.3],
      dodge: [0.09, 0.14],
    },
    legendary: {
      attack: [15, 25],
      defense: [12, 20],
      hp: [60, 120],
      mp: [50, 100],
      speed: [6, 10],
      critRate: [0.15, 0.25],
      critDamage: [0.25, 0.45],
      dodge: [0.12, 0.2],
    },
  };

  const [min, max] = ranges[rarity][type];
  const value = randomFloat(min, max);
  
  if (type === 'critRate' || type === 'critDamage' || type === 'dodge') {
    return Math.round(value * 100) / 100;
  }
  
  return Math.floor(value);
};

export const generateFloorRooms = (floor: number): Room[] => {
  const rooms: Room[] = [];
  const isBossFloor = floor % 3 === 0;
  
  let roomTypes: RoomType[];
  
  if (floor === 1) {
    roomTypes = [
      'battle', 'battle', 'battle', 'battle',
      'event', 'event',
      'rest',
      'treasure',
      'battle', 'elite',
    ];
  } else if (isBossFloor) {
    roomTypes = [
      'battle', 'battle', 'elite', 'event',
      'rest', 'treasure', 'event',
      'elite', 'battle', 'boss',
    ];
  } else {
    roomTypes = [
      'battle', 'battle', 'battle', 'elite',
      'event', 'event',
      'rest',
      'treasure',
      'elite', 'battle',
    ];
  }

  const shuffledTypes = shuffleArray(roomTypes);

  for (let i = 0; i < shuffledTypes.length; i++) {
    const type = shuffledTypes[i];
    rooms.push({
      id: generateId(),
      type,
      cleared: false,
      position: { x: i, y: 0 },
    });
  }

  return rooms;
};

export const generateRandomEquipmentBySlot = (
  slot: EquipmentSlot,
  minRarity: Rarity = 'common',
  maxRarity: Rarity = 'rare'
): Equipment => {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const minIndex = rarities.indexOf(minRarity);
  const maxIndex = rarities.indexOf(maxRarity);
  
  const eligibleTemplates = BASE_EQUIPMENT_LIST.filter(
    (eq) => eq.slot === slot &&
      rarities.indexOf(eq.rarity) >= minIndex &&
      rarities.indexOf(eq.rarity) <= maxIndex
  );
  
  if (eligibleTemplates.length === 0) {
    const anyEligible = BASE_EQUIPMENT_LIST.filter(
      (eq) => rarities.indexOf(eq.rarity) >= minIndex && rarities.indexOf(eq.rarity) <= maxIndex
    );
    const template = randomChoice(anyEligible);
    return createEquipment({ ...template, slot }, maxRarity);
  }
  
  const template = randomChoice(eligibleTemplates);
  return createEquipment(template, maxRarity);
};

export const generateRewardEquipment = (floor: number, isBoss: boolean = false): Equipment => {
  let minRarity: Rarity = 'common';
  let maxRarity: Rarity = 'uncommon';
  
  if (floor >= 3) {
    minRarity = 'uncommon';
    maxRarity = 'rare';
  }
  if (floor >= 5) {
    minRarity = 'rare';
    maxRarity = 'epic';
  }
  if (isBoss) {
    maxRarity = 'legendary';
  }
  
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'boots', 'accessory'];
  const slot = randomChoice(slots);
  
  return generateRandomEquipmentBySlot(slot, minRarity, maxRarity);
};

export const generateEnemyCount = (floor: number, isBoss: boolean = false): number => {
  if (isBoss) return 1;
  
  const baseCount = Math.min(1 + Math.floor(floor / 2), 3);
  return randomInt(baseCount, baseCount + 1);
};

export const rollLoot = <T>(items: T[], chances: number[]): T[] => {
  const results: T[] = [];
  
  items.forEach((item, index) => {
    if (Math.random() < chances[index]) {
      results.push(item);
    }
  });
  
  return results;
};
