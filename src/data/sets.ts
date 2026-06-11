import type { EquipmentSet } from '@/types/game';

export const EQUIPMENT_SETS: Record<string, EquipmentSet> = {
  flame_warrior: {
    id: 'flame_warrior',
    name: '烈焰战士',
    description: '蕴含火焰之力的战士套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '攻击力+15%',
        stats: { attack: 0.15 },
      },
      {
        pieceCount: 3,
        effect: '攻击时有30%几率造成灼烧',
        stats: {},
      },
      {
        pieceCount: 4,
        effect: '技能伤害+25%',
        stats: { attack: 0.25 },
      },
    ],
  },
  arcane_master: {
    id: 'arcane_master',
    name: '奥术大师',
    description: '精通奥术魔法的法师套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '法力值+20%',
        stats: { mp: 0.2 },
      },
      {
        pieceCount: 3,
        effect: '技能冷却-1回合',
        stats: {},
      },
      {
        pieceCount: 4,
        effect: '暴击伤害+50%',
        stats: { critDamage: 0.5 },
      },
    ],
  },
  shadow_assassin: {
    id: 'shadow_assassin',
    name: '暗影刺客',
    description: '潜伏于阴影中的刺客套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '暴击率+15%',
        stats: { critRate: 0.15 },
      },
      {
        pieceCount: 3,
        effect: '闪避率+10%',
        stats: { dodge: 0.1 },
      },
      {
        pieceCount: 4,
        effect: '背刺伤害+100%',
        stats: { attack: 1.0 },
      },
    ],
  },
  holy_priest: {
    id: 'holy_priest',
    name: '圣职者',
    description: '承载神圣之力的牧师套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '治疗量+25%',
        stats: {},
      },
      {
        pieceCount: 3,
        effect: '每回合恢复10点法力',
        stats: {},
      },
      {
        pieceCount: 4,
        effect: '复活队友时恢复50%生命',
        stats: {},
      },
    ],
  },
  wind_ranger: {
    id: 'wind_ranger',
    name: '疾风游侠',
    description: '如疾风般迅捷的游侠套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '速度+20%',
        stats: { speed: 0.2 },
      },
      {
        pieceCount: 3,
        effect: '移动范围+1',
        stats: {},
      },
      {
        pieceCount: 4,
        effect: '攻击有40%几率触发连击',
        stats: {},
      },
    ],
  },
  iron_guardian: {
    id: 'iron_guardian',
    name: '钢铁守卫',
    description: '坚不可摧的守卫套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '防御力+25%',
        stats: { defense: 0.25 },
      },
      {
        pieceCount: 3,
        effect: '生命值+30%',
        stats: { hp: 0.3 },
      },
      {
        pieceCount: 4,
        effect: '受到伤害时有25%几率免疫',
        stats: {},
      },
    ],
  },
  ancient_mechanism: {
    id: 'ancient_mechanism',
    name: '远古机关',
    description: '来自古代机关塔的神秘套装',
    bonuses: [
      {
        pieceCount: 2,
        effect: '全属性+10%',
        stats: {
          attack: 0.1,
          defense: 0.1,
          hp: 0.1,
          mp: 0.1,
          speed: 0.1,
        },
      },
      {
        pieceCount: 3,
        effect: '技能消耗-30%',
        stats: {},
      },
      {
        pieceCount: 5,
        effect: '进入战斗时获得机关护盾',
        stats: {},
      },
    ],
  },
};

export const getSet = (setId: string): EquipmentSet | undefined => {
  return EQUIPMENT_SETS[setId];
};
