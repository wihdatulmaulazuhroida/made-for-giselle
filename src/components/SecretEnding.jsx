import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { ANNIVERSARY_LETTER } from '../data/rewards';
import SecretScene from '../three/SecretScene';
import VinylPlayer from './VinylPlayer';

const CINEMATIC_LINES = [
  'SEMUA MISI BERHASIL DISELESAIKAN GISELLE! ✨',
  'Tapi sejujurnya...',
  'Aku bikin game arcade ini bukan cuma biar kamu menang.',
  'Aku bikin ini karena aku pengen ngasih hadiah yang bisa kamu mainin, bikin kamu senyum, dan kamu ingat selalu.',
];

export default function SecretEnding() {
  const markSecretEndingSeen = useGameStore((s) => s.markSecretEndingSeen);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const { play } = useSound();

  // phase: 'cinematic' | 'button' | 'letter'
  const [phase, setPhase] = useState('cinematic');
  const [visibleLine, setVisibleLine] = useState(-1);

  // Typing animation states
  const fullLetterText = useMemo(() => {
    return ANNIVERSARY_LETTER.paragraphs.join('\n\n');
  }, []);

  const [displayedTextLength, setDisplayedTextLength] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Phase 1: Show cinematic lines one at a time
  useEffect(() => {
    if (phase !== 'cinematic') return;

    const timers = [];

    CINEMATIC_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLine(i);
        }, (i + 1) * 2600)
      );
    });

    // After all lines, transition to reward button phase
    timers.push(
      setTimeout(() => {
        setPhase('button');
      }, (CINEMATIC_LINES.length + 1) * 2600)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Phase 3: Character-by-character typing animation
  useEffect(() => {
    if (phase !== 'letter' || isTypingDone) return;

    if (displayedTextLength < fullLetterText.length) {
      const char = fullLetterText[displayedTextLength];
      // Slight variation: pause slightly longer at punctuation
      const delay = char === '.' || char === '!' || char === '?' ? 120 : char === ',' ? 60 : 25;

      const timer = setTimeout(() => {
        setDisplayedTextLength((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsTypingDone(true);
    }
  }, [phase, displayedTextLength, fullLetterText, isTypingDone]);

  // Skip typing button
  const handleSkipTyping = useCallback(() => {
    setDisplayedTextLength(fullLetterText.length);
    setIsTypingDone(true);
    play('click');
  }, [fullLetterText, play]);

  // Transition to letter phase
  const handleClaimReward = useCallback(() => {
    play('win');
    markSecretEndingSeen();
    unlockAchievement('still_here');
    setPhase('letter');
    setDisplayedTextLength(0);
    setIsTypingDone(false);
  }, [play, markSecretEndingSeen, unlockAchievement]);

  const handleBackToMenu = useCallback(() => {
    play('click');
    goToMenu();
  }, [play, goToMenu]);

  // Format the typed text preserving paragraphs
  const renderedParagraphs = useMemo(() => {
    const currentSubstring = fullLetterText.substring(0, displayedTextLength);
    return currentSubstring.split('\n\n');
  }, [fullLetterText, displayedTextLength]);

  return (
    <div className="game-screen" style={{ position: 'relative', overflowY: 'auto' }}>
      {/* Dreamy Galaxy 3D Background */}
      <Suspense fallback={null}>
        <SecretScene />
      </Suspense>

      <div className="secret-screen" style={{ position: 'relative', zIndex: 10 }}>
        {/* Phase 1: Cinematic text intro */}
        {phase === 'cinematic' && (
          <div className="secret-centered-phase">
            <AnimatePresence mode="wait">
              {visibleLine >= 0 && (
                <motion.p
                  key={visibleLine}
                  className="secret-text"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  {CINEMATIC_LINES[visibleLine]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Phase 2: Claim final reward button */}
        {phase === 'button' && (
          <div className="secret-centered-phase">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
            >
              <p className="secret-text">Spesial untuk Giselle...</p>
              <button
                className="arcade-btn accent"
                onClick={handleClaimReward}
                style={{ padding: '18px 36px', boxShadow: '0 0 25px rgba(255, 217, 61, 0.6)' }}
              >
                🎁 BUKA HADIAH AKHIR GISELLE
              </button>
            </motion.div>
          </div>
        )}

        {/* Phase 3: Redesigned Anniversary Letter & Vinyl Player Section */}
        {phase === 'letter' && (
          <motion.div
            className="anniversary-showcase-container"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className="anniversary-header">
              <h1 className="anniversary-main-title">{ANNIVERSARY_LETTER.title}</h1>
              <p className="anniversary-sub-title">{ANNIVERSARY_LETTER.subtitle}</p>
              <span className="anniversary-date-badge">{ANNIVERSARY_LETTER.date}</span>
            </div>

            {/* Main Showcase Layout: Left Letter | Right Vinyl */}
            <div className="anniversary-dual-layout">
              {/* Left Column: Letter with slow typing animation */}
              <div className="letter-wrapper">
                <div className="letter-paper">
                  <div className="letter-stamp">💜</div>
                  <div className="letter-body-content">
                    {renderedParagraphs.map((para, i) => (
                      <p key={i} className="letter-paragraph">
                        {para}
                        {/* Cursor placed on the currently typing paragraph */}
                        {!isTypingDone && i === renderedParagraphs.length - 1 && (
                          <span className="typing-cursor">|</span>
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Skip typing button */}
                  {!isTypingDone && (
                    <div className="skip-typing-container">
                      <button
                        type="button"
                        className="skip-typing-btn"
                        onClick={handleSkipTyping}
                      >
                        ⚡ TAMPILKAN SEMUA TEKS
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Realistic Vinyl Record Player */}
              <div className="vinyl-wrapper">
                <VinylPlayer
                  src={ANNIVERSARY_LETTER.audioSrc || '/music/our-song.mp3'}
                  title={ANNIVERSARY_LETTER.audioTitle || 'Our Melody'}
                  artist={ANNIVERSARY_LETTER.audioArtist || 'Giselle & Player 1'}
                />
              </div>
            </div>

            {/* Back Button */}
            <div className="anniversary-footer-action">
              <button className="arcade-btn secondary" onClick={handleBackToMenu}>
                ← KEMBALI KE MENU UTAMA
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
