import type { Equipment, Rarity, EquipmentSlot, StatType } from '@/types/game';

const generateId = () => Math.random().toString(36).substr(2, 9);

const BASE_EQUIPMENT: Omit<Equipment, 'id'>[] = [
  {
    name: '铁剑',
    rarity: 'common',
    slot: 'weapon',
    baseStats: { attack: 5 },
    stats: [{ type: 'attack', value: 3 }],
    description: '普通的铁制长剑',
  },
  {
    name: '精钢剑',
    rarity: 'uncommon',
    slot: 'weapon',
    baseStats: { attack: 10 },
    stats: [
      { type: 'attack', value: 5 },
      { type: 'critRate', value: 0.05 },
    ],
    description: '精心锻造的钢剑',
  },
  {
    name: '烈焰之刃',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'flame_warrior',
    baseStats: { attack: 18 },
    stats: [
      { type: 'attack', value: 8 },
      { type: 'critDamage', value: 0.2 },
    ],
    description: '燃烧着火焰的魔法剑',
  },
  {
    name: '炽炎巨剑',
    rarity: 'epic',
    slot: 'weapon',
    setId: 'flame_warrior',
    baseStats: { attack: 30 },
    stats: [
      { type: 'attack', value: 15 },
      { type: 'critRate', value: 0.1 },
      { type: 'critDamage', value: 0.3 },
    ],
    description: '传说中燃烧着烈焰的巨剑',
  },
  {
    name: '火焰主宰',
    rarity: 'legendary',
    slot: 'weapon',
    setId: 'flame_warrior',
    baseStats: { attack: 50 },
    stats: [
      { type: 'attack', value: 25 },
      { type: 'critRate', value: 0.15 },
      { type: 'critDamage', value: 0.5 },
      { type: 'speed', value: 3 },
    ],
    description: '火焰之力的终极化身',
  },
  {
    name: '木杖',
    rarity: 'common',
    slot: 'weapon',
    baseStats: { attack: 3, mp: 10 },
    stats: [{ type: 'attack', value: 2 }],
    description: '普通的木质法杖',
  },
  {
    name: '水晶法杖',
    rarity: 'uncommon',
    slot: 'weapon',
    baseStats: { attack: 8, mp: 25 },
    stats: [
      { type: 'attack', value: 4 },
      { type: 'mp', value: 15 },
    ],
    description: '镶嵌水晶的法杖',
  },
  {
    name: '奥术之杖',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'arcane_master',
    baseStats: { attack: 15, mp: 40 },
    stats: [
      { type: 'attack', value: 7 },
      { type: 'mp', value: 20 },
      { type: 'critRate', value: 0.08 },
    ],
    description: '蕴含奥术能量的法杖',
  },
  {
    name: '秘法权杖',
    rarity: 'epic',
    slot: 'weapon',
    setId: 'arcane_master',
    baseStats: { attack: 25, mp: 60 },
    stats: [
      { type: 'attack', value: 12 },
      { type: 'mp', value: 35 },
      { type: 'critDamage', value: 0.25 },
    ],
    description: '承载远古秘法的权杖',
  },
  {
    name: '暗影匕首',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'shadow_assassin',
    baseStats: { attack: 20 },
    stats: [
      { type: 'attack', value: 10 },
      { type: 'critRate', value: 0.15 },
      { type: 'dodge', value: 0.05 },
    ],
    description: '淬有暗影之力的匕首',
  },
  {
    name: '圣十字杖',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'holy_priest',
    baseStats: { attack: 10, mp: 35 },
    stats: [
      { type: 'mp', value: 25 },
      { type: 'defense', value: 5 },
    ],
    description: '承载神圣之力的十字架',
  },
  {
    name: '疾风长弓',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'wind_ranger',
    baseStats: { attack: 16 },
    stats: [
      { type: 'attack', value: 8 },
      { type: 'speed', value: 5 },
      { type: 'critRate', value: 0.1 },
    ],
    description: '如风般迅捷的长弓',
  },
  {
    name: '钢铁巨盾',
    rarity: 'rare',
    slot: 'weapon',
    setId: 'iron_guardian',
    baseStats: { attack: 8, defense: 15 },
    stats: [
      { type: 'defense', value: 10 },
      { type: 'hp', value: 30 },
    ],
    description: '坚不可摧的巨型盾牌',
  },
  {
    name: '皮甲',
    rarity: 'common',
    slot: 'armor',
    baseStats: { defense: 5, hp: 10 },
    stats: [{ type: 'defense', value: 3 }],
    description: '普通的皮质护甲',
  },
  {
    name: '锁子甲',
    rarity: 'uncommon',
    slot: 'armor',
    baseStats: { defense: 10, hp: 20 },
    stats: [
      { type: 'defense', value: 5 },
      { type: 'hp', value: 15 },
    ],
    description: '由金属环编织的护甲',
  },
  {
    name: '烈焰战甲',
    rarity: 'rare',
    slot: 'armor',
    setId: 'flame_warrior',
    baseStats: { defense: 15, hp: 35 },
    stats: [
      { type: 'defense', value: 8 },
      { type: 'hp', value: 25 },
      { type: 'attack', value: 5 },
    ],
    description: '燃烧着火焰的战甲',
  },
  {
    name: '奥术长袍',
    rarity: 'rare',
    slot: 'armor',
    setId: 'arcane_master',
    baseStats: { defense: 8, mp: 50 },
    stats: [
      { type: 'defense', value: 4 },
      { type: 'mp', value: 30 },
      { type: 'critRate', value: 0.08 },
    ],
    description: '绣有奥术符文的长袍',
  },
  {
    name: '暗影斗篷',
    rarity: 'rare',
    slot: 'armor',
    setId: 'shadow_assassin',
    baseStats: { defense: 10, hp: 25 },
    stats: [
      { type: 'defense', value: 5 },
      { type: 'dodge', value: 0.1 },
      { type: 'speed', value: 3 },
    ],
    description: '能融入阴影的斗篷',
  },
  {
    name: '圣袍',
    rarity: 'rare',
    slot: 'armor',
    setId: 'holy_priest',
    baseStats: { defense: 12, hp: 30, mp: 30 },
    stats: [
      { type: 'defense', value: 6 },
      { type: 'hp', value: 20 },
      { type: 'mp', value: 20 },
    ],
    description: '散发神圣光芒的长袍',
  },
  {
    name: '皮靴',
    rarity: 'common',
    slot: 'boots',
    baseStats: { speed: 3 },
    stats: [{ type: 'speed', value: 2 }],
    description: '普通的皮靴',
  },
  {
    name: '疾风靴',
    rarity: 'uncommon',
    slot: 'boots',
    baseStats: { speed: 6 },
    stats: [
      { type: 'speed', value: 4 },
      { type: 'dodge', value: 0.05 },
    ],
    description: '轻便迅捷的靴子',
  },
  {
    name: '铁盔',
    rarity: 'common',
    slot: 'helmet',
    baseStats: { defense: 4, hp: 8 },
    stats: [{ type: 'defense', value: 2 }],
    description: '普通的铁制头盔',
  },
  {
    name: '钢盔',
    rarity: 'uncommon',
    slot: 'helmet',
    baseStats: { defense: 8, hp: 15 },
    stats: [
      { type: 'defense', value: 4 },
      { type: 'hp', value: 10 },
    ],
    description: '坚固的钢制头盔',
  },
  {
    name: '铜戒指',
    rarity: 'common',
    slot: 'accessory',
    baseStats: { attack: 2 },
    stats: [{ type: 'attack', value: 1 }],
    description: '普通的铜戒指',
  },
  {
    name: '银护符',
    rarity: 'uncommon',
    slot: 'accessory',
    baseStats: { mp: 15, defense: 3 },
    stats: [
      { type: 'mp', value: 10 },
      { type: 'defense', value: 2 },
    ],
    description: '带有微弱魔力的护符',
  },
  {
    name: '机关核心',
    rarity: 'legendary',
    slot: 'accessory',
    setId: 'ancient_mechanism',
    baseStats: { attack: 15, defense: 15, hp: 50, mp: 50, speed: 5 },
    stats: [
      { type: 'attack', value: 10 },
      { type: 'defense', value: 10 },
      { type: 'critRate', value: 0.1 },
      { type: 'critDamage', value: 0.2 },
    ],
    description: '来自古代机关塔的神秘核心',
  },
];

export const BASE_EQUIPMENT_LIST = BASE_EQUIPMENT;

export const createEquipment = (
  template: Omit<Equipment, 'id'>,
  overrideRarity?: Rarity
): Equipment => {
  const rarity = overrideRarity || template.rarity;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.3,
    rare: 1.6,
    epic: 2,
    legendary: 3,
  };

  const multiplier = rarityMultiplier[rarity];

  const scaledBaseStats: Partial<Record<StatType, number>> = {};
  Object.entries(template.baseStats).forEach(([key, value]) => {
    if (value !== undefined) {
      scaledBaseStats[key as StatType] = Math.floor(value * multiplier);
    }
  });

  const scaledStats = template.stats.map((stat) => ({
    ...stat,
    value: stat.type === 'critRate' || stat.type === 'dodge' || stat.type === 'critDamage'
      ? stat.value * multiplier
      : Math.floor(stat.value * multiplier),
  }));

  return {
    ...template,
    id: generateId(),
    rarity,
    baseStats: scaledBaseStats,
    stats: scaledStats,
  };
};

export const generateRandomEquipment = (minRarity: Rarity = 'common', maxRarity: Rarity = 'rare'): Equipment => {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const minIndex = rarities.indexOf(minRarity);
  const maxIndex = rarities.indexOf(maxRarity);
  
  const weights = [50, 30, 15, 4, 1];
  let totalWeight = 0;
  for (let i = minIndex; i <= maxIndex; i++) {
    totalWeight += weights[i];
  }
  
  let random = Math.random() * totalWeight;
  let selectedRarity = rarities[minIndex];
  
  for (let i = minIndex; i <= maxIndex; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedRarity = rarities[i];
      break;
    }
  }
  
  const eligibleTemplates = BASE_EQUIPMENT.filter(
    (eq) => eq.rarity === selectedRarity || 
    rarities.indexOf(eq.rarity) <= rarities.indexOf(selectedRarity)
  );
  
  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
  return createEquipment(template, selectedRarity);
};

export const getEquipmentByName = (name: string): Equipment | undefined => {
  return BASE_EQUIPMENT.find((eq) => eq.name === name) as Equipment | undefined;
};
