import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import GameSetup from './components/GameSetup';
import AdminPanel from './components/AdminPanel';
import HostControlScreen from './components/HostControlScreen';
import './App.css';

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameData {
  team1Name: string;
  team2Name: string;
  question: string;
  answers: Answer[];
}

type Screen = 'welcome' | 'game' | 'gameSetup' | 'settings' | 'admin' | 'hostControl';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [gameData, setGameData] = useState<GameData | null>(null);

  const startGame = () => {
    setCurrentScreen('gameSetup');
  };

  const backToWelcome = () => {
    setCurrentScreen('welcome');
    setGameData(null); // Clear game data when returning to welcome
  };

  const openSettings = () => {
    setCurrentScreen('settings');
  };

  const openAdmin = () => {
    setCurrentScreen('admin');
  };

  const openHostControl = () => {
    setCurrentScreen('hostControl');
  };

  return (
    <div className="App">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onStartGame={startGame}
          onSettings={openSettings}
          onAdmin={openAdmin}
          onHostControl={openHostControl}
        />
      )}

      {currentScreen === 'gameSetup' && (
        <GameSetup
          onBackToWelcome={backToWelcome}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminPanel
          onBackToWelcome={backToWelcome}
        />
      )}

      {currentScreen === 'hostControl' && (
        <HostControlScreen
          onBackToWelcome={backToWelcome}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          onBackToWelcome={backToWelcome}
          gameData={gameData}
        />
      )}

      {currentScreen === 'settings' && (
        <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto p-8 text-center bg-blue-800/50 rounded-xl border border-yellow-400/30">
            <h2 className="text-4xl font-bold text-yellow-300 mb-8">Settings</h2>
            <p className="text-white mb-8">Game settings and preferences coming soon!</p>
            <div className="space-y-4 mb-8">
              <div className="text-left">
                <label className="text-white block mb-2">Game Difficulty:</label>
                <select className="w-full p-3 rounded-lg bg-blue-900 text-white border border-yellow-400/50">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="text-left">
                <label className="text-white block mb-2">Sound Effects:</label>
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-white">Enable sound effects</span>
              </div>
            </div>
            <button
              onClick={backToWelcome}
              className="bg-gradient-to-b from-blue-700 to-blue-900 border-4 border-yellow-400 text-yellow-300 font-bold text-xl px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
