// Zustand game state store
import { create } from 'zustand';
import { loadProgress, saveProgress, resetProgress } from '../utils/storage';
import { GAME_CONFIG } from '../data/gameConfig';

const initialProgress = loadProgress();

const useGameStore = create((set, get) => ({
  // Navigation
  currentScreen: 'loading', // loading, menu, gameSelect, game, achievements, settings, secret, ending
  currentGame: null,

  // Progress
  ...initialProgress,

  // Achievement popup queue
  pendingAchievement: null,

  // Screen navigation
  setScreen: (screen) => set({ currentScreen: screen }),

  setCurrentGame: (gameId) => set({ currentGame: gameId, currentScreen: 'game' }),

  goToMenu: () => set({ currentScreen: 'menu', currentGame: null }),

  // Game completion
  completeGame: (gameId, score) => {
    const state = get();
    const completedGames = state.completedGames.includes(gameId)
      ? state.completedGames
      : [...state.completedGames, gameId];

    const highScores = {
      ...state.highScores,
      [gameId]: Math.max(state.highScores[gameId] || 0, score),
    };

    const totalPoints = state.totalPoints + score;

    // Count plays
    const gamePlayCounts = {
      ...state.gamePlayCounts,
      [gameId]: (state.gamePlayCounts[gameId] || 0) + 1,
    };

    // Unlock next games
    const unlockedGames = [...state.unlockedGames];
    GAME_CONFIG.games.forEach((game) => {
      if (!unlockedGames.includes(game.id)) {
        const required = game.requiresGames || 0;
        if (completedGames.length >= required) {
          unlockedGames.push(game.id);
        }
      }
    });

    const newState = {
      completedGames,
      highScores,
      totalPoints,
      gamePlayCounts,
      unlockedGames,
    };

    set(newState);
    saveProgress({ ...state, ...newState });

    // Check achievements
    get().checkAchievements();
  },

  incrementPlayCount: (gameId) => {
    const state = get();
    const gamePlayCounts = {
      ...state.gamePlayCounts,
      [gameId]: (state.gamePlayCounts[gameId] || 0) + 1,
    };
    set({ gamePlayCounts });
    saveProgress({ ...state, gamePlayCounts });
  },

  addPoints: (points) => {
    const state = get();
    const totalPoints = state.totalPoints + points;
    set({ totalPoints });
    saveProgress({ ...state, totalPoints });
  },

  addHearts: (hearts) => {
    const state = get();
    const totalHearts = state.totalHearts + hearts;
    set({ totalHearts });
    saveProgress({ ...state, totalHearts });

    // Check heart collector achievement
    if (totalHearts >= 100) {
      get().unlockAchievement('heart_collector');
    }
  },

  incrementMemoryLosses: () => {
    const state = get();
    const memoryLosses = state.memoryLosses + 1;
    set({ memoryLosses });
    saveProgress({ ...state, memoryLosses });

    if (memoryLosses >= 5) {
      get().unlockAchievement('skill_issue');
    }
  },

  trackClick: (elementId) => {
    const state = get();
    const clickCounts = {
      ...state.clickCounts,
      [elementId]: (state.clickCounts[elementId] || 0) + 1,
    };
    set({ clickCounts });
    saveProgress({ ...state, clickCounts });
  },

  // Achievements
  unlockAchievement: (achievementId) => {
    const state = get();
    if (state.achievements.includes(achievementId)) return;

    const achievements = [...state.achievements, achievementId];
    set({ achievements, pendingAchievement: achievementId });
    saveProgress({ ...state, achievements });
  },

  dismissAchievement: () => set({ pendingAchievement: null }),

  // Easter eggs
  discoverEasterEgg: (eggId) => {
    const state = get();
    if (state.easterEggs.includes(eggId)) return;

    const easterEggs = [...state.easterEggs, eggId];
    set({ easterEggs });
    saveProgress({ ...state, easterEggs });
    get().unlockAchievement('devs_favorite');
  },

  // Boss
  defeatBoss: () => {
    const state = get();
    set({ bossDefeated: true });
    saveProgress({ ...state, bossDefeated: true });
    get().completeGame('boss', 1000);
  },

  // Check achievements based on current state
  checkAchievements: () => {
    const state = get();

    // Certified Simp - completed all mini-games
    const mainGames = GAME_CONFIG.games.filter(g => !g.isBoss).map(g => g.id);
    if (mainGames.every(id => state.completedGames.includes(id))) {
      get().unlockAchievement('certified_simp');
    }

    // Unemployed Gamer - played one game 10 times
    if (Object.values(state.gamePlayCounts).some(count => count >= 10)) {
      get().unlockAchievement('unemployed_gamer');
    }

    // Still Putting Up With Me - completed everything
    if (state.bossDefeated && state.completedGames.length >= GAME_CONFIG.games.length - 1) {
      get().unlockAchievement('still_here');
    }
  },

  // Secret ending
  canAccessSecretEnding: () => {
    const state = get();
    return state.bossDefeated && state.completedGames.length >= 5;
  },

  markSecretEndingSeen: () => {
    const state = get();
    set({ secretEndingSeen: true });
    saveProgress({ ...state, secretEndingSeen: true });
  },

  // Settings
  setSoundEnabled: (enabled) => {
    const state = get();
    set({ soundEnabled: enabled });
    saveProgress({ ...state, soundEnabled: enabled });
  },
  setMusicEnabled: (enabled) => {
    const state = get();
    set({ musicEnabled: enabled });
    saveProgress({ ...state, musicEnabled: enabled });
  },
  setVolume: (volume) => {
    const state = get();
    set({ volume });
    saveProgress({ ...state, volume });
  },
  setReducedMotion: (reduced) => {
    const state = get();
    set({ reducedMotion: reduced });
    saveProgress({ ...state, reducedMotion: reduced });
  },

  // Reset
  resetAll: () => {
    const fresh = resetProgress();
    set({ ...fresh, currentScreen: 'menu', currentGame: null, pendingAchievement: null });
  },
}));

export default useGameStore;
