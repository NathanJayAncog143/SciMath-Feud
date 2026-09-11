import React, { useEffect, useRef, useState } from 'react';
import welcomeImage from '../assets/1758200122303.jpg';
import themeSong from '../assets/Family Feud Theme Song (Harvey era).mp3';

interface WelcomeScreenProps {
  onStartGame: () => void;
  onSettings: () => void;
  onAdmin: () => void;
  onHostControl: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onSettings,
  onAdmin,
  onHostControl
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playTheme = () => {
      audio.volume = 0.35;
      audio.loop = true;
      audio.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    };

    playTheme();

    const playThemeFromInteraction = () => {
      playTheme();
      window.removeEventListener('pointerdown', playThemeFromInteraction);
      window.removeEventListener('keydown', playThemeFromInteraction);
      window.removeEventListener('touchstart', playThemeFromInteraction);
    };

    window.addEventListener('pointerdown', playThemeFromInteraction, { once: true });
    window.addEventListener('keydown', playThemeFromInteraction, { once: true });
    window.addEventListener('touchstart', playThemeFromInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', playThemeFromInteraction);
      window.removeEventListener('keydown', playThemeFromInteraction);
      window.removeEventListener('touchstart', playThemeFromInteraction);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden flex flex-col justify-between items-center bg-gradient-to-b from-[#4a0808] via-[#240404] to-[#0d0101] select-none">
      {/* Background Music */}
      <audio ref={audioRef} src={themeSong} preload="auto" />

      {/* Atmospheric Background Layers */}
      <div 
        className="absolute inset-0 opacity-25 bg-center bg-cover pointer-events-none filter blur-xl scale-110"
        style={{ backgroundImage: `url(${welcomeImage})` }}
      />
      {/* Radial Spotlight & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.15)_0%,_rgba(180,20,20,0.25)_45%,_rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      
      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-ping"></span>
          <span className="text-yellow-400/90 text-sm font-semibold tracking-widest uppercase drop-shadow">
            Official Game Arena
          </span>
        </div>

        {/* Music Control Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Theme Song' : 'Mute Theme Song'}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-yellow-500/40 text-yellow-300 hover:bg-black/60 hover:border-yellow-400 hover:scale-105 active:scale-95 transition-all text-xs font-semibold backdrop-blur-md shadow-lg"
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span>{isMuted ? 'Sound OFF' : 'Music ON'}</span>
        </button>
      </header>

      {/* Main Center Stage: Logo Showcase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl">
        <div className="relative group flex items-center justify-center">
          {/* Outer Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-red-600/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
          
          {/* Logo Card with Golden Border and Shadow */}
          <div className="relative rounded-2xl md:rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-yellow-500/30 via-amber-700/20 to-black/60 backdrop-blur-sm border-2 md:border-4 border-yellow-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
            <img
              src={welcomeImage}
              alt="Sci-Math Feud"
              className="max-h-[42vh] sm:max-h-[48vh] md:max-h-[52vh] w-auto object-contain rounded-xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-[1.01]"
            />
          </div>
        </div>
      </main>

      {/* Bottom Control Deck */}
      <footer className="relative z-20 w-full max-w-3xl flex flex-col items-center gap-4 px-6 pb-6 pt-2">
        {/* Primary START Button */}
        <div className="relative group w-full max-w-sm">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-full blur-md opacity-80 group-hover:opacity-100 group-active:opacity-90 transition duration-300 animate-pulse"></div>
          
          <button
            onClick={onStartGame}
            className="relative w-full bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 border-4 border-yellow-400 text-yellow-300 font-black text-2xl sm:text-3xl py-3.5 sm:py-4 px-8 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] transform group-hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none flex items-center justify-center gap-3 tracking-wider cursor-pointer"
          >
            <span className="transform group-hover:rotate-12 transition-transform duration-200">⭐</span>
            <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">START GAME</span>
            <span className="transform group-hover:-rotate-12 transition-transform duration-200">⭐</span>
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
          <button
            onClick={onSettings}
            className="flex items-center gap-2 bg-gradient-to-b from-slate-800/90 to-slate-950/90 backdrop-blur-md border-2 border-blue-400/80 hover:border-blue-300 text-blue-200 hover:text-white font-bold text-sm sm:text-base px-5 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          <button
            onClick={onAdmin}
            className="flex items-center gap-2 bg-gradient-to-b from-amber-700/90 to-amber-950/90 backdrop-blur-md border-2 border-yellow-400/80 hover:border-yellow-300 text-yellow-200 hover:text-white font-bold text-sm sm:text-base px-5 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>🎮</span>
            <span>Create Games</span>
          </button>

          <button
            onClick={onHostControl}
            className="flex items-center gap-2 bg-gradient-to-b from-purple-800/90 to-purple-950/90 backdrop-blur-md border-2 border-pink-400/80 hover:border-pink-300 text-pink-200 hover:text-white font-bold text-sm sm:text-base px-5 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>🎛️</span>
            <span>Host Control</span>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default WelcomeScreen;

