import React, { useState } from 'react';
import { X, Play, Download, Check, Star, Clock, Heart } from 'lucide-react';
import { MediaItem, Episode } from '../../types/media';

interface MediaDetailModalProps {
  media: MediaItem;
  onClose: () => void;
  onPlay: (media: MediaItem, episode?: Episode) => void;
  onDownloadOffline: (media: MediaItem, episode?: Episode) => void;
  downloadedIds: string[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media,
  onClose,
  onPlay,
  onDownloadOffline,
  downloadedIds,
  isFavorite,
  onToggleFavorite,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (episode?: Episode) => {
    const id = episode ? episode.id : media.id;
    setDownloadingId(id);
    onDownloadOffline(media, episode);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-neutral-300 hover:text-white backdrop-blur-md transition-colors"
          aria-label="Tutup Detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto">
          {/* Header Banner */}
          <div className="relative h-64 sm:h-80 w-full bg-neutral-950">
            <img
              src={media.backdrop || media.poster}
              alt={media.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-xs text-neutral-300 mb-1.5">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {media.rating}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{media.year}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{media.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-400 font-medium">Subtitle Indonesia</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">{media.title}</h2>
                {media.originalTitle && (
                  <p className="text-xs text-neutral-400 mt-0.5">{media.originalTitle}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onPlay(media, media.episodes ? media.episodes[0] : undefined)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Putar</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(media.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                  title={isFavorite ? 'Favorit' : 'Tambah Favorit'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Synopsis */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Sinopsis</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{media.synopsis}</p>
            </div>

            {/* Cast & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-xs text-neutral-300">
              <div>
                <span className="text-neutral-500 block mb-1">Pemeran Utama:</span>
                <span className="font-medium">{media.cast.join(', ')}</span>
              </div>
              {media.director && (
                <div>
                  <span className="text-neutral-500 block mb-1">Sutradara:</span>
                  <span className="font-medium">{media.director}</span>
                </div>
              )}
            </div>

            {/* Episodes List (if drama / series) */}
            {media.episodes && media.episodes.length > 0 && (
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Daftar Episode ({media.episodes.length} Episode)
                  </h3>
                  <span className="text-xs text-rose-400 font-medium">Semua Sub Indo Lengkap</span>
                </div>

                <div className="space-y-2">
                  {media.episodes.map((ep) => {
                    const isDownloaded = downloadedIds.includes(ep.id);
                    const isDownInProgress = downloadingId === ep.id;

                    return (
                      <div
                        key={ep.id}
                        className="flex items-center justify-between p-3.5 bg-neutral-800/40 hover:bg-neutral-800/80 rounded-2xl border border-neutral-800 transition-colors group"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-4"
                          onClick={() => onPlay(media, ep)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-rose-600/20 transition-colors">
                            <Play className="w-4 h-4 text-neutral-300 group-hover:text-rose-400" />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors truncate">
                              {ep.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {Math.floor(ep.duration / 60)} Menit
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-400">Multi Resolusi (4K / 1080p / 720p)</span>
                            </div>
                          </div>
                        </div>

                        {/* Download offline action */}
                        <div className="shrink-0">
                          {isDownloaded ? (
                            <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Offline</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDownload(ep)}
                              disabled={isDownInProgress}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5"
                              title="Unduh Episode untuk Ditonton Offline"
                            >
                              {isDownInProgress ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                  <span>Mengunduh...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>Unduh</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
