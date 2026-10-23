import { DownloadedItem, PlaybackHistoryItem, SyncProfile } from '../types/media';

const DB_NAME = 'NusantaraPlayerDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('downloads')) {
        db.createObjectStore('downloads', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncProfile')) {
        db.createObjectStore('syncProfile', { keyPath: 'syncId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// ----------------- HISTORY -----------------
export async function getPlaybackHistory(): Promise<PlaybackHistoryItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result as PlaybackHistoryItem[]) || [];
        // Sort most recently played first
        items.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
        resolve(items);
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error('Failed to get history:', e);
    // Fallback to localStorage
    const local = localStorage.getItem('nusantara_history');
    return local ? JSON.parse(local) : [];
  }
}

export async function savePlaybackHistory(item: PlaybackHistoryItem): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    store.put(item);
    // Also save in localStorage for fast synchronous read
    const current = await getPlaybackHistory();
    const filtered = current.filter((h) => h.id !== item.id);
    localStorage.setItem('nusantara_history', JSON.stringify([item, ...filtered].slice(0, 50)));

    // Broadcast change to other tabs/windows for instant cross-tab sync
    broadcastSyncEvent('history_updated', item);
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

export async function removePlaybackHistory(id: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('history', 'readwrite');
    tx.objectStore('history').delete(id);
    const local = localStorage.getItem('nusantara_history');
    if (local) {
      const parsed: PlaybackHistoryItem[] = JSON.parse(local);
      localStorage.setItem('nusantara_history', JSON.stringify(parsed.filter((h) => h.id !== id)));
    }
    broadcastSyncEvent('history_removed', { id });
  } catch (e) {
    console.error('Failed to remove history item:', e);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('history', 'readwrite');
    tx.objectStore('history').clear();
    localStorage.removeItem('nusantara_history');
    broadcastSyncEvent('history_cleared', {});
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

// ----------------- OFFLINE DOWNLOADS -----------------
export async function getDownloadedItems(): Promise<DownloadedItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('downloads', 'readonly');
      const store = tx.objectStore('downloads');
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as DownloadedItem[]) || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error('Failed to get downloaded items:', e);
    return [];
  }
}

export async function saveDownloadedItem(item: DownloadedItem, blob?: Blob): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('downloads', 'readwrite');
    const store = tx.objectStore('downloads');
    
    let itemToSave = { ...item };
    if (blob) {
      // In IndexedDB we can store actual Blobs directly!
      (itemToSave as any).blobData = blob;
      itemToSave.blobUrl = URL.createObjectURL(blob);
    }
    store.put(itemToSave);
  } catch (e) {
    console.error('Failed to save download:', e);
  }
}

export async function removeDownloadedItem(id: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('downloads', 'readwrite');
    tx.objectStore('downloads').delete(id);
  } catch (e) {
    console.error('Failed to delete download:', e);
  }
}

// ----------------- FAVORITES -----------------
export function getFavorites(): string[] {
  try {
    const favs = localStorage.getItem('nusantara_favorites');
    return favs ? JSON.parse(favs) : ['drakor-1', 'dracin-1'];
  } catch {
    return ['drakor-1', 'dracin-1'];
  }
}

export function toggleFavorite(mediaId: string): string[] {
  const current = getFavorites();
  const next = current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId];
  localStorage.setItem('nusantara_favorites', JSON.stringify(next));
  broadcastSyncEvent('favorites_updated', next);
  return next;
}

// ----------------- CROSS DEVICE SYNC -----------------
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('nusantara_device_sync');
  } catch {
    syncChannel = null;
  }
}

function broadcastSyncEvent(type: string, payload: any) {
  if (syncChannel) {
    syncChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

export function subscribeToSyncEvents(callback: (event: { type: string; payload: any }) => void): () => void {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => callback(event.data);
  syncChannel.addEventListener('message', handler);
  return () => syncChannel?.removeEventListener('message', handler);
}

export function getSyncDeviceProfile(): SyncProfile {
  const stored = localStorage.getItem('nusantara_sync_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  // Generate a friendly 6-digit sync key
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const initial: SyncProfile = {
    syncId: `SYNC-${randomCode}`,
    deviceName: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Laptop / PC',
    lastSyncedAt: Date.now(),
    history: [],
    favorites: getFavorites(),
    settings: {
      theme: 'dark',
      autoQuality: true,
      defaultSubtitleLang: 'id',
      eyeComfort: false,
      eyeComfortWarmth: 35,
    },
  };
  localStorage.setItem('nusantara_sync_profile', JSON.stringify(initial));
  return initial;
}

export function updateSyncDeviceProfile(profile: Partial<SyncProfile>): SyncProfile {
  const current = getSyncDeviceProfile();
  const updated: SyncProfile = {
    ...current,
    ...profile,
    lastSyncedAt: Date.now(),
  };
  localStorage.setItem('nusantara_sync_profile', JSON.stringify(updated));
  broadcastSyncEvent('profile_synced', updated);
  return updated;
}
