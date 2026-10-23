import React from 'react';
import { X, History, Play, Trash2, Clock, Check } from 'lucide-react';
import { PlaybackHistoryItem } from '../../types/media';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: PlaybackHistoryItem[];
  onResume: (item: PlaybackHistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onResume,
  onRemoveItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Riwayat Pemutaran</h2>
              <p className="text-xs text-neutral-400">Tersinkron otomatis lintas perangkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear All action */}
        {history.length > 0 && (
          <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400">{history.length} judul tersimpan</span>
            <button
              onClick={onClearAll}
              className="text-neutral-400 hover:text-rose-400 font-medium transition-colors"
            >
              Hapus Semua Riwayat
            </button>
          </div>
        )}

        {/* History List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-300">Belum Ada Riwayat Pemutaran</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Setiap video dan lagu yang Anda putar akan otomatis tercatat di sini sehingga Anda bisa melanjutkan
                menonton kapan saja.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const progressPercent = Math.min(
                100,
                Math.round((item.currentTime / (item.duration || 1)) * 100)
              );

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-neutral-800/40 hover:bg-neutral-800/80 rounded-2xl border border-neutral-800 transition-colors group flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={item.poster}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 rounded-xl object-cover bg-neutral-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-rose-400 transition-colors truncate">
                          {item.title}
                        </h4>
                        {item.episodeTitle && (
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{item.episodeTitle}</p>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                          <span className="font-mono text-neutral-300">
                            {formatSeconds(item.currentTime)} / {formatSeconds(item.duration)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(item.lastPlayedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>

                  {/* Resume button */}
                  <button
                    onClick={() => onResume(item)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lanjutkan di menit {Math.floor(item.currentTime / 60)}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
