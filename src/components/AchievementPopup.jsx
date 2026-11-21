import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { ACHIEVEMENTS } from '../data/achievements';

export default function AchievementPopup() {
  const pendingAchievement = useGameStore((s) => s.pendingAchievement);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const { play } = useSound();

  const achievement = pendingAchievement
    ? ACHIEVEMENTS.find((a) => a.id === pendingAchievement)
    : null;

  useEffect(() => {
    if (!achievement) return;

    play('achievement');

    const timer = setTimeout(() => {
      dismissAchievement();
    }, 4000);

    return () => clearTimeout(timer);
  }, [achievement, play, dismissAchievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="achievement-popup"
          onClick={dismissAchievement}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span className="achievement-popup-icon">{achievement.icon}</span>
          <div className="achievement-popup-info">
            <span className="achievement-popup-label">🏆 PENCAPAIAN BARU TERBUKA!</span>
            <span className="achievement-popup-name">{achievement.name}</span>
            <span className="achievement-popup-desc">{achievement.description}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
