import { useEffect } from 'react';
import useGameStore from './hooks/useGameProgress';
import { useSound } from './hooks/useSound';

// Components
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import GameSelect from './components/GameSelect';
import AchievementsPage from './components/AchievementsPage';
import SettingsMenu from './components/SettingsMenu';
import SecretEnding from './components/SecretEnding';
import AchievementPopup from './components/AchievementPopup';

// Mini-games
import MemoryGame from './games/MemoryGame';
import YapOrCap from './games/YapOrCap';
import CatchMyAttention from './games/CatchMyAttention';
import DodgeTheRedFlags from './games/DodgeTheRedFlags';
import DeveloperQuiz from './games/DeveloperQuiz';
import WhackAYap from './games/WhackAYap';
import SpinWheel from './games/SpinWheel';
import FinalBoss from './games/FinalBoss';

export default function App() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const currentGame = useGameStore((s) => s.currentGame);
  const discoverEasterEgg = useGameStore((s) => s.discoverEasterEgg);
  const { play } = useSound();

  // Easter Egg listener: Typing "LOVE" or Konami sequence
  useEffect(() => {
    let typed = '';
    const handleKeyPress = (e) => {
      typed += e.key.toUpperCase();
      if (typed.length > 10) typed = typed.slice(-10);

      if (typed.includes('LOVE')) {
        typed = '';
        play('achievement');
        discoverEasterEgg('typed_love');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [discoverEasterEgg, play]);

  // Render current active game
  const renderGame = () => {
    switch (currentGame) {
      case 'memory':
        return <MemoryGame />;
      case 'yaporcap':
        return <YapOrCap />;
      case 'catch':
        return <CatchMyAttention />;
      case 'dodge':
        return <DodgeTheRedFlags />;
      case 'devquiz':
        return <DeveloperQuiz />;
      case 'whack':
        return <WhackAYap />;
      case 'spin':
        return <SpinWheel />;
      case 'boss':
        return <FinalBoss />;
      default:
        return <GameSelect />;
    }
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
      case 'menu':
        return <MainMenu />;
      case 'gameSelect':
        return <GameSelect />;
      case 'game':
        return renderGame();
      case 'achievements':
        return <AchievementsPage />;
      case 'settings':
        return <SettingsMenu />;
      case 'secret':
        return <SecretEnding />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="arcade-app">
      {renderScreen()}
      <AchievementPopup />
    </div>
  );
}
