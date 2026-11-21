// Sound effects hook using Web Audio API (no external files needed)
import { useCallback, useRef } from 'react';
import useGameStore from './useGameProgress';

// Generate sound effects procedurally
function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = createAudioContext();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'square', volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio context isn't available
  }
}

const SOUNDS = {
  click: () => playTone(800, 0.1, 'square', 0.2),
  hover: () => playTone(600, 0.05, 'sine', 0.1),
  success: () => {
    playTone(523, 0.15, 'square', 0.2);
    setTimeout(() => playTone(659, 0.15, 'square', 0.2), 100);
    setTimeout(() => playTone(784, 0.3, 'square', 0.2), 200);
  },
  error: () => {
    playTone(300, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.2), 150);
  },
  collect: () => {
    playTone(880, 0.1, 'square', 0.15);
    setTimeout(() => playTone(1100, 0.15, 'square', 0.15), 80);
  },
  match: () => {
    playTone(660, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(880, 0.2, 'sine', 0.2), 100);
  },
  mismatch: () => playTone(200, 0.3, 'sawtooth', 0.15),
  achievement: () => {
    playTone(523, 0.15, 'square', 0.25);
    setTimeout(() => playTone(659, 0.15, 'square', 0.25), 120);
    setTimeout(() => playTone(784, 0.15, 'square', 0.25), 240);
    setTimeout(() => playTone(1047, 0.4, 'square', 0.25), 360);
  },
  gameOver: () => {
    playTone(400, 0.2, 'square', 0.2);
    setTimeout(() => playTone(350, 0.2, 'square', 0.2), 200);
    setTimeout(() => playTone(300, 0.2, 'square', 0.2), 400);
    setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.2), 600);
  },
  win: () => {
    [523, 587, 659, 784, 880, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'square', 0.2), i * 100);
    });
  },
  spin: () => playTone(440 + Math.random() * 400, 0.05, 'square', 0.1),
  bonk: () => {
    playTone(150, 0.1, 'square', 0.3);
    setTimeout(() => playTone(100, 0.15, 'sawtooth', 0.2), 50);
  },
  boss: () => {
    playTone(100, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(80, 0.3, 'sawtooth', 0.3), 200);
  },
  transition: () => {
    playTone(440, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(660, 0.15, 'sine', 0.15), 80);
  },
};

export function useSound() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const volume = useGameStore((s) => s.volume);

  const play = useCallback(
    (soundName) => {
      if (!soundEnabled) return;
      const soundFn = SOUNDS[soundName];
      if (soundFn) soundFn();
    },
    [soundEnabled, volume]
  );

  return { play };
}
