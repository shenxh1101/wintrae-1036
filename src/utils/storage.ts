import type { SaveData, GameSettings, PlayerState, Character, TowerState } from '@/types/game';
import { STORAGE_KEYS } from '@/types/game';

export const saveGame = (
  playerState: PlayerState,
  characters: Character[],
  towerState: TowerState,
  settings: GameSettings
): void => {
  const saveData: SaveData = {
    version: '1.0.0',
    playerState,
    characters,
    towerState,
    settings,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(saveData));
};

export const loadGame = (): SaveData | null => {
  const data = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const deleteSave = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SAVE_DATA);
};

export const hasSaveData = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.SAVE_DATA) !== null;
};

export const saveSettings = (settings: GameSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): GameSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    return {
      soundEnabled: true,
      musicVolume: 0.7,
      effectVolume: 0.5,
      animationSpeed: 1,
      gridSize: 6,
    };
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return {
      soundEnabled: true,
      musicVolume: 0.7,
      effectVolume: 0.5,
      animationSpeed: 1,
      gridSize: 6,
    };
  }
};

export const saveCodex = (enemies: string[], equipment: string[]): void => {
  localStorage.setItem(
    STORAGE_KEYS.CODEX,
    JSON.stringify({ enemies, equipment })
  );
};

export const loadCodex = (): { enemies: string[]; equipment: string[] } => {
  const data = localStorage.getItem(STORAGE_KEYS.CODEX);
  if (!data) {
    return { enemies: [], equipment: [] };
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return { enemies: [], equipment: [] };
  }
};

export const updateCodex = (type: 'enemies' | 'equipment', id: string): void => {
  const codex = loadCodex();
  if (!codex[type].includes(id)) {
    codex[type].push(id);
    saveCodex(codex.enemies, codex.equipment);
  }
};

export const exportSave = (): string => {
  const saveData = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
  return saveData || '';
};

export const importSave = (saveString: string): boolean => {
  try {
    const data = JSON.parse(saveString) as SaveData;
    if (data.version && data.playerState && data.characters) {
      localStorage.setItem(STORAGE_KEYS.SAVE_DATA, saveString);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const getSaveInfo = (): { timestamp: number; floor: number; gold: number } | null => {
  const save = loadGame();
  if (!save) return null;
  
  return {
    timestamp: save.timestamp,
    floor: save.towerState.floor,
    gold: save.playerState.gold,
  };
};
