import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { yapOrCapQuestions } from '../data/questions';
import { shuffleArray, formatScore, getScoreTier } from '../utils/gameHelpers';
import GameHUD from '../components/GameHUD';

const POINTS_PER_CORRECT = 100;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function YapOrCap() {
  const { completeGame, addHearts, unlockAchievement, goToMenu } = useGameStore();
  const { play } = useSound();

  const [phase, setPhase] = useState('instructions'); // instructions, playing, feedback, result
  const [questions] = useState(() => shuffleArray(yapOrCapQuestions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleStart = useCallback(() => {
    play('click');
    setPhase('playing');
  }, [play]);

  const handleAnswer = useCallback((optionIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correct;

    if (isCorrect) {
      play('success');
      setCorrectCount((c) => c + 1);
      setScore((s) => s + POINTS_PER_CORRECT);
      setFeedbackText(currentQuestion.response);
    } else {
      play('error');
      setFeedbackText(currentQuestion.wrongResponse);
    }

    setPhase('feedback');

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setFeedbackText('');
        setPhase('playing');
      } else {
        setPhase('result');
      }
    }, 2000);
  }, [selectedAnswer, currentQuestion, currentIndex, totalQuestions, play]);

  // Handle game completion
  useEffect(() => {
    if (phase !== 'result') return;

    const finalScore = correctCount * POINTS_PER_CORRECT;

    play('win');
    completeGame('yaporcap', finalScore);
    addHearts(correctCount * 5);

    if (correctCount === totalQuestions) {
      unlockAchievement('main_character');
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const tier = getScoreTier(percentage);

  const getResultMessage = () => {
    if (percentage === 100) return "Giselle tau segalanya tentang aku melebihi diriku sendiri. Agak serem tapi terharu!";
    if (percentage >= 80) return "Akurasi Giselle menakjubkan! Kamu diem-diem nyatet ya?";
    if (percentage >= 60) return "Lumayan juga! Ternyata Giselle beneran dengerin ceritaku... kadang-kadang.";
    if (percentage >= 40) return "Hmm, kamu sering pura-pura ngangguk doang ya pas aku cerita?";
    return "Kayaknya kita perlu evaluasi berdua soal skill mendengarkan kamu nih, Giselle!";
  };

  // Instructions screen
  if (phase === 'instructions') {
    return (
      <div className="game-container">
        <GameHUD title="YAP OR CAP" onBack={goToMenu} />
        <div className="quiz-container">
          <div className="game-title">🗣️ YAP OR CAP 🧢</div>
          <div className="game-subtitle">UJIAN PENGETAHUAN GISELLE</div>
          <div className="game-instructions">
            Yakin udah kenal luar dalam sama pacar kamu?<br /><br />
            Jawab pertanyaan pilihan ganda ini buat ngebuktiin apakah Giselle beneran nyimak ocehan selama ini... atau cuma pura-pura iya doang.<br /><br />
            <strong>Total {totalQuestions} pertanyaan. Santai, jangan panik!</strong>
          </div>
          <button className="arcade-btn" onClick={handleStart}>
            ▶ MULAI KUIS
          </button>
        </div>
      </div>
    );
  }

  // Result screen
  if (phase === 'result') {
    return (
      <div className="game-container">
        <GameHUD title="YAP OR CAP" onBack={goToMenu} />
        <div className="quiz-container">
          <div className="quiz-result">
            <div className="result-title">KUIS SELESAI!</div>
            <div className="quiz-tier" style={{ color: tier.color }}>
              {tier.emoji} {tier.tier} {tier.emoji}
            </div>
            <div className="result-score">BENAR {correctCount} DARI {totalQuestions}</div>
            <div className="quiz-score-display">{formatScore(score)} POIN</div>
            <div className="result-message">{getResultMessage()}</div>
            <div className="result-rewards">
              <span>💖 +{correctCount * 5} Hati</span>
              <span>⭐ {score} Poin Afeksi</span>
            </div>
            {correctCount === totalQuestions && (
              <div className="game-message" style={{ color: '#FFD93D' }}>
                🏆 PENCAPAIAN TERBUKA: KARAKTER UTAMA 🏆
              </div>
            )}
            <div className="result-buttons">
              <button className="arcade-btn secondary" onClick={goToMenu}>
                KEMBALI KE MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing / Feedback screen
  return (
    <div className="game-container">
      <GameHUD title="YAP OR CAP" score={score} onBack={goToMenu} showScore />
      <div className="quiz-container">
        <div className="quiz-progress">
          PERTANYAAN {currentIndex + 1} DARI {totalQuestions}
        </div>

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

        {phase === 'feedback' && feedbackText && (
          <div className="quiz-feedback">{feedbackText}</div>
        )}
      </div>
    </div>
  );
}
