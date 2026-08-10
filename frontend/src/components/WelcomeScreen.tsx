import React, { useEffect, useRef } from 'react';
import welcomeImage from '../assets/1758200122303.jpg';
import themeSong from '../assets/Family Feud Theme Song (Harvey era).mp3';

interface WelcomeScreenProps {
  onStartGame: () => void;
  onSettings: () => void;
  onAdmin: () => void;
  onHostControl: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame, onSettings, onAdmin, onHostControl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Start playing background music when component mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.loop = true; // Loop the music
      audioRef.current.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
        // Handle autoplay restrictions by modern browsers
      });
    }

    // Cleanup function to stop music when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden flex items-center justify-center relative">
      {/* Background Music */}
      <audio
        ref={audioRef}
        src={themeSong}
        preload="auto"
      />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ 
          backgroundImage: `url(${welcomeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center px-8 pb-12">
        
        {/* All Buttons Container - Positioned at Bottom */}
        <div className="flex flex-col items-center gap-6">
          
          {/* START Button with Enhanced Game Show UI */}
          <div className="relative group">
            {/* Button glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur opacity-75 group-hover:opacity-100 group-active:opacity-100 transition duration-300"></div>
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 group-active:animate-ping transition-opacity duration-150"></div>
            
            {/* Main button */}
            <button
              onClick={onStartGame}
              className="relative bg-gradient-to-b from-blue-700 to-blue-900 border-4 border-yellow-400 text-white font-black text-2xl md:text-3xl px-16 py-4 rounded-full shadow-2xl transform group-hover:scale-105 group-active:scale-95 transition-all duration-200 animate-bounce group-focus:animate-none group-active:animate-none focus:outline-none"
              style={{ animationDuration: '2s' }}
            >
              <span className="text-yellow-300 drop-shadow-lg flex items-center justify-center space-x-2">
                <span className="transform group-active:rotate-12 transition-transform duration-150">⭐</span>
                <span className="transform group-active:scale-110 transition-transform duration-150">START</span>
                <span className="transform group-active:-rotate-12 transition-transform duration-150">⭐</span>
              </span>
              
              {/* Inner highlight effect */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Active state overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-600 to-blue-800 opacity-0 group-active:opacity-30 transition-opacity duration-75"></div>
            </button>
          </div>

          {/* Action Buttons - Settings, Admin, and Host Control */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={onSettings}
              className="bg-gradient-to-b from-gray-700/80 to-gray-900/80 backdrop-blur-md border-3 border-blue-400 text-blue-300 font-bold text-lg px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 hover:border-blue-300"
            >
              ⚙️ Settings
            </button>
            
            <button
              onClick={onAdmin}
              className="bg-gradient-to-b from-orange-600/80 to-orange-800/80 backdrop-blur-md border-3 border-yellow-400 text-yellow-200 font-bold text-lg px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 hover:border-yellow-300"
            >
              🎮 Create Games
            </button>

            <button
              onClick={onHostControl}
              className="bg-gradient-to-b from-purple-600/80 to-purple-800/80 backdrop-blur-md border-3 border-pink-400 text-pink-200 font-bold text-lg px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 hover:border-pink-300"
            >
              🎛️ Host Control
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
