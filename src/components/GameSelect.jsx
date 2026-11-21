import { useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { GAME_CONFIG } from '../data/gameConfig';

export default function GameSelect() {
  const setCurrentGame = useGameStore((s) => s.setCurrentGame);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const completedGames = useGameStore((s) => s.completedGames);
  const unlockedGames = useGameStore((s) => s.unlockedGames);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const { play } = useSound();

  const handleGameClick = useCallback(
    (game) => {
      const isUnlocked = game.unlocked || unlockedGames.includes(game.id);
      if (!isUnlocked) {
        play('error');
        return;
      }
      play('click');
      setCurrentGame(game.id);
    },
    [unlockedGames, setCurrentGame, play]
  );

  const handleBack = useCallback(() => {
    play('click');
    goToMenu();
  }, [play, goToMenu]);

  return (
    <div className="game-screen">
      <div className="game-select">
        <button className="back-button" onClick={handleBack}>
          ← KEMBALI
        </button>

        <motion.h1
          className="game-select-title"
          initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          🎮 KOLEKSI MINI-GAME GISELLE
        </motion.h1>

        <div className="game-grid">
          {GAME_CONFIG.games.map((game, i) => {
            const isUnlocked = game.unlocked || unlockedGames.includes(game.id);
            const isCompleted = completedGames.includes(game.id);
            const gamesNeeded = (game.requiresGames || 0) - completedGames.length;

            return (
              <motion.div
                key={game.id}
                className={`game-card${!isUnlocked ? ' locked' : ''}${isCompleted ? ' completed' : ''}`}
                onClick={() => handleGameClick(game)}
                onMouseEnter={() => isUnlocked && play('hover')}
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={isUnlocked && !reducedMotion ? { scale: 1.03 } : {}}
              >
                <span className="game-card-icon">
                  {isUnlocked ? game.icon : '🔒'}
                </span>
                <span className="game-card-title">
                  {isUnlocked ? game.title : 'TERKUNCI'}
                </span>
                <span className="game-card-subtitle">
                  {isUnlocked ? game.subtitle : 'Selesaikan misi sebelumnya'}
                </span>
                {isCompleted && (
                  <span className="game-card-status">✅ SELESAI DITAMATKAN</span>
                )}
                {!isUnlocked && (
                  <span className="game-card-lock">
                    🔒 Selesaikan {gamesNeeded > 0 ? gamesNeeded : 1} game lagi untuk membuka
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
