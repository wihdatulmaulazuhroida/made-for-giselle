import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import Modal from './Modal';

export default function SettingsMenu() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const volume = useGameStore((s) => s.volume);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const setMusicEnabled = useGameStore((s) => s.setMusicEnabled);
  const setVolume = useGameStore((s) => s.setVolume);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const resetAll = useGameStore((s) => s.resetAll);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const { play } = useSound();

  const [showResetModal, setShowResetModal] = useState(false);

  const handleBack = useCallback(() => {
    play('click');
    goToMenu();
  }, [play, goToMenu]);

  const handleToggleSound = useCallback(() => {
    play('click');
    setSoundEnabled(!soundEnabled);
  }, [play, setSoundEnabled, soundEnabled]);

  const handleToggleMusic = useCallback(() => {
    play('click');
    setMusicEnabled(!musicEnabled);
  }, [play, setMusicEnabled, musicEnabled]);

  const handleVolumeChange = useCallback(
    (e) => {
      setVolume(parseFloat(e.target.value));
    },
    [setVolume]
  );

  const handleToggleMotion = useCallback(() => {
    play('click');
    setReducedMotion(!reducedMotion);
  }, [play, setReducedMotion, reducedMotion]);

  const handleResetConfirm = useCallback(() => {
    play('error');
    setShowResetModal(false);
    resetAll();
  }, [play, resetAll]);

  return (
    <div className="game-screen">
      <div className="settings-screen">
        <button className="back-button" onClick={handleBack}>
          ← KEMBALI
        </button>

        <motion.h1
          className="settings-title"
          initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          ⚙️ PENGATURAN ARCADE
        </motion.h1>

        <motion.div
          className="settings-panel"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="settings-row">
            <label>🔊 Efek Suara (SFX)</label>
            <button
              className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
              onClick={handleToggleSound}
              aria-label={`Suara ${soundEnabled ? 'aktif' : 'mati'}`}
            />
          </div>

          <div className="settings-row">
            <label>🎵 Musik</label>
            <button
              className={`toggle-switch ${musicEnabled ? 'active' : ''}`}
              onClick={handleToggleMusic}
              aria-label={`Musik ${musicEnabled ? 'aktif' : 'mati'}`}
            />
          </div>

          <div className="settings-row">
            <label>🔉 Volume Suara</label>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>

          <div className="settings-row">
            <label>🎬 Kurangi Animasi (Reduced Motion)</label>
            <button
              className={`toggle-switch ${reducedMotion ? 'active' : ''}`}
              onClick={handleToggleMotion}
              aria-label={`Kurangi animasi ${reducedMotion ? 'aktif' : 'mati'}`}
            />
          </div>

          <div className="settings-danger">
            <button
              className="arcade-btn"
              onClick={() => {
                play('click');
                setShowResetModal(true);
              }}
            >
              ⚠️ RESET SELURUH PROGRES GISELLE
            </button>
          </div>
        </motion.div>

        <Modal
          isOpen={showResetModal}
          title="⚠️ YAKIN MAU RESET PROGRES?"
          message="Semua game yang udah Giselle tamatin, skor tertinggi, dan pencapaian bakal dihapus total. Mau diulang dari awal lagi?"
          confirmText="IYA, RESET SEMUA"
          cancelText="BATAL, JANGAN"
          onConfirm={handleResetConfirm}
          onCancel={() => setShowResetModal(false)}
        />
      </div>
    </div>
  );
}
