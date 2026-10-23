import React, { useRef } from 'react';
import { SubtitleTrack } from '../../types/media';
import { Subtitles, Upload, Clock, Type, Check, X } from 'lucide-react';

interface SubtitleManagerProps {
  tracks: SubtitleTrack[];
  activeTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  offsetSeconds: number;
  onOffsetChange: (delta: number) => void;
  onResetOffset: () => void;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
  onUploadCustomSubtitle: (file: File) => void;
  onClose: () => void;
}

export const SubtitleManager: React.FC<SubtitleManagerProps> = ({
  tracks,
  activeTrackId,
  onSelectTrack,
  offsetSeconds,
  onOffsetChange,
  onResetOffset,
  fontSize,
  onFontSizeChange,
  onUploadCustomSubtitle,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomSubtitle(e.target.files[0]);
    }
  };

  return (
    <div className="absolute bottom-16 right-4 sm:right-12 w-80 sm:w-96 bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-5 text-white z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-rose-500" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Pengaturan Subtitle & Bahasa</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Tutup pengaturan subtitle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Track Selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-neutral-400 mb-2 block">Pilih Trek Subtitle</label>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectTrack(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTrackId === null ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-neutral-300 hover:bg-white/5'
            }`}
          >
            <span>Matikan Subtitle (Off)</span>
            {activeTrackId === null && <Check className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTrackId === track.id
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <span className="truncate">{track.label}</span>
              {activeTrackId === track.id && <Check className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Offset */}
      <div className="mb-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Sinkronisasi / Delay Subtitle
          </span>
          <span className="text-xs font-mono tabular-nums text-neutral-300">
            {offsetSeconds > 0 ? `+${offsetSeconds.toFixed(1)}s` : `${offsetSeconds.toFixed(1)}s`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOffsetChange(-0.5)}
            className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            title="Percepat subtitle 0.5 detik"
          >
            -0.5s
          </button>
          <button
            onClick={() => onOffsetChange(0.5)}
            className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            title="Perlambat subtitle 0.5 detik"
          >
            +0.5s
          </button>
          <button
            onClick={onResetOffset}
            className="py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors"
            title="Reset sinkronisasi ke 0.0 detik"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-4 pt-3 border-t border-white/10">
        <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 mb-2">
          <Type className="w-3.5 h-3.5" /> Ukuran Teks Subtitle
        </span>
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl">
          {[
            { id: 'small', label: 'Kecil' },
            { id: 'medium', label: 'Standar' },
            { id: 'large', label: 'Besar' },
            { id: 'xlarge', label: 'Ekstra' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onFontSizeChange(item.id as any)}
              className={`py-1 text-[11px] font-medium rounded-lg transition-colors ${
                fontSize === item.id ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Subtitle File Upload */}
      <div className="pt-3 border-t border-white/10">
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.vtt"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-neutral-300 hover:text-white transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-rose-400" />
          <span>Unggah File Subtitle Lokal (.srt / .vtt)</span>
        </button>
      </div>
    </div>
  );
};
