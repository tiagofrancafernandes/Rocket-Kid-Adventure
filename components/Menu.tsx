
import React from 'react';
import { GameSettings, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface MenuProps {
  settings: GameSettings;
  onPlay: () => void;
  onOpenSettings: () => void;
  highScore: number;
}

const Menu: React.FC<MenuProps> = ({ settings, onPlay, onOpenSettings, highScore }) => {
  const t = TRANSLATIONS[settings.language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-400 to-indigo-600">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl animate-bounce" />
      
      {/* Floating Rocket Decoration */}
      <div className="mb-8 animate-bounce transition-all duration-1000">
        <div className="w-24 h-40 bg-red-500 rounded-t-full relative shadow-xl border-4 border-white">
           <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-200 rounded-full border-2 border-white" />
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-orange-500 rounded-b-xl" />
        </div>
      </div>

      <h1 className="text-6xl md:text-8xl font-fredoka text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mb-4 text-center px-4">
        {t.title}
      </h1>

      <div className="bg-black/30 backdrop-blur-md px-8 py-4 rounded-3xl mb-12 border-2 border-white/20">
        <p className="text-2xl font-fredoka text-yellow-300">
          {t.highScore}: {highScore}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onPlay}
          className="bg-green-500 hover:bg-green-600 text-white font-fredoka text-3xl py-6 rounded-3xl shadow-[0_10px_0_#228B22] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
        >
          <i className="fas fa-play"></i> {t.play}
        </button>

        <button
          onClick={onOpenSettings}
          className="bg-blue-500 hover:bg-blue-600 text-white font-fredoka text-2xl py-4 rounded-3xl shadow-[0_8px_0_#1E90FF] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
        >
          <i className="fas fa-cog"></i> {t.settings}
        </button>
      </div>

      <p className="mt-12 text-white/60 font-bold uppercase tracking-widest text-sm">
        Use Arrows & Space to Play
      </p>
    </div>
  );
};

export default Menu;
