import { useState, useEffect, useCallback, useRef } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { shuffleArray, formatTime } from '../utils/gameHelpers';
import GameHUD from '../components/GameHUD';

const CARD_POOL = [
  { id: 'heart', emoji: '💖', label: 'Afeksi' },
  { id: 'star', emoji: '⭐', label: 'Bintang Emas' },
  { id: 'game', emoji: '🎮', label: 'Giselle' },
  { id: 'music', emoji: '🎵', label: 'Lagu Kita' },
  { id: 'moon', emoji: '🌙', label: 'Pikiran Jam 2 Pagi' },
  { id: 'fire', emoji: '🔥', label: 'Meme Pedas' },
  { id: 'target', emoji: '🎯', label: 'Fokus' },
  { id: 'rainbow', emoji: '🌈', label: 'Wholesome' },
];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, label: 'MUDAH (4 PASANG)', cols: 'easy' },
  normal: { pairs: 6, label: 'NORMAL (6 PASANG)', cols: 'normal' },
  hard: { pairs: 8, label: 'SULIT (8 PASANG)', cols: 'hard' },
};

export default function MemoryGame() {
  const completeGame = useGameStore((s) => s.completeGame);
  const addHearts = useGameStore((s) => s.addHearts);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const incrementMemoryLosses = useGameStore((s) => s.incrementMemoryLosses);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const { play } = useSound();

  const [gameState, setGameState] = useState('instructions'); // 'instructions' | 'playing' | 'result'
  const [difficulty, setDifficulty] = useState('normal');
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef(null);

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const initGame = useCallback((diff = difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    const selectedSymbols = CARD_POOL.slice(0, config.pairs);
    const deck = [];

    selectedSymbols.forEach((item, index) => {
      deck.push({ ...item, uid: `${item.id}-1`, pairIndex: index });
      deck.push({ ...item, uid: `${item.id}-2`, pairIndex: index });
    });

    setCards(shuffleArray(deck));
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setTimer(0);
    setMessage('Temukan semua pasangan kartu untuk memulihkan ingatanmu, Giselle!');
    setGameState('playing');
    play('transition');
  }, [difficulty, play]);

  const handleCardClick = (index) => {
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].id)) return;

    play('click');
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Correct match
        play('match');
        setMessage('PASANGAN COCOK! Tumben jago banget, Giselle.');
        setMatchedIds((prev) => {
          const next = [...prev, firstCard.id];
          if (next.length === DIFFICULTY_CONFIG[difficulty].pairs) {
            // Completed!
            setTimeout(() => {
              handleGameComplete(moves + 1);
            }, 600);
          }
          return next;
        });
        setFlippedIndices([]);
      } else {
        // Mismatch
        play('mismatch');
        setMessage('Memori kamu terputus sementara dari server...');
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handleGameComplete = (totalMoves) => {
    clearInterval(timerRef.current);
    play('win');

    const baseScore = difficulty === 'hard' ? 1000 : difficulty === 'normal' ? 600 : 400;
    const penalty = totalMoves * 15 + timer * 5;
    const calculatedScore = Math.max(100, baseScore - penalty);

    setFinalScore(calculatedScore);
    completeGame('memory', calculatedScore);
    addHearts(15);
    setGameState('result');
    setMessage("MEMORI PULIH TOTAL! Sayangnya, kamu tetap terjebak sama aku, Giselle. ✨");

    // Zero mistakes on hard/normal
    if (totalMoves === DIFFICULTY_CONFIG[difficulty].pairs) {
      unlockAchievement('main_character');
    }
  };

  const handleRestart = () => {
    if (gameState === 'playing' && matchedIds.length < DIFFICULTY_CONFIG[difficulty].pairs) {
      incrementMemoryLosses();
    }
    initGame(difficulty);
  };

  return (
    <div className="game-container">
      <GameHUD
        title="WHERE DID I PUT MY BRAIN?"
        score={finalScore || Math.max(0, 500 - moves * 10)}
        timer={formatTime(timer)}
        showTimer={gameState === 'playing'}
        showScore={gameState !== 'instructions'}
        onBack={goToMenu}
      />

      <h1 className="game-title">WHERE DID I PUT MY BRAIN?</h1>
      <p className="game-subtitle">Tebak Kartu Memori Giselle</p>

      {gameState === 'instructions' && (
        <div className="arcade-panel" style={{ maxWidth: '520px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="game-instructions">
            Kartu tertutup di awal. Buka dua kartu sekaligus. Kalau pasangannya sama, kartu tetap terbuka. Kalau beda, bakal ketutup lagi. Buktiin kalau Giselle gak gampang pikun!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`arcade-btn ${difficulty === key ? 'accent' : 'secondary'}`}
                style={{ fontSize: '10px', padding: '10px 14px' }}
                onClick={() => {
                  setDifficulty(key);
                  play('click');
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <button className="arcade-btn" style={{ marginTop: '10px' }} onClick={() => initGame(difficulty)}>
            ▶ MULAI MAIN
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="memory-stats">
            <span>LANGKAH: {moves}</span>
            <span>COCOK: {matchedIds.length}/{DIFFICULTY_CONFIG[difficulty].pairs}</span>
            <span>WAKTU: {formatTime(timer)}</span>
          </div>

          <p className="game-message">{message}</p>

          <div className={`memory-grid ${DIFFICULTY_CONFIG[difficulty].cols}`}>
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx);
              const isMatched = matchedIds.includes(card.id);

              return (
                <div
                  key={card.uid}
                  className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  {isFlipped || isMatched ? (
                    <span role="img" aria-label={card.label}>{card.emoji}</span>
                  ) : (
                    <span className="memory-card-back">❓</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="arcade-btn secondary" onClick={handleRestart}>
              🔄 ULANG DARI AWAL
            </button>
          </div>
        </>
      )}

      {gameState === 'result' && (
        <div className="arcade-panel result-screen">
          <h2 className="result-title">🧠 MEMORI BERHASIL PULIH!</h2>
          <p className="result-message">{message}</p>
          <div className="result-score">SKOR: {finalScore}</div>
          <div className="result-rewards">
            <span>💖 +15 Hati</span>
            <span>🏅 Lencana Ingatan Kuat</span>
            <span>⏱️ Waktu: {formatTime(timer)}</span>
            <span>🎯 Langkah: {moves}</span>
          </div>
          <div className="result-buttons">
            <button className="arcade-btn" onClick={() => initGame(difficulty)}>
              MAIN LAGI
            </button>
            <button className="arcade-btn secondary" onClick={goToMenu}>
              KEMBALI KE MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
