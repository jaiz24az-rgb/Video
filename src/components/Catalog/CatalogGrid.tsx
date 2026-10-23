import React, { useState } from 'react';
import { Play, Info, Heart, Download, Search, Check, Clock } from 'lucide-react';
import { MediaItem, PlaybackHistoryItem } from '../../types/media';

interface CatalogGridProps {
  items: MediaItem[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onPlayMedia: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  history: PlaybackHistoryItem[];
  downloadedIds: string[];
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  items,
  activeCategory,
  onCategoryChange,
  onPlayMedia,
  onOpenDetails,
  favorites,
  onToggleFavorite,
  history,
  downloadedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Featured Item (Drakor Queen of Destiny)
  const featured = items.find((i) => i.id === 'drakor-1') || items[0];
  const featuredHistory = history.find((h) => h.mediaId === featured.id);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'favorites'
        ? favorites.includes(item.id)
        : activeCategory === 'offline'
        ? downloadedIds.includes(item.id) || (item.episodes && item.episodes.some((e) => downloadedIds.includes(e.id)))
        : item.category === activeCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.originalTitle && item.originalTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.cast.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Showcase Banner */}
      {activeCategory === 'all' && searchQuery.trim() === '' && featured && (
        <section className="relative w-full rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900">
          <div className="relative h-[420px] sm:h-[480px] w-full">
            <img
              src={featured.backdrop || featured.poster}
              alt={featured.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {/* Contrast Scrim as required by frontend-design */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent" />

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-neutral-300 mb-2">
                <span className="text-rose-400 font-semibold tracking-wider uppercase">Pilihan Utama Streaming</span>
                <span aria-hidden="true">·</span>
                <span>Korea Selatan</span>
                <span aria-hidden="true">·</span>
                <span>Tahun {featured.year}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-semibold">★ {featured.rating}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
                {featured.title}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 line-clamp-2 sm:line-clamp-3 mb-6 font-normal leading-relaxed">
                {featured.synopsis}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onPlayMedia(featured)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{featuredHistory ? 'Lanjutkan Menonton' : 'Putar Sekarang'}</span>
                </button>

                <button
                  onClick={() => onOpenDetails(featured)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md transition-all whitespace-nowrap"
                >
                  <Info className="w-4 h-4" />
                  <span>Episode & Info</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(featured.id)}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                    favorites.includes(featured.id)
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                  title={favorites.includes(featured.id) ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.includes(featured.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>

              {/* Resume status banner */}
              {featuredHistory && (
                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    Terakhir ditonton sampai{' '}
                    <span className="font-mono text-neutral-200">
                      {Math.floor(featuredHistory.currentTime / 60)} menit
                    </span>{' '}
                    ({Math.round((featuredHistory.currentTime / (featuredHistory.duration || 1)) * 100)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive segmented buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'drakor', label: 'Drama Korea' },
            { id: 'dracin', label: 'Drama China' },
            { id: 'movie', label: 'Film Bioskop' },
            { id: 'music', label: 'Audio & OST' },
            { id: 'favorites', label: 'Favorit' },
            { id: 'offline', label: 'Tersimpan Offline' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul drama, aktor, genre..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-900/40 rounded-3xl border border-neutral-800/60">
          <p className="text-sm text-neutral-400 mb-2">Tidak ditemukan konten yang cocok dengan pencarian.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              onCategoryChange('all');
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Tampilkan semua katalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const itemHistory = history.find((h) => h.mediaId === item.id);
            const isFav = favorites.includes(item.id);
            const isDownloaded =
              downloadedIds.includes(item.id) ||
              (item.episodes && item.episodes.some((e) => downloadedIds.includes(e.id)));

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-neutral-900/60 border border-neutral-800/70 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Poster Container */}
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-800 cursor-pointer"
                  onClick={() => onPlayMedia(item)}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Play hover icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md transition-colors text-white"
                    title={isFav ? 'Hapus favorit' : 'Favoritkan'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>

                  {/* Offline downloaded badge */}
                  {isDownloaded && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md">
                      <Check className="w-2.5 h-2.5" />
                      <span>Offline</span>
                    </div>
                  )}

                  {/* Resume progress bar */}
                  {itemHistory && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-neutral-800">
                      <div
                        className="h-full bg-rose-600"
                        style={{
                          width: `${Math.min(100, Math.round((itemHistory.currentTime / (itemHistory.duration || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Info (Zero-Pill Discipline: Clean metadata with typographic separators) */}
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3
                      onClick={() => onPlayMedia(item)}
                      className="text-xs sm:text-sm font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-1 cursor-pointer"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Metadata line */}
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <span>{item.year}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-medium">★ {item.rating}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.type === 'video' ? `${item.episodesCount || 1} Ep` : 'Audio'}</span>
                    </div>

                    {/* Indonesian Subtitle indicator */}
                    <div className="mt-1.5 text-[11px] text-neutral-400 line-clamp-1">
                      <span className="text-rose-400/90 font-medium">Sub Indo</span>
                      <span aria-hidden="true" className="mx-1">
                        ·
                      </span>
                      <span>{item.genre[0]}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenDetails(item)}
                      className="text-[11px] font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      <span>Detail</span>
                    </button>

                    <button
                      onClick={() => onPlayMedia(item)}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      {itemHistory ? 'Lanjutkan' : 'Tonton'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
