import { memo } from 'react';

function GameHUD({ title, score, timer, hearts, showTimer, showHearts, showScore, onBack }) {
  return (
    <div className="game-hud">
      <div className="hud-left">
        <button className="hud-back" onClick={onBack} aria-label="Back">
          ← 
        </button>
        <span className="hud-title">{title}</span>
      </div>
      <div className="hud-right">
        {showScore && (
          <span className="hud-stat">⭐ {score ?? 0}</span>
        )}
        {showTimer && (
          <span className="hud-stat">⏱️ {timer ?? 0}s</span>
        )}
        {showHearts && (
          <span className="hud-stat">💖 {hearts ?? 0}</span>
        )}
      </div>
    </div>
  );
}

export default memo(GameHUD);
