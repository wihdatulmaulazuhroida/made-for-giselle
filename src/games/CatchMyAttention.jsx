import { useState, useEffect, useRef, useCallback } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import GameHUD from '../components/GameHUD';

const ITEM_TYPES = [
  { type: 'heart', emoji: '💖', points: 10, weight: 35, color: '#FF6B9D' },
  { type: 'star', emoji: '⭐', points: 20, weight: 20, color: '#FFD93D' },
  { type: 'letter', emoji: '💌', points: 50, weight: 10, color: '#C4B5FD' },
  { type: 'joke', emoji: '💩', points: -5, weight: 15, color: '#a78bfa' },
  { type: 'bug', emoji: '🐛', points: -10, weight: 10, color: '#f87171' },
  { type: 'nonsense', emoji: '❓', points: -5, weight: 10, color: '#94a3b8' },
];

export default function CatchMyAttention() {
  const completeGame = useGameStore((s) => s.completeGame);
  const addHearts = useGameStore((s) => s.addHearts);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const { play } = useSound();

  const [gameState, setGameState] = useState('instructions'); // 'instructions' | 'playing' | 'result'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [collectedStats, setCollectedStats] = useState({ hearts: 0, badJokes: 0 });

  const canvasRef = useRef(null);
  const stateRef = useRef({
    playerX: 200,
    playerWidth: 50,
    playerHeight: 25,
    items: [],
    score: 0,
    keys: { left: false, right: false },
    lastSpawn: 0,
    heartsCollected: 0,
    badJokesCollected: 0,
  });

  const animFrameRef = useRef(null);
  const timerRef = useRef(null);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    stateRef.current = {
      playerX: 250,
      playerWidth: 60,
      playerHeight: 25,
      items: [],
      score: 0,
      keys: { left: false, right: false },
      lastSpawn: 0,
      heartsCollected: 0,
      badJokesCollected: 0,
    };
    play('transition');
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const endGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    const finalSc = stateRef.current.score;
    const hearts = stateRef.current.heartsCollected;
    const badJokes = stateRef.current.badJokesCollected;

    setCollectedStats({ hearts, badJokes });
    setScore(finalSc);
    setGameState('result');

    completeGame('catch', Math.max(0, finalSc));
    addHearts(Math.max(5, Math.floor(finalSc / 15)));

    if (finalSc >= 250) {
      play('win');
    } else {
      play('gameOver');
    }
  }, [completeGame, addHearts, play]);

  // Main Canvas game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Update player position
      const speed = 350;
      if (state.keys.left) state.playerX -= speed * dt;
      if (state.keys.right) state.playerX += speed * dt;
      state.playerX = Math.max(0, Math.min(width - state.playerWidth, state.playerX));

      // Spawn falling items
      const spawnInterval = Math.max(400, 900 - (30 - timeLeft) * 15);
      if (currentTime - state.lastSpawn > spawnInterval) {
        state.lastSpawn = currentTime;

        const totalWeight = ITEM_TYPES.reduce((acc, cur) => acc + cur.weight, 0);
        let rand = Math.random() * totalWeight;
        let chosen = ITEM_TYPES[0];
        for (const it of ITEM_TYPES) {
          if (rand < it.weight) {
            chosen = it;
            break;
          }
          rand -= it.weight;
        }

        const fallSpeed = 120 + (30 - timeLeft) * 5 + Math.random() * 40;
        state.items.push({
          ...chosen,
          x: Math.random() * (width - 40) + 10,
          y: -30,
          speed: fallSpeed,
          size: 28,
        });
      }

      // Collide
      const playerY = height - 45;
      const remainingItems = [];

      for (let i = 0; i < state.items.length; i++) {
        const item = state.items[i];
        item.y += item.speed * dt;

        const collides =
          item.x + item.size > state.playerX &&
          item.x < state.playerX + state.playerWidth &&
          item.y + item.size > playerY &&
          item.y < playerY + state.playerHeight;

        if (collides) {
          state.score += item.points;
          setScore(state.score);

          if (item.points > 0) {
            play('collect');
            if (item.type === 'heart') state.heartsCollected += 1;
          } else {
            play('error');
            if (item.type === 'joke') state.badJokesCollected += 1;
          }
        } else if (item.y < height) {
          remainingItems.push(item);
        }
      }
      state.items = remainingItems;

      // Background
      ctx.fillStyle = '#0f0f3d';
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let x = 20; x < width; x += 60) {
        ctx.fillRect(x, (x * 3) % height, 2, 2);
      }

      // Player basket
      ctx.fillStyle = '#6C63FF';
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(state.playerX, playerY, state.playerWidth, state.playerHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Face
      ctx.font = '15px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('( ˶• ֊ •˶)', state.playerX + state.playerWidth / 2, playerY + 18);

      // Falling items
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      for (const item of state.items) {
        ctx.fillText(item.emoji, item.x + item.size / 2, item.y + item.size);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, timeLeft, play]);

  const handleTouchLeft = (active) => {
    stateRef.current.keys.left = active;
  };
  const handleTouchRight = (active) => {
    stateRef.current.keys.right = active;
  };

  const getFunnyMessage = () => {
    if (score >= 280) {
      return "AFEKSI BERHASIL DIAMBIL SEMUA! Giselle sukses mengumpulkan seluruh kasih sayang. Gak bisa direfund ya!";
    }
    if (score >= 150) {
      return "Refleks mantap, Giselle! Sebagian besar jokes garing berhasil dihindari.";
    }
    return `Waduh, Giselle ngumpulin ${collectedStats.hearts} hati tapi kena ${collectedStats.badJokes} jokes garing. Performa yang cukup tragis tapi tetep lucu!`;
  };

  return (
    <div className="game-container">
      <GameHUD
        title="CATCH MY ATTENTION"
        score={score}
        timer={`${timeLeft}d`}
        showTimer={gameState === 'playing'}
        showScore={gameState !== 'instructions'}
        onBack={goToMenu}
      />

      <h1 className="game-title">CATCH MY ATTENTION</h1>
      <p className="game-subtitle">Tangkap Afeksi dalam 30 Detik</p>

      {gameState === 'instructions' && (
        <div className="arcade-panel" style={{ maxWidth: '540px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="game-instructions">
            Tangkap hal-hal manis buat nambah poin dan cinta Giselle! Hindari jokes garing, bug drama, dan hal absurd lainnya!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: 'var(--fs-body-sm)', textAlign: 'left', padding: '10px' }}>
            <div>💖 Hati: +10 poin</div>
            <div>⭐ Bintang: +20 poin</div>
            <div>💌 Surat Cinta: +50 poin</div>
            <div>💩 Jokes Garing: -5 poin</div>
            <div>🐛 Drama / Bug: -10 poin</div>
            <div>❓ Hal Random: -5 poin</div>
          </div>

          <p style={{ fontSize: 'var(--fs-body-sm)', color: '#a5b4fc' }}>
            Kontrol: Tombol Panah / A & D / Tombol Sentuh di Bawah
          </p>

          <button className="arcade-btn" onClick={startGame}>
            ▶ MULAI TANGKAP
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="canvas-game-container">
          <canvas ref={canvasRef} width={500} height={380} />

          <div className="canvas-controls">
            <button
              onMouseDown={() => handleTouchLeft(true)}
              onMouseUp={() => handleTouchLeft(false)}
              onTouchStart={(e) => { e.preventDefault(); handleTouchLeft(true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchLeft(false); }}
            >
              ◀ KIRI
            </button>
            <button
              onMouseDown={() => handleTouchRight(true)}
              onMouseUp={() => handleTouchRight(false)}
              onTouchStart={(e) => { e.preventDefault(); handleTouchRight(true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchRight(false); }}
            >
              KANAN ▶
            </button>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="arcade-panel result-screen">
          <h2 className="result-title">{score >= 150 ? '💫 PERHATIAN BERHASIL DIDAPAT!' : '💔 MISKOMUNIKASI TERCETAK'}</h2>
          <div className="result-score">SKOR AKHIR: {score}</div>
          <p className="result-message">{getFunnyMessage()}</p>
          <div className="result-rewards">
            <span>💖 +{Math.max(5, Math.floor(score / 15))} Hati</span>
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
