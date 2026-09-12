import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import themeSong from '../assets/Family Feud Theme Song (Harvey era).mp3';
import intenseSound from '../assets/intense.mp3';
import winningRoundSound from '../assets/winning_round.mp3';
import buzzerSound from '../assets/family-feud-answer-buzzer.mp3';
import playerPressSound from '../assets/player_press.mp3';

import cteLogo from '../assets/cte_logo.png';
import ctechLogo from '../assets/ctech_logo.jpg';
import coasLogo from '../assets/coas_logo.jpg';
import cbmLogo from '../assets/cbm_logo.jpg';
import cfesLogo from '../assets/cfes_logo.jpg';

const DEFAULT_LOGOS = [cteLogo, ctechLogo, coasLogo, cbmLogo, cfesLogo];

function getTeamLogo(teamName?: string, teamIndex: number = 0): string {
  // Always prioritise the actual team NAME so logos follow the college, not the slot
  if (teamName) {
    const upper = teamName.toUpperCase().trim();
    if (upper.includes('CTECH') || upper.includes('TECHNOLOGY')) return ctechLogo;
    if (upper.includes('CTE') || upper.includes('TEACHER')) return cteLogo;
    if (upper.includes('COAS') || upper.includes('AGRICULTUR')) return coasLogo;
    if (upper.includes('CBM') || upper.includes('BUSINESS') || upper.includes('MANAGEMENT')) return cbmLogo;
    if (upper.includes('CFES') || upper.includes('FORESTRY') || upper.includes('ENVIRONMENT')) return cfesLogo;
  }

  // Fallback: use default order by slot index
  return DEFAULT_LOGOS[teamIndex] ?? cteLogo;
}


interface CollegeTheme {
  name: string;
  shortName: string;
  emojis: string[];
  motto: string;
  cardBg: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

const COLLEGE_THEMES: Record<number, CollegeTheme> = {
  0: {
    name: 'College of Teacher Education',
    shortName: 'CTE',
    emojis: ['🎓', '📚', '🍎', '💡', '✍️', '🏆', '⚡', '🔒'],
    motto: 'Molding Future Educators & Leaders!',
    cardBg: 'from-rose-950/95 via-red-900/98 to-slate-950/95',
    badgeBg: 'from-amber-400 via-rose-400 to-red-500',
    textColor: 'text-amber-300',
    borderColor: 'border-yellow-400',
    glowColor: 'rgba(244,63,94,0.95)',
  },
  1: {
    name: 'College of Technology',
    shortName: 'CTECH',
    emojis: ['💻', '🤖', '⚙️', '🚀', '🔧', '🏆', '⚡', '🔒'],
    motto: 'Innovating Technology & Engineering!',
    cardBg: 'from-slate-950/95 via-blue-950/98 to-cyan-950/95',
    badgeBg: 'from-cyan-400 via-sky-300 to-blue-500',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-400',
    glowColor: 'rgba(6,182,212,0.95)',
  },
  2: {
    name: 'College of Agricultural Sciences',
    shortName: 'COAS',
    emojis: ['🌾', '🌱', '🚜', '🌳', '🍃', '🏆', '⚡', '🔒'],
    motto: 'Nurturing Agriculture & Life Sciences!',
    cardBg: 'from-slate-950/95 via-emerald-950/98 to-green-950/95',
    badgeBg: 'from-emerald-400 via-green-300 to-lime-400',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-400',
    glowColor: 'rgba(16,185,129,0.95)',
  },
  3: {
    name: 'College of Business & Management',
    shortName: 'CBM',
    emojis: ['💼', '📊', '📈', '💰', '💵', '🏆', '⚡', '🔒'],
    motto: 'Empowering Business Leaders & Entrepreneurs!',
    cardBg: 'from-slate-950/95 via-purple-950/98 to-indigo-950/95',
    badgeBg: 'from-purple-400 via-indigo-300 to-amber-400',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168,85,247,0.95)',
  },
  4: {
    name: 'College of Forestry & Environmental Sciences',
    shortName: 'CFES',
    emojis: ['🌲', '🦅', '🦉', '🌿', '⛰️', '🏆', '⚡', '🔒'],
    motto: 'Protecting Nature & Forestry Excellence!',
    cardBg: 'from-slate-950/95 via-amber-950/98 to-yellow-950/95',
    badgeBg: 'from-yellow-400 via-amber-400 to-emerald-500',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-400',
    glowColor: 'rgba(234,179,8,0.95)',
  },
};

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
  question?: string;
  onRevealAnswer: (index: number) => void;
  // Arduino integration
  arduinoConnected?: boolean;
  buttonStates?: boolean[]; // index 0..4 for teams 1..5
  lastPressedIndex?: number | null;
  buzzWinnerIndex?: number | null;
  onResetBuzzer?: () => void;
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
  question,
  onRevealAnswer,
  arduinoConnected = false,
  buttonStates = [false, false, false, false, false],
  lastPressedIndex = null,
  buzzWinnerIndex = null,
  onResetBuzzer,
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
      playHostSound(buzzerAudioRef.current, 'buzzer');
      
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
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const intenseAudioRef = useRef<HTMLAudioElement | null>(null);
  const winningRoundAudioRef = useRef<HTMLAudioElement | null>(null);
  const buzzerAudioRef = useRef<HTMLAudioElement | null>(null);
  const playerPressAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeEffectAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    themeAudioRef.current = new Audio(themeSong);
    intenseAudioRef.current = new Audio(intenseSound);
    winningRoundAudioRef.current = new Audio(winningRoundSound);
    buzzerAudioRef.current = new Audio(buzzerSound);
    playerPressAudioRef.current = new Audio(playerPressSound);

    // Set volume levels
    if (themeAudioRef.current) {
      themeAudioRef.current.volume = 0.25;
      themeAudioRef.current.loop = true;
    }
    if (intenseAudioRef.current) intenseAudioRef.current.volume = 0.7;
    if (winningRoundAudioRef.current) winningRoundAudioRef.current.volume = 0.8;
    if (buzzerAudioRef.current) buzzerAudioRef.current.volume = 0.9;
    if (playerPressAudioRef.current) playerPressAudioRef.current.volume = 0.8;
    if (intenseAudioRef.current) intenseAudioRef.current.loop = true;

    return () => {
      // Cleanup audio elements
      if (themeAudioRef.current) {
        themeAudioRef.current.pause();
        themeAudioRef.current = null;
      }
      if (intenseAudioRef.current) {
        intenseAudioRef.current.pause();
        intenseAudioRef.current = null;
      }
      if (winningRoundAudioRef.current) {
        winningRoundAudioRef.current.pause();
        winningRoundAudioRef.current = null;
      }
      if (buzzerAudioRef.current) {
        buzzerAudioRef.current.pause();
        buzzerAudioRef.current = null;
      }
      if (playerPressAudioRef.current) {
        playerPressAudioRef.current.pause();
        playerPressAudioRef.current = null;
      }
    };
  }, []);

  const playThemeSong = () => {
    if (!themeAudioRef.current || activeEffectAudioRef.current) return;

    themeAudioRef.current
      .play()
      .then(() => setAudioUnlocked(true))
      .catch(error => {
        console.log('Could not play Family Feud theme:', error);
      });
  };

  const pauseThemeSong = () => {
    if (!themeAudioRef.current) return;
    themeAudioRef.current.pause();
  };

  const stopAudio = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const playHostSound = (audio: HTMLAudioElement | null, label: string) => {
    if (!audio) return;

    pauseThemeSong();
    stopAudio(activeEffectAudioRef.current);
    activeEffectAudioRef.current = audio;
    audio.onended = () => {
      if (activeEffectAudioRef.current !== audio) return;
      activeEffectAudioRef.current = null;
      playThemeSong();
    };

    audio.currentTime = 0;
    audio.play().catch(error => {
      console.log(`Error playing ${label} sound:`, error);
      if (activeEffectAudioRef.current === audio) {
        activeEffectAudioRef.current = null;
      }
      playThemeSong();
    });
  };

  const unlockAudio = async () => {
    const audioElements = [themeAudioRef.current, intenseAudioRef.current, winningRoundAudioRef.current].filter(Boolean) as HTMLAudioElement[];

    try {
      await Promise.all(audioElements.map(async (audio) => {
        audio.muted = true;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }));
      setAudioUnlocked(true);
      playThemeSong();
    } catch (error) {
      console.log('Audio unlock was blocked:', error);
      audioElements.forEach((audio) => {
        audio.muted = false;
      });
    }
  };

  useEffect(() => {
    playThemeSong();
  }, []);

  useEffect(() => {
    const unlockFromInteraction = () => {
      unlockAudio();
    };

    window.addEventListener('pointerdown', unlockFromInteraction, { once: true });
    window.addEventListener('keydown', unlockFromInteraction, { once: true });
    window.addEventListener('touchstart', unlockFromInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockFromInteraction);
      window.removeEventListener('keydown', unlockFromInteraction);
      window.removeEventListener('touchstart', unlockFromInteraction);
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
          playHostSound(intenseAudioRef.current, 'intense');
        }

        // Check for winning sound trigger
        if (data.play_winning_sound_at && data.play_winning_sound_at !== lastSoundTimestamps.current.winning) {
          lastSoundTimestamps.current.winning = data.play_winning_sound_at;
          playHostSound(winningRoundAudioRef.current, 'winning');
        }

        // Check for stop sounds trigger
        if (data.stop_sounds_at && data.stop_sounds_at !== lastSoundTimestamps.current.stop) {
          lastSoundTimestamps.current.stop = data.stop_sounds_at;
          stopAudio(intenseAudioRef.current);
          stopAudio(winningRoundAudioRef.current);
          activeEffectAudioRef.current = null;
          playThemeSong();
        }
      } catch (error) {
        console.error('Error polling sound triggers:', error);
      }
    };

    // Poll every 500ms for sound triggers
    pollSoundTriggers();
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

  // Check if this team is the current buzzer winner
  const isWinner = buzzWinnerIndex === teamIndex;

  if (isWinner) {
    return base + `
      !from-gray-950 !via-gray-900 !to-black
      border-yellow-200
      ring-8 ring-yellow-300
      shadow-[0_0_35px_rgba(255,220,0,0.95)]
      scale-105
      animate-pulse
      z-30
    `;
  }

  // If another team already won, slightly dim this team
  if (buzzWinnerIndex !== null && buzzWinnerIndex !== undefined) {
    return base + ' opacity-60';
  }

  // Live button feedback before a winner is locked
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

  const getTeamNameByIndex = (index: number | null | undefined) => {
    if (index === null || index === undefined) return '';
    switch (index) {
      case 0: return team1Name || 'CTE (College of Teacher Education)';
      case 1: return team2Name || 'CTECH (College of Technology)';
      case 2: return team3Name || 'COAS (College of Agricultural Sciences)';
      case 3: return team4Name || 'CBM (College of Business & Management)';
      case 4: return team5Name || 'CFES (College of Forestry & Environmental Sciences)';
      default: return `Team ${index + 1}`;
    }
  };

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
      {/* College Logo Lock-In Overlay Modal on top of the game board with visual effects & fitting emojis */}
      {(buzzWinnerIndex !== null && buzzWinnerIndex !== undefined && buzzWinnerIndex >= 0 && buzzWinnerIndex <= 4) && (() => {
        const theme = COLLEGE_THEMES[buzzWinnerIndex] || COLLEGE_THEMES[0];
        const collegeName = getTeamNameByIndex(buzzWinnerIndex);
        const teamLogo = getTeamLogo(collegeName, buzzWinnerIndex);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-md transition-all duration-300 animate-pop-in overflow-hidden">
            
            {/* Spinning Conic Ray / Light Beams Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div 
                className="w-[160vw] h-[160vw] animate-spin-slow rounded-full opacity-60"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(250, 204, 21, 0.4) 20deg, transparent 40deg, rgba(250, 204, 21, 0.4) 60deg, transparent 80deg, rgba(250, 204, 21, 0.4) 100deg, transparent 120deg, rgba(250, 204, 21, 0.4) 140deg, transparent 160deg, rgba(250, 204, 21, 0.4) 180deg, transparent 200deg, rgba(250, 204, 21, 0.4) 220deg, transparent 240deg, rgba(250, 204, 21, 0.4) 260deg, transparent 280deg, rgba(250, 204, 21, 0.4) 300deg, transparent 320deg, rgba(250, 204, 21, 0.4) 340deg, transparent 360deg)'
                }}
              />
            </div>

            {/* Radial Light Glow Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-500/30 via-blue-950/40 to-black/80 animate-pulse pointer-events-none" />

            {/* Floating Orbit Emojis around screen background */}
            <div className="absolute top-10 left-8 sm:left-14 text-4xl sm:text-5xl lg:text-6xl animate-float-around pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ animationDelay: '0s' }}>
              {theme.emojis[0]}
            </div>
            <div className="absolute top-12 right-10 sm:right-16 text-4xl sm:text-5xl lg:text-6xl animate-float-around pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ animationDelay: '0.5s' }}>
              {theme.emojis[1]}
            </div>
            <div className="absolute bottom-16 left-10 sm:left-16 text-4xl sm:text-5xl lg:text-6xl animate-float-around pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ animationDelay: '1s' }}>
              {theme.emojis[2]}
            </div>
            <div className="absolute bottom-14 right-12 sm:right-18 text-4xl sm:text-5xl lg:text-6xl animate-float-around pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ animationDelay: '1.5s' }}>
              {theme.emojis[3]}
            </div>

            <div className="absolute top-1/3 left-4 sm:left-12 text-3xl sm:text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}>
              ⚡
            </div>
            <div className="absolute top-1/3 right-4 sm:right-12 text-3xl sm:text-4xl animate-bounce pointer-events-none" style={{ animationDuration: '2.5s' }}>
              🔒
            </div>

            {/* Main Lock-In Floating Card */}
            <div className={`relative flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 bg-gradient-to-b ${theme.cardBg} rounded-3xl border-4 sm:border-6 ${theme.borderColor} shadow-[0_0_120px_rgba(250,204,21,0.95)] max-w-sm sm:max-w-md lg:max-w-xl w-[90vw] text-center transform transition-all duration-300 z-20`}>
              
              {/* Outer Dual Expanding Ripple Rings */}
              <div className="absolute -inset-4 rounded-3xl border-4 border-yellow-400 animate-ping opacity-50 pointer-events-none"></div>
              <div className="absolute -inset-8 rounded-3xl border-2 border-cyan-400 animate-pulse opacity-40 pointer-events-none"></div>

              {/* Top Glowing Header Badge */}
              <div className={`bg-gradient-to-r ${theme.badgeBg} text-slate-950 font-black px-6 sm:px-8 py-2 rounded-full text-xs sm:text-sm lg:text-base uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.9)] mb-3 animate-pulse flex items-center justify-center gap-2`}>
                <span>🚨</span>
                <span>⚡</span>
                <span>BUZZER LOCKED IN!</span>
                <span>⚡</span>
                <span>🚨</span>
              </div>

              {/* Crown Badge */}
              <div className="text-4xl sm:text-5xl -mb-3 z-20 animate-bounce">
                👑
              </div>

              {/* College Logo Image Container with Double Rotating Rings & Lock Badge */}
              <div className="relative my-3 flex items-center justify-center">
                {/* Rotating Outer Dashed Ring */}
                <div className="absolute -inset-5 rounded-full border-4 border-dashed border-yellow-300 animate-spin-slow pointer-events-none"></div>
                {/* Reverse Rotating Inner Dotted Ring */}
                <div className="absolute -inset-2.5 rounded-full border-3 border-dotted border-cyan-300 animate-spin-reverse-slow pointer-events-none"></div>
                
                {/* Logo Frame */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full border-4 sm:border-6 border-yellow-300 shadow-[0_0_80px_rgba(255,255,255,1)] overflow-hidden bg-white p-2.5 flex items-center justify-center z-10 transform hover:scale-105 transition-transform">
                  <img
                    src={teamLogo}
                    alt={collegeName}
                    className="w-full h-full object-cover rounded-full shadow-inner transform scale-105"
                  />
                </div>

                {/* Overlaid Lock Badge on Logo */}
                <div className="absolute -bottom-3 z-30 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-blue-950 font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow-xl border-2 border-white animate-bounce flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>LOCKED IN</span>
                  <span>⚡</span>
                </div>
              </div>

              {/* College Name Display */}
              <div className="text-yellow-300 font-black text-2xl sm:text-3xl lg:text-4xl mt-4 tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] uppercase flex items-center justify-center gap-2">
                <span>🏆</span>
                <span>{theme.shortName}</span>
                <span>🏆</span>
              </div>

              {/* Full College Name */}
              <div className="text-white font-extrabold text-sm sm:text-base lg:text-lg mt-1 tracking-wide text-amber-200 opacity-95">
                {collegeName}
              </div>

              {/* College Motto */}
              <div className="text-cyan-200 text-xs sm:text-sm italic mt-1 font-semibold flex items-center justify-center gap-1">
                <span>{theme.emojis[0]}</span>
                <span>"{theme.motto}"</span>
                <span>{theme.emojis[1]}</span>
              </div>

              {/* Subtitle Status with Fitting Emojis */}
              <div className="bg-blue-950/80 border border-yellow-400/60 rounded-xl px-4 py-2 mt-4 text-yellow-200 font-black text-xs sm:text-sm lg:text-base tracking-wider flex items-center justify-center gap-2 shadow-inner">
                <span>⚡</span>
                <span>READY TO ANSWER THE QUESTION!</span>
                <span>🧠</span>
                <span>💡</span>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Current Question */}
      {question && (
        <div className="absolute top-3 left-[48%] -translate-x-1/2 z-40 max-w-[80vw] sm:max-w-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-blue-950/80 border-2 border-yellow-400 shadow-xl text-center">
          <span className="text-white font-bold text-sm sm:text-base lg:text-lg">
            {question}
          </span>
        </div>
      )}
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

      {/* Still Ambient Glows (No animation) */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-300/20 via-yellow-400/10 to-transparent rounded-full"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-radial from-orange-300/20 via-orange-400/10 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-radial from-red-300/15 via-red-400/8 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-radial from-blue-300/15 via-blue-400/8 to-transparent rounded-full"></div>
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
                
                {/* College Logo Badge */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-yellow-300 overflow-hidden bg-white p-0.5 shadow-md z-10 mb-0.5 flex items-center justify-center">
                  <img src={getTeamLogo(team1Name, 0)} alt={team1Name || 'CTE'} className="w-full h-full object-cover rounded-full transform scale-105" />
                </div>

                <div
                  className={`font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1 ${
                    buzzWinnerIndex === 0
                      ? 'text-yellow-200'
                      : 'text-white'
                  }`}
                >
                  {buzzWinnerIndex === 0 && (
                    <div className="text-yellow-300 text-[9px] sm:text-xs font-black animate-pulse mb-1 flex items-center justify-center gap-1">
                      <span>⚡</span> BUZZED FIRST! <span>⚡</span>
                    </div>
                  )}

                  {team1Name || 'CTE'}
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
                
                {/* College Logo Badge */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-yellow-300 overflow-hidden bg-white p-0.5 shadow-md z-10 mb-0.5 flex items-center justify-center">
                  <img src={getTeamLogo(team3Name, 2)} alt={team3Name || 'COAS'} className="w-full h-full object-cover rounded-full transform scale-105" />
                </div>

                <div
                  className={`font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1 ${
                    buzzWinnerIndex === 2
                      ? 'text-yellow-200'
                      : 'text-white'
                  }`}
                >
                  {buzzWinnerIndex === 2 && (
                    <div className="text-yellow-300 text-[9px] sm:text-xs font-black animate-pulse mb-1 flex items-center justify-center gap-1">
                      <span>⚡</span> BUZZED FIRST! <span>⚡</span>
                    </div>
                  )}

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
                          <div className={`flex items-center justify-between h-8 sm:h-10 lg:h-12 xl:h-14 px-3 sm:px-4 lg:px-5 rounded-lg border-2 overflow-hidden ${
                            answer.revealed
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-white text-white shadow-xl'
                              : 'bg-gradient-to-r from-blue-800 to-blue-900 border-blue-600 text-gray-300 hover:bg-blue-700'
                          }`}>
                            <div className="flex items-center flex-1 min-w-0 pr-2 overflow-hidden">
                              <span className={`font-bold uppercase tracking-wide break-words [word-break:break-word] line-clamp-2 leading-tight ${
                                answer.revealed && answer.text.length > 25
                                  ? 'text-[10px] sm:text-xs lg:text-sm'
                                  : answer.revealed && answer.text.length > 15
                                  ? 'text-xs sm:text-sm lg:text-base'
                                  : 'text-sm sm:text-base lg:text-lg'
                              }`}>
                                {answer.revealed ? answer.text : `${index + 1}`}
                              </span>
                            </div>
                            <div className="bg-blue-900 px-2 sm:px-3 lg:px-4 py-1 rounded border-l-2 border-blue-600 min-w-[30px] sm:min-w-[40px] lg:min-w-[50px] text-center shrink-0 ml-2">
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
                          <div className={`flex items-center justify-between h-8 sm:h-10 lg:h-12 xl:h-14 px-3 sm:px-4 lg:px-5 rounded-lg border-2 overflow-hidden ${
                            answer.revealed
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-white text-white shadow-xl'
                              : 'bg-gradient-to-r from-blue-800 to-blue-900 border-blue-600 text-gray-300 hover:bg-blue-700'
                          }`}>
                            <div className="flex items-center flex-1 min-w-0 pr-2 overflow-hidden">
                              <span className={`font-bold uppercase tracking-wide break-words [word-break:break-word] line-clamp-2 leading-tight ${
                                answer.revealed && answer.text.length > 25
                                  ? 'text-[10px] sm:text-xs lg:text-sm'
                                  : answer.revealed && answer.text.length > 15
                                  ? 'text-xs sm:text-sm lg:text-base'
                                  : 'text-sm sm:text-base lg:text-lg'
                              }`}>
                                {answer.revealed ? answer.text : `${index + 5}`}
                              </span>
                            </div>
                            <div className="bg-blue-900 px-2 sm:px-3 lg:px-4 py-1 rounded border-l-2 border-blue-600 min-w-[30px] sm:min-w-[40px] lg:min-w-[50px] text-center shrink-0 ml-2">
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
                
                {/* College Logo Badge */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-yellow-300 overflow-hidden bg-white p-0.5 shadow-md z-10 mb-0.5 flex items-center justify-center">
                  <img src={getTeamLogo(team2Name, 1)} alt={team2Name || 'CTECH'} className="w-full h-full object-cover rounded-full transform scale-105" />
                </div>

                <div
                  className={`font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1 ${
                    buzzWinnerIndex === 1
                      ? 'text-yellow-200'
                      : 'text-white'
                  }`}
                >
                  {buzzWinnerIndex === 1 && (
                    <div className="text-yellow-300 text-[9px] sm:text-xs font-black animate-pulse mb-1 flex items-center justify-center gap-1">
                      <span>⚡</span> BUZZED FIRST! <span>⚡</span>
                    </div>
                  )}

                  {team2Name || 'CTECH'}
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
                
                {/* College Logo Badge */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-yellow-300 overflow-hidden bg-white p-0.5 shadow-md z-10 mb-0.5 flex items-center justify-center">
                  <img src={getTeamLogo(team4Name, 3)} alt={team4Name || 'CBM'} className="w-full h-full object-cover rounded-full transform scale-105" />
                </div>

                <div
                  className={`font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1 ${
                    buzzWinnerIndex === 3
                      ? 'text-yellow-200'
                      : 'text-white'
                  }`}
                >
                  {buzzWinnerIndex === 3 && (
                    <div className="text-yellow-300 text-[9px] sm:text-xs font-black animate-pulse mb-1 flex items-center justify-center gap-1">
                      <span>⚡</span> BUZZED FIRST! <span>⚡</span>
                    </div>
                  )}

                  {team4Name || 'CBM'}
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
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className={teamHighlight(4, "bg-gradient-to-br from-yellow-600 to-yellow-700 border-2 sm:border-3 lg:border-4 border-yellow-400 rounded-xl lg:rounded-2xl w-20 sm:w-28 lg:w-36 xl:w-40 h-24 sm:h-32 lg:h-40 xl:h-44 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-200")}>
              <div className={getTeamBoxClasses(5, "absolute inset-0 rounded-xl lg:rounded-2xl")}></div>
              <div className="absolute inset-1 sm:inset-2 border-2 border-dotted border-yellow-300 rounded-lg lg:rounded-xl"></div>
              
              {/* College Logo Badge */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-yellow-300 overflow-hidden bg-white p-0.5 shadow-md z-10 mb-0.5 flex items-center justify-center">
                <img src={getTeamLogo(team5Name, 4)} alt={team5Name || 'CFES'} className="w-full h-full object-cover rounded-full transform scale-105" />
              </div>

              <div
                className={`font-bold text-xs sm:text-sm lg:text-base xl:text-lg drop-shadow-lg z-10 mb-1 text-center px-1 ${
                  buzzWinnerIndex === 4
                    ? 'text-yellow-200'
                    : 'text-white'
                }`}
              >
                {buzzWinnerIndex === 4 && (
                  <div className="text-yellow-300 text-[9px] sm:text-xs font-black animate-pulse mb-1 flex items-center justify-center gap-1">
                    <span>⚡</span> BUZZED FIRST! <span>⚡</span>
                  </div>
                )}

                {team5Name || 'CFES'}
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
      {!audioUnlocked && (
        <button
          onClick={unlockAudio}
          className="fixed bottom-4 right-4 z-[60] bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-5 py-3 rounded-lg shadow-2xl border-2 border-white"
          title="Enable audio on this screen"
        >
          ENABLE AUDIO
        </button>
      )}

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
              {getTeamName(celebratingTeam).toUpperCase()} BUZZED FIRST!
            </div>
            <div className="text-yellow-400 text-4xl font-bold drop-shadow-lg animate-bounce mt-4" style={{ animationDelay: '0.3s' }}>
              ⚡ FIRST TO BUZZ! ⚡
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