import React from 'react';
import { X, Download, Trash2, Play, HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DownloadedItem, MediaItem } from '../../types/media';

interface OfflineManagerModalProps {
  downloads: DownloadedItem[];
  onClose: () => void;
  onPlayOffline: (item: DownloadedItem) => void;
  onDeleteDownload: (id: string) => void;
  onClearAll: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  downloads,
  onClose,
  onPlayOffline,
  onDeleteDownload,
  onClearAll,
}) => {
  // Calculate total storage in MB
  const totalBytes = downloads.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Manajer Unduhan Offline</h2>
              <p className="text-xs text-neutral-400">Putar konten favorit tanpa kuota & internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar Indicator */}
        <div className="px-6 py-4 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <HardDrive className="w-4 h-4 text-rose-400" />
            <span>
              Total Penyimpanan Digunakan: <strong className="text-white font-mono">{totalMB} MB</strong>
            </span>
          </div>
          {downloads.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-neutral-400 hover:text-rose-400 font-medium transition-colors"
            >
              Hapus Semua Unduhan
            </button>
          )}
        </div>

        {/* Downloads List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {downloads.length === 0 ? (
            <div className="text-center py-12">
              <Download className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-300">Belum Ada Konten yang Diunduh</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Buka drama atau episode apa saja, lalu klik tombol "Unduh Offline" untuk menyimpan file ke perangkat
                Anda.
              </p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-neutral-800/40 hover:bg-neutral-800/80 rounded-2xl border border-neutral-800 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-4"
                  onClick={() => onPlayOffline(item)}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 rounded-xl object-cover bg-neutral-800 shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-rose-400 transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span className="font-mono text-neutral-300">
                        {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{item.quality}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Siap Offline
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPlayOffline(item)}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                    title="Putar Offline Sekarang"
                  >
                    <Play className="w-4 h-4 fill-white" />
                  </button>

                  <button
                    onClick={() => onDeleteDownload(item.id)}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors"
                    title="Hapus dari Penyimpanan Offline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Tersimpan aman di IndexedDB Browser
          </span>
          <span>{downloads.length} File Offline</span>
        </div>
      </div>
    </div>
  );
};
