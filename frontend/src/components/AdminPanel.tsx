import React, { useState } from 'react';
import { saveGameSet, generateGameCode, type GameSetQuestion, type GameSetAnswer } from '../lib/supabase';

interface AdminPanelProps {
  onBackToWelcome: () => void;
}

// Local interface for admin panel state (before saving to database)
interface AdminQuestion {
  question: string;
  answers: GameSetAnswer[];
  order_index: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToWelcome }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [questions, setQuestions] = useState<AdminQuestion[]>([
    {
      question: '',
      answers: [
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 }
      ],
      order_index: 0
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedGameCode, setSavedGameCode] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      answers: [
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 },
        { text: '', points: 0 }
      ],
      order_index: questions.length + 1
    }]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, index) => index !== questionIndex);
      // Update order_index for remaining questions
      newQuestions.forEach((q, index) => {
        q.order_index = index;
      });
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number, field: 'text' | 'points', value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = {
      ...newQuestions[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleSaveGameSet = async () => {
    // Validate input
    if (gameTitle.trim() === '') {
      alert('Please enter a game title.');
      return;
    }

    // Validate questions
    const validQuestions = questions.filter(q => {
      const validAnswers = q.answers.filter(answer => answer.text.trim() !== '');
      return q.question.trim() !== '' && validAnswers.length > 0;
    });

    if (validQuestions.length === 0) {
      alert('Please add at least one complete question with answers.');
      return;
    }

    setIsLoading(true);
    
    try {
      const gameCode = generateGameCode();
      
      // Clean up questions - only include questions with valid answers
      const cleanedQuestions: GameSetQuestion[] = validQuestions.map((q, index) => ({
        question: q.question,
        order_index: index + 1,
        answers: q.answers.filter(answer => answer.text.trim() !== '')
      }));

      const gameSetData = {
        code: gameCode,
        title: gameTitle,
        description: gameDescription || undefined,
        questions: cleanedQuestions
      };

      const result = await saveGameSet(gameSetData);
      
      if (result.success) {
        setSavedGameCode(gameCode);
        alert(`Game set saved successfully!\n\nGame Code: ${gameCode}\n\nShare this code with players to access your game.`);
      } else {
        alert(`Failed to save game set: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving game set:', error);
      alert('An error occurred while saving the game set.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
      {/* Background Pattern - Match Welcome Screen */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: 'clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)'
          }}
        ></div>
      </div>

      {/* Admin Panel Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-h-screen overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-2xl mb-2">
            HOST CONTROL PANEL
          </h1>
          <p className="text-lg text-blue-200">Create and save your Family Feud game set</p>
          {savedGameCode && (
            <div className="mt-4 p-4 bg-green-600/80 rounded-lg border border-green-400">
              <p className="text-white font-bold">✅ Game Set Saved!</p>
              <p className="text-green-100">Game Code: <span className="font-mono text-xl">{savedGameCode}</span></p>
            </div>
          )}
        </div>

        {/* Admin Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          
          {/* Game Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
              <label className="block text-yellow-300 font-bold mb-3 text-xl flex items-center">
                <span className="text-2xl mr-2">🎮</span>
                Game Title *
              </label>
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur border-2 border-purple-400/50 rounded-xl text-white text-lg font-semibold focus:border-yellow-400 focus:outline-none transition-all duration-200 placeholder-purple-300"
                placeholder="Enter game title (e.g., 'Office Party Quiz')"
                maxLength={100}
              />
              <div className="text-right text-xs text-purple-300">{gameTitle.length}/100</div>
            </div>
            <div className="space-y-2">
              <label className="block text-yellow-300 font-bold mb-3 text-xl flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Description (Optional)
              </label>
              <textarea
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                rows={3}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur border-2 border-purple-400/50 rounded-xl text-white text-lg font-semibold focus:border-yellow-400 focus:outline-none transition-all duration-200 placeholder-purple-300 resize-none"
                placeholder="Brief description of your game..."
                maxLength={300}
              />
              <div className="text-right text-xs text-purple-300">{gameDescription.length}/300</div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-yellow-300 font-bold text-2xl flex items-center mb-2">
                  <span className="text-3xl mr-3">❓</span>
                  Questions ({questions.length})
                </h2>
                <p className="text-purple-200 text-sm">Add survey questions with up to 8 answers each</p>
              </div>
              <button
                onClick={addQuestion}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
              >
                <span className="text-xl mr-2">➕</span>
                Add Question
              </button>
            </div>

            <div className="space-y-8">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl border border-gray-600/50 p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <span className="bg-yellow-500 text-black font-black text-lg w-10 h-10 rounded-full flex items-center justify-center mr-4">
                        {questionIndex + 1}
                      </span>
                      <h3 className="text-white font-bold text-xl">Question {questionIndex + 1}</h3>
                    </div>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(questionIndex)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                      >
                        <span className="mr-1">🗑️</span>
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-8">
                    <label className="block text-yellow-300 font-bold mb-3 text-lg flex items-center">
                      <span className="text-xl mr-2">💭</span>
                      Question Text *
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                      rows={2}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur border-2 border-blue-400/50 rounded-xl text-white text-lg font-semibold focus:border-yellow-400 focus:outline-none transition-all duration-200 resize-none placeholder-blue-300"
                      placeholder="Enter your survey question (e.g., 'Name something you might find in a kitchen')"
                      maxLength={200}
                    />
                    <div className="text-right text-xs text-blue-300 mt-1">{question.question.length}/200</div>
                  </div>

                  {/* Answers */}
                  <div>
                    <label className="block text-yellow-300 font-bold mb-4 text-lg flex items-center">
                      <span className="text-xl mr-2">📊</span>
                      Answers (Ranked 1-8)
                    </label>
                    
                    {/* Answers 1-4 (Top Row) */}
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Top Answers (1-4)</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                        {question.answers.slice(0, 4).map((answer, answerIndex) => (
                          <div key={answerIndex} className="space-y-2">
                            <div className="flex gap-2 items-center p-3 bg-white/5 rounded-lg border border-gray-600/30 hover:border-yellow-400/50 transition-all duration-200">
                              <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-full flex items-center justify-center text-sm">
                                {answerIndex + 1}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={answer.text}
                                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex, 'text', e.target.value)}
                                  className="w-full px-3 py-2 bg-white/10 backdrop-blur border border-gray-500/50 rounded-lg text-white font-medium focus:border-yellow-400 focus:outline-none transition-all duration-200 placeholder-gray-400 text-sm"
                                  placeholder={`Answer ${answerIndex + 1}`}
                                  maxLength={50}
                                />
                                <input
                                  type="number"
                                  value={answer.points || ''}
                                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex, 'points', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-orange-600/80 to-red-600/80 backdrop-blur border border-orange-500/50 rounded-lg text-white font-bold text-center focus:border-yellow-400 focus:outline-none transition-all duration-200 text-sm"
                                  placeholder="Points"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            {answer.text && (
                              <div className="text-right text-xs text-gray-400">{answer.text.length}/50</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Answers 5-8 (Bottom Row) */}
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Lower Answers (5-8)</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                        {question.answers.slice(4, 8).map((answer, answerIndex) => (
                          <div key={answerIndex + 4} className="space-y-2">
                            <div className="flex gap-2 items-center p-3 bg-white/5 rounded-lg border border-gray-600/30 hover:border-yellow-400/50 transition-all duration-200">
                              <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-full flex items-center justify-center text-sm">
                                {answerIndex + 5}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={answer.text}
                                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex + 4, 'text', e.target.value)}
                                  className="w-full px-3 py-2 bg-white/10 backdrop-blur border border-gray-500/50 rounded-lg text-white font-medium focus:border-yellow-400 focus:outline-none transition-all duration-200 placeholder-gray-400 text-sm"
                                  placeholder={`Answer ${answerIndex + 5}`}
                                  maxLength={50}
                                />
                                <input
                                  type="number"
                                  value={answer.points || ''}
                                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex + 4, 'points', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-orange-600/80 to-red-600/80 backdrop-blur border border-orange-500/50 rounded-lg text-white font-bold text-center focus:border-yellow-400 focus:outline-none transition-all duration-200 text-sm"
                                  placeholder="Points"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            {answer.text && (
                              <div className="text-right text-xs text-gray-400">{answer.text.length}/50</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Simplified Tips */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                      <div className="flex items-center text-blue-300 text-sm">
                        <span className="mr-2">💡</span>
                        <span><strong>Tip:</strong> Rank answers 1-8 by popularity. Higher ranks (1-4) should have more points than lower ranks (5-8).</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <button
                onClick={onBackToWelcome}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/30 flex items-center backdrop-blur"
              >
                <span className="text-xl mr-2">⬅️</span>
                Back to Menu
              </button>
              
              {/* Save Button with Validation Indicator */}
              <div className="relative">
                <button
                  onClick={handleSaveGameSet}
                  disabled={isLoading || !gameTitle.trim()}
                  className={`px-12 py-4 font-black text-xl rounded-xl shadow-lg transform transition-all duration-200 border-2 flex items-center ${
                    isLoading || !gameTitle.trim()
                      ? 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-green-500 hover:border-green-400 hover:scale-105'
                  } text-white`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mr-3">💾</span>
                      SAVE GAME SET
                    </>
                  )}
                </button>
                
                {/* Validation Message */}
                {!gameTitle.trim() && (
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <span className="text-red-300 text-sm">⚠️ Game title required</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4">
                <div className="text-2xl text-blue-300 font-bold">{questions.length}</div>
                <div className="text-blue-200 text-sm">Questions</div>
              </div>
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
                <div className="text-2xl text-green-300 font-bold">
                  {questions.reduce((total, q) => total + q.answers.filter(a => a.text.trim() !== '').length, 0)}
                </div>
                <div className="text-green-200 text-sm">Total Answers</div>
              </div>
              <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-4">
                <div className="text-2xl text-purple-300 font-bold">
                  {questions.filter(q => q.question.trim() !== '' && q.answers.some(a => a.text.trim() !== '')).length}
                </div>
                <div className="text-purple-200 text-sm">Complete Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
