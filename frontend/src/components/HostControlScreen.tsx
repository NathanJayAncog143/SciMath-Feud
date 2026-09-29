import React, { useEffect, useRef, useState } from 'react';
import HostControl from './Answer';
import GameHistory from './GameHistory';
import { getGameSetByCode, createGameWithCustomNames, updateGameScore, revealAnswerInGame, updateGameStatus, addTeamStrike, triggerGameSound, getGameBuzzerState, setGameBuzzerWinner, getRevealedAnswerDetails, supabase } from '../lib/supabase';
import type { GameState, Game, GameSet } from '../lib/supabase';
import { useArduino } from '../hooks/useArduino';

interface HostControlScreenProps {
  onBackToWelcome: () => void;
}

const HostControlScreen: React.FC<HostControlScreenProps> = ({ onBackToWelcome }) => {
  const [gameCode, setGameCode] = useState('');
  const [gameSet, setGameSet] = useState<GameSet | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [resumableGame, setResumableGame] = useState<Game | null>(null);
  const [showNewGameForm, setShowNewGameForm] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    team1Score: 0,
    team2Score: 0,
    team3Score: 0,
    team4Score: 0,
    team5Score: 0,
    strikes: 0,
    gameStarted: false
  });
  const [revealedAnswerIds, setRevealedAnswerIds] = useState<string[]>([]);
  const [revealedAnswersByTeam, setRevealedAnswersByTeam] = useState<Record<string, number>>({});
  const [buzzerLockedTeam, setBuzzerLockedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'paused' | 'finished'>('waiting');
  // Team name states
  const [customTeam1Name, setCustomTeam1Name] = useState('');
  const [customTeam2Name, setCustomTeam2Name] = useState('');
  const [customTeam3Name, setCustomTeam3Name] = useState('');
  const [customTeam4Name, setCustomTeam4Name] = useState('');
  const [customTeam5Name, setCustomTeam5Name] = useState('');
  // Step state
  const [step, setStep] = useState<'code' | 'teams' | 'control'>('code');
  const [showHistory, setShowHistory] = useState(false);
  // Undo functionality states
  const [previousGameState, setPreviousGameState] = useState<GameState | null>(null);
  const [hasUndo, setHasUndo] = useState(false);
  // Strike undo functionality
  const [previousStrikes, setPreviousStrikes] = useState<{
    strikes: number;
    team1Strikes: number;
    team2Strikes: number;
    team3Strikes: number;
    team4Strikes: number;
    team5Strikes: number;
  } | null>(null);
  const [hasStrikeUndo, setHasStrikeUndo] = useState(false);

  // Arduino buzzer controls — host can manage buzzer from this panel
  const {
    connected: arduinoConnected,
    connecting: arduinoConnecting,
    reconnecting: arduinoReconnecting,
    error: arduinoError,
    buttonStates: arduinoButtonStates,
    connect: connectArduino,
    disconnect: disconnectArduino,
    resetBuzzer: resetArduinoBuzzer,
  } = useArduino({ baudRate: 9600, numButtons: 5, autoReconnect: true });
  const previousArduinoButtonsRef = useRef<boolean[]>(Array(5).fill(false));

  // Keep Host Control synchronized with the game-board buzzer and answer owners.
  useEffect(() => {
    const gameId = game?.id;
    if (!gameId) return;
    let active = true;

    const pollSharedControlState = async () => {
      const [buzzer, revealedAnswers] = await Promise.all([
        getGameBuzzerState(gameId),
        getRevealedAnswerDetails(gameId),
      ]);
      if (!active) return;
      setBuzzerLockedTeam(buzzer.teamId);
      setRevealedAnswerIds(revealedAnswers.map(answer => answer.answer_id));
      setRevealedAnswersByTeam(Object.fromEntries(
        revealedAnswers.map(answer => [answer.answer_id, answer.revealed_by_team])
      ));
    };

    void pollSharedControlState();
    const interval = setInterval(() => { void pollSharedControlState(); }, 300);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [game?.id]);

  // If the Arduino is connected to Host Control, publish its first press too.
  useEffect(() => {
    if (!arduinoConnected) {
      previousArduinoButtonsRef.current = Array(5).fill(false);
      return;
    }

    const previous = previousArduinoButtonsRef.current;
    if (buzzerLockedTeam === null && game?.id) {
      const teamStrikes = [
        game.team1_strikes || 0,
        game.team2_strikes || 0,
        game.team3_strikes || 0,
        game.team4_strikes || 0,
        game.team5_strikes || 0,
      ];
      for (let index = 0; index < arduinoButtonStates.length && index < 5; index += 1) {
        if (!previous[index] && arduinoButtonStates[index]) {
          if (teamStrikes[index] >= 3) continue;
          const teamId = index + 1;
          void setGameBuzzerWinner(game.id, teamId).then(buzzer => {
            if (buzzer) setBuzzerLockedTeam(buzzer.teamId);
          });
          break;
        }
      }
    }
    previousArduinoButtonsRef.current = [...arduinoButtonStates];
  }, [
    arduinoButtonStates,
    arduinoConnected,
    buzzerLockedTeam,
    game?.id,
    game?.team1_strikes,
    game?.team2_strikes,
    game?.team3_strikes,
    game?.team4_strikes,
    game?.team5_strikes,
  ]);

  const handleResetBuzzer = async () => {
    resetArduinoBuzzer();
    previousArduinoButtonsRef.current = Array(5).fill(false);
    setBuzzerLockedTeam(null);
    if (game?.id) {
      try {
        await setGameBuzzerWinner(game.id, null);
        await triggerGameSound(game.id, 'stop');
        console.log('Buzzer reset signal broadcast to game board');
      } catch (error) {
        console.error('Error broadcasting buzzer reset:', error);
      }
    }
  };

  // Poll game data for real-time updates
  const pollGameData = async () => {
    if (!game) return;
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', game.id)
        .single();
      
      if (data && !error) {
        setGame(data);
        setGameState(prev => ({
          ...prev,
          team1Score: data.team1_score || 0,
          team2Score: data.team2_score || 0,
          team3Score: data.team3_score || 0,
          team4Score: data.team4_score || 0,
          team5Score: data.team5_score || 0,
          strikes: data.strikes || 0,
          team1Strikes: data.team1_strikes || 0,
          team2Strikes: data.team2_strikes || 0,
          team3Strikes: data.team3_strikes || 0,
          team4Strikes: data.team4_strikes || 0,
          team5Strikes: data.team5_strikes || 0
        }));
      }
    } catch (error) {
      console.error('Error polling game data:', error);
    }
  };

  // Save current game state before making changes
  const saveCurrentGameState = () => {
    setPreviousGameState({ ...gameState });
    setHasUndo(true);
  };

  // Undo last score change
  const undoLastScoreChange = async () => {
    if (!previousGameState || !game) return;

    try {
      // Update database with previous scores
      await updateGameScore(
        game.id,
        previousGameState.team1Score,
        previousGameState.team2Score,
        previousGameState.team3Score,
        previousGameState.team4Score,
        previousGameState.team5Score,
        previousGameState.strikes,
        previousGameState.currentQuestionIndex
      );

      // Update local state
      setGameState(previousGameState);
      setHasUndo(false);
      setPreviousGameState(null);
    } catch (error) {
      console.error('Error undoing score change:', error);
    }
  };

  // Add custom score to a team
  const addCustomScore = async (teamId: number, points: number) => {
    if (!game) return;

    // Save current state before making changes
    saveCurrentGameState();

    try {
      // Get current scores
      const currentScores = [
        gameState.team1Score,
        gameState.team2Score,
        gameState.team3Score,
        gameState.team4Score,
        gameState.team5Score
      ];

      // Add points to the selected team
      if (teamId >= 1 && teamId <= 5) {
        currentScores[teamId - 1] += points;
      }

      // Update local state
      setGameState(prev => ({
        ...prev,
        team1Score: currentScores[0],
        team2Score: currentScores[1],
        team3Score: currentScores[2],
        team4Score: currentScores[3],
        team5Score: currentScores[4]
      }));

      // Update game score in database
      await updateGameScore(
        game.id,
        currentScores[0],
        currentScores[1],
        currentScores[2],
        currentScores[3],
        currentScores[4],
        gameState.strikes,
        gameState.currentQuestionIndex
      );
    } catch (error) {
      console.error('Error adding custom score:', error);
    }
  };

  // Save current strike state before making changes
  const saveCurrentStrikeState = async () => {
    if (!game) return;

    try {
      const { data, error } = await supabase
        .from('games')
        .select('strikes, team1_strikes, team2_strikes, team3_strikes, team4_strikes, team5_strikes')
        .eq('id', game.id)
        .single();

      if (error) throw error;

      setPreviousStrikes({
        strikes: data.strikes || 0,
        team1Strikes: data.team1_strikes || 0,
        team2Strikes: data.team2_strikes || 0,
        team3Strikes: data.team3_strikes || 0,
        team4Strikes: data.team4_strikes || 0,
        team5Strikes: data.team5_strikes || 0
      });
      setHasStrikeUndo(true);
    } catch (error) {
      console.error('Error saving current strike state:', error);
    }
  };

  // Undo last strike change
  const undoLastStrikeChange = async () => {
    if (!previousStrikes || !game) return;

    try {
      // Update database with previous strikes
      await updateGameScore(
        game.id,
        gameState.team1Score,
        gameState.team2Score,
        gameState.team3Score,
        gameState.team4Score,
        gameState.team5Score,
        previousStrikes.strikes,
        gameState.currentQuestionIndex,
        previousStrikes.team1Strikes,
        previousStrikes.team2Strikes,
        previousStrikes.team3Strikes,
        previousStrikes.team4Strikes,
        previousStrikes.team5Strikes
      );

      // Update local state
      setGameState(prev => ({
        ...prev,
        strikes: previousStrikes.strikes
      }));

      setHasStrikeUndo(false);
      setPreviousStrikes(null);
      
      // Re-poll game data to get updated strikes
      pollGameData();
    } catch (error) {
      console.error('Error undoing strike change:', error);
    }
  };

  // Step 1: Validate game code
  const validateGameCode = async () => {
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }
    setLoading(true);
    setError(null);
    setGameSet(null);
    setResumableGame(null);
    setShowNewGameForm(false);
    try {
      const { gameSet: gameSetData, success, error: gameSetError } = await getGameSetByCode(gameCode.trim());
      if (!success || !gameSetData) {
        setError(gameSetError || 'Game set not found');
        setGameSet(null);
        return;
      }
      setGameSet(gameSetData);

      const { data: latestGame, error: latestGameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_set_id', gameSetData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestGameError && !latestGameError.message.includes('(404)')) {
        setError('The game set was found, but existing games could not be checked. Please try again.');
        return;
      }

      const ongoingGame = !latestGameError && latestGame
        && (latestGame.game_status === 'playing' || latestGame.game_status === 'paused')
        ? latestGame as Game
        : null;
      setResumableGame(ongoingGame);
      setShowNewGameForm(!ongoingGame);
      setError(null);
      setStep('teams');
    } catch {
      setError('Failed to validate game code');
      setGameSet(null);
    } finally {
      setLoading(false);
    }
  };

  const resumeHostGame = async () => {
    if (!resumableGame || !gameSet) return;

    setLoading(true);
    setError(null);
    try {
      // Refresh before resuming so Host Control restores the newest persisted
      // state, even if it changed while this choice was on screen.
      const { data: currentGame, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', resumableGame.id)
        .single();

      if (gameError || !currentGame) {
        setError('The ongoing game could not be loaded. Please validate the code again.');
        return;
      }
      if (currentGame.game_status !== 'playing' && currentGame.game_status !== 'paused') {
        setResumableGame(null);
        setShowNewGameForm(true);
        setError('That game has already ended. You can start a new game below.');
        return;
      }

      const maximumQuestionIndex = Math.max((gameSet.questions?.length || 1) - 1, 0);
      const questionIndex = Math.min(Math.max(currentGame.current_question_index || 0, 0), maximumQuestionIndex);

      setCustomTeam1Name(currentGame.team1_custom_name || currentGame.team1?.name || '');
      setCustomTeam2Name(currentGame.team2_custom_name || currentGame.team2?.name || '');
      setCustomTeam3Name(currentGame.team3_custom_name || currentGame.team3?.name || '');
      setCustomTeam4Name(currentGame.team4_custom_name || currentGame.team4?.name || '');
      setCustomTeam5Name(currentGame.team5_custom_name || currentGame.team5?.name || '');
      setGameState({
        currentQuestionIndex: questionIndex,
        team1Score: currentGame.team1_score || 0,
        team2Score: currentGame.team2_score || 0,
        team3Score: currentGame.team3_score || 0,
        team4Score: currentGame.team4_score || 0,
        team5Score: currentGame.team5_score || 0,
        strikes: currentGame.strikes || 0,
        gameStarted: currentGame.game_status === 'playing',
      });
      setGameStatus(currentGame.game_status);
      setGame(currentGame);
      setHasUndo(false);
      setPreviousGameState(null);
      setHasStrikeUndo(false);
      setPreviousStrikes(null);
      setStep('control');
    } catch (error) {
      console.error('Failed to resume game:', error);
      setError('Failed to resume the ongoing game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create game and start after team names
  const startHostGame = async () => {
    if (!gameSet) {
      setError('Please validate game code first');
      return;
    }
    // Get team names from custom inputs
    const teamNames = [
      customTeam1Name.trim(),
      customTeam2Name.trim(),
      customTeam3Name.trim(),
      customTeam4Name.trim(),
      customTeam5Name.trim()
    ].filter(name => name !== '');
    if (teamNames.length < 2) {
      setError('Please enter names for at least 2 teams');
      return;
    }
    // Check for duplicate team names
    const uniqueTeams = new Set(teamNames);
    if (uniqueTeams.size !== teamNames.length) {
      setError('Please use different names for each team');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { game: gameData, success: gameSuccess, error: gameError } = await createGameWithCustomNames(
        gameSet.id,
        customTeam1Name.trim(),
        customTeam2Name.trim(),
        customTeam3Name.trim(),
        customTeam4Name.trim(),
        customTeam5Name.trim()
      );
      if (!gameSuccess || !gameData) {
        setError(gameError || 'Failed to create game');
        return;
      }
      const started = await updateGameStatus(gameData.id, 'playing');
      if (!started) {
        setError('The game was created but could not be started. Please validate the code again.');
        return;
      }
      setGameStatus('playing');
      setGame({ ...gameData, game_status: 'playing' });
      setGameState({
        currentQuestionIndex: 0,
        team1Score: 0,
        team2Score: 0,
        team3Score: 0,
        team4Score: 0,
        team5Score: 0,
        strikes: 0,
        gameStarted: true,
      });
      setResumableGame(null);
      setStep('control');
      setError(null);
    } catch {
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const revealAnswer = async (answerIndex: number, teamId?: number) => {
    const teamIndex = teamId || 1; // Default to team 1 if no team specified
    
    if (!gameSet?.questions || !game) return;

    const currentQuestion = gameSet.questions[gameState.currentQuestionIndex];
    if (!currentQuestion || answerIndex >= currentQuestion.answers.length) return;

    const answer = currentQuestion.answers[answerIndex];
    if (revealedAnswerIds.includes(answer.id)) return;

    // Save current state before making changes
    saveCurrentGameState();

    try {
      // Add to revealed answers in database
      const success = await revealAnswerInGame(game.id, answer.id, teamIndex);

      if (success) {
        // Update local state
        setRevealedAnswerIds(prev => [...prev, answer.id]);
        setRevealedAnswersByTeam(prev => ({ ...prev, [answer.id]: teamIndex }));

        // Calculate new scores
        const newScores = [
          gameState.team1Score,
          gameState.team2Score,
          gameState.team3Score,
          gameState.team4Score,
          gameState.team5Score
        ];
        
        if (teamIndex >= 1 && teamIndex <= 5) {
          newScores[teamIndex - 1] += answer.points;
        }

        // Add points to the correct team
        setGameState(prev => ({
          ...prev,
          team1Score: newScores[0],
          team2Score: newScores[1],
          team3Score: newScores[2],
          team4Score: newScores[3],
          team5Score: newScores[4]
        }));

        // Update game score in database with new calculated scores
        await updateGameScore(
          game.id,
          newScores[0],
          newScores[1],
          newScores[2],
          newScores[3],
          newScores[4],
          gameState.strikes,
          gameState.currentQuestionIndex
        );
      }
    } catch (error) {
      console.error('Failed to reveal answer:', error);
    }
  };

  const revealAnswerNoPoints = async (answerIndex: number) => {
    if (!gameSet?.questions || !game) return;

    const currentQuestion = gameSet.questions[gameState.currentQuestionIndex];
    if (!currentQuestion || answerIndex >= currentQuestion.answers.length) return;

    const answer = currentQuestion.answers[answerIndex];
    if (revealedAnswerIds.includes(answer.id)) return;

    try {
      // Add to revealed answers in database without awarding points (team 0)
      const success = await revealAnswerInGame(game.id, answer.id, 0);

      if (success) {
        // Update local state - just reveal the answer without changing scores
        setRevealedAnswerIds(prev => [...prev, answer.id]);
        setRevealedAnswersByTeam(prev => ({ ...prev, [answer.id]: 0 }));
      }
    } catch (error) {
      console.error('Failed to reveal answer without points:', error);
    }
  };

  const nextQuestion = async () => {
    if (!gameSet?.questions || !game) return;
    
    const nextIndex = gameState.currentQuestionIndex + 1;
    if (nextIndex < gameSet.questions.length) {
      try {
        // Update database with new question index and reset all strikes
        const success = await updateGameScore(
          game.id,
          gameState.team1Score,
          gameState.team2Score,
          gameState.team3Score,
          gameState.team4Score,
          gameState.team5Score,
          0, // Reset global strikes
          nextIndex, // New question index
          0, // Reset team 1 strikes
          0, // Reset team 2 strikes
          0, // Reset team 3 strikes
          0, // Reset team 4 strikes
          0  // Reset team 5 strikes
        );

        if (success) {
          // Update local state
          setGameState(prev => ({
            ...prev,
            currentQuestionIndex: nextIndex,
            strikes: 0, // Reset global strikes
            team1Strikes: 0,
            team2Strikes: 0,
            team3Strikes: 0,
            team4Strikes: 0,
            team5Strikes: 0
          }));
          // The strike indicators are rendered from the game record, so reset
          // that local copy immediately instead of waiting for another fetch.
          setGame(prev => prev ? ({
            ...prev,
            current_question_index: nextIndex,
            strikes: 0,
            team1_strikes: 0,
            team2_strikes: 0,
            team3_strikes: 0,
            team4_strikes: 0,
            team5_strikes: 0,
          }) : prev);
          setHasStrikeUndo(false);
          setPreviousStrikes(null);
          setRevealedAnswerIds([]); // Reset revealed answers for new question
          setRevealedAnswersByTeam({});
        }
      } catch (error) {
        console.error('Failed to advance to next question:', error);
      }
    }
  };

  const addStrike = async (teamId?: number) => {
    if (!game) {
      console.log('No game found');
      return;
    }

    // Save current strike state before making changes
    await saveCurrentStrikeState();

    if (teamId) {
      console.log('Adding strike to team', teamId, 'for game', game.id);
      // Add strike to specific team
      const success = await addTeamStrike(game.id, teamId);
      console.log('Strike added successfully:', success);
      if (success) {
        // Re-poll game data to get updated strikes
        pollGameData();
      }
    } else {
      // Add global strike (existing behavior)
      if (gameState.strikes >= 3) return;

      const newStrikes = gameState.strikes + 1;
      setGameState(prev => ({
        ...prev,
        strikes: newStrikes
      }));

      // Update game score in database
      await updateGameScore(
        game.id,
        gameState.team1Score,
        gameState.team2Score,
        gameState.team3Score,
        gameState.team4Score,
        gameState.team5Score,
        newStrikes,
        gameState.currentQuestionIndex
      );
    }
  };

  const startGame = async () => {
    if (!game) return;
    
    try {
      await updateGameStatus(game.id, 'playing');
      setGameStatus('playing');
      // Game status updated - players can now see the game board
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const pauseGame = async () => {
    if (!game) return;
    
    try {
      await updateGameStatus(game.id, 'paused');
      setGameStatus('paused');
    } catch (error) {
      console.error('Failed to pause game:', error);
    }
  };

  const endGame = async () => {
    if (!game) return;
    
    try {
      await updateGameStatus(game.id, 'finished');
      setGameStatus('finished');
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  // Trigger strike animation without adding actual strikes (for dramatic effect)
  const triggerStrikeAnimation = async () => {
    if (!game) return;
    
    try {
      // Use a timestamp approach similar to question reveal
      const { error } = await supabase
        .from('games')
        .update({ show_strike_animation_at: new Date().toISOString() })
        .eq('id', game.id);
      
      if (error) {
        console.error('Error triggering strike animation:', error);
      } else {
        console.log('Strike animation triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering strike animation:', error);
    }
  };

  // Trigger sound effects on main screen
  const triggerIntenseSound = async () => {
    if (!game) return;
    
    try {
      const success = await triggerGameSound(game.id, 'intense');
      if (success) {
        console.log('Intense sound triggered successfully');
      } else {
        console.error('Error triggering intense sound');
      }
    } catch (error) {
      console.error('Error triggering intense sound:', error);
    }
  };

  const triggerWinningSound = async () => {
    if (!game) return;
    
    try {
      const success = await triggerGameSound(game.id, 'winning');
      if (success) {
        console.log('Winning sound triggered successfully');
      } else {
        console.error('Error triggering winning sound');
      }
    } catch (error) {
      console.error('Error triggering winning sound:', error);
    }
  };

  const triggerStopSounds = async () => {
    if (!game) return;
    
    try {
      const success = await triggerGameSound(game.id, 'stop');
      if (success) {
        console.log('Stop sounds triggered successfully');
      } else {
        console.error('Error triggering stop sounds');
      }
    } catch (error) {
      console.error('Error triggering stop sounds:', error);
    }
  };

  // Step UI
  if (step === 'code') {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-[#1f225d] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-[#2a2e6b] rounded-xl shadow-2xl p-8 border border-purple-400/30">
            <h1 className="text-3xl font-black text-center mb-8 text-white">🎛️ HOST CONTROL</h1>
            {/* Game Code Input */}
            <div className="mb-6">
              <label className="block text-purple-300 font-bold mb-2 text-lg">Enter Game Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => {
                    setGameCode(e.target.value.toUpperCase());
                    setGameSet(null);
                    setResumableGame(null);
                    setShowNewGameForm(false);
                    setError(null);
                  }}
                  placeholder="Enter game code (e.g., DEMO001)"
                  className="flex-1 px-4 py-3 text-lg font-mono border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white"
                  maxLength={20}
                />
                <button
                  onClick={validateGameCode}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl transition-all duration-200"
                >
                  {loading ? 'Checking...' : 'Validate'}
                </button>
              </div>
            </div>
            {/* Game Set Info */}
            {gameSet && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-400/50 rounded-xl">
                <h3 className="text-lg font-bold text-green-300 mb-2">{gameSet.title}</h3>
                {gameSet.description && (
                  <p className="text-green-200 mb-2">{gameSet.description}</p>
                )}
                <p className="text-sm text-green-100">{gameSet.questions?.length || 0} questions available</p>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-400/50 rounded-xl">
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBackToWelcome}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                ← Back to Welcome
              </button>
              {gameSet && (
                <button
                  onClick={() => setStep('teams')}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200"
                >
                  Next: Enter Teams
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (step === 'teams') {
    return (
      <div className="w-screen h-screen fixed inset-0 overflow-y-auto bg-[#1f225d] flex items-start md:items-center justify-center py-6">
        <div className="max-w-md w-full mx-4">
          <div className="bg-[#2a2e6b] rounded-xl shadow-2xl p-8 border border-purple-400/30">
            <h1 className="text-3xl font-black text-center mb-6 text-white">
              {resumableGame ? 'Ongoing Game Found' : 'Enter Team Names'}
            </h1>
            {resumableGame && (
              <div className="mb-6 p-4 bg-amber-500/15 border border-amber-300/50 rounded-xl">
                <p className="text-amber-200 font-bold mb-1">
                  {resumableGame.game_status === 'paused' ? 'Paused' : 'Playing'} game available
                </p>
                <p className="text-sm text-amber-100 mb-4">
                  Question {resumableGame.current_question_index + 1} · Created {resumableGame.created_at ? new Date(resumableGame.created_at).toLocaleString() : 'earlier'}
                </p>
                <p className="text-xs text-amber-100/80 mb-4">
                  Teams: {[resumableGame.team1_custom_name, resumableGame.team2_custom_name, resumableGame.team3_custom_name, resumableGame.team4_custom_name, resumableGame.team5_custom_name].filter(Boolean).join(', ')}
                </p>
                <button
                  onClick={resumeHostGame}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-500 text-gray-950 font-black rounded-xl transition-all duration-200"
                >
                  {loading ? 'Loading Game...' : 'Resume Ongoing Game'}
                </button>
                {!showNewGameForm && (
                  <button
                    onClick={() => {
                      setShowNewGameForm(true);
                      setError(null);
                    }}
                    disabled={loading}
                    className="w-full mt-3 px-4 py-2 bg-transparent hover:bg-white/10 text-amber-100 font-bold rounded-xl border border-amber-200/40 transition-all duration-200"
                  >
                    Start a New Game Instead
                  </button>
                )}
              </div>
            )}
            {showNewGameForm && resumableGame && (
              <p className="mb-4 text-center text-sm text-orange-200">
                Starting a new game creates a separate session. Audience screens must rejoin to use it.
              </p>
            )}
            {/* Team Name Inputs */}
            {showNewGameForm && <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={customTeam1Name} onChange={e => setCustomTeam1Name(e.target.value)} placeholder="Team 1 Name" className="w-full px-4 py-3 text-lg border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white" />
                <input type="text" value={customTeam2Name} onChange={e => setCustomTeam2Name(e.target.value)} placeholder="Team 2 Name" className="w-full px-4 py-3 text-lg border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white" />
                <input type="text" value={customTeam3Name} onChange={e => setCustomTeam3Name(e.target.value)} placeholder="Team 3 Name" className="w-full px-4 py-3 text-lg border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white" />
                <input type="text" value={customTeam4Name} onChange={e => setCustomTeam4Name(e.target.value)} placeholder="Team 4 Name" className="w-full px-4 py-3 text-lg border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white" />
                <input type="text" value={customTeam5Name} onChange={e => setCustomTeam5Name(e.target.value)} placeholder="Team 5 Name" className="w-full px-4 py-3 text-lg border-2 border-purple-400 rounded-xl focus:border-pink-400 focus:outline-none bg-[#1f225d] text-white" />
              </div>
            </div>}
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-400/50 rounded-xl">
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setStep('code');
                  setError(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                ← Back
              </button>
              {showNewGameForm && (
                <button
                  onClick={startHostGame}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all duration-200"
                >
                  {loading ? 'Starting...' : resumableGame ? 'Start New Game' : 'Start Game'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory && game) {
    return (
      <GameHistory
        game={{
          ...game,
          team1_score: gameState.team1Score,
          team2_score: gameState.team2Score,
          team3_score: gameState.team3Score,
          team4_score: gameState.team4Score,
          team5_score: gameState.team5Score,
        }}
        gameCode={gameCode}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (!gameSet?.questions || gameSet.questions.length === 0) {
    return (
      <div className="w-screen h-screen fixed inset-0 bg-[#1f225d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-4">No questions found in this game set</div>
          <button
            onClick={onBackToWelcome}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Welcome
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = gameSet.questions[gameState.currentQuestionIndex];
  const answersWithRevealState = currentQuestion.answers.map(answer => ({
    ...answer,
    revealed: revealedAnswerIds.includes(answer.id),
    revealedByTeam: revealedAnswersByTeam[answer.id] || 0
  }));

  return (
    <HostControl
      currentQuestionIndex={gameState.currentQuestionIndex}
      totalQuestions={gameSet.questions.length}
      answers={answersWithRevealState}
      team1Name={customTeam1Name || "TEAM NAME (1)"}
      team2Name={customTeam2Name || "TEAM NAME (2)"}
      team3Name={customTeam3Name || "TEAM NAME (3)"}
      team4Name={customTeam4Name || "TEAM NAME (4)"}
      team5Name={customTeam5Name || "TEAM NAME (5)"}
      team1Score={gameState.team1Score}
      team2Score={gameState.team2Score}
      team3Score={gameState.team3Score}
      team4Score={gameState.team4Score}
      team5Score={gameState.team5Score}
      team1Strikes={game?.team1_strikes || 0}
      team2Strikes={game?.team2_strikes || 0}
      team3Strikes={game?.team3_strikes || 0}
      team4Strikes={game?.team4_strikes || 0}
      team5Strikes={game?.team5_strikes || 0}
      gameStatus={gameStatus}
      onRevealAnswer={revealAnswer}
      onRevealAnswerNoPoints={revealAnswerNoPoints}
      onNextQuestion={nextQuestion}
      onAddStrike={addStrike}
      onStartGame={startGame}
      onPauseGame={pauseGame}
      onEndGame={endGame}
      onBackToWelcome={onBackToWelcome}
      onOpenHistory={() => setShowHistory(true)}
      onTriggerStrikeAnimation={triggerStrikeAnimation}
      hasUndo={hasUndo}
      onUndoLastScoreChange={undoLastScoreChange}
      onAddCustomScore={addCustomScore}
      hasStrikeUndo={hasStrikeUndo}
      onUndoLastStrikeChange={undoLastStrikeChange}
      onTriggerIntenseSound={triggerIntenseSound}
      onTriggerWinningSound={triggerWinningSound}
      onTriggerStopSounds={triggerStopSounds}
      onResetBuzzer={handleResetBuzzer}
      arduinoConnected={arduinoConnected}
      onConnectBuzzer={connectArduino}
      onDisconnectBuzzer={disconnectArduino}
      buzzerConnecting={arduinoConnecting || arduinoReconnecting}
      buzzerButtonStates={arduinoButtonStates}
      buzzerError={arduinoError}
      buzzerLockedTeam={buzzerLockedTeam}
    />
  );
};

export default HostControlScreen;
