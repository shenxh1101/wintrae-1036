export type CharacterClass = 'warrior' | 'mage' | 'assassin' | 'priest' | 'ranger' | 'guardian';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';

export type RoomType = 'battle' | 'elite' | 'boss' | 'event' | 'rest' | 'treasure';

export type EventType = 'puzzle' | 'trade' | 'rest' | 'gamble';

export type ActionType = 'move' | 'attack' | 'defend' | 'item' | 'skill' | null;

export type StatusEffectType = 'poison' | 'burn' | 'stun' | 'shield' | 'buff_attack' | 'buff_defense' | 'debuff_attack' | 'debuff_defense';

export type StatType = 'attack' | 'defense' | 'hp' | 'mp' | 'speed' | 'critRate' | 'critDamage' | 'dodge';

export interface Position {
  x: number;
  y: number;
}

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number;
  value: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  mpCost: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'aoe';
  range: number;
  damage?: number;
  heal?: number;
  targetType: 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies';
}

export interface Equipment {
  id: string;
  name: string;
  rarity: Rarity;
  slot: EquipmentSlot;
  setId?: string;
  baseStats: Partial<Record<StatType, number>>;
  stats: {
    type: StatType;
    value: number;
  }[];
  description?: string;
}

export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  bonuses: {
    pieceCount: number;
    effect: string;
    stats: Partial<Record<StatType, number>>;
  }[];
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'material';
  description: string;
  effect: {
    type: 'heal' | 'restore_mp' | 'buff' | 'revive';
    value: number;
  };
  price: number;
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  exp: number;
  expToNextLevel: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
    dodge: number;
  };
  position: Position;
  equipment: Record<EquipmentSlot, Equipment | null>;
  skills: Skill[];
  statusEffects: StatusEffect[];
  isDefending: boolean;
  hasActed: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  position: Position;
  skills: string[];
  expReward: number;
  goldReward: number;
  lootTable: { itemId: string; chance: number }[];
  statusEffects: StatusEffect[];
  isBoss?: boolean;
}

export interface ClassData {
  id: CharacterClass;
  name: string;
  description: string;
  icon: string;
  baseHp: number;
  baseMp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseCritRate: number;
  baseCritDamage: number;
  baseDodge: number;
  skillIds: string[];
}

export interface Room {
  id: string;
  type: RoomType;
  cleared: boolean;
  eventId?: string;
  enemyIds?: string[];
  position: { x: number; y: number };
}

export interface EventOption {
  id: string;
  text: string;
  result: {
    type: 'gold' | 'hp' | 'mp' | 'item' | 'equipment' | 'exp' | 'damage';
    value: number;
    itemId?: string;
    successRate?: number;
  };
}

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  options: EventOption[];
}

export interface BattleState {
  playerCharacters: Character[];
  enemies: Enemy[];
  turnOrder: string[];
  currentTurnIndex: number;
  selectedUnitId: string | null;
  selectedAction: ActionType;
  selectedSkillId: string | null;
  moveRange: Position[];
  attackRange: Position[];
  targetablePositions: Position[];
  battleLog: string[];
  isPlayerTurn: boolean;
  battleEnded: boolean;
  battleResult: 'victory' | 'defeat' | null;
  rewards: {
    gold: number;
    exp: number;
    items: Item[];
    equipment: Equipment[];
  } | null;
}

export interface PlayerState {
  gold: number;
  currentFloor: number;
  difficulty: number;
  unlockedDifficulties: number[];
  inventory: {
    equipment: Equipment[];
    items: { id: string; quantity: number }[];
  };
  codex: {
    enemies: string[];
    equipment: string[];
  };
}

export interface TowerState {
  floor: number;
  rooms: Room[];
  currentRoomId: string | null;
  completedRoomIds: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  effectVolume: number;
  animationSpeed: number;
  gridSize: number;
}

export interface SaveData {
  version: string;
  playerState: PlayerState;
  characters: Character[];
  towerState: TowerState;
  settings: GameSettings;
  timestamp: number;
}

export const STORAGE_KEYS = {
  SAVE_DATA: 'mechanic_tower_save',
  SETTINGS: 'mechanic_tower_settings',
  CODEX: 'mechanic_tower_codex',
} as const;

export const GRID_SIZE = 6;
export const MAX_PARTY_SIZE = 3;
export const TOTAL_FLOORS = 5;

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const CLASS_NAMES: Record<CharacterClass, string> = {
  warrior: '战士',
  mage: '法师',
  assassin: '刺客',
  priest: '牧师',
  ranger: '游侠',
  guardian: '守卫',
};

export const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: '武器',
  armor: '护甲',
  helmet: '头盔',
  boots: '靴子',
  accessory: '饰品',
};

export const STAT_NAMES: Record<StatType, string> = {
  attack: '攻击力',
  defense: '防御力',
  hp: '生命值',
  mp: '法力值',
  speed: '速度',
  critRate: '暴击率',
  critDamage: '暴击伤害',
  dodge: '闪避率',
};

export const STATUS_EFFECT_NAMES: Record<StatusEffectType, string> = {
  poison: '中毒',
  burn: '灼烧',
  stun: '眩晕',
  shield: '护盾',
  buff_attack: '攻击提升',
  buff_defense: '防御提升',
  debuff_attack: '攻击降低',
  debuff_defense: '防御降低',
};

export const ROOM_TYPE_NAMES: Record<RoomType, string> = {
  battle: '战斗',
  elite: '精英战斗',
  boss: 'Boss战',
  event: '事件',
  rest: '休整',
  treasure: '宝箱',
};

export const DIFFICULTY_NAMES: Record<number, string> = {
  1: '简单',
  2: '普通',
  3: '困难',
  4: '噩梦',
  5: '地狱',
};
