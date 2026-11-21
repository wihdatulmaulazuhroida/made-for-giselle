// LocalStorage utility functions

const STORAGE_KEY = 'player2_arcade_save';

const defaultState = {
  completedGames: [],
  highScores: {},
  totalPoints: 0,
  totalHearts: 0,
  achievements: [],
  unlockedGames: ['memory'],
  easterEggs: [],
  gamePlayCounts: {},
  memoryLosses: 0,
  clickCounts: {},
  secretEndingSeen: false,
  bossDefeated: false,
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.5,
  reducedMotion: false,
};

export function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return { ...defaultState };
}

export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to reset progress:', e);
  }
  return { ...defaultState };
}

export { defaultState };
