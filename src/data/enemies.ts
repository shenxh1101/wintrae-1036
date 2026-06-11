import type { Enemy } from '@/types/game';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ENEMY_TEMPLATES: Omit<Enemy, 'id' | 'position' | 'statusEffects'>[] = [
  {
    name: '机关蜘蛛',
    type: 'mech',
    hp: 40,
    maxHp: 40,
    attack: 12,
    defense: 5,
    speed: 10,
    skills: ['basic_attack', 'poison_bite'],
    expReward: 20,
    goldReward: 15,
    lootTable: [
      { itemId: 'hp_potion_small', chance: 0.3 },
      { itemId: 'mp_potion_small', chance: 0.2 },
    ],
  },
  {
    name: '石像守卫',
    type: 'construct',
    hp: 80,
    maxHp: 80,
    attack: 18,
    defense: 15,
    speed: 5,
    skills: ['basic_attack', 'stone_slam'],
    expReward: 35,
    goldReward: 25,
    lootTable: [
      { itemId: 'hp_potion_small', chance: 0.4 },
      { itemId: 'defense_scroll', chance: 0.15 },
    ],
  },
  {
    name: '幽灵',
    type: 'undead',
    hp: 35,
    maxHp: 35,
    attack: 20,
    defense: 3,
    speed: 12,
    skills: ['basic_attack', 'life_drain'],
    expReward: 30,
    goldReward: 20,
    lootTable: [
      { itemId: 'mp_potion_small', chance: 0.35 },
      { itemId: 'attack_scroll', chance: 0.1 },
    ],
  },
  {
    name: '火焰元素',
    type: 'elemental',
    hp: 50,
    maxHp: 50,
    attack: 22,
    defense: 6,
    speed: 9,
    skills: ['basic_attack', 'fire_blast'],
    expReward: 40,
    goldReward: 30,
    lootTable: [
      { itemId: 'hp_potion_medium', chance: 0.25 },
      { itemId: 'fire_resistance', chance: 0.1 },
    ],
  },
  {
    name: '机关傀儡',
    type: 'mech',
    hp: 100,
    maxHp: 100,
    attack: 25,
    defense: 20,
    speed: 4,
    skills: ['basic_attack', 'rocket_punch', 'overload'],
    expReward: 60,
    goldReward: 45,
    lootTable: [
      { itemId: 'hp_potion_medium', chance: 0.5 },
      { itemId: 'attack_scroll', chance: 0.2 },
    ],
  },
  {
    name: '暗影刺客',
    type: 'humanoid',
    hp: 45,
    maxHp: 45,
    attack: 28,
    defense: 8,
    speed: 15,
    skills: ['basic_attack', 'backstab', 'poison_blade'],
    expReward: 50,
    goldReward: 40,
    lootTable: [
      { itemId: 'dodge_scroll', chance: 0.15 },
      { itemId: 'hp_potion_medium', chance: 0.3 },
    ],
  },
  {
    name: '古代大法师',
    type: 'humanoid',
    hp: 70,
    maxHp: 70,
    attack: 35,
    defense: 10,
    speed: 11,
    skills: ['basic_attack', 'fireball', 'ice_lance', 'arcane_shield'],
    expReward: 80,
    goldReward: 60,
    lootTable: [
      { itemId: 'mp_potion_large', chance: 0.4 },
      { itemId: 'magic_scroll', chance: 0.2 },
    ],
  },
  {
    name: '青铜巨像',
    type: 'construct',
    hp: 200,
    maxHp: 200,
    attack: 35,
    defense: 30,
    speed: 3,
    skills: ['basic_attack', 'ground_slam', 'ancient_ray'],
    expReward: 150,
    goldReward: 100,
    isBoss: true,
    lootTable: [
      { itemId: 'hp_potion_large', chance: 0.8 },
      { itemId: 'revive_potion', chance: 0.3 },
    ],
  },
  {
    name: '机关塔主',
    type: 'mech',
    hp: 350,
    maxHp: 350,
    attack: 45,
    defense: 25,
    speed: 8,
    skills: ['basic_attack', 'missile_barrage', 'energy_beam', 'self_repair', 'summon_drones'],
    expReward: 300,
    goldReward: 200,
    isBoss: true,
    lootTable: [
      { itemId: 'hp_potion_large', chance: 1 },
      { itemId: 'mp_potion_large', chance: 1 },
      { itemId: 'revive_potion', chance: 0.5 },
    ],
  },
  {
    name: '永夜守护者',
    type: 'eldritch',
    hp: 500,
    maxHp: 500,
    attack: 55,
    defense: 35,
    speed: 10,
    skills: ['basic_attack', 'void_blast', 'nightmare', 'reality_warp', 'dark_pact'],
    expReward: 500,
    goldReward: 350,
    isBoss: true,
    lootTable: [
      { itemId: 'revive_potion', chance: 1 },
      { itemId: 'elixir', chance: 0.5 },
    ],
  },
];

export const ENEMY_SKILLS: Record<string, {
  name: string;
  description: string;
  damage?: number;
  effect?: string;
  cooldown: number;
}> = {
  basic_attack: {
    name: '普通攻击',
    description: '基础攻击',
    damage: 1.0,
    cooldown: 0,
  },
  poison_bite: {
    name: '毒牙',
    description: '造成伤害并附加中毒',
    damage: 0.8,
    effect: 'poison',
    cooldown: 2,
  },
  stone_slam: {
    name: '石锤猛击',
    description: '造成大量伤害',
    damage: 1.5,
    cooldown: 3,
  },
  life_drain: {
    name: '生命汲取',
    description: '造成伤害并恢复生命',
    damage: 1.2,
    effect: 'lifesteal',
    cooldown: 2,
  },
  fire_blast: {
    name: '火焰爆发',
    description: '造成火焰伤害',
    damage: 1.3,
    effect: 'burn',
    cooldown: 2,
  },
  rocket_punch: {
    name: '火箭拳',
    description: '发射拳头造成远程伤害',
    damage: 1.4,
    cooldown: 2,
  },
  overload: {
    name: '超载',
    description: '下一次攻击伤害翻倍',
    effect: 'buff_attack',
    cooldown: 4,
  },
  backstab: {
    name: '背刺',
    description: '造成高额暴击伤害',
    damage: 1.8,
    cooldown: 2,
  },
  fireball: {
    name: '火球术',
    description: '发射火球',
    damage: 1.5,
    effect: 'burn',
    cooldown: 2,
  },
  ice_lance: {
    name: '冰枪',
    description: '造成伤害并减速',
    damage: 1.3,
    effect: 'debuff_speed',
    cooldown: 2,
  },
  arcane_shield: {
    name: '奥术护盾',
    description: '获得护盾',
    effect: 'shield',
    cooldown: 3,
  },
  ground_slam: {
    name: '大地震击',
    description: '对所有敌人造成伤害',
    damage: 1.2,
    cooldown: 3,
  },
  ancient_ray: {
    name: '远古射线',
    description: '发射远古能量射线',
    damage: 2.0,
    cooldown: 4,
  },
  missile_barrage: {
    name: '导弹齐射',
    description: '发射多枚导弹',
    damage: 1.0,
    effect: 'aoe',
    cooldown: 3,
  },
  energy_beam: {
    name: '能量光束',
    description: '发射高能光束',
    damage: 2.5,
    cooldown: 4,
  },
  self_repair: {
    name: '自我修复',
    description: '恢复大量生命',
    effect: 'heal',
    cooldown: 5,
  },
  summon_drones: {
    name: '召唤无人机',
    description: '召唤小型无人机',
    effect: 'summon',
    cooldown: 6,
  },
  void_blast: {
    name: '虚空冲击',
    description: '造成虚空伤害',
    damage: 2.0,
    effect: 'debuff_defense',
    cooldown: 2,
  },
  nightmare: {
    name: '噩梦',
    description: '使目标陷入恐惧',
    effect: 'fear',
    cooldown: 4,
  },
  reality_warp: {
    name: '现实扭曲',
    description: '扭曲现实，造成混乱',
    damage: 1.5,
    effect: 'stun',
    cooldown: 5,
  },
  dark_pact: {
    name: '黑暗契约',
    description: '牺牲生命获得力量',
    effect: 'buff_attack',
    cooldown: 6,
  },
};

export const createEnemy = (
  template: Omit<Enemy, 'id' | 'position' | 'statusEffects'>,
  position: { x: number; y: number },
  difficultyMultiplier: number = 1
): Enemy => {
  return {
    ...template,
    id: generateId(),
    position,
    statusEffects: [],
    hp: Math.floor(template.hp * difficultyMultiplier),
    maxHp: Math.floor(template.maxHp * difficultyMultiplier),
    attack: Math.floor(template.attack * difficultyMultiplier),
    defense: Math.floor(template.defense * difficultyMultiplier),
    expReward: Math.floor(template.expReward * difficultyMultiplier),
    goldReward: Math.floor(template.goldReward * difficultyMultiplier),
  };
};

export const getRandomEnemies = (
  count: number,
  floor: number,
  isBoss: boolean = false,
  isElite: boolean = false
): Enemy[] => {
  const difficultyMultiplier = 1 + (floor - 1) * 0.2 + (isElite ? 0.3 : 0);
  
  const eligibleTemplates = ENEMY_TEMPLATES.filter((e) => 
    isBoss ? e.isBoss : !e.isBoss
  );
  
  const positions = isBoss 
    ? [{ x: 4, y: 2 }]
    : [
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
      ];
  
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
    const pos = positions[i % positions.length];
    enemies.push(createEnemy(template, pos, difficultyMultiplier));
  }
  
  return enemies;
};

export const getEnemyByType = (type: string, position: { x: number; y: number }, floor: number): Enemy | null => {
  const template = ENEMY_TEMPLATES.find((e) => e.type === type);
  if (!template) return null;
  
  const difficultyMultiplier = 1 + (floor - 1) * 0.2;
  return createEnemy(template, position, difficultyMultiplier);
};
