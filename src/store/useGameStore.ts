import { create } from 'zustand';
import type { TowerState, Room, GameEvent, CharacterClass, Character } from '@/types/game';
import { generateFloorRooms, generateCharacter } from '@/utils/random';
import { getRandomEvent } from '@/data/events';
import { saveGame, loadGame, loadSettings } from '@/utils/storage';
import { usePlayerStore } from './usePlayerStore';

interface GameStore {
  towerState: TowerState;
  currentEvent: GameEvent | null;
  currentRoomType: string | null;
  gamePhase: 'menu' | 'team_setup' | 'exploring' | 'battle' | 'event' | 'result' | 'inventory' | 'codex' | 'settings';
  lastResult: {
    type: 'battle' | 'event' | 'floor' | 'gameover' | 'victory';
    success: boolean;
    rewards?: any;
  } | null;
  isTransitioning: boolean;
  transitionData: any;
  
  initNewGame: (difficulty: number, characterClasses: CharacterClass[]) => void;
  loadSavedGame: () => boolean;
  saveCurrentGame: () => void;
  enterRoom: (roomId: string) => void;
  completeRoom: (roomId: string) => void;
  goToNextFloor: () => void;
  setGamePhase: (phase: GameStore['gamePhase']) => void;
  setCurrentEvent: (event: GameEvent | null) => void;
  setLastResult: (result: GameStore['lastResult']) => void;
  setTransitioning: (transitioning: boolean, data?: any) => void;
  getAvailableRooms: () => Room[];
  getCurrentRoom: () => Room | undefined;
  resetGame: (keepResources: boolean) => void;
  generateEvent: () => void;
}

const initialTowerState: TowerState = {
  floor: 1,
  rooms: [],
  currentRoomId: null,
  completedRoomIds: [],
};

const CLASS_NAMES: Record<CharacterClass, string[]> = {
  warrior: ['艾伦', '雷德', '马库斯'],
  mage: ['莉娜', '梅林', '爱丽丝'],
  assassin: ['影', '凯特', '雷克'],
  priest: ['赛拉', '约翰', '玛丽'],
  ranger: ['罗宾', '艾拉', '亨特'],
  guardian: ['格雷格', '铁壁', '奥古'],
};

export const useGameStore = create<GameStore>((set, get) => ({
  towerState: initialTowerState,
  currentEvent: null,
  currentRoomType: null,
  gamePhase: 'menu',
  lastResult: null,
  isTransitioning: false,
  transitionData: null,

  initNewGame: (difficulty, characterClasses) => {
    const settings = loadSettings();
    
    const characters: Character[] = characterClasses.map((classId, index) => {
      const names = CLASS_NAMES[classId];
      const name = names[index % names.length];
      const position = { x: 0, y: index };
      return generateCharacter(classId, name, position);
    });

    const rooms = generateFloorRooms(1);

    const playerStore = usePlayerStore.getState();
    playerStore.setCharacters(characters);
    playerStore.setDifficulty(difficulty);
    playerStore.loadCodexData();

    set({
      towerState: {
        floor: 1,
        rooms,
        currentRoomId: null,
        completedRoomIds: [],
      },
      currentEvent: null,
      currentRoomType: null,
      gamePhase: 'exploring',
      lastResult: null,
    });

    get().saveCurrentGame();
  },

  loadSavedGame: () => {
    const saveData = loadGame();
    if (!saveData) return false;

    const playerStore = usePlayerStore.getState();
    playerStore.setCharacters(saveData.characters);

    const ps = saveData.playerState;
    playerStore.addGold(ps.gold - playerStore.gold);
    playerStore.setDifficulty(ps.difficulty);
    ps.unlockedDifficulties.forEach((d) => playerStore.unlockDifficulty(d));

    const inv = ps.inventory;
    playerStore.resetInventory();
    inv.equipment.forEach((eq) => playerStore.addEquipment(eq));
    inv.items.forEach((item) => playerStore.addItem(item.id, item.quantity));

    if (ps.codex) {
      playerStore.loadCodexData();
    }

    if (saveData.settings) {
      playerStore.setSettings(saveData.settings);
    }

    set({
      towerState: saveData.towerState,
      currentEvent: null,
      currentRoomType: null,
      gamePhase: 'exploring',
      lastResult: null,
    });

    return true;
  },

  saveCurrentGame: () => {
    const { towerState, gamePhase } = get();
    if (gamePhase === 'battle') return;

    const playerStore = usePlayerStore.getState();
    saveGame(
      {
        gold: playerStore.gold,
        currentFloor: towerState.floor,
        difficulty: playerStore.difficulty,
        unlockedDifficulties: playerStore.unlockedDifficulties,
        inventory: playerStore.inventory,
        codex: playerStore.codex,
      },
      playerStore.characters,
      towerState,
      playerStore.settings
    );
  },

  enterRoom: (roomId) => {
    const { towerState } = get();
    const room = towerState.rooms.find((r) => r.id === roomId);
    if (!room || room.cleared) return;

    set({
      towerState: {
        ...towerState,
        currentRoomId: roomId,
      },
      currentRoomType: room.type,
    });

    if (room.type === 'battle' || room.type === 'elite' || room.type === 'boss') {
      set({ gamePhase: 'battle' });
    } else if (room.type === 'event') {
      get().generateEvent();
      set({ gamePhase: 'event' });
    } else if (room.type === 'rest') {
      const playerStore = usePlayerStore.getState();
      playerStore.healAllCharacters(0.3);
      playerStore.restoreAllMp(0.3);
      get().setLastResult({
        type: 'event',
        success: true,
        rewards: { message: '队伍在营地休整，恢复了30%的生命和法力' },
      });
      get().completeRoom(roomId);
      set({ gamePhase: 'result' });
    } else if (room.type === 'treasure') {
      const playerStore = usePlayerStore.getState();
      const gold = 50 + towerState.floor * 20;
      playerStore.addGold(gold);
      get().setLastResult({
        type: 'event',
        success: true,
        rewards: { gold, message: `发现了宝箱，获得 ${gold} 金币！` },
      });
      get().completeRoom(roomId);
      set({ gamePhase: 'result' });
    }
  },

  completeRoom: (roomId) => {
    const { towerState } = get();
    
    set({
      towerState: {
        ...towerState,
        completedRoomIds: [...towerState.completedRoomIds, roomId],
        rooms: towerState.rooms.map((r) =>
          r.id === roomId ? { ...r, cleared: true } : r
        ),
        currentRoomId: null,
      },
      currentRoomType: null,
      currentEvent: null,
    });

    get().saveCurrentGame();
  },

  goToNextFloor: () => {
    const { towerState } = get();
    const nextFloor = towerState.floor + 1;
    const rooms = generateFloorRooms(nextFloor);

    const playerStore = usePlayerStore.getState();
    playerStore.healAllCharacters(0.2);
    playerStore.restoreAllMp(0.2);

    if (nextFloor > 5) {
      playerStore.unlockDifficulty(Math.min(playerStore.difficulty + 1, 5));
      set({
        lastResult: {
          type: 'victory',
          success: true,
          rewards: {
            message: '恭喜通关！你征服了机关塔！',
            newDifficulty: playerStore.difficulty + 1,
          },
        },
        gamePhase: 'result',
      });
      return;
    }

    set({
      towerState: {
        floor: nextFloor,
        rooms,
        currentRoomId: null,
        completedRoomIds: [],
      },
      lastResult: {
        type: 'floor',
        success: true,
        rewards: {
          floor: nextFloor,
          message: `进入第 ${nextFloor} 层，恢复了20%的生命和法力`,
        },
      },
      gamePhase: 'result',
    });

    get().saveCurrentGame();
  },

  setGamePhase: (phase) => set({ gamePhase: phase }),

  setCurrentEvent: (event) => set({ currentEvent: event }),

  setLastResult: (result) => set({ lastResult: result }),

  setTransitioning: (transitioning, data) =>
    set({ isTransitioning: transitioning, transitionData: data }),

  getAvailableRooms: () => {
    const { towerState } = get();
    const completedCount = towerState.completedRoomIds.length;
    
    return towerState.rooms.filter((_, index) => index <= completedCount && !towerState.completedRoomIds.includes(towerState.rooms[index].id));
  },

  getCurrentRoom: () => {
    const { towerState } = get();
    return towerState.rooms.find((r) => r.id === towerState.currentRoomId);
  },

  resetGame: (keepResources) => {
    const playerStore = usePlayerStore.getState();
    playerStore.resetAll(keepResources);
    
    set({
      towerState: initialTowerState,
      currentEvent: null,
      currentRoomType: null,
      gamePhase: 'menu',
      lastResult: null,
      isTransitioning: false,
      transitionData: null,
    });
  },

  generateEvent: () => {
    const event = getRandomEvent();
    set({ currentEvent: event });
  },
}));
