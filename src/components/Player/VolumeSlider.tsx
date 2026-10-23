import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX, Volume } from 'lucide-react';

interface VolumeSliderProps {
  volume: number; // 0 to 1
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
    if (currentLevel < 0.3) return <Volume className="w-5 h-5 text-neutral-300" />;
    if (currentLevel < 0.7) return <Volume1 className="w-5 h-5 text-neutral-200" />;
    return <Volume2 className="w-5 h-5 text-rose-500" />;
  };

  const percent = Math.round(currentLevel * 100);

  return (
    <div
      className="relative flex items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggleMute}
        type="button"
        className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
        title={isMuted ? 'Bunyikan (M)' : 'Bisukan (M)'}
        aria-label="Kontrol Volume"
      >
        {getVolumeIcon()}
      </button>

      {/* Slider Bar */}
      <div
        className={`flex items-center gap-2 transition-all duration-200 ${
          vertical
            ? 'flex-col-reverse p-3 bg-neutral-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md absolute bottom-12 left-0'
            : 'w-24 sm:w-28'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={currentLevel}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none"
          title={`Volume: ${percent}%`}
        />
        <span className="text-[11px] font-mono tabular-nums text-neutral-400 select-none min-w-[28px] text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
};
