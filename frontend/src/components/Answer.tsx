import React, { useState } from 'react';

interface Answer {
  id: string;
  text: string;
  points: number;
  revealed: boolean;
}
interface HostControlProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Answer[];
  team1Name?: string;
  team2Name?: string;
  team3Name?: string;
  team4Name?: string;
  team5Name?: string;
  team1Score: number;
  team2Score: number;
  team3Score: number;
  team4Score: number;
  team5Score: number;
  team1Strikes?: number;
  team2Strikes?: number;
  team3Strikes?: number;
  team4Strikes?: number;
  team5Strikes?: number;
  gameStatus?: 'waiting' | 'playing' | 'paused' | 'finished';
  onRevealAnswer: (index: number, teamId?: number) => void;
  onRevealAnswerNoPoints?: (index: number) => void;
  onTriggerStrikeAnimation?: () => void;
  onNextQuestion: () => void;
  onAddStrike: (teamId?: number) => void;
  onStartGame?: () => void;
  onPauseGame?: () => void;
  onEndGame?: () => void;
  onBackToWelcome: () => void;
  hasUndo?: boolean;
  onUndoLastScoreChange?: () => void;
  onAddCustomScore?: (teamId: number, points: number) => void;
  hasStrikeUndo?: boolean;
  onUndoLastStrikeChange?: () => void;
  onTriggerIntenseSound?: () => void;
  onTriggerWinningSound?: () => void;
  onTriggerStopSounds?: () => void;
}
const HostControl: React.FC<HostControlProps> = ({
  currentQuestionIndex, totalQuestions, answers, team1Name = 'TEAM NAME (1)', team2Name = 'TEAM NAME (2)', team3Name = 'TEAM NAME (3)', team4Name = 'TEAM NAME (4)', team5Name = 'TEAM NAME (5)', team1Score, team2Score, team3Score, team4Score, team5Score, team1Strikes = 0, team2Strikes = 0, team3Strikes = 0, team4Strikes = 0, team5Strikes = 0, gameStatus = 'waiting', onRevealAnswer, onRevealAnswerNoPoints, onTriggerStrikeAnimation, onNextQuestion, onAddStrike, onStartGame, onPauseGame, onEndGame, onBackToWelcome, hasUndo = false, onUndoLastScoreChange, onAddCustomScore, hasStrikeUndo = false, onUndoLastStrikeChange, onTriggerIntenseSound, onTriggerWinningSound, onTriggerStopSounds
}) => {
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [customScore, setCustomScore] = useState<string>('');
  const [showCustomScorePanel, setShowCustomScorePanel] = useState<boolean>(false);

  const teams = [
    { id: 1, name: team1Name, score: team1Score, strikes: team1Strikes },
    { id: 2, name: team2Name, score: team2Score, strikes: team2Strikes },
    { id: 3, name: team3Name, score: team3Score, strikes: team3Strikes },
    { id: 4, name: team4Name, score: team4Score, strikes: team4Strikes },
    { id: 5, name: team5Name, score: team5Score, strikes: team5Strikes }
  ];

  const handleAnswerClick = (answerIndex: number) => {
    onRevealAnswer(answerIndex, selectedTeam);
  };

  const handleRevealNoPoints = (answerIndex: number) => {
    if (onRevealAnswerNoPoints) {
      onRevealAnswerNoPoints(answerIndex);
    }
  };

  // Custom score functions
  const handleAddCustomScore = () => {
    const points = parseInt(customScore);
    if (isNaN(points) || points === 0) {
      alert('Please enter a valid number');
      return;
    }
    
    if (onAddCustomScore) {
      onAddCustomScore(selectedTeam, points);
      setCustomScore('');
      setShowCustomScorePanel(false);
    }
  };

  const toggleCustomScorePanel = () => {
    setShowCustomScorePanel(!showCustomScorePanel);
    setCustomScore('');
  };

  // Ensure we have 8 answers, padding with empty ones if needed
  const paddedAnswers = [...answers];
  while (paddedAnswers.length < 8) {
    paddedAnswers.push({
      id: `empty-${paddedAnswers.length}`,
      text: '',
      points: 0,
      revealed: false
    });
  }

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-auto bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToWelcome}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-white text-2xl font-bold">
            Host Control Panel
          </h1>
        </div>

        {/* Sound Control Buttons */}
        <div className="flex items-center gap-3">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-white text-xs font-bold mb-3 text-center">SOUND CONTROL</div>
            <div className="flex gap-3">
              {/* Intense Sound Button */}
              {onTriggerIntenseSound && (
                <button
                  onClick={onTriggerIntenseSound}
                  className="px-4 py-3 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                  title="Play Intense Background Music on Main Screen"
                >
                  <span className="text-lg mb-1">🔥</span>
                  <span className="text-xs font-bold">INTENSE</span>
                </button>
              )}

              {/* Winning Round Sound Button */}
              {onTriggerWinningSound && (
                <button
                  onClick={onTriggerWinningSound}
                  className="px-4 py-3 bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                  title="Play Victory Sound Effect on Main Screen"
                >
                  <span className="text-lg mb-1">🏆</span>
                  <span className="text-xs font-bold">VICTORY</span>
                </button>
              )}

              {/* Stop All Sounds Button */}
              {onTriggerStopSounds && (
                <button
                  onClick={onTriggerStopSounds}
                  className="px-4 py-3 bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                  title="Stop All Audio Playback on Main Screen"
                >
                  <span className="text-lg mb-1">🔇</span>
                  <span className="text-xs font-bold">STOP</span>
                </button>
              )}
            </div>
          </div>

          {/* Undo Button */}
          {hasUndo && onUndoLastScoreChange && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-white text-xs font-bold mb-3 text-center">UNDO SCORE</div>
              <button
                onClick={onUndoLastScoreChange}
                className="px-4 py-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                title="Undo Last Score Change"
              >
                <span className="text-lg mb-1">↶</span>
                <span className="text-xs font-bold">SCORE</span>
              </button>
            </div>
          )}

          {/* Undo Strike Button */}
          {hasStrikeUndo && onUndoLastStrikeChange && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-white text-xs font-bold mb-3 text-center">UNDO STRIKE</div>
              <button
                onClick={onUndoLastStrikeChange}
                className="px-4 py-3 bg-gradient-to-br from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                title="Undo Last Strike Change"
              >
                <span className="text-lg mb-1">↶</span>
                <span className="text-xs font-bold">STRIKE</span>
              </button>
            </div>
          )}

          {/* Custom Score Addition */}
          {onAddCustomScore && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-white text-xs font-bold mb-3 text-center">ADD SCORE</div>
              <button
                onClick={toggleCustomScorePanel}
                className="px-4 py-3 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                title="Add Custom Score to Team"
              >
                <span className="text-lg mb-1">➕</span>
                <span className="text-xs font-bold">SCORE</span>
              </button>
            </div>
          )}

          {/* Strike Animation Button */}
          {onTriggerStrikeAnimation && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-white text-xs font-bold mb-3 text-center">WRONG ANSWER</div>
              <button
                onClick={onTriggerStrikeAnimation}
                className="px-4 py-3 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[80px]"
                title="Show Wrong Answer Animation"
              >
                <span className="text-lg mb-1">❌</span>
                <span className="text-xs font-bold">ANIM</span>
              </button>
            </div>
          )}
        </div>

        {/* Custom Score Panel */}
        {showCustomScorePanel && onAddCustomScore && (
          <div className="mt-4 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white text-lg font-bold mb-4 text-center">Add Custom Score</div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-white text-sm font-bold mb-2">Select Team:</label>
                <select 
                  value={selectedTeam} 
                  onChange={(e) => setSelectedTeam(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                >
                  {teams.filter(team => team.name && team.name.trim() !== '').map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} (Current: {team.score})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-white text-sm font-bold mb-2">Points:</label>
                <input
                  type="number"
                  value={customScore}
                  onChange={(e) => setCustomScore(e.target.value)}
                  placeholder="Enter points (+ or -)"
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAddCustomScore}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                >
                  Add Score
                </button>
                <button
                  onClick={toggleCustomScorePanel}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${gameStatus === 'waiting' ? 'bg-yellow-600 text-yellow-100' :
              gameStatus === 'playing' ? 'bg-green-600 text-green-100' :
                gameStatus === 'paused' ? 'bg-orange-600 text-orange-100' :
                  'bg-red-600 text-red-100'}`}>
            {gameStatus.toUpperCase()}
          </div>

          {/* Undo Button */}
          {hasUndo && onUndoLastScoreChange && (
            <button
              onClick={onUndoLastScoreChange}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              ↶ UNDO LAST CHANGE
            </button>
          )}

          {gameStatus === 'waiting' && onStartGame && (
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              ▶️ START GAME
            </button>
          )}

          {gameStatus === 'playing' && onPauseGame && (
            <button
              onClick={onPauseGame}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-3 rounded-lg transition-colors"
            >
              ⏸️ PAUSE
            </button>
          )}

          {gameStatus === 'paused' && onStartGame && (
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-lg transition-colors"
            >
              ▶️ RESUME
            </button>
          )}
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="max-w-6xl mx-auto">

        {/* Question Display */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="text-center">
            <div className="text-white/80 text-lg mb-2">Question {currentQuestionIndex + 1} of {totalQuestions}</div>
          </div>
        </div>

        {/* Team Selection */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="text-white text-xl font-bold mb-4 text-center">Select Team to Award Points</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`px-6 py-4 rounded-lg font-bold border-2 transition-all duration-200 min-w-[180px] ${selectedTeam === team.id
                    ? 'bg-yellow-400 text-blue-900 border-yellow-500 shadow-lg scale-105'
                    : 'bg-blue-700/50 text-white border-blue-500/50 hover:bg-blue-600/70 hover:border-blue-400'}`}
              >
                <div className="text-lg">{team.name}</div>
                <div className="text-sm opacity-80">{team.score} points</div>
                <div className="flex justify-center gap-1 mt-1">
                  {[1, 2, 3].map((strike) => (
                    <div
                      key={strike}
                      className={`w-3 h-3 rounded-full ${strike <= team.strikes
                          ? 'bg-red-600'
                          : 'bg-gray-400/50'}`}
                    >
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Strike Control */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="text-white text-xl font-bold mb-4 text-center">
            Add Strike to <span className="text-red-400">{teams.find(t => t.id === selectedTeam)?.name}</span>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => onAddStrike(selectedTeam)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg flex items-center gap-2"
            >
              🚫 ADD STRIKE
            </button>
          </div>
        </div>

        {/* Answer Board */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="text-white text-xl font-bold mb-4 text-center">
            Click Answer to Award to <span className="text-yellow-400">{teams.find(t => t.id === selectedTeam)?.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Left Column - Answers 1-4 */}
            <div className="flex flex-col gap-4">
              {paddedAnswers.slice(0, 4).map((answer, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-2 transition-all duration-200 ${answer.revealed
                      ? 'bg-green-600/80 border-green-400'
                      : answer.text
                        ? 'bg-blue-600/80 border-blue-400/50'
                        : 'bg-gray-600/50 border-gray-500/50'}`}
                >
                  {/* Answer Content Row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex-1 text-left font-bold text-lg text-white">
                      {answer.text ? answer.text : `—`}
                    </span>
                    <span className="bg-black/40 px-3 py-1 rounded-full text-yellow-400 font-black min-w-[60px] text-center">
                      {answer.text ? answer.points : '—'}
                    </span>
                    {answer.revealed && (
                      <span className="ml-2 text-green-300 text-sm font-bold">
                        ✓ REVEALED
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons Row */}
                  {answer.text && !answer.revealed && (
                    <div className="flex gap-2 px-4 pb-3">
                      <button
                        onClick={() => handleAnswerClick(index)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        Award to {teams.find(t => t.id === selectedTeam)?.name}
                      </button>
                      <button
                        onClick={() => handleRevealNoPoints(index)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        👁️ Reveal Only
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column - Answers 5-8 */}
            <div className="flex flex-col gap-4">
              {paddedAnswers.slice(4, 8).map((answer, index) => (
                <div
                  key={index + 4}
                  className={`rounded-lg border-2 transition-all duration-200 ${answer.revealed
                      ? 'bg-green-600/80 border-green-400'
                      : answer.text
                        ? 'bg-blue-600/80 border-blue-400/50'
                        : 'bg-gray-600/50 border-gray-500/50'}`}
                >
                  {/* Answer Content Row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex-1 text-left font-bold text-lg text-white">
                      {answer.text ? answer.text : `—`}
                    </span>
                    <span className="bg-black/40 px-3 py-1 rounded-full text-yellow-400 font-black min-w-[60px] text-center">
                      {answer.text ? answer.points : '—'}
                    </span>
                    {answer.revealed && (
                      <span className="ml-2 text-green-300 text-sm font-bold">
                        ✓ REVEALED
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons Row */}
                  {answer.text && !answer.revealed && (
                    <div className="flex gap-2 px-4 pb-3">
                      <button
                        onClick={() => handleAnswerClick(index + 4)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        Award to {teams.find(t => t.id === selectedTeam)?.name}
                      </button>
                      <button
                        onClick={() => handleRevealNoPoints(index + 4)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        👁️ Reveal Only
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Game Progress */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white text-lg font-bold mb-4 text-center">Progress</div>
            <div className="space-y-3 text-white text-center">
              <div>
                <span className="text-white/80">Question:</span>
                <div className="text-2xl font-bold text-yellow-400">{currentQuestionIndex + 1}/{totalQuestions}</div>
              </div>
              <div>
                <span className="text-white/80">Revealed:</span>
                <div className="text-lg font-bold">{answers.filter(a => a.revealed).length}/{answers.length}</div>
              </div>
            </div>
          </div>

          {/* Next Question */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-white text-lg font-bold mb-4 text-center">Controls</div>
            <div className="space-y-3">
              <button
                onClick={onNextQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                ➡️ NEXT QUESTION
              </button>
              {onEndGame && gameStatus !== 'finished' && (
                <button
                  onClick={onEndGame}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  🏁 END GAME
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HostControl;
