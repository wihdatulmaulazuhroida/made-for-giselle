import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';

const LOADING_ITEMS = [
  { text: 'Memuat kenangan indah...', done: 'SELESAI' },
  { text: 'Mengisi stok afeksi & cinta...', done: 'SELESAI' },
  { text: 'Menyiapkan lelucon garing...', done: 'SELESAI' },
  { text: 'Mengecek kecocokan hati...', done: '100%' },
];

export default function LoadingScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const [visibleItems, setVisibleItems] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    // Show items sequentially
    const timers = [];

    LOADING_ITEMS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleItems(i + 1);
          setProgress(((i + 1) / LOADING_ITEMS.length) * 100);
        }, (i + 1) * 700)
      );
    });

    // Show final message
    timers.push(
      setTimeout(() => {
        setShowFinal(true);
      }, LOADING_ITEMS.length * 700 + 500)
    );

    // Transition to menu
    timers.push(
      setTimeout(() => {
        setScreen('menu');
      }, 4000)
    );

    return () => timers.forEach(clearTimeout);
  }, [setScreen]);

  return (
    <div className="loading-screen">
      <motion.h1
        className="loading-title"
        initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        MEMPERSIAPKAN PETUALANGAN GISELLE...
      </motion.h1>

      <div className="loading-items">
        <AnimatePresence>
          {LOADING_ITEMS.slice(0, visibleItems).map((item, i) => (
            <motion.div
              key={i}
              className="loading-item"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span>{item.text}</span>
              <span className="done">{item.done}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="loading-bar-container">
        <motion.div
          className="loading-bar"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence>
        {showFinal && (
          <motion.p
            className="loading-status"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            Sayangnya, kamu udah terjebak sama game & orang ini selamanya. ✨
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
