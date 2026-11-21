import { useState, useEffect, useRef, useCallback } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import GameHUD from '../components/GameHUD';

const OBSTACLE_TYPES = [
  { name: 'Overthinking', color: '#c084fc', text: '💭 OVERTHINKING' },
  { name: 'Bad Jokes', color: '#f87171', text: '🃏 JOKES GARING' },
  { name: 'Random Yapping', color: '#fb923c', text: '🗣️ YAPPING 2 AM' },
  { name: 'Awkward Silence', color: '#94a3b8', text: '😶 HENING TIBA2' },
  { name: 'Spam Texts', color: '#38bdf8', text: '📱 14 NOTIF' },
  { name: 'Tiny Bug', color: '#4ade80', text: '🐛 DRAMA KECIL' },
];

const POWERUP_TYPES = [
  { type: 'potion', emoji: '🧪', name: 'RAMUAN KESABARAN', color: '#4ade80' },
  { type: 'shield', emoji: '🛡️', name: 'PERISAI KOMUNIKASI', color: '#60a5fa' },
  { type: 'time', emoji: '⏳', name: 'QUALITY TIME', color: '#fbbf24' },
];

export default function DodgeTheRedFlags() {
  const completeGame = useGameStore((s) => s.completeGame);
  const addHearts = useGameStore((s) => s.addHearts);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const { play } = useSound();

  const [gameState, setGameState] = useState('instructions'); // 'instructions' | 'playing' | 'result'
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [activePowerup, setActivePowerup] = useState(null);
  const [won, setWon] = useState(false);

  const canvasRef = useRef(null);
  const stateRef = useRef({
    playerX: 230,
    playerWidth: 40,
    playerHeight: 35,
    obstacles: [],
    powerups: [],
    lives: 3,
    hasShield: false,
    invincibleUntil: 0,
    slowUntil: 0,
    keys: { left: false, right: false },
    lastSpawn: 0,
    lastPowerupSpawn: 0,
    timeAlive: 0,
  });

  const animFrameRef = useRef(null);
  const timerRef = useRef(null);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(30);
    setLives(3);
    setActivePowerup(null);
    setWon(false);

    stateRef.current = {
      playerX: 230,
      playerWidth: 40,
      playerHeight: 35,
      obstacles: [],
      powerups: [],
      lives: 3,
      hasShield: false,
      invincibleUntil: 0,
      slowUntil: 0,
      keys: { left: false, right: false },
      lastSpawn: 0,
      lastPowerupSpawn: 0,
      timeAlive: 0,
    };
    play('transition');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = false;
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
          handleGameWon();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleGameWon = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setWon(true);
    setGameState('result');
    play('win');
    completeGame('dodge', 500);
    addHearts(25);
    unlockAchievement('yap_survivor');
  }, [completeGame, addHearts, unlockAchievement, play]);

  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setWon(false);
    setGameState('result');
    play('gameOver');
    completeGame('dodge', Math.floor(stateRef.current.timeAlive * 10));
  }, [completeGame, play]);

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
      state.timeAlive += dt;

      // Powerups status
      const isInvincible = currentTime < state.invincibleUntil;
      const isSlow = currentTime < state.slowUntil;
      if (isInvincible) setActivePowerup('KESABARAN (KEBAL)');
      else if (state.hasShield) setActivePowerup('PERISAI KOMUNIKASI');
      else if (isSlow) setActivePowerup('QUALITY TIME (SLOW-MO)');
      else setActivePowerup(null);

      // Movement
      const speed = 360;
      if (state.keys.left) state.playerX -= speed * dt;
      if (state.keys.right) state.playerX += speed * dt;
      state.playerX = Math.max(0, Math.min(width - state.playerWidth, state.playerX));

      // Spawning obstacles
      const spawnRate = isSlow ? 1200 : Math.max(350, 800 - (30 - timeLeft) * 15);
      if (currentTime - state.lastSpawn > spawnRate) {
        state.lastSpawn = currentTime;
        const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        const obsWidth = 120;
        state.obstacles.push({
          ...type,
          x: Math.random() * (width - obsWidth),
          y: -30,
          width: obsWidth,
          height: 24,
          speed: (isSlow ? 90 : 160) + (30 - timeLeft) * 4,
        });
      }

      // Spawning powerups
      if (currentTime - state.lastPowerupSpawn > 6000) {
        state.lastPowerupSpawn = currentTime;
        if (Math.random() < 0.6) {
          const pType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
          state.powerups.push({
            ...pType,
            x: Math.random() * (width - 30),
            y: -25,
            size: 26,
            speed: 100,
          });
        }
      }

      const playerY = height - 55;

      // Update powerups
      const remainingPowerups = [];
      for (const p of state.powerups) {
        p.y += p.speed * dt;
        if (
          p.x + p.size > state.playerX &&
          p.x < state.playerX + state.playerWidth &&
          p.y + p.size > playerY &&
          p.y < playerY + state.playerHeight
        ) {
          play('collect');
          if (p.type === 'potion') state.invincibleUntil = currentTime + 4000;
          if (p.type === 'shield') state.hasShield = true;
          if (p.type === 'time') state.slowUntil = currentTime + 5000;
        } else if (p.y < height) {
          remainingPowerups.push(p);
        }
      }
      state.powerups = remainingPowerups;

      // Update obstacles
      const remainingObstacles = [];
      for (const obs of state.obstacles) {
        obs.y += obs.speed * dt;

        const collides =
          obs.x + obs.width > state.playerX &&
          obs.x < state.playerX + state.playerWidth &&
          obs.y + obs.height > playerY &&
          obs.y < playerY + state.playerHeight;

        if (collides) {
          if (isInvincible) {
            play('bonk');
          } else if (state.hasShield) {
            play('bonk');
            state.hasShield = false;
          } else {
            play('error');
            state.lives -= 1;
            setLives(state.lives);
            if (state.lives <= 0) {
              handleGameOver();
              return;
            }
          }
        } else if (obs.y < height) {
          remainingObstacles.push(obs);
        }
      }
      state.obstacles = remainingObstacles;

      // Draw Background
      ctx.fillStyle = '#0f0f3d';
      ctx.fillRect(0, 0, width, height);

      // Warning glow
      ctx.fillStyle = 'rgba(255, 107, 157, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Draw Powerups
      for (const p of state.powerups) {
        ctx.font = '22px sans-serif';
        ctx.fillText(p.emoji, p.x, p.y + p.size);
      }

      // Draw Obstacles
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      for (const obs of state.obstacles) {
        ctx.fillStyle = obs.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.fillText(obs.text, obs.x + obs.width / 2, obs.y + 16);
      }

      // Draw Player
      ctx.fillStyle = isInvincible ? '#fde047' : state.hasShield ? '#38bdf8' : '#6C63FF';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(state.playerX, playerY, state.playerWidth, state.playerHeight, 6);
      ctx.fill();
      ctx.stroke();

      if (state.hasShield) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(state.playerX + state.playerWidth / 2, playerY + state.playerHeight / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Face
      ctx.font = '13px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      const face = state.lives === 1 ? '(;・_・)' : '(・ω・)';
      ctx.fillText(face, state.playerX + state.playerWidth / 2, playerY + 22);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, timeLeft, handleGameOver, play]);

  return (
    <div className="game-container">
      <GameHUD
        title="DODGE THE RED FLAGS"
        score={`NYAWA: ${'❤️'.repeat(lives)}`}
        timer={`${timeLeft}d`}
        showTimer={gameState === 'playing'}
        showScore={gameState !== 'instructions'}
        onBack={goToMenu}
      />

      <h1 className="game-title">DODGE THE RED FLAGS</h1>
      <p className="game-subtitle">Bertahan Hidup Selama 30 Detik</p>

      {gameState === 'instructions' && (
        <div className="arcade-panel" style={{ maxWidth: '540px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="game-instructions">
            Hindari overthinking, lelucon garing, dan notifikasi beruntun! Ambil power-up buat melindungi Giselle dari badai hal absurd!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--fs-body-sm)', textAlign: 'left', padding: '10px' }}>
            <div>🧪 <strong>RAMUAN KESABARAN:</strong> Kebal terhadap semua rintangan (4 detik)</div>
            <div>🛡️ <strong>PERISAI KOMUNIKASI:</strong> Menahan 1 kali benturan</div>
            <div>⏳ <strong>QUALITY TIME:</strong> Memperlambat kecepatan rintangan</div>
          </div>

          <button className="arcade-btn" onClick={startGame}>
            ▶ MULAI BERTAHAN
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="canvas-game-container">
          {activePowerup && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: '#fde047', fontFamily: 'monospace' }}>
              ⚡ {activePowerup}
            </div>
          )}

          <canvas ref={canvasRef} width={500} height={380} />

          <div className="canvas-controls">
            <button
              onMouseDown={() => (stateRef.current.keys.left = true)}
              onMouseUp={() => (stateRef.current.keys.left = false)}
              onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys.left = true; }}
              onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.left = false; }}
            >
              ◀ KIRI
            </button>
            <button
              onMouseDown={() => (stateRef.current.keys.right = true)}
              onMouseUp={() => (stateRef.current.keys.right = false)}
              onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys.right = true; }}
              onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.right = false; }}
            >
              KANAN ▶
            </button>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="arcade-panel result-screen">
          <h2 className="result-title">{won ? '🛡️ SURVIVAL CONFIRMED' : '💀 GAME OVER'}</h2>
          <p className="result-message">
            {won
              ? 'SURVIVAL CONFIRMED! Tingkat kesabaran Giselle menghadapi cowok ini sungguh di luar nalar.'
              : 'GAME OVER. Giselle tumbang dihantam gelombang overthinking dan jokes garing.'}
          </p>
          <div className="result-rewards">
            {won ? (
              <>
                <span>💖 +25 Hati</span>
                <span>⭐ Skor: 500</span>
                <span>🏅 Lencana Yap Survivor</span>
              </>
            ) : (
              <span>Jangan menyerah Giselle! Orang sabar disayang pacar.</span>
            )}
          </div>
          <div className="result-buttons">
            <button className="arcade-btn" onClick={startGame}>
              COBA LAGI
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
