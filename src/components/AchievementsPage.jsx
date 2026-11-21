import { useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { ACHIEVEMENTS } from '../data/achievements';

export default function AchievementsPage() {
  const achievements = useGameStore((s) => s.achievements);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const { play } = useSound();

  const handleBack = useCallback(() => {
    play('click');
    goToMenu();
  }, [play, goToMenu]);

  const unlockedCount = achievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="game-screen">
      <div className="achievements-screen">
        <button className="back-button" onClick={handleBack}>
          ← KEMBALI
        </button>

        <motion.h1
          className="achievements-title"
          initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          🏆 PENCAPAIAN GISELLE
        </motion.h1>

        <motion.p
          className="achievements-count"
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {unlockedCount} DARI {totalCount} TERBUKA
        </motion.p>

        <div className="achievements-grid">
          {ACHIEVEMENTS.map((ach, i) => {
            const isUnlocked = achievements.includes(ach.id);

            return (
              <motion.div
                key={ach.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <span className="achievement-icon">
                  {isUnlocked ? ach.icon : '🔒'}
                </span>
                <div className="achievement-info">
                  <h3>{isUnlocked ? ach.name : '??? (RAHASIA)'}</h3>
                  <p>{isUnlocked ? ach.description : 'Main terus untuk membuka misteri ini...'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
