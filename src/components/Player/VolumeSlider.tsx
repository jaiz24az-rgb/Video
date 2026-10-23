import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX, Volume, Zap } from 'lucide-react';

interface VolumeSliderProps {
  volume: number; // 0 to 2.0 (200% boost!)
  isMuted: boolean;
  onVolumeChange: (newVol: number) => void;
  onToggleMute: () => void;
  vertical?: boolean;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  vertical = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentLevel = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (isMuted || currentLevel === 0) return <VolumeX className="w-5 h-5 text-rose-400" />;
    if (currentLevel < 0.4) return <Volume className="w-5 h-5 text-neutral-300" />;
    if (currentLevel <= 1.0) return <Volume1 className="w-5 h-5 text-neutral-200" />;
    return <Volume2 className="w-5 h-5 text-rose-500 animate-pulse" />;
  };

  const percent = Math.round(currentLevel * 100);
  const isBoosted = currentLevel > 1.0;

  const toggle2xBoost = () => {
    if (currentLevel >= 1.95) {
      onVolumeChange(1.0); // Reset to normal 100%
    } else {
      onVolumeChange(2.0); // Boost to 200% (2x)
    }
  };

  return (
    <div
      className="relative flex items-center gap-1.5 sm:gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mute / Unmute Button */}
      <button
        onClick={onToggleMute}
        type="button"
        className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
        title={isMuted ? 'Bunyikan Suara (M)' : 'Bisukan Suara (M)'}
        aria-label="Kontrol Volume"
      >
        {getVolumeIcon()}
      </button>

      {/* Slider Bar */}
      <div
        className={`flex items-center gap-2 transition-all duration-200 ${
          vertical
            ? 'flex-col-reverse p-3 bg-neutral-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md absolute bottom-12 left-0'
            : 'w-24 sm:w-32'
        }`}
      >
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={currentLevel}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors ${
            isBoosted ? 'bg-amber-950/80 accent-amber-400' : 'bg-neutral-700 accent-rose-600'
          }`}
          title={`Volume: ${percent}% (Maksimal 200% / 2x Boost)`}
        />
        <span
          className={`text-[11px] font-mono tabular-nums select-none min-w-[34px] text-right font-semibold ${
            isBoosted ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* 2x Boost Button */}
      <button
        type="button"
        onClick={toggle2xBoost}
        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
          currentLevel >= 1.9
            ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shadow-amber-500/30 ring-1 ring-amber-400'
            : 'bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white'
        }`}
        title="Klik untuk Mengaktifkan Volume 200% (2 Kali Lebih Keras)"
      >
        <Zap className="w-3 h-3 text-amber-300" />
        <span>2x Boost</span>
      </button>
    </div>
  );
};
