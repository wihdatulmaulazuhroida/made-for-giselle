import { useState, useEffect, useRef } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { WHEEL_REWARDS } from '../data/rewards';
import GameHUD from '../components/GameHUD';

export default function SpinWheel() {
  const completeGame = useGameStore((s) => s.completeGame);
  const addPoints = useGameStore((s) => s.addPoints);
  const addHearts = useGameStore((s) => s.addHearts);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const discoverEasterEgg = useGameStore((s) => s.discoverEasterEgg);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const { play } = useSound();

  const [isSpinning, setIsSpinning] = useState(false);
  const [resultReward, setResultReward] = useState(null);

  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const animFrameRef = useRef(null);

  const drawWheel = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const count = WHEEL_REWARDS.length;
    const sliceAngle = (Math.PI * 2) / count;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    for (let i = 0; i < count; i++) {
      const reward = WHEEL_REWARDS[i];
      const startA = i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = reward.color || '#6C63FF';
      ctx.fill();

      ctx.strokeStyle = '#0f0f3d';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      let text = reward.label;
      if (text.length > 22) text = text.substring(0, 20) + '...';
      ctx.fillText(text, radius - 15, 4);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a2e';
    ctx.fill();
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResultReward(null);
    play('spin');

    const totalSpins = 5 + Math.random() * 5;
    const randomStop = Math.random() * Math.PI * 2;
    const targetAngle = angleRef.current + totalSpins * Math.PI * 2 + randomStop;

    const startAngle = angleRef.current;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + (targetAngle - startAngle) * easeOut;

      angleRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        const normalizedAngle = (current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const count = WHEEL_REWARDS.length;
        const sliceAngle = (Math.PI * 2) / count;

        const pointerAngle = (3 * Math.PI / 2 - normalizedAngle + Math.PI * 2) % (Math.PI * 2);
        const winningIndex = Math.floor(pointerAngle / sliceAngle) % count;
        const won = WHEEL_REWARDS[winningIndex];

        handleRewardWon(won);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleRewardWon = (reward) => {
    setResultReward(reward);
    completeGame('spin', 100);

    if (reward.type === 'points') {
      play('success');
      addPoints(reward.value);
    } else if (reward.type === 'hearts') {
      play('success');
      addHearts(reward.value);
    } else if (reward.type === 'achievement') {
      play('achievement');
      unlockAchievement('devs_favorite');
    } else if (reward.type === 'nothing') {
      play('error');
    } else {
      play('win');
      discoverEasterEgg('wheel_spin_secret');
    }
  };

  return (
    <div className="game-container">
      <GameHUD
        title="WHEEL OF NONSENSE"
        score="PUTAR & MENANGKAN"
        timer=""
        showTimer={false}
        showScore={false}
        onBack={goToMenu}
      />

      <h1 className="game-title">🎡 SPIN THE WHEEL OF NONSENSE</h1>
      <p className="game-subtitle">Roda Keberuntungan Halu Giselle</p>

      <div className="wheel-container">
        <div className="wheel-pointer">🔻</div>
        <canvas
          ref={canvasRef}
          className="wheel-canvas"
          width={340}
          height={340}
        />
      </div>

      <button
        className="arcade-btn accent"
        onClick={spin}
        disabled={isSpinning}
      >
        {isSpinning ? '🌀 LAGI MUTER...' : '🎰 PUTAR RODA SEKARANG!'}
      </button>

      {resultReward && (
        <div className="arcade-panel wheel-result" style={{ marginTop: '16px' }}>
          <h3 style={{ color: resultReward.color, marginBottom: '8px' }}>
            🎉 {resultReward.label}
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
            {resultReward.type === 'nothing'
              ? 'SELAMAT GISELLE! ANDA MEMENANGKAN: GAK DAPET APA-APA (ZONK).'
              : resultReward.value || 'Hadiah langsung aktif di akun Giselle!'}
          </p>
        </div>
      )}
    </div>
  );
}
