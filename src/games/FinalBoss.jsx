import { useState, useEffect, useCallback, useRef } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { bossQuestions } from '../data/questions';
import GameHUD from '../components/GameHUD';

const BOSS_EMOJIS = ['👾', '🥔', '🗿', '🤖'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const DAMAGE_PER_HIT = 20;

export default function FinalBoss() {
  const { defeatBoss, unlockAchievement, goToMenu, setScreen } = useGameStore();
  const { play } = useSound();

  const [phase, setPhase] = useState('intro'); // intro, battle, feedback, victory
  const [bossHp, setBossHp] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reactionText, setReactionText] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [bossEmojiIndex, setBossEmojiIndex] = useState(0);

  const totalRounds = bossQuestions.length;
  const currentQuestion = bossQuestions[currentIndex];

  const handleStart = useCallback(() => {
    play('boss');
    setPhase('battle');
  }, [play]);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(optionIndex);
      const isCorrect = optionIndex === currentQuestion.correct;

      if (isCorrect) {
        play('bonk');
        triggerShake();

        const newHp = Math.max(0, bossHp - DAMAGE_PER_HIT);
        setBossHp(newHp);
        setReactionText(currentQuestion.bossReaction);
        setBossEmojiIndex((i) => (i + 1) % BOSS_EMOJIS.length);

        setPhase('feedback');

        setTimeout(() => {
          if (newHp <= 0 || currentIndex + 1 >= totalRounds) {
            setBossHp(0);
            setPhase('victory');
            play('win');
            defeatBoss();
            unlockAchievement('yap_survivor');
          } else {
            setCurrentIndex((i) => i + 1);
            setSelectedAnswer(null);
            setReactionText('');
            setPhase('battle');
          }
        }, 2200);
      } else {
        play('error');
        setReactionText(currentQuestion.wrongReaction);
        setPhase('feedback');

        setTimeout(() => {
          setSelectedAnswer(null);
          setReactionText('');
          setPhase('battle');
        }, 2000);
      }
    },
    [selectedAnswer, currentQuestion, bossHp, currentIndex, totalRounds, play, triggerShake, defeatBoss, unlockAchievement]
  );

  const hpPercent = Math.max(0, Math.min(100, bossHp));

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="game-container">
        <GameHUD title="FINAL BOSS" onBack={goToMenu} />
        <div className="boss-container">
          <div className="boss-character">👾</div>
          <div className="game-title" style={{ color: '#f87171' }}>
            ⚠️ PERINGATAN: BOS TERAKHIR MENDEKAT!
          </div>
          <div className="game-subtitle">Ujian Akhir Hubungan untuk Giselle</div>
          <div className="game-instructions">
            Si Bos Besar adalah manifestasi dari semua overthinking, lelucon garing, dan kelakuan ajaib selama pacaran.<br /><br />
            Hanya Giselle yang memiliki kekuatan dan kesabaran untuk mengalahkannya.<br /><br />
            <strong>Kalahkan Bos dengan menjawab pertanyaan dengan tepat!</strong>
          </div>
          <button className="arcade-btn accent" onClick={handleStart}>
            ⚔️ MULAI PERTARUNGAN
          </button>
        </div>
      </div>
    );
  }

  // Victory Screen
  if (phase === 'victory') {
    return (
      <div className="game-container">
        <GameHUD title="FINAL BOSS" onBack={goToMenu} />
        <div className="boss-container">
          <div className="boss-character" style={{ filter: 'grayscale(0.5)' }}>
            💥✨
          </div>
          <div className="result-title" style={{ color: '#4ade80' }}>
            🏆 SI BOS BERHASIL DIKALAHKAN!
          </div>
          <div className="game-subtitle" style={{ color: '#FFD93D' }}>
            GISELLE TELAH MENYELESAIKAN SELURUH MISI!
          </div>
          <div className="game-instructions" style={{ lineHeight: '1.8' }}>
            Luar biasa! Tidak ada lagi halangan di depan.<br />
            Kesabaran, cinta, dan pemahaman Giselle telah mengunci kemenangan mutlak.<br /><br />
            <strong style={{ color: '#a5b4fc' }}>Memuat hadiah rahasia spesial untukmu...</strong>
          </div>
          <div className="result-buttons">
            <button
              className="arcade-btn accent"
              onClick={() => setScreen('secret')}
              style={{ boxShadow: '0 0 25px rgba(255, 217, 61, 0.6)' }}
            >
              🔮 BUKA HADIAH RAHASIA GISELLE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Battle / Feedback screen
  return (
    <div className={`game-container ${isShaking ? 'shake' : ''}`}>
      <GameHUD title="FINAL BOSS" onBack={goToMenu} />
      <div className="boss-container">
        {/* Boss Visual */}
        <div className="boss-character">{BOSS_EMOJIS[bossEmojiIndex]}</div>

        {/* Boss HP Bar */}
        <div className="boss-hp-bar">
          <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }} />
          <span className="boss-hp-text">DARAH BOS: {hpPercent}%</span>
        </div>

        {/* Reaction Text */}
        <div className="boss-reaction" style={{ minHeight: '36px', color: '#FFD93D' }}>
          {reactionText || `RONDE ${currentIndex + 1} DARI ${totalRounds}`}
        </div>

        {/* Question & Options */}
        <div className="quiz-question">
          {currentQuestion.question}
        </div>

        <div className="quiz-options">
          {currentQuestion.options.map((option, i) => {
            let className = 'quiz-option';
            if (selectedAnswer !== null) {
              if (i === currentQuestion.correct) className += ' correct';
              else if (i === selectedAnswer) className += ' wrong';
            }
            return (
              <button
                key={i}
                className={className}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
              >
                <strong>{OPTION_LABELS[i]}.</strong> {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
