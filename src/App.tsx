/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CATALOG_ITEMS } from './data/mockCatalog';
import { MediaItem, Episode, PlaybackHistoryItem, DownloadedItem, SyncProfile } from './types/media';
import {
  getPlaybackHistory,
  removePlaybackHistory,
  clearAllHistory,
  getDownloadedItems,
  saveDownloadedItem,
  removeDownloadedItem,
  getFavorites,
  toggleFavorite,
  getSyncDeviceProfile,
  updateSyncDeviceProfile,
  subscribeToSyncEvents,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { CatalogGrid } from './components/Catalog/CatalogGrid';
import { UniversalPlayer } from './components/Player/UniversalPlayer';
import { MediaDetailModal } from './components/Catalog/MediaDetailModal';
import { OfflineManagerModal } from './components/Offline/OfflineManagerModal';
import { HistoryDrawer } from './components/History/HistoryDrawer';
import { DeviceSyncModal } from './components/Sync/DeviceSyncModal';
import { LocalFileModal } from './components/LocalFilePlayer/LocalFileModal';

export default function App() {
  // Catalog & Media state
  const [catalog, setCatalog] = useState<MediaItem[]>(CATALOG_ITEMS);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Player state
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | undefined>(undefined);
  const [initialPlaybackTime, setInitialPlaybackTime] = useState<number>(0);

  // Modals state
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [isLocalFileOpen, setIsLocalFileOpen] = useState<boolean>(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Storage / Persistence state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<PlaybackHistoryItem[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [syncProfile, setSyncProfile] = useState<SyncProfile>(getSyncDeviceProfile());
  const [theme, setTheme] = useState<'dark' | 'amoled' | 'light'>('dark');

  // Load storage state on mount
  const refreshStorageData = useCallback(async () => {
    const [hist, downs, favs, profile] = await Promise.all([
      getPlaybackHistory(),
      getDownloadedItems(),
      getFavorites(),
      getSyncDeviceProfile(),
    ]);
    setHistory(hist);
    setDownloadedItems(downs);
    setFavorites(favs);
    setSyncProfile(profile);
    if (profile.settings?.theme) {
      setTheme(profile.settings.theme);
    }
  }, []);

  useEffect(() => {
    refreshStorageData();

    // Subscribe to cross-tab / cross-device synchronization events
    const unsubscribe = subscribeToSyncEvents((event) => {
      if (event.type === 'history_updated' || event.type === 'history_removed' || event.type === 'history_cleared') {
        getPlaybackHistory().then(setHistory);
      } else if (event.type === 'favorites_updated') {
        setFavorites(event.payload);
      } else if (event.type === 'profile_synced') {
        setSyncProfile(event.payload);
        if (event.payload.settings?.theme) setTheme(event.payload.settings.theme);
      }
    });

    return () => unsubscribe();
  }, [refreshStorageData]);

  // Handle Theme switching and apply class to document body
  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-amoled', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const handleThemeChange = (newTheme: 'dark' | 'amoled' | 'light') => {
    setTheme(newTheme);
    updateSyncDeviceProfile({
      settings: {
        ...syncProfile.settings,
        theme: newTheme,
      },
    });
  };

  // Play a media item (checks if user has resume timestamp)
  const handlePlayMedia = (media: MediaItem, episode?: Episode, resumeTime?: number) => {
    // If not specified, check history
    let startTime = 0;
    if (resumeTime !== undefined) {
      startTime = resumeTime;
    } else {
      const hist = history.find((h) => h.mediaId === media.id);
      if (hist && hist.currentTime > 5 && hist.currentTime < (hist.duration || 100) - 10) {
        startTime = hist.currentTime;
      }
    }

    setActiveMedia(media);
    setActiveEpisode(episode || (media.episodes && media.episodes.length > 0 ? media.episodes[0] : undefined));
    setInitialPlaybackTime(startTime);
    setDetailMedia(null);
  };

  // Resume from History Drawer
  const handleResumeFromHistory = (item: PlaybackHistoryItem) => {
    const targetMedia = catalog.find((c) => c.id === item.mediaId);
    if (targetMedia) {
      let targetEp: Episode | undefined;
      if (item.episodeId && targetMedia.episodes) {
        targetEp = targetMedia.episodes.find((e) => e.id === item.episodeId);
      }
      setIsHistoryOpen(false);
      handlePlayMedia(targetMedia, targetEp, item.currentTime);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const next = toggleFavorite(id);
    setFavorites(next);
  };

  // Offline Download handler
  const handleDownloadOffline = async (media: MediaItem, episode?: Episode) => {
    const downloadId = episode ? episode.id : media.id;
    const newDownload: DownloadedItem = {
      id: downloadId,
      mediaId: media.id,
      episodeId: episode?.id,
      title: episode ? `${media.title} - ${episode.title}` : media.title,
      poster: media.poster,
      quality: '1080p',
      sizeBytes: (episode ? 320 : 650) * 1024 * 1024, // ~320 MB or 650 MB
      downloadedAt: Date.now(),
      type: media.type,
      isCompleted: true,
      progress: 100,
    };

    await saveDownloadedItem(newDownload);
    const updated = await getDownloadedItems();
    setDownloadedItems(updated);
  };

  // Play item from offline storage
  const handlePlayOffline = (item: DownloadedItem) => {
    const targetMedia = catalog.find((c) => c.id === item.mediaId);
    if (targetMedia) {
      let targetEp: Episode | undefined;
      if (item.episodeId && targetMedia.episodes) {
        targetEp = targetMedia.episodes.find((e) => e.id === item.episodeId);
      }
      setIsOfflineManagerOpen(false);
      handlePlayMedia(targetMedia, targetEp);
    }
  };

  // Delete downloaded item
  const handleDeleteDownload = async (id: string) => {
    await removeDownloadedItem(id);
    const updated = await getDownloadedItems();
    setDownloadedItems(updated);
  };

  // Clear all downloads
  const handleClearAllDownloads = async () => {
    for (const item of downloadedItems) {
      await removeDownloadedItem(item.id);
    }
    setDownloadedItems([]);
  };

  // History removal
  const handleRemoveHistoryItem = async (id: string) => {
    await removePlaybackHistory(id);
    const updated = await getPlaybackHistory();
    setHistory(updated);
  };

  const handleClearHistory = async () => {
    await clearAllHistory();
    setHistory([]);
  };

  // Sync update
  const handleUpdateSyncProfile = (updates: Partial<SyncProfile>) => {
    const updated = updateSyncDeviceProfile(updates);
    setSyncProfile(updated);
  };

  // Import JSON profile
  const handleImportProfile = (jsonStr: string): boolean => {
    try {
      const parsed: SyncProfile = JSON.parse(jsonStr);
      if (parsed.syncId) {
        updateSyncDeviceProfile(parsed);
        if (parsed.history) {
          localStorage.setItem('nusantara_history', JSON.stringify(parsed.history));
          setHistory(parsed.history);
        }
        if (parsed.favorites) {
          localStorage.setItem('nusantara_favorites', JSON.stringify(parsed.favorites));
          setFavorites(parsed.favorites);
        }
        setSyncProfile(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid profile JSON', e);
    }
    return false;
  };

  // Add local file to catalog & play
  const handlePlayLocalFileItem = (item: MediaItem) => {
    setCatalog((prev) => [item, ...prev]);
    handlePlayMedia(item);
  };

  const downloadedIds = downloadedItems.map((d) => d.id);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-rose-600 selection:text-white">
      {/* 3-Zone Top Bar Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'offline') setIsOfflineManagerOpen(true);
          else setActiveTab(tab);
        }}
        onOpenLocalFile={() => setIsLocalFileOpen(true)}
        onOpenOfflineManager={() => setIsOfflineManagerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        historyCount={history.length}
        downloadCount={downloadedItems.length}
        syncId={syncProfile.syncId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <CatalogGrid
          items={catalog}
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
          onPlayMedia={(m) => handlePlayMedia(m)}
          onOpenDetails={(m) => setDetailMedia(m)}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          history={history}
          downloadedIds={downloadedIds}
        />
      </main>

      {/* Universal Player Overlay (When media is active) */}
      {activeMedia && (
        <UniversalPlayer
          media={activeMedia}
          currentEpisode={activeEpisode}
          onClose={() => {
            setActiveMedia(null);
            setActiveEpisode(undefined);
            refreshStorageData();
          }}
          onEpisodeSelect={(ep) => {
            setActiveEpisode(ep);
            setInitialPlaybackTime(0);
          }}
          initialTime={initialPlaybackTime}
          onDownloadOffline={handleDownloadOffline}
        />
      )}

      {/* Media Detail & Episode Modal */}
      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onPlay={(m, ep) => handlePlayMedia(m, ep)}
          onDownloadOffline={handleDownloadOffline}
          downloadedIds={downloadedIds}
          isFavorite={favorites.includes(detailMedia.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Offline Downloads Manager Modal */}
      {isOfflineManagerOpen && (
        <OfflineManagerModal
          downloads={downloadedItems}
          onClose={() => setIsOfflineManagerOpen(false)}
          onPlayOffline={handlePlayOffline}
          onDeleteDownload={handleDeleteDownload}
          onClearAll={handleClearAllDownloads}
        />
      )}

      {/* Playback History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onResume={handleResumeFromHistory}
        onRemoveItem={handleRemoveHistoryItem}
        onClearAll={handleClearHistory}
      />

      {/* Cross Device Sync Modal */}
      {isSyncModalOpen && (
        <DeviceSyncModal
          profile={syncProfile}
          onClose={() => setIsSyncModalOpen(false)}
          onUpdateProfile={handleUpdateSyncProfile}
          onImportProfile={handleImportProfile}
        />
      )}

      {/* Universal Local Media File Player Modal */}
      {isLocalFileOpen && (
        <LocalFileModal
          onClose={() => setIsLocalFileOpen(false)}
          onPlayMedia={handlePlayLocalFileItem}
        />
      )}
    </div>
  );
}
