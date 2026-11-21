// Game helper utilities

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatScore(score) {
  return score.toString().padStart(6, '0');
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export function getScoreTier(percentage) {
  if (percentage === 100) return { tier: 'HACKER OTAK TINGKAT TINGGI', emoji: '🧠', color: '#FFD93D' };
  if (percentage >= 86) return { tier: 'PAHAM LORE PACAR (LORE MASTER)', emoji: '📚', color: '#c4b5fd' };
  if (percentage >= 61) return { tier: 'ORANG DALEM RESMI', emoji: '🔑', color: '#4ade80' };
  if (percentage >= 31) return { tier: 'TEMEN BIASA AJA KALI YA', emoji: '📋', color: '#a5b4fc' };
  return { tier: 'KAMU SIAPA YA? (STRANGER DANGER)', emoji: '🚨', color: '#f87171' };
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}
