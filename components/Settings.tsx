
import React from 'react';
import { GameSettings, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (settings: GameSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClose }) => {
  const t = TRANSLATIONS[settings.language];

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const updateSoundEffect = (key: keyof GameSettings['soundEffects'], value: boolean) => {
    onUpdate({
      ...settings,
      soundEffects: { ...settings.soundEffects, [key]: value }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border-8 border-yellow-400">
        <div className="bg-yellow-400 p-4 text-center">
          <h2 className="text-3xl font-fredoka text-white drop-shadow-md">{t.settings}</h2>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-bold text-gray-700">
          {/* Language */}
          <div className="flex items-center justify-between">
            <span>{t.language}</span>
            <div className="flex gap-2">
              {(['en', 'pt'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => updateSetting('language', lang)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    settings.language === lang 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-gray-200'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span>{t.volume}</span>
              <span>{settings.volume}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={settings.volume}
              onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Sound Toggles */}
          <div className="space-y-3">
            <span className="text-sm uppercase text-gray-400 tracking-wider">{t.sounds}</span>
            <Toggle 
              label={t.countdownSound} 
              checked={settings.soundEffects.countdown} 
              onChange={(v) => updateSoundEffect('countdown', v)} 
            />
            <Toggle 
              label={t.turbineSound} 
              checked={settings.soundEffects.turbine} 
              onChange={(v) => updateSoundEffect('turbine', v)} 
            />
            <Toggle 
              label={t.jetSound} 
              checked={settings.soundEffects.jet} 
              onChange={(v) => updateSoundEffect('jet', v)} 
            />
          </div>

          {/* Gameplay Options */}
          <div className="space-y-3">
            <Toggle 
              label={t.autoRestart} 
              checked={settings.autoRestart} 
              onChange={(v) => updateSetting('autoRestart', v)} 
            />
            <Toggle 
              label={t.obstacleCollision} 
              checked={settings.obstacleCollision} 
              onChange={(v) => updateSetting('obstacleCollision', v)} 
            />
            <Toggle 
              label={t.shooting} 
              checked={settings.shooting} 
              onChange={(v) => updateSetting('shooting', v)} 
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-12 py-3 rounded-2xl font-fredoka text-xl hover:bg-green-600 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span>{label}</span>
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <div className={`w-12 h-7 rounded-full transition-colors ${checked ? 'bg-green-400' : 'bg-gray-300'}`}></div>
      <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

export default Settings;
