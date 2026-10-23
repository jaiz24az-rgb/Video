import React from 'react';
import { PlaySquare, FolderOpen, Download, History, RefreshCw, Sun, Moon, Laptop } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLocalFile: () => void;
  onOpenOfflineManager: () => void;
  onOpenHistory: () => void;
  onOpenSync: () => void;
  currentTheme: 'dark' | 'amoled' | 'light';
  onThemeChange: (theme: 'dark' | 'amoled' | 'light') => void;
  historyCount: number;
  downloadCount: number;
  syncId: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenLocalFile,
  onOpenOfflineManager,
  onOpenHistory,
  onOpenSync,
  currentTheme,
  onThemeChange,
  historyCount,
  downloadCount,
  syncId,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/85 border-b border-neutral-800/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark Brand */}
        <button
          onClick={() => onTabChange('all')}
          className="flex items-center gap-2.5 text-left text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-600/20 group-hover:scale-105 transition-transform">
            <PlaySquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
              NusantaraStream
            </span>
          </div>
        </button>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onTabChange('all')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'all' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onTabChange('drakor')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'drakor' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Drakor
          </button>
          <button
            onClick={() => onTabChange('dracin')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'dracin' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Dracin
          </button>
          <button
            onClick={() => onTabChange('music')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'music' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Audio & OST
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-neutral-300 hover:text-white transition-colors"
          >
            <History className="w-4 h-4 text-neutral-400" />
            <span>Riwayat</span>
            {historyCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-neutral-400">({historyCount})</span>
            )}
          </button>
          <button
            onClick={onOpenOfflineManager}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-neutral-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-400" />
            <span>Unduhan</span>
            {downloadCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-neutral-400">({downloadCount})</span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Sync status & Theme switch */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cross Device Sync Status button */}
          <button
            onClick={onOpenSync}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            title={`Sinkronisasi Lintas Perangkat: ${syncId}`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span className="font-mono text-[11px]">{syncId.slice(0, 8)}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => {
              if (currentTheme === 'dark') onThemeChange('amoled');
              else if (currentTheme === 'amoled') onThemeChange('light');
              else onThemeChange('dark');
            }}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title={`Tema: ${currentTheme === 'dark' ? 'Mode Gelap' : currentTheme === 'amoled' ? 'Mode AMOLED Pure Black' : 'Mode Terang'}`}
            aria-label="Ganti Tema"
          >
            {currentTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-rose-400" />
            ) : currentTheme === 'amoled' ? (
              <Laptop className="w-4 h-4 text-cyan-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Primary Action Button: Open Local File */}
          <button
            onClick={onOpenLocalFile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
            title="Buka File Audio/Video Lokal (Semua Format: MKV, MP4, MP3, FLAC dll)"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Putar File Lokal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
