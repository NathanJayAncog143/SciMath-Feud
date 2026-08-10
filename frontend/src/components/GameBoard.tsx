import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface GameBoardProps {
  answers: Array<{
    text: string;
    points: number;
    revealed: boolean;
  }>;
  team1Score?: number;
  team2Score?: number;
  team3Score?: number;
  team4Score?: number;
  team5Score?: number;
  team1Name?: string;
  team2Name?: string;
  team3Name?: string;
  team4Name?: string;
  team5Name?: string;
  team1Strikes?: number;
  team2Strikes?: number;
  team3Strikes?: number;
  team4Strikes?: number;
  team5Strikes?: number;
  currentQuestionIndex?: number;
  onRevealAnswer: (index: number) => void;
  // Arduino integration
  arduinoConnected?: boolean;
  buttonStates?: boolean[]; // index 0..4 for teams 1..5
  lastPressedIndex?: number | null;
  buzzWinnerIndex?: number | null;
  showStrikeAnimation?: boolean;
  // Sound control
  gameId?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  answers,
  team1Score = 0,
  team2Score = 0,
  team3Score = 0,
  team4Score = 0,
  team5Score = 0,
  team1Name,
  team2Name,
  team3Name,
  team4Name,
  team5Name,
  team1Strikes = 0,
  team2Strikes = 0,
  team3Strikes = 0,
  team4Strikes = 0,
  team5Strikes = 0,
  // optional, currently unused visually:
  currentQuestionIndex,
  onRevealAnswer,
  arduinoConnected = false,
  buttonStates = [false, false, false, false, false],
  lastPressedIndex = null,
  buzzWinnerIndex = null,
  showStrikeAnimation = false,
  gameId
}) => {
  // Track previous scores to detect changes
  const [prevScores, setPrevScores] = useState({
    team1: team1Score,
    team2: team2Score,
    team3: team3Score,
    team4: team4Score,
    team5: team5Score,
  });

  // Track which teams have score animations
  const [animatingTeams, setAnimatingTeams] = useState<Set<number>>(new Set());

  // Track celebration animation for buzzer lock-in
  const [celebratingTeam, setCelebratingTeam] = useState<number | null>(null);
  const [prevBuzzWinner, setPrevBuzzWinner] = useState<number | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup celebration timeout on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
    };
  }, []);

  // Clear celebration when buzzer is reset (prevents stuck animations)
  useEffect(() => {
    if (buzzWinnerIndex === null && celebratingTeam !== null) {
      // Buzzer was reset while celebration was active - force cleanup
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
      setCelebratingTeam(null);
      console.log('Celebration cleared due to buzzer reset');
    }
  }, [buzzWinnerIndex, celebratingTeam]);

  // Clear celebration when question changes
  const prevQuestionIndexRef = useRef<number | undefined>(currentQuestionIndex);
  useEffect(() => {
    if (prevQuestionIndexRef.current !== undefined && 
        prevQuestionIndexRef.current !== currentQuestionIndex && 
        celebratingTeam !== null) {
      console.log('Question changed - clearing celebration animation');
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
      setCelebratingTeam(null);
    }
    prevQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex, celebratingTeam]);

  // Detect buzzer lock-in and trigger celebration with robust validation
  useEffect(() => {
    // Guard clause 1: Check if buzzWinnerIndex changed from null to a valid team number
    if (prevBuzzWinner === null && buzzWinnerIndex !== null && buzzWinnerIndex >= 0 && buzzWinnerIndex <= 4) {
      
      // Guard clause 2: Validate that the winning team is not disabled (< 3 strikes)
      const isWinningTeamDisabled = isTeamDisabled(buzzWinnerIndex);
      
      if (isWinningTeamDisabled) {
        console.warn(`Celebration blocked: Team ${buzzWinnerIndex + 1} is disabled with 3+ strikes`);
        // Do not trigger celebration for disabled teams
        setPrevBuzzWinner(buzzWinnerIndex);
        return;
      }
      
      // Guard clause 3: Ensure no other celebration is currently active
      if (celebratingTeam !== null) {
        // Force clear previous celebration to allow new steal attempt
        console.log('Clearing previous celebration for steal attempt');
        if (celebrationTimeoutRef.current) {
          clearTimeout(celebrationTimeoutRef.current);
          celebrationTimeoutRef.current = null;
        }
      }
      
      // Clear any existing timeout before setting new one
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
      
      // Check if this is a steal attempt (any team has 3+ strikes but winner is different)
      const teamStrikesArray = [team1Strikes, team2Strikes, team3Strikes, team4Strikes, team5Strikes];
      const hasEliminatedTeam = teamStrikesArray.some(strikes => strikes >= 3);
      const isStealAttempt = hasEliminatedTeam && teamStrikesArray[buzzWinnerIndex] < 3;
      
      if (isStealAttempt) {
        console.log(`Steal attempt detected: Team ${buzzWinnerIndex + 1} stealing opportunity`);
      }
      
      // All guards passed - trigger celebration (same duration for regular and steal attempts)
      setCelebratingTeam(buzzWinnerIndex);
      
      // Set cleanup timeout with proper reference tracking (full 3 seconds)
      celebrationTimeoutRef.current = setTimeout(() => {
        setCelebratingTeam(null);
        celebrationTimeoutRef.current = null;
      }, 3000);
    }
    
    // Update previous state tracking
    setPrevBuzzWinner(buzzWinnerIndex);
  }, [buzzWinnerIndex, prevBuzzWinner, celebratingTeam, team1Strikes, team2Strikes, team3Strikes, team4Strikes, team5Strikes]);

  // Emergency cleanup function to force clear celebrations
  const forceCleanupCelebration = () => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    setCelebratingTeam(null);
  };

  // Validate celebration state consistency (prevent orphaned celebrations)
  useEffect(() => {
    if (celebratingTeam !== null) {
      // If celebrating team is now disabled, force cleanup
      if (isTeamDisabled(celebratingTeam)) {
        console.warn(`Force clearing celebration: Team ${celebratingTeam + 1} became disabled`);
        forceCleanupCelebration();
      }
      // If no buzzer winner but celebration active, cleanup
      else if (buzzWinnerIndex === null) {
        console.warn('Force clearing orphaned celebration: no active buzzer winner');
        forceCleanupCelebration();
      }
    }
  }, [celebratingTeam, buzzWinnerIndex]);

  // Check for score changes and trigger animations
  useEffect(() => {
    const currentScores = {
      team1: team1Score,
      team2: team2Score,
      team3: team3Score,
      team4: team4Score,
      team5: team5Score,
    };

    const newAnimatingTeams = new Set<number>();

    (Object.entries(currentScores) as Array<[keyof typeof currentScores, number]>).forEach(([key, current]) => {
      const prev = prevScores[key];
      if (current > prev) {
        const teamNumber =
          key === 'team1' ? 1 :
          key === 'team2' ? 2 :
          key === 'team3' ? 3 :
          key === 'team4' ? 4 : 5;
        newAnimatingTeams.add(teamNumber);
      }
    });

    if (newAnimatingTeams.size > 0) {
      setAnimatingTeams(newAnimatingTeams);
      const t = setTimeout(() => setAnimatingTeams(new Set()), 2000);
      return () => clearTimeout(t);
    }

    setPrevScores(currentScores);
  }, [team1Score, team2Score, team3Score, team4Score, team5Score]);

  // Sound effect refs
  const intenseAudioRef = useRef<HTMLAudioElement | null>(null);
  const winningRoundAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    intenseAudioRef.current = new Audio('/src/assets/intense.mp3');
    winningRoundAudioRef.current = new Audio('/src/assets/winning_round.mp3');

    // Set volume levels
    if (intenseAudioRef.current) intenseAudioRef.current.volume = 0.7;
    if (winningRoundAudioRef.current) winningRoundAudioRef.current.volume = 0.8;

    return () => {
      // Cleanup audio elements
      if (intenseAudioRef.current) {
        intenseAudioRef.current.pause();
        intenseAudioRef.current = null;
      }
      if (winningRoundAudioRef.current) {
        winningRoundAudioRef.current.pause();
        winningRoundAudioRef.current = null;
      }
    };
  }, []);

  // Listen for sound triggers from database
  const lastSoundTimestamps = useRef({
    intense: null as string | null,
    winning: null as string | null,
    stop: null as string | null
  });

  useEffect(() => {
    if (!gameId) return;

    const pollSoundTriggers = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('play_intense_sound_at, play_winning_sound_at, stop_sounds_at')
          .eq('id', gameId)
          .single();

        if (error) {
          console.error('Error polling sound triggers:', error);
          return;
        }

        // Check for intense sound trigger
        if (data.play_intense_sound_at && data.play_intense_sound_at !== lastSoundTimestamps.current.intense) {
          lastSoundTimestamps.current.intense = data.play_intense_sound_at;
          if (intenseAudioRef.current) {
            intenseAudioRef.current.currentTime = 0;
            intenseAudioRef.current.play().catch(e => console.log('Error playing intense sound:', e));
          }
        }

        // Check for winning sound trigger
        if (data.play_winning_sound_at && data.play_winning_sound_at !== lastSoundTimestamps.current.winning) {
          lastSoundTimestamps.current.winning = data.play_winning_sound_at;
          if (winningRoundAudioRef.current) {
            winningRoundAudioRef.current.currentTime = 0;
            winningRoundAudioRef.current.play().catch(e => console.log('Error playing winning sound:', e));
          }
        }

        // Check for stop sounds trigger
        if (data.stop_sounds_at && data.stop_sounds_at !== lastSoundTimestamps.current.stop) {
          lastSoundTimestamps.current.stop = data.stop_sounds_at;
          if (intenseAudioRef.current) {
            intenseAudioRef.current.pause();
            intenseAudioRef.current.currentTime = 0;
          }
          if (winningRoundAudioRef.current) {
            winningRoundAudioRef.current.pause();
            winningRoundAudioRef.current.currentTime = 0;
          }
        }
      } catch (error) {
        console.error('Error polling sound triggers:', error);
      }
    };

    // Poll every 500ms for sound triggers
    const interval = setInterval(pollSoundTriggers, 500);

    return () => clearInterval(interval);
  }, [gameId]);

  const handleAnswerClick = (index: number) => {
    if (!answers[index]?.revealed) {
      onRevealAnswer(index);
    }
  };

  // Helper function to get team name by index (0-4)
  const getTeamName = (teamIndex: number): string => {
    switch (teamIndex) {
      case 0: return team1Name || 'Team 1';
      case 1: return team2Name || 'Team 2';
      case 2: return team3Name || 'Team 3';
      case 3: return team4Name || 'Team 4';
      case 4: return team5Name || 'Team 5';
      default: return `Team ${teamIndex + 1}`;
    }
  };

  // Helper function to check if team is disabled due to 3+ strikes
  const isTeamDisabled = (teamIndex: number): boolean => {
    const teamStrikesArray = [team1Strikes, team2Strikes, team3Strikes, team4Strikes, team5Strikes];
    return teamStrikesArray[teamIndex] >= 3;
  };

  const teamHighlight = (teamIndex: number, base: string) => {
    // Check if team is disabled first
    const disabled = isTeamDisabled(teamIndex);
    if (disabled) {
      return base + ' opacity-30 grayscale cursor-not-allowed border-gray-500';
    }
    
    if (!arduinoConnected) return base;
    
    // Check if this team is celebrating (locked in)
    const isCelebrating = celebratingTeam === teamIndex;
    
    // If a winner is locked, show only that team highlighted
    if (buzzWinnerIndex !== null && buzzWinnerIndex !== undefined) {
      if (buzzWinnerIndex === teamIndex) {
        const celebrationStyles = isCelebrating 
          ? ' ring-8 ring-yellow-300 animate-pulse shadow-[0_0_25px_rgba(255,255,0,0.9)] scale-105 border-yellow-200' 
          : ' ring-4 ring-white animate-pulse shadow-[0_0_18px_rgba(255,255,255,0.8)]';
        return base + celebrationStyles;
      }
      return base + ' opacity-70';
    }
    // Otherwise, live-echo pressed buttons and briefly flash last press
    const active = !!buttonStates[teamIndex];
    const winnerFlash = lastPressedIndex === teamIndex;
    if (winnerFlash) {
      return base + ' ring-4 ring-white animate-pulse';
    }
    if (active) {
      return base + ' ring-4 ring-yellow-300 shadow-[0_0_15px_rgba(255,255,0,0.7)]';
    }
    return base;
  };

  // Helper function to get team box classes with animation
  const getTeamBoxClasses = (teamNumber: number, baseClasses: string) => {
    const isAnimating = animatingTeams.has(teamNumber);
    const isCelebrating = celebratingTeam === (teamNumber - 1); // Convert 1-5 to 0-4 for comparison
    
    let classes = baseClasses;
    
    if (isCelebrating) {
      classes += ' animate-pulse scale-110 ring-8 ring-yellow-300 shadow-yellow-400/80 shadow-2xl border-yellow-200';
    } else if (isAnimating) {
      classes += ' animate-bounce shadow-yellow-400/50 shadow-2xl scale-110 border-yellow-300';
    }
    
    return classes;
  };

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
      {/* Background Pattern */}
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

      {/* Ambient glows */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-300/20 via-yellow-400/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-radial from-orange-300/20 via-orange-400/10 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-radial from-red-300/15 via-red-400/8 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-radial from-blue-300/15 via-blue-400/8 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 max-h-full p-2 sm:p-4">
          {/* Top row: Teams 1&3 left, 2&4 right */}
          <div className="w-full max-w-7xl flex justify-between items-center mb-4 sm:mb-6">
            {/* Left: Team 1 & 3 */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Team 1 */}
              <div className={teamHighlight(0, "bg-gradient-to-br from-red-700 to-red-800 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-20 sm:w-28 lg:w-36 xl:w-40 h-24 sm:h-32 lg:h-40 xl:h-44 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
                <div className={getTeamBoxClasses(1, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
                <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
                <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1">
                  {team1Name || 'Team 1'}
                </div>
                <div className="text-yellow-400 font-black text-lg sm:text-2xl lg:text-3xl xl:text-4xl drop-shadow-2xl z-10 mb-1">
                  {team1Score}
                </div>
                <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg z-10 mb-1">POINTS</div>
                <div className="flex gap-1 z-10">
                  {Array.from({ length: team1Strikes }, (_, i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold animate-pulse">✕</div>
                  ))}
                </div>
              </div>

              {/* Team 3 */}
              <div className={teamHighlight(2, "bg-gradient-to-br from-green-700 to-green-800 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-20 sm:w-28 lg:w-36 xl:w-40 h-24 sm:h-32 lg:h-40 xl:h-44 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
                <div className={getTeamBoxClasses(3, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
                <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
                <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1">
                  {team3Name || 'Team 3'}
                </div>
                <div className="text-yellow-400 font-black text-lg sm:text-2xl lg:text-3xl xl:text-4xl drop-shadow-2xl z-10 mb-1">
                  {team3Score}
                </div>
                <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg z-10 mb-1">POINTS</div>
                <div className="flex gap-1 z-10">
                  {Array.from({ length: team3Strikes }, (_, i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold animate-pulse">✕</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer board */}
            <div className="flex-1 max-w-2xl lg:max-w-3xl mx-6 sm:mx-8 lg:mx-10 ml-20 sm:ml-28 lg:ml-36">
              <div className="relative bg-gradient-to-br from-blue-700 to-blue-800 rounded-full border-4 sm:border-6 lg:border-8 border-yellow-400 shadow-2xl p-4 sm:p-6 lg:p-8" style={{ aspectRatio: '4/3', maxHeight: '55vh' }}>
                <div className="absolute inset-3 sm:inset-4 lg:inset-6 border-2 sm:border-3 lg:border-4 border-dotted border-yellow-300 rounded-full"></div>
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
                    {/* Left column 1-4 */}
                    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                      {answers.slice(0, 4).map((answer, index) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer transition-all duration-300 ${answer.revealed ? 'transform scale-105' : 'hover:scale-105'}`}
                          onClick={() => handleAnswerClick(index)}
                        >
                          <div className={`flex items-center justify-between h-8 sm:h-10 lg:h-12 xl:h-14 px-3 sm:px-4 lg:px-5 rounded-lg border-2 ${
                            answer.revealed
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-white text-white shadow-xl'
                              : 'bg-gradient-to-r from-blue-800 to-blue-900 border-blue-600 text-gray-300 hover:bg-blue-700'
                          }`}>
                            <div className="flex items-center flex-1">
                              <span className="font-bold text-sm sm:text-base lg:text-lg uppercase tracking-wide">
                                {answer.revealed ? answer.text : `${index + 1}`}
                              </span>
                            </div>
                            <div className="bg-blue-900 px-2 sm:px-3 lg:px-4 py-1 rounded border-l-2 border-blue-600 min-w-[30px] sm:min-w-[40px] lg:min-w-[50px] text-center">
                              <span className="font-black text-sm sm:text-base lg:text-lg">
                                {answer.revealed ? answer.points : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right column 5-8 */}
                    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                      {answers.slice(4, 8).map((answer, index) => (
                        <div
                          key={index + 4}
                          className={`relative cursor-pointer transition-all duration-300 ${answer.revealed ? 'transform scale-105' : 'hover:scale-105'}`}
                          onClick={() => handleAnswerClick(index + 4)}
                        >
                          <div className={`flex items-center justify-between h-8 sm:h-10 lg:h-12 xl:h-14 px-3 sm:px-4 lg:px-5 rounded-lg border-2 ${
                            answer.revealed
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-white text-white shadow-xl'
                              : 'bg-gradient-to-r from-blue-800 to-blue-900 border-blue-600 text-gray-300 hover:bg-blue-700'
                          }`}>
                            <div className="flex items-center flex-1">
                              <span className="font-bold text-sm sm:text-base lg:text-lg uppercase tracking-wide">
                                {answer.revealed ? answer.text : `${index + 5}`}
                              </span>
                            </div>
                            <div className="bg-blue-900 px-2 sm:px-3 lg:px-4 py-1 rounded border-l-2 border-blue-600 min-w-[30px] sm:min-w-[40px] lg:min-w-[50px] text-center">
                              <span className="font-black text-sm sm:text-base lg:text-lg">
                                {answer.revealed ? answer.points : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Team 2 & 4 */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Team 2 */}
              <div className={teamHighlight(1, "bg-gradient-to-br from-blue-700 to-blue-800 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-20 sm:w-28 lg:w-36 xl:w-40 h-24 sm:h-32 lg:h-40 xl:h-44 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
                <div className={getTeamBoxClasses(2, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
                <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
                <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1">
                  {team2Name || 'Team 2'}
                </div>
                <div className="text-yellow-400 font-black text-lg sm:text-2xl lg:text-3xl xl:text-4xl drop-shadow-2xl z-10 mb-1">
                  {team2Score}
                </div>
                <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg z-10 mb-1">POINTS</div>
                <div className="flex gap-1 z-10">
                  {Array.from({ length: team2Strikes }, (_, i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold animate-pulse">✕</div>
                  ))}
                </div>
              </div>

              {/* Team 4 */}
              <div className={teamHighlight(3, "bg-gradient-to-br from-red-900 to-red-950 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-20 sm:w-28 lg:w-36 xl:w-40 h-24 sm:h-32 lg:h-40 xl:h-44 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
                <div className={getTeamBoxClasses(4, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
                <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
                <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1">
                  {team4Name || 'Team 4'}
                </div>
                <div className="text-yellow-400 font-black text-lg sm:text-2xl lg:text-3xl xl:text-4xl drop-shadow-2xl z-10 mb-1">
                  {team4Score}
                </div>
                <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg z-10 mb-1">POINTS</div>
                <div className="flex gap-1 z-10">
                  {Array.from({ length: team4Strikes }, (_, i) => (
                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold animate-pulse">✕</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team 5 at bottom */}
          <div className="flex justify-center mt-4 sm:mt-6">
            <div className={teamHighlight(4, "bg-gradient-to-br from-yellow-600 to-yellow-700 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-24 sm:w-32 lg:w-40 xl:w-44 h-20 sm:h-24 lg:h-28 xl:h-32 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
              <div className={getTeamBoxClasses(5, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
              <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
              <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1">
                {team5Name || 'Team 5'}
              </div>
              <div className="text-yellow-400 font-black text-lg sm:text-2xl lg:text-3xl xl:text-4xl drop-shadow-2xl z-10 mb-1">
                {team5Score}
              </div>
              <div className="text-white font-bold text-xs sm:text-sm drop-shadow-lg z-10 mb-1">POINTS</div>
              <div className="flex gap-1 z-10">
                {Array.from({ length: team5Strikes }, (_, i) => (
                  <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold animate-pulse">✕</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Strike Animation Overlay */}
      {showStrikeAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-red-600 bg-opacity-95 animate-pulse">
          <div className="absolute inset-0 bg-red-700 animate-ping"></div>
          <div className="relative z-10 text-white text-[25rem] font-black drop-shadow-2xl animate-bounce transform scale-110">
            ✕
          </div>
        </div>
      )}

      {/* Celebration Animation Overlay for Buzzer Lock-in */}
      {celebratingTeam !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Burst effect background */}
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-yellow-300/20 to-transparent animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-radial from-orange-400/20 via-orange-300/10 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Central celebration message */}
          <div className="relative z-10 text-center">
            <div className="text-yellow-300 text-8xl font-black drop-shadow-2xl animate-bounce mb-4">
              🎉
            </div>
            <div className="text-white text-6xl font-black drop-shadow-2xl animate-pulse">
              {getTeamName(celebratingTeam).toUpperCase()} LOCKED IN!
            </div>
            <div className="text-yellow-400 text-4xl font-bold drop-shadow-lg animate-bounce mt-4" style={{ animationDelay: '0.3s' }}>
              🔥 GET READY! 🔥
            </div>
          </div>
          
          {/* Sparkle effects around the edges */}
          <div className="absolute top-10 left-10 text-yellow-300 text-6xl animate-ping">✨</div>
          <div className="absolute top-20 right-20 text-yellow-300 text-5xl animate-pulse" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute bottom-20 left-20 text-yellow-300 text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
          <div className="absolute bottom-10 right-10 text-yellow-300 text-6xl animate-ping" style={{ animationDelay: '0.6s' }}>✨</div>
          
          {/* Corner burst effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-yellow-400/40 to-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-orange-400/40 to-transparent animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-red-400/40 to-transparent animate-spin" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-blue-400/40 to-transparent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
