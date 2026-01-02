
import React, { useState, useEffect } from 'react';
import { GamePhase, GameSettings } from './types';
import { INITIAL_SETTINGS, TRANSLATIONS } from './constants';
import Menu from './components/Menu';
import Settings from './components/Settings';
import Game from './components/Game';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  // Identificador para forçar o reset do componente Game
  const [gameId, setGameId] = useState(0);

  // Load persistence
  useEffect(() => {
    const savedSettings = localStorage.getItem('rocket_kid_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedHighScore = localStorage.getItem('rocket_kid_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const updateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('rocket_kid_settings', JSON.stringify(newSettings));
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('rocket_kid_highscore', score.toString());
    }

    if (settings.autoRestart) {
      // Incrementa o ID para forçar o remount do componente Game
      setGameId(prev => prev + 1);
      setPhase(GamePhase.LAUNCH);
    } else {
      setPhase(GamePhase.GAMEOVER);
    }
  };

  const startNewGame = () => {
    setGameId(prev => prev + 1);
    setPhase(GamePhase.LAUNCH);
  };

  const t = TRANSLATIONS[settings.language];

  return (
    <div className="w-full h-screen">
      {phase === GamePhase.MENU && (
        <Menu 
          settings={settings} 
          onPlay={startNewGame} 
          onOpenSettings={() => setShowSettings(true)}
          highScore={highScore}
        />
      )}

      {(phase === GamePhase.LAUNCH || phase === GamePhase.ATMOSPHERE || phase === GamePhase.SPACE) && (
        <Game 
          key={gameId}
          settings={settings} 
          onGameOver={handleGameOver}
          onExit={() => setPhase(GamePhase.MENU)}
        />
      )}

      {phase === GamePhase.GAMEOVER && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-8 border-red-500 shadow-2xl">
              <h2 className="text-5xl font-fredoka text-red-500 mb-4">{t.gameOver}</h2>
              <div className="space-y-2 mb-8">
                <p className="text-2xl font-bold text-gray-700">{t.score}: <span className="text-blue-600">{lastScore}</span></p>
                <p className="text-xl font-bold text-gray-400">{t.highScore}: {highScore}</p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={startNewGame}
                  className="bg-green-500 text-white font-fredoka text-2xl py-4 rounded-2xl shadow-lg hover:bg-green-600 transition-all hover:scale-105"
                >
                  {t.restart}
                </button>
                <button
                  onClick={() => setPhase(GamePhase.MENU)}
                  className="bg-gray-200 text-gray-700 font-fredoka text-xl py-4 rounded-2xl hover:bg-gray-300 transition-all"
                >
                  {t.mainMenu}
                </button>
              </div>
           </div>
        </div>
      )}

      {showSettings && (
        <Settings 
          settings={settings} 
          onUpdate={updateSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};

export default App;
