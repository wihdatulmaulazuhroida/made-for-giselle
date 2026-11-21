import { useState, useEffect, useRef, useCallback } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import GameHUD from '../components/GameHUD';

const TARGET_TYPES = [
  { type: 'heart', emoji: '💖', points: 10, isGood: true },
  { type: 'star', emoji: '⭐', points: 15, isGood: true },
  { type: 'char', emoji: '😊', points: 20, isGood: true },
  { type: 'joke', emoji: '💩', points: -10, isGood: false },
  { type: 'bomb', emoji: '💣', points: -15, isGood: false },
  { type: 'bug', emoji: '🐛', points: -5, isGood: false },
];

export default function WhackAYap() {
  const completeGame = useGameStore((s) => s.completeGame);
  const addHearts = useGameStore((s) => s.addHearts);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const { play } = useSound();

  const [gameState, setGameState] = useState('instructions'); // 'instructions' | 'playing' | 'result'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeHoles, setActiveHoles] = useState(Array(9).fill(null));
  const [message, setMessage] = useState('Pukul yang baik-baik, hindari bom!');

  const spawnTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(20);
    setActiveHoles(Array(9).fill(null));
    setMessage('AYO BONK SEKARANG GISELLE!');
    play('transition');
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          clearInterval(spawnTimerRef.current);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [gameState]);

  const handleGameEnd = useCallback(() => {
    setActiveHoles(Array(9).fill(null));
    setGameState('result');
    play('win');
    completeGame('whack', Math.max(0, score));
    addHearts(Math.max(5, Math.floor(score / 10)));
  }, [completeGame, addHearts, play, score]);

  // Spawner loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawn = () => {
      const holeIndex = Math.floor(Math.random() * 9);
      const target = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];

      setActiveHoles((prev) => {
        const next = [...prev];
        next[holeIndex] = target;
        return next;
      });

      const hideTime = Math.max(600, 1100 - (20 - timeLeft) * 20);
      setTimeout(() => {
        setActiveHoles((prev) => {
          const next = [...prev];
          if (next[holeIndex] === target) {
            next[holeIndex] = null;
          }
          return next;
        });
      }, hideTime);
    };

    const intervalTime = Math.max(400, 750 - (20 - timeLeft) * 15);
    spawnTimerRef.current = setInterval(spawn, intervalTime);

    return () => clearInterval(spawnTimerRef.current);
  }, [gameState, timeLeft]);

  const handleHoleClick = (index) => {
    const target = activeHoles[index];
    if (!target) return;

    setActiveHoles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    if (target.isGood) {
      play('bonk');
      setMessage(`BONK! +${target.points} poin`);
      setScore((s) => s + target.points);
    } else {
      play('error');
      setMessage(`KENAPA DIPUKUL SIH GISELLE?! ${target.points} poin`);
      setScore((s) => Math.max(0, s + target.points));
    }
  };

  return (
    <div className="game-container">
      <GameHUD
        title="WHACK-A-YAP"
        score={score}
        timer={`${timeLeft}d`}
        showTimer={gameState === 'playing'}
        showScore={gameState !== 'instructions'}
        onBack={goToMenu}
      />

      <h1 className="game-title">🔨 WHACK-A-YAP</h1>
      <p className="game-subtitle">Tes Refleks Cepat 20 Detik</p>

      {gameState === 'instructions' && (
        <div className="arcade-panel" style={{ maxWidth: '540px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="game-instructions">
            Target bakal nongol acak dari 9 lubang. Pukul hati, bintang, dan muka senyum! Jangan gebuk kotoran, bom, atau serangga!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: 'var(--fs-body-sm)', textAlign: 'left', padding: '10px' }}>
            <div>💖 Hati: +10 poin</div>
            <div>⭐ Bintang: +15 poin</div>
            <div>😊 Muka: +20 poin</div>
            <div>💩 Joke Garing: -10 poin</div>
            <div>💣 Bom: -15 poin</div>
            <div>🐛 Bug: -5 poin</div>
          </div>

          <button className="arcade-btn" onClick={startGame}>
            ▶ MULAI PUKUL
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <p className="game-message">{message}</p>

          <div className="whack-grid">
            {activeHoles.map((target, idx) => (
              <div
                key={idx}
                className={`whack-hole ${target ? 'active' : ''}`}
                onClick={() => handleHoleClick(idx)}
              >
                {target ? target.emoji : '🕳️'}
              </div>
            ))}
          </div>
        </>
      )}

      {gameState === 'result' && (
        <div className="arcade-panel result-screen">
          <h2 className="result-title">🔨 PEMBASMI YAPPING BERSERTIFIKAT</h2>
          <div className="result-score">SKOR AKHIR: {score}</div>
          <p className="result-message">
            {score >= 200
              ? 'Refleks dewa! Giselle sukses menertibkan semua kehebohan dengan palu!'
              : 'Pukulan yang sangat bersemangat! Gak ada yapper yang berani berkutik.'}
          </p>
          <div className="result-rewards">
            <span>💖 +{Math.max(5, Math.floor(score / 10))} Hati</span>
            <span>⭐ Poin Afeksi: +{score}</span>
          </div>
          <div className="result-buttons">
            <button className="arcade-btn" onClick={startGame}>
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
