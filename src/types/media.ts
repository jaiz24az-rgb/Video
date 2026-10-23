export type MediaType = 'video' | 'audio';
export type MediaCategory = 'drakor' | 'dracin' | 'movie' | 'anime' | 'music' | 'local';

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src?: string; // WebVTT URL or Blob URL
  default?: boolean;
}

export interface QualityStream {
  quality: '4K' | '1080p' | '720p' | '480p' | '360p' | 'Auto';
  url: string;
  bitrate?: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
  sources: QualityStream[];
  subtitles: SubtitleTrack[];
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  category: MediaCategory;
  genre: string[];
  year: number;
  rating: number; // e.g. 9.4
  episodesCount?: number;
  poster: string;
  backdrop: string;
  synopsis: string;
  cast: string[];
  director?: string;
  sources: QualityStream[];
  subtitles: SubtitleTrack[];
  episodes?: Episode[];
  isLocal?: boolean;
}

export interface PlaybackHistoryItem {
  id: string;
  mediaId: string;
  episodeId?: string;
  title: string;
  episodeTitle?: string;
  poster: string;
  category: MediaCategory;
  type: MediaType;
  currentTime: number;
  duration: number;
  lastPlayedAt: number; // timestamp
}

export interface DownloadedItem {
  id: string; // mediaId or episodeId
  mediaId: string;
  episodeId?: string;
  title: string;
  poster: string;
  quality: string;
  sizeBytes: number;
  downloadedAt: number;
  blobUrl?: string; // locally stored Blob Object URL
  type: MediaType;
  isCompleted: boolean;
  progress: number; // 0 to 100
}

export interface SyncProfile {
  syncId: string;
  deviceName: string;
  lastSyncedAt: number;
  history: PlaybackHistoryItem[];
  favorites: string[]; // mediaId list
  settings: {
    theme: 'dark' | 'amoled' | 'light';
    autoQuality: boolean;
    defaultSubtitleLang: string;
    eyeComfort: boolean;
    eyeComfortWarmth: number; // 0 - 100
  };
}
