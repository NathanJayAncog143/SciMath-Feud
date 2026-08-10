import React, { useState } from 'react';
import { getGameSetByCode } from '../lib/supabase';
import type { GameSet } from '../lib/supabase';
import DatabaseGameScreen from './DatabaseGameScreen';
import { supabase } from '../lib/supabase';

interface GameSetupProps {
  onBackToWelcome: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onBackToWelcome }) => {
  // Polling for game status
  const [polling, setPolling] = useState(false);
  const [game, setGame] = useState<any | null>(null);
  const [gameCode, setGameCode] = useState('');
  // Team names will be fetched from gameSet
  const [gameSet, setGameSet] = useState<GameSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  // Remove gameStatus, only validate code

  const validateGameCode = async () => {
    
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { gameSet: gameSetData, success, error: gameSetError } = await getGameSetByCode(gameCode.trim());
      if (!success || !gameSetData) {
        setError(gameSetError || 'Game set not found');
        setGameSet(null);
        return;
      }
      setGameSet(gameSetData);
      setError(null);
    } catch (error) {
      setError('Failed to validate game code');
      setGameSet(null);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (!gameSet) {
      setError('Please enter a valid game code first');
      return;
    }
    // Fetch the latest game for this code
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('game_set_id', gameSet.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) {
        setError('No game found for this code.');
        return;
      }
      if (data.game_status !== 'playing') {
        setError('Waiting for host to start the game.');
        setPolling(true);
        return;
      }
      setGame(data);
      setGameStarted(true);
      setPolling(false);
    };
    fetchGame();
  // Poll for game status if waiting
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (polling && gameSet) {
      interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('game_set_id', gameSet.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data && data.game_status === 'playing') {
          setGame(data);
          setGameStarted(true);
          setPolling(false);
        }
      }, 2000); // poll every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, gameSet]);
  };

  if (gameStarted) {
    return (
      <DatabaseGameScreen
        onBackToWelcome={onBackToWelcome}
        gameCode={gameCode}
        customTeam1Name={game?.team1_custom_name || "TEAM NAME (1)"}
        customTeam2Name={game?.team2_custom_name || "TEAM NAME (2)"}
        customTeam3Name={game?.team3_custom_name || "TEAM NAME (3)"}
        customTeam4Name={game?.team4_custom_name || "TEAM NAME (4)"}
        customTeam5Name={game?.team5_custom_name || "TEAM NAME (5)"}
      />
    );
  }

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <h1 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Game Setup
          </h1>

          {/* Game Code Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Game Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter game code (e.g., DEMO001)"
                className="flex-1 px-4 py-3 text-lg font-mono border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                maxLength={20}
              />
              <button
                onClick={validateGameCode}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200"
              >
                {loading ? 'Checking...' : 'Validate'}
              </button>
            </div>
          </div>

          {/* Game Set Info */}
          {gameSet && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-bold text-green-800 mb-2">{gameSet.title}</h3>
              {gameSet.description && (
                <p className="text-green-700 mb-2">{gameSet.description}</p>
              )}
              <p className="text-sm text-green-600">
                {gameSet.questions?.length || 0} questions available
              </p>
            </div>
          )}

          {/* Team Names: Removed for player, fetched from gameSet */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onBackToWelcome}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-200"
            >
              Back to Welcome
            </button>
            <button
              onClick={startGame}
              disabled={!gameSet}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all duration-200"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
