import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../hooks/useGameProgress';
import { useSound } from '../hooks/useSound';
import { developerQuizQuestions } from '../data/questions';
import { shuffleArray, formatScore, getScoreTier } from '../utils/gameHelpers';
import GameHUD from '../components/GameHUD';

const POINTS_PER_CORRECT = 100;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function DeveloperQuiz() {
  const { completeGame, addHearts, unlockAchievement, goToMenu } = useGameStore();
  const { play } = useSound();

  const [phase, setPhase] = useState('instructions');
  const [questions] = useState(() => shuffleArray(developerQuizQuestions));
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
      setFeedbackText(currentQuestion.feedback);
    } else {
      play('error');
      setFeedbackText(currentQuestion.feedback || 'Salah tebak nih!');
    }

    setPhase('feedback');

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

  useEffect(() => {
    if (phase !== 'result') return;

    const finalScore = correctCount * POINTS_PER_CORRECT;

    play('win');
    completeGame('devquiz', finalScore);
    addHearts(correctCount * 5);
    unlockAchievement('lore_master');

    if (correctCount === totalQuestions) {
      unlockAchievement('main_character');
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const tier = getScoreTier(percentage);

  const getResultMessage = () => {
    if (percentage === 100) return "AKSES ILEGAL KE OTAK PACAR: Giselle beneran hafal tiap jengkal kelakuanku!";
    if (percentage >= 80) return "LORE MASTER RESMI: Giselle udah lulus S2 dalam memahami kepribadian aneh ini.";
    if (percentage >= 60) return "ORANG DALEM: Lumayan kenal, walau ada beberapa kebiasaan yang masih bikin heran.";
    if (percentage >= 40) return "TEMEN BIASA: Kayaknya kamu harus lebih sering merhatiin pas aku cerita deh!";
    return "KAMU SIAPA YA? Waduh Giselle, nilai kamu mengkhawatirkan sekali!";
  };

  if (phase === 'instructions') {
    return (
      <div className="game-container">
        <GameHUD title="HOW WELL DO YOU KNOW ME?" onBack={goToMenu} />
        <div className="quiz-container">
          <div className="game-title">🔍 SEBERAPA KENAL KAMU SAMA AKU?</div>
          <div className="game-subtitle">Kuis Kebiasaan & Fakta Pacar</div>
          <div className="game-instructions">
            Ini adalah ujian resmi untuk mengukur seberapa dalam Giselle memahami kebiasaan, keanehan, dan isi kepala pacarmu.<br /><br />
            <strong>Total {totalQuestions} pertanyaan personal. Jawab dengan jujur!</strong>
          </div>
          <button className="arcade-btn" onClick={handleStart}>
            ▶ MULAI UJIAN
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="game-container">
        <GameHUD title="HOW WELL DO YOU KNOW ME?" onBack={goToMenu} />
        <div className="quiz-container">
          <div className="quiz-result">
            <div className="result-title">HASIL UJIAN GISELLE!</div>
            <div className="quiz-tier" style={{ color: tier.color }}>
              {tier.emoji} {tier.tier} {tier.emoji}
            </div>
            <div className="result-score">BENAR {correctCount} DARI {totalQuestions}</div>
            <div className="quiz-score-display">{formatScore(score)} POIN</div>
            <div className="result-message">{getResultMessage()}</div>
            <div className="result-rewards">
              <span>💖 +{correctCount * 5} Hati</span>
              <span>⭐ {score} Poin Afeksi</span>
              <span>🏅 Lencana Lore Master</span>
            </div>
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

  return (
    <div className="game-container">
      <GameHUD title="HOW WELL DO YOU KNOW ME?" score={score} onBack={goToMenu} showScore />
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
