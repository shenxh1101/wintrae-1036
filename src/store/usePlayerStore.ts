import { create } from 'zustand';
import type { PlayerState, Character, Equipment, GameSettings } from '@/types/game';
import { loadCodex, updateCodex, loadUnlockedDifficulties, saveUnlockedDifficulties as persistUnlockedDifficulties, loadInheritedResources as loadInheritedRes, clearInheritedResources as clearInheritedRes, saveInheritedResources as persistInheritedResources } from '@/utils/storage';
import { getItemById } from '@/data/events';

interface PlayerStore extends PlayerState {
  characters: Character[];
  settings: GameSettings;
  setCharacters: (characters: Character[]) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addEquipment: (equipment: Equipment) => void;
  removeEquipment: (equipmentId: string) => void;
  equipItem: (characterId: string, equipment: Equipment) => void;
  unequipItem: (characterId: string, slot: string) => void;
  addItem: (itemId: string, quantity: number) => void;
  useItem: (itemId: string, characterId: string) => boolean;
  addExp: (characterId: string, amount: number) => void;
  healCharacter: (characterId: string, amount: number) => void;
  healAllCharacters: (percentage: number) => void;
  restoreMp: (characterId: string, amount: number) => void;
  restoreAllMp: (percentage: number) => void;
  damageCharacter: (characterId: string, amount: number) => void;
  addToCodex: (type: 'enemies' | 'equipment', id: string) => void;
  loadCodexData: () => void;
  setDifficulty: (difficulty: number) => void;
  unlockDifficulty: (difficulty: number) => void;
  setSettings: (settings: Partial<GameSettings>) => void;
  resetInventory: () => void;
  resetAll: (keepResources: boolean) => void;
  loadInheritedResources: () => boolean;
  saveInheritedResources: () => void;
}

const getInitialPlayerState = (): PlayerState => {
  const inherited = loadInheritedRes();
  return {
    gold: inherited ? inherited.gold : 100,
    currentFloor: 1,
    difficulty: 1,
    unlockedDifficulties: loadUnlockedDifficulties(),
    inventory: inherited
      ? {
          equipment: inherited.equipment,
          items: inherited.items,
        }
      : {
          equipment: [],
          items: [],
        },
    codex: {
      enemies: [],
      equipment: [],
    },
  };
};

const initialSettings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  effectVolume: 0.5,
  animationSpeed: 1,
  gridSize: 6,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...getInitialPlayerState(),
  characters: [],
  settings: initialSettings,

  setCharacters: (characters) => set({ characters }),

  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  addGold: (amount) =>
    set((state) => ({ gold: Math.max(0, state.gold + amount) })),

  spendGold: (amount) => {
    const { gold } = get();
    if (gold < amount) return false;
    set({ gold: gold - amount });
    return true;
  },

  addEquipment: (equipment) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        equipment: [...state.inventory.equipment, equipment],
      },
    })),

  removeEquipment: (equipmentId) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        equipment: state.inventory.equipment.filter((e) => e.id !== equipmentId),
      },
    })),

  equipItem: (characterId, equipment) => {
    const { characters, inventory } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const currentEquipped = character.equipment[equipment.slot];
    const newInventory = inventory.equipment.filter((e) => e.id !== equipment.id);
    
    if (currentEquipped) {
      newInventory.push(currentEquipped);
    }

    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId
          ? {
              ...c,
              equipment: {
                ...c.equipment,
                [equipment.slot]: equipment,
              },
            }
          : c
      ),
      inventory: {
        ...state.inventory,
        equipment: newInventory,
      },
    }));
  },

  unequipItem: (characterId, slot) => {
    const { characters } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const equipment = character.equipment[slot as keyof typeof character.equipment];
    if (!equipment) return;

    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId
          ? {
              ...c,
              equipment: {
                ...c.equipment,
                [slot]: null,
              },
            }
          : c
      ),
      inventory: {
        ...state.inventory,
        equipment: [...state.inventory.equipment, equipment],
      },
    }));
  },

  addItem: (itemId, quantity) =>
    set((state) => {
      const existingItem = state.inventory.items.find((i) => i.id === itemId);
      if (existingItem) {
        return {
          inventory: {
            ...state.inventory,
            items: state.inventory.items.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          },
        };
      }
      return {
        inventory: {
          ...state.inventory,
          items: [...state.inventory.items, { id: itemId, quantity }],
        },
      };
    }),

  useItem: (itemId, characterId) => {
    const { characters, inventory } = get();
    const character = characters.find((c) => c.id === characterId);
    const itemInInventory = inventory.items.find((i) => i.id === itemId);
    
    if (!character || !itemInInventory || itemInInventory.quantity <= 0) {
      return false;
    }

    const item = getItemById(itemId);
    if (!item) return false;

    let success = false;

    switch (item.effect.type) {
      case 'heal':
        if (character.hp < character.maxHp) {
          const newHp = Math.min(character.maxHp, character.hp + item.effect.value);
          get().updateCharacter(characterId, { hp: newHp });
          success = true;
        }
        break;
      case 'restore_mp':
        if (character.mp < character.maxMp) {
          const newMp = Math.min(character.maxMp, character.mp + item.effect.value);
          get().updateCharacter(characterId, { mp: newMp });
          success = true;
        }
        break;
      case 'revive':
        if (character.hp <= 0) {
          const newHp = Math.floor(character.maxHp * (item.effect.value / 100));
          get().updateCharacter(characterId, { hp: newHp, statusEffects: [] });
          success = true;
        }
        break;
      case 'buff':
        get().updateCharacter(characterId, {
          statusEffects: [
            ...character.statusEffects,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'buff_attack',
              duration: 999,
              value: item.effect.value,
            },
          ],
        });
        success = true;
        break;
    }

    if (success) {
      set((state) => ({
        inventory: {
          ...state.inventory,
          items: state.inventory.items
            .map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        },
      }));
    }

    return success;
  },

  addExp: (characterId, amount) => {
    const { characters } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    let newExp = character.exp + amount;
    let newLevel = character.level;
    let expToNext = character.expToNextLevel;
    let newMaxHp = character.maxHp;
    let newMaxMp = character.maxMp;
    let newBaseStats = { ...character.baseStats };

    while (newExp >= expToNext) {
      newExp -= expToNext;
      newLevel++;
      expToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1));
      
      newMaxHp = Math.floor(newMaxHp * 1.1);
      newMaxMp = Math.floor(newMaxMp * 1.1);
      newBaseStats = {
        attack: Math.floor(newBaseStats.attack * 1.08),
        defense: Math.floor(newBaseStats.defense * 1.08),
        speed: Math.floor(newBaseStats.speed * 1.05),
        critRate: Math.min(0.5, newBaseStats.critRate + 0.01),
        critDamage: newBaseStats.critDamage + 0.02,
        dodge: Math.min(0.4, newBaseStats.dodge + 0.005),
      };
    }

    get().updateCharacter(characterId, {
      level: newLevel,
      exp: newExp,
      expToNextLevel: expToNext,
      maxHp: newMaxHp,
      maxMp: newMaxMp,
      hp: Math.min(character.hp, newMaxHp),
      mp: Math.min(character.mp, newMaxMp),
      baseStats: newBaseStats,
    });
  },

  healCharacter: (characterId, amount) => {
    const { characters } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const newHp = Math.min(character.maxHp, character.hp + amount);
    get().updateCharacter(characterId, { hp: newHp });
  },

  healAllCharacters: (percentage) =>
    set((state) => ({
      characters: state.characters.map((c) => ({
        ...c,
        hp: Math.min(c.maxHp, c.hp + Math.floor(c.maxHp * percentage)),
        statusEffects: c.statusEffects.filter((e) => !['poison', 'burn', 'stun', 'debuff_attack', 'debuff_defense'].includes(e.type)),
      })),
    })),

  restoreMp: (characterId, amount) => {
    const { characters } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const newMp = Math.min(character.maxMp, character.mp + amount);
    get().updateCharacter(characterId, { mp: newMp });
  },

  restoreAllMp: (percentage) =>
    set((state) => ({
      characters: state.characters.map((c) => ({
        ...c,
        mp: Math.min(c.maxMp, c.mp + Math.floor(c.maxMp * percentage)),
      })),
    })),

  damageCharacter: (characterId, amount) => {
    const { characters } = get();
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const newHp = Math.max(0, character.hp - amount);
    get().updateCharacter(characterId, { hp: newHp });
  },

  addToCodex: (type, id) => {
    updateCodex(type, id);
    set((state) => ({
      codex: {
        ...state.codex,
        [type]: [...new Set([...state.codex[type], id])],
      },
    }));
  },

  loadCodexData: () => {
    const codexData = loadCodex();
    set({ codex: codexData });
  },

  setDifficulty: (difficulty) => set({ difficulty }),

  unlockDifficulty: (difficulty) => {
    set((state) => ({
      unlockedDifficulties: [
        ...new Set([...state.unlockedDifficulties, difficulty]),
      ],
    }));
    persistUnlockedDifficulties(get().unlockedDifficulties);
  },

  setSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),

  resetInventory: () =>
    set({
      inventory: {
        equipment: [],
        items: [],
      },
    }),

  resetAll: (keepResources) => {
    const initState = getInitialPlayerState();
    set((state) => ({
      ...initState,
      gold: keepResources ? Math.floor(state.gold * 0.3) : initState.gold,
      inventory: keepResources
        ? {
            equipment: state.inventory.equipment.slice(0, 3),
            items: state.inventory.items.map((i) => ({
              ...i,
              quantity: Math.floor(i.quantity * 0.3),
            })).filter((i) => i.quantity > 0),
          }
        : initState.inventory,
      codex: state.codex,
      unlockedDifficulties: state.unlockedDifficulties,
      currentFloor: 1,
    }));
    
    if (keepResources) {
      const s = get();
      persistInheritedResources({
        gold: s.gold,
        equipment: s.inventory.equipment,
        items: s.inventory.items,
      });
    } else {
      clearInheritedRes();
    }
  },

  loadInheritedResources: () => {
    const resources = loadInheritedRes();
    if (!resources) return false;
    
    set((state) => ({
      gold: resources.gold > 0 ? resources.gold : state.gold,
      inventory: {
        equipment: resources.equipment.length > 0 ? resources.equipment : state.inventory.equipment,
        items: resources.items.length > 0 ? resources.items : state.inventory.items,
      },
    }));
    
    clearInheritedRes();
    return true;
  },

  saveInheritedResources: () => {
    const state = get();
    persistInheritedResources({
      gold: state.gold,
      equipment: state.inventory.equipment,
      items: state.inventory.items,
    });
  },
}));
