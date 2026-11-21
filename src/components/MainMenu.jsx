import { Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { GAME_CONFIG } from '../data/gameConfig';
import ArcadeScene from '../three/ArcadeScene';

export default function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const completedGames = useGameStore((s) => s.completedGames);
  const achievements = useGameStore((s) => s.achievements);
  const totalPoints = useGameStore((s) => s.totalPoints);
  const trackClick = useGameStore((s) => s.trackClick);
  const clickCounts = useGameStore((s) => s.clickCounts);
  const discoverEasterEgg = useGameStore((s) => s.discoverEasterEgg);
  const canAccessSecretEnding = useGameStore((s) => s.canAccessSecretEnding);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const { play } = useSound();

  const handleTitleClick = useCallback(() => {
    trackClick('title');
    play('click');
    const current = (clickCounts['title'] || 0) + 1;
    if (current >= 5) {
      discoverEasterEgg('title_click');
    }
  }, [trackClick, clickCounts, discoverEasterEgg, play]);

  const handleNav = useCallback(
    (screen) => {
      play('click');
      setScreen(screen);
    },
    [play, setScreen]
  );

  const handleHover = useCallback(() => {
    play('hover');
  }, [play]);

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' },
      };

  return (
    <div className="main-menu">
      {/* 3D Retro Arcade Background */}
      <Suspense fallback={null}>
        <ArcadeScene />
      </Suspense>

      {/* Menu Overlay */}
      <div className="menu-overlay">
        <motion.h1
          className="menu-title"
          onClick={handleTitleClick}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          {...motionProps}
        >
          {GAME_CONFIG.title}
        </motion.h1>

        <motion.p
          className="menu-subtitle"
          {...motionProps}
          transition={{ ...(motionProps.transition || {}), delay: 0.1 }}
        >
          {GAME_CONFIG.subtitle}
        </motion.p>

        <motion.div
          className="menu-stats"
          {...motionProps}
          transition={{ ...(motionProps.transition || {}), delay: 0.2 }}
        >
          <span>👤 Nama Pemain: Giselle</span>
          <span>🎮 Misi Selesai: {completedGames.length}/{GAME_CONFIG.games.length}</span>
          <span>🏆 Pencapaian: {achievements.length}</span>
          <span>⭐ Skor Total: {totalPoints}</span>
        </motion.div>

        <motion.div
          className="menu-buttons"
          {...motionProps}
          transition={{ ...(motionProps.transition || {}), delay: 0.3 }}
        >
          <button
            className="arcade-btn"
            onClick={() => handleNav('gameSelect')}
            onMouseEnter={handleHover}
          >
            ▶ MULAI PETUALANGAN
          </button>
          <button
            className="arcade-btn secondary"
            onClick={() => handleNav('gameSelect')}
            onMouseEnter={handleHover}
          >
            🎮 KOLEKSI GAME
          </button>
          <button
            className="arcade-btn secondary"
            onClick={() => handleNav('achievements')}
            onMouseEnter={handleHover}
          >
            🏆 PENCAPAIAN
          </button>
          <button
            className="arcade-btn secondary"
            onClick={() => handleNav('settings')}
            onMouseEnter={handleHover}
          >
            ⚙️ PENGATURAN
          </button>
          {canAccessSecretEnding() && (
            <button
              className="arcade-btn accent"
              onClick={() => handleNav('secret')}
              onMouseEnter={handleHover}
            >
              🔮 RAHASIA SPESIAL
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
