import type { GameEvent } from '@/types/game';

export const EVENTS: GameEvent[] = [
  {
    id: 'puzzle_ancient_rune',
    type: 'puzzle',
    title: '远古符文',
    description: '墙上刻着神秘的符文，似乎是一道古老的谜题。解开它可能会获得奖励，但失败可能会触发陷阱。',
    options: [
      {
        id: 'a',
        text: '尝试解读符文（成功率60%）',
        result: {
          type: 'gold',
          value: 50,
          successRate: 0.6,
        },
      },
      {
        id: 'b',
        text: '强行破坏符文',
        result: {
          type: 'damage',
          value: 20,
        },
      },
      {
        id: 'c',
        text: '离开',
        result: {
          type: 'gold',
          value: 0,
        },
      },
    ],
  },
  {
    id: 'puzzle_mechanism',
    type: 'puzzle',
    title: '机关谜题',
    description: '复杂的齿轮机关挡住了去路。你需要正确调整齿轮的位置才能通过。',
    options: [
      {
        id: 'a',
        text: '仔细研究机关（成功率50%）',
        result: {
          type: 'equipment',
          value: 1,
          successRate: 0.5,
        },
      },
      {
        id: 'b',
        text: '胡乱尝试',
        result: {
          type: 'damage',
          value: 30,
          successRate: 0.3,
        },
      },
      {
        id: 'c',
        text: '寻找其他路线',
        result: {
          type: 'gold',
          value: 10,
        },
      },
    ],
  },
  {
    id: 'trade_merchant',
    type: 'trade',
    title: '神秘商人',
    description: '一位神秘的商人出现在你面前，他的斗篷下藏着各种稀奇古怪的物品。',
    options: [
      {
        id: 'a',
        text: '购买生命药水（30金币）',
        result: {
          type: 'item',
          value: 1,
          itemId: 'hp_potion_medium',
        },
      },
      {
        id: 'b',
        text: '购买法力药水（25金币）',
        result: {
          type: 'item',
          value: 1,
          itemId: 'mp_potion_medium',
        },
      },
      {
        id: 'c',
        text: '购买随机装备（100金币）',
        result: {
          type: 'equipment',
          value: 1,
        },
      },
      {
        id: 'd',
        text: '离开',
        result: {
          type: 'gold',
          value: 0,
        },
      },
    ],
  },
  {
    id: 'trade_blacksmith',
    type: 'trade',
    title: '流浪铁匠',
    description: '一位技艺精湛的铁匠正在收拾他的摊位。他愿意以优惠价格出售他的作品。',
    options: [
      {
        id: 'a',
        text: '购买武器（80金币）',
        result: {
          type: 'equipment',
          value: 1,
        },
      },
      {
        id: 'b',
        text: '购买护甲（70金币）',
        result: {
          type: 'equipment',
          value: 1,
        },
      },
      {
        id: 'c',
        text: '强化现有装备（50金币）',
        result: {
          type: 'exp',
          value: 30,
        },
      },
      {
        id: 'd',
        text: '离开',
        result: {
          type: 'gold',
          value: 0,
        },
      },
    ],
  },
  {
    id: 'rest_campfire',
    type: 'rest',
    title: '温暖的篝火',
    description: '你发现了一处安全的营地，篝火还在燃烧着。这里可以让你暂时休整。',
    options: [
      {
        id: 'a',
        text: '休息恢复（恢复30%生命）',
        result: {
          type: 'hp',
          value: 0.3,
        },
      },
      {
        id: 'b',
        text: '冥想恢复法力（恢复50%法力）',
        result: {
          type: 'mp',
          value: 0.5,
        },
      },
      {
        id: 'c',
        text: '完全休整（恢复全部生命和法力）',
        result: {
          type: 'hp',
          value: 1,
        },
      },
    ],
  },
  {
    id: 'rest_healing_spring',
    type: 'rest',
    title: '治愈之泉',
    description: '清澈的泉水散发着淡淡的光芒，似乎蕴含着治愈的力量。',
    options: [
      {
        id: 'a',
        text: '饮用泉水（恢复50%生命，解除负面状态）',
        result: {
          type: 'hp',
          value: 0.5,
        },
      },
      {
        id: 'b',
        text: '收集泉水（获得2瓶治疗药水）',
        result: {
          type: 'item',
          value: 2,
          itemId: 'hp_potion_medium',
        },
      },
      {
        id: 'c',
        text: '在泉水中沐浴（永久提升5点最大生命）',
        result: {
          type: 'exp',
          value: 50,
        },
      },
    ],
  },
  {
    id: 'gamble_treasure_chest',
    type: 'gamble',
    title: '神秘宝箱',
    description: '一个散发着诡异光芒的宝箱静静地躺在那里。它可能蕴含着宝藏，也可能是致命的陷阱。',
    options: [
      {
        id: 'a',
        text: '打开宝箱（50%获得稀有装备，50%受到伤害）',
        result: {
          type: 'equipment',
          value: 1,
          successRate: 0.5,
        },
      },
      {
        id: 'b',
        text: '小心翼翼地检查（70%获得金币，30%无事发生）',
        result: {
          type: 'gold',
          value: 80,
          successRate: 0.7,
        },
      },
      {
        id: 'c',
        text: '用远程攻击触发（必定触发陷阱，但伤害减半）',
        result: {
          type: 'damage',
          value: 15,
        },
      },
      {
        id: 'd',
        text: '离开',
        result: {
          type: 'gold',
          value: 0,
        },
      },
    ],
  },
  {
    id: 'gamble_ancient_altar',
    type: 'gamble',
    title: '远古祭坛',
    description: '一座古老的祭坛矗立在房间中央，上面刻满了神秘的符文。似乎可以献祭某些东西来换取力量。',
    options: [
      {
        id: 'a',
        text: '献祭金币（消耗50金币，60%获得永久属性提升）',
        result: {
          type: 'exp',
          value: 100,
          successRate: 0.6,
        },
      },
      {
        id: 'b',
        text: '献祭生命（消耗20%最大生命，40%获得传说装备）',
        result: {
          type: 'equipment',
          value: 1,
          successRate: 0.4,
        },
      },
      {
        id: 'c',
        text: '亵渎祭坛（30%获得大量金币，70%触发诅咒）',
        result: {
          type: 'gold',
          value: 200,
          successRate: 0.3,
        },
      },
      {
        id: 'd',
        text: '恭敬离开',
        result: {
          type: 'gold',
          value: 5,
        },
      },
    ],
  },
  {
    id: 'gamble_fountain',
    type: 'gamble',
    title: '许愿池',
    description: '一个古老的许愿池，池底闪闪发光，似乎有很多金币和物品。',
    options: [
      {
        id: 'a',
        text: '投入10金币许愿（可能获得双倍回报）',
        result: {
          type: 'gold',
          value: 20,
          successRate: 0.5,
        },
      },
      {
        id: 'b',
        text: '跳进去捡东西（获得随机物品，但可能受伤）',
        result: {
          type: 'item',
          value: 1,
          successRate: 0.6,
        },
      },
      {
        id: 'c',
        text: '许一个伟大的愿望（消耗50金币，小概率获得稀有装备）',
        result: {
          type: 'equipment',
          value: 1,
          successRate: 0.2,
        },
      },
      {
        id: 'd',
        text: '离开',
        result: {
          type: 'gold',
          value: 0,
        },
      },
    ],
  },
];

export const ITEMS: Record<string, {
  id: string;
  name: string;
  type: 'consumable' | 'material';
  description: string;
  effect: {
    type: 'heal' | 'restore_mp' | 'buff' | 'revive';
    value: number;
  };
  price: number;
}> = {
  hp_potion_small: {
    id: 'hp_potion_small',
    name: '小型生命药水',
    type: 'consumable',
    description: '恢复30点生命值',
    effect: { type: 'heal', value: 30 },
    price: 20,
  },
  hp_potion_medium: {
    id: 'hp_potion_medium',
    name: '中型生命药水',
    type: 'consumable',
    description: '恢复60点生命值',
    effect: { type: 'heal', value: 60 },
    price: 40,
  },
  hp_potion_large: {
    id: 'hp_potion_large',
    name: '大型生命药水',
    type: 'consumable',
    description: '恢复100点生命值',
    effect: { type: 'heal', value: 100 },
    price: 70,
  },
  mp_potion_small: {
    id: 'mp_potion_small',
    name: '小型法力药水',
    type: 'consumable',
    description: '恢复20点法力值',
    effect: { type: 'restore_mp', value: 20 },
    price: 15,
  },
  mp_potion_medium: {
    id: 'mp_potion_medium',
    name: '中型法力药水',
    type: 'consumable',
    description: '恢复40点法力值',
    effect: { type: 'restore_mp', value: 40 },
    price: 30,
  },
  mp_potion_large: {
    id: 'mp_potion_large',
    name: '大型法力药水',
    type: 'consumable',
    description: '恢复70点法力值',
    effect: { type: 'restore_mp', value: 70 },
    price: 50,
  },
  revive_potion: {
    id: 'revive_potion',
    name: '复活药水',
    type: 'consumable',
    description: '复活一名倒下的角色，恢复50%生命',
    effect: { type: 'revive', value: 50 },
    price: 150,
  },
  attack_scroll: {
    id: 'attack_scroll',
    name: '力量卷轴',
    type: 'consumable',
    description: '永久提升5点攻击力',
    effect: { type: 'buff', value: 5 },
    price: 100,
  },
  defense_scroll: {
    id: 'defense_scroll',
    name: '防御卷轴',
    type: 'consumable',
    description: '永久提升5点防御力',
    effect: { type: 'buff', value: 5 },
    price: 100,
  },
  dodge_scroll: {
    id: 'dodge_scroll',
    name: '敏捷卷轴',
    type: 'consumable',
    description: '永久提升5%闪避率',
    effect: { type: 'buff', value: 0.05 },
    price: 120,
  },
  magic_scroll: {
    id: 'magic_scroll',
    name: '魔法卷轴',
    type: 'consumable',
    description: '永久提升10点法力上限',
    effect: { type: 'buff', value: 10 },
    price: 80,
  },
  elixir: {
    id: 'elixir',
    name: '万能灵药',
    type: 'consumable',
    description: '恢复全部生命和法力，并解除所有负面状态',
    effect: { type: 'heal', value: 999 },
    price: 200,
  },
  fire_resistance: {
    id: 'fire_resistance',
    name: '火焰抗性药剂',
    type: 'consumable',
    description: '战斗中提升50%火焰抗性',
    effect: { type: 'buff', value: 0.5 },
    price: 60,
  },
};

export const getRandomEvent = (): GameEvent => {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
};

export const getEventById = (id: string): GameEvent | undefined => {
  return EVENTS.find((e) => e.id === id);
};

export const getItemById = (id: string) => {
  return ITEMS[id];
};

export const getItems = () => {
  return Object.values(ITEMS);
};
