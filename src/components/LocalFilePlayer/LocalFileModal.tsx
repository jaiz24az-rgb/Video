import React, { useState, useRef } from 'react';
import { X, Upload, Film, Music, Globe, Subtitles, Play, FileVideo, CheckCircle2 } from 'lucide-react';
import { MediaItem, SubtitleTrack } from '../../types/media';

interface LocalFileModalProps {
  onClose: () => void;
  onPlayMedia: (item: MediaItem) => void;
}

export const LocalFileModal: React.FC<LocalFileModalProps> = ({ onClose, onPlayMedia }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'stream'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSubtitleFile, setSelectedSubtitleFile] = useState<File | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        setSelectedSubtitleFile(file);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handlePlayLocalFile = () => {
    if (!selectedFile) return;

    const isAudio = selectedFile.type.startsWith('audio/') || /\.(mp3|flac|wav|aac|m4a|ogg)$/i.test(selectedFile.name);
    const objectUrl = URL.createObjectURL(selectedFile);

    const subtitles: SubtitleTrack[] = [];
    if (selectedSubtitleFile) {
      const subUrl = URL.createObjectURL(selectedSubtitleFile);
      subtitles.push({
        id: `local-sub-${Date.now()}`,
        label: `Subtitle: ${selectedSubtitleFile.name.replace(/\.[^/.]+$/, '')}`,
        language: 'id',
        src: subUrl,
        default: true,
      });
    }

    const localItem: MediaItem = {
      id: `local-${Date.now()}`,
      title: selectedFile.name.replace(/\.[^/.]+$/, ''),
      type: isAudio ? 'audio' : 'video',
      category: 'local',
      genre: [isAudio ? 'Audio Lokal' : 'Video Lokal', selectedFile.name.split('.').pop()?.toUpperCase() || 'SEMUA FORMAT'],
      year: new Date().getFullYear(),
      rating: 10,
      poster: isAudio
        ? '/src/assets/images/drakor_youth_melody_1792734796686.jpg'
        : '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
      backdrop: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
      synopsis: `File media lokal dari perangkat Anda: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Diputar secara offline dengan performa tinggi & kontrol geser.`,
      cast: ['File Pengguna'],
      sources: [
        {
          quality: '1080p',
          url: objectUrl,
          bitrate: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      ],
      subtitles,
      isLocal: true,
    };

    onPlayMedia(localItem);
    onClose();
  };

  const handlePlayStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const isAudio = streamUrl.endsWith('.mp3') || streamUrl.endsWith('.aac') || streamUrl.endsWith('.m4a');
    const isM3u8 = streamUrl.includes('.m3u8');

    const streamItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: streamTitle.trim() || (isM3u8 ? 'Live HLS Stream' : 'Online Media Stream'),
      type: isAudio ? 'audio' : 'video',
      category: 'movie',
      genre: [isM3u8 ? 'Live HLS / M3U8' : 'Online Stream', 'Streaming Langsung'],
      year: new Date().getFullYear(),
      rating: 9.5,
      poster: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
      backdrop: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
      synopsis: `Aliran streaming online dari URL: ${streamUrl}. Mendukung HLS adaptif, subtitle, dan kontrol geser volume.`,
      cast: ['Streaming Web'],
      sources: [
        {
          quality: '1080p',
          url: streamUrl,
          bitrate: isM3u8 ? 'HLS Adaptif' : 'Online Direct',
        },
      ],
      subtitles: [],
    };

    onPlayMedia(streamItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <FileVideo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pemutar Universal Semua Format</h2>
              <p className="text-xs text-neutral-400">Putar file dari komputer/HP atau stream online M3U8</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-800 p-2 gap-2 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'file' ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih File Media Lokal</span>
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'stream' ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Putar URL Stream Online (M3U8 / MP4)</span>
          </button>
        </div>

        {/* Tab 1: Local File Drag & Drop */}
        {activeTab === 'file' && (
          <div className="p-6 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-rose-500 bg-rose-500/10'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-neutral-700 hover:border-neutral-600 bg-neutral-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*,.mkv,.avi,.flv,.mov,.ts,.flac,.opus,.m4a"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{selectedFile.name}</span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Siap Diputar
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-rose-500">
                    <Film className="w-7 h-7" />
                    <Music className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-white">Tarik & Lepas File Audio/Video ke Sini</span>
                  <span className="text-xs text-neutral-400 max-w-sm">
                    Mendukung semua format: <strong>MKV, MP4, WEBM, AVI, MOV, TS, MP3, FLAC, WAV, M4A, OGG</strong>
                  </span>
                  <span className="mt-2 text-xs font-medium text-rose-400">atau klik untuk telusuri file</span>
                </div>
              )}
            </div>

            {/* Optional Subtitle Upload */}
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
              <input
                ref={subtitleInputRef}
                type="file"
                accept=".srt,.vtt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedSubtitleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-2.5 truncate">
                <Subtitles className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-xs text-neutral-300 truncate">
                  {selectedSubtitleFile ? `Subtitle: ${selectedSubtitleFile.name}` : 'Sertakan file subtitle (.srt / .vtt) (Opsional)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => subtitleInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium whitespace-nowrap transition-colors"
              >
                {selectedSubtitleFile ? 'Ubah File' : 'Pilih Subtitle'}
              </button>
            </div>

            {/* Submit play button */}
            <button
              onClick={handlePlayLocalFile}
              disabled={!selectedFile}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Pemutaran</span>
            </button>
          </div>
        )}

        {/* Tab 2: Custom Online Stream URL */}
        {activeTab === 'stream' && (
          <form onSubmit={handlePlayStream} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 mb-1.5 block">
                Judul Siaran / Stream (Opsional)
              </label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Contoh: Drakor Live Channel / M3U8 Stream"
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 mb-1.5 block">
                URL Stream (HLS .m3u8 atau Direct MP4 / MP3)
              </label>
              <input
                type="url"
                required
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-neutral-500">Contoh Stream Demo Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'HLS Live Stream (M3U8)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
                  {
                    label: 'Big Buck Bunny (MP4)',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  },
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStreamUrl(demo.url);
                      setStreamTitle(demo.label);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition-colors"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!streamUrl.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Putar Stream Online</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
