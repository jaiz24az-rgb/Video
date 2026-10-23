import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  PictureInPicture2,
  Subtitles,
  Sliders,
  Eye,
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Gauge,
  ArrowLeft,
  Clock,
  AudioWaveform,
  Server,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { MediaItem, Episode, QualityStream, SubtitleTrack } from '../../types/media';
import { VolumeSlider } from './VolumeSlider';
import { SubtitleManager } from './SubtitleManager';
import { savePlaybackHistory, saveDownloadedItem } from '../../services/storage';

interface UniversalPlayerProps {
  media: MediaItem;
  currentEpisode?: Episode;
  onClose: () => void;
  onEpisodeSelect?: (episode: Episode) => void;
  initialTime?: number;
  onDownloadOffline?: (media: MediaItem, episode?: Episode) => void;
}

export const UniversalPlayer: React.FC<UniversalPlayerProps> = ({
  media,
  currentEpisode,
  onClose,
  onEpisodeSelect,
  initialTime = 0,
  onDownloadOffline,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);

  // Core Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Quality & Server State
  const activeSources: QualityStream[] = currentEpisode?.sources || media.sources;
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [activeServerIndex, setActiveServerIndex] = useState<number>(0);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);

  // Subtitle State
  const availableSubtitles: SubtitleTrack[] = currentEpisode?.subtitles || media.subtitles || [];
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(
    availableSubtitles.find((s) => s.default)?.id || (availableSubtitles.length > 0 ? availableSubtitles[0].id : null)
  );
  const [showSubtitleMenu, setShowSubtitleMenu] = useState<boolean>(false);
  const [subtitleOffset, setSubtitleOffset] = useState<number>(0);
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [customSubtitleTracks, setCustomSubtitleTracks] = useState<SubtitleTrack[]>([]);

  // Eye Comfort & Brightness State
  const [brightness, setBrightness] = useState<number>(100); // 30 - 150
  const [eyeComfort, setEyeComfort] = useState<boolean>(false);

  // Equalizer & Audio Presets
  const [equalizerPreset, setEqualizerPreset] = useState<'flat' | 'bass' | 'vocal' | 'cinema'>('flat');
  const [showAudioMenu, setShowAudioMenu] = useState<boolean>(false);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // UI HUD Controls visibility
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gesture indicators
  const [gestureNotice, setGestureNotice] = useState<{ icon: string; text: string } | null>(null);
  const gestureNoticeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Offline Download status for active episode
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Custom Stream URL input
  const [showCustomUrlInput, setShowCustomUrlInput] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Determine current active stream URL based on quality or server index
  const getActiveStreamUrl = useCallback((): string => {
    if (activeSources.length === 0) return '';
    if (activeServerIndex < activeSources.length) {
      return activeSources[activeServerIndex].url;
    }
    const match = activeSources.find((s) => s.quality === selectedQuality);
    if (match) return match.url;
    const fallback = activeSources.find((s) => s.quality === '1080p') || activeSources[0];
    return fallback ? fallback.url : '';
  }, [activeSources, activeServerIndex, selectedQuality]);

  // Show HUD feedback for volume / brightness gestures
  const showHUD = (icon: string, text: string) => {
    setGestureNotice({ icon, text });
    if (gestureNoticeTimeout.current) clearTimeout(gestureNoticeTimeout.current);
    gestureNoticeTimeout.current = setTimeout(() => {
      setGestureNotice(null);
    }, 1500);
  };

  // Setup HLS or Direct Video Stream with Autoplay Resilience
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = getActiveStreamUrl();
    if (!streamUrl) return;

    setVideoError(null);
    setIsBuffering(true);
    const savedPosition = currentTime;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            // Autoplay policy prevented unmuted playback, try muted autoplay
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
                showHUD('volume', 'Mulai memutar (Klik untuk nyalakan suara)');
              })
              .catch(() => {
                setIsPlaying(false);
                setIsBuffering(false);
              });
          });
      }
    };

    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (savedPosition > 0) video.currentTime = savedPosition;
        attemptPlay();
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setVideoError('Koneksi stream HLS terputus. Silakan pilih server alternatif di atas.');
          setIsBuffering(false);
        }
      });
    } else {
      video.src = streamUrl;
      if (savedPosition > 0) {
        video.currentTime = savedPosition;
      }
      attemptPlay();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [getActiveStreamUrl]);

  // Initial Seek
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Audio Equalizer setup with Web Audio API
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          const source = ctx.createMediaElementSource(video);
          const bass = ctx.createBiquadFilter();
          bass.type = 'lowshelf';
          bass.frequency.value = 250;

          const treble = ctx.createBiquadFilter();
          treble.type = 'highshelf';
          treble.frequency.value = 3500;

          source.connect(bass);
          bass.connect(treble);
          treble.connect(ctx.destination);

          bassFilterRef.current = bass;
          trebleFilterRef.current = treble;
        }
      }

      // Apply preset
      if (bassFilterRef.current && trebleFilterRef.current) {
        if (equalizerPreset === 'bass') {
          bassFilterRef.current.gain.value = 8;
          trebleFilterRef.current.gain.value = 0;
        } else if (equalizerPreset === 'vocal') {
          bassFilterRef.current.gain.value = -3;
          trebleFilterRef.current.gain.value = 5;
        } else if (equalizerPreset === 'cinema') {
          bassFilterRef.current.gain.value = 5;
          trebleFilterRef.current.gain.value = 4;
        } else {
          bassFilterRef.current.gain.value = 0;
          trebleFilterRef.current.gain.value = 0;
        }
      }
    } catch {
      // Cross-origin audio restriction handling
    }
  }, [equalizerPreset]);

  // Periodic Playback History update
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && duration > 0) {
        savePlaybackHistory({
          id: `${media.id}_${currentEpisode ? currentEpisode.id : 'main'}`,
          mediaId: media.id,
          episodeId: currentEpisode?.id,
          title: media.title,
          episodeTitle: currentEpisode ? currentEpisode.title : undefined,
          poster: media.poster,
          category: media.category,
          type: media.type,
          currentTime: videoRef.current.currentTime,
          duration: duration,
          lastPlayedAt: Date.now(),
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [media, currentEpisode, duration]);

  // Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerRemaining(null);
      return;
    }

    setSleepTimerRemaining(sleepTimerMinutes * 60);

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (videoRef.current) videoRef.current.pause();
          setIsPlaying(false);
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerMinutes]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowQualityMenu(false);
        setShowSubtitleMenu(false);
        setShowAudioMenu(false);
        setShowServerMenu(false);
      }
    }, 4000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Play / Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.muted && isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          showHUD('play', 'Memutar');
        })
        .catch(() => {
          video.muted = true;
          video.play().then(() => setIsPlaying(true));
        });
    } else {
      video.pause();
      setIsPlaying(false);
      showHUD('pause', 'Jeda');
    }
  };

  // Seek relative
  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    showHUD(seconds > 0 ? 'forward' : 'rewind', `${seconds > 0 ? '+' : ''}${seconds}s`);
  };

  // Change Volume
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
    showHUD('volume', `Volume ${Math.round(newVol * 100)}%`);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showHUD('volume', video.muted ? 'Dibisukan' : `Volume ${Math.round(volume * 100)}%`);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or disabled', e);
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      showHUD('speed', `Kecepatan ${speed}x`);
    }
  };

  // Switch Stream Server
  const handleSelectServer = (index: number) => {
    setActiveServerIndex(index);
    if (activeSources[index]) {
      setSelectedQuality(activeSources[index].quality);
    }
    setShowServerMenu(false);
    setVideoError(null);
    showHUD('speed', `Beralih ke Server ${index + 1}`);
  };

  // Add Custom Stream URL
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim() || !videoRef.current) return;
    videoRef.current.src = customUrlInput.trim();
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    setShowCustomUrlInput(false);
    showHUD('speed', 'URL Streaming Kustom Dimuat');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isMuted, isFullscreen, onClose]);

  // Touch and Mouse Vertical Drag Gestures on Video
  const gestureState = useRef<{ startY: number; type: 'volume' | 'brightness' | null }>({
    startY: 0,
    type: null,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName !== 'VIDEO') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    gestureState.current = {
      startY: e.clientY,
      type: xRatio > 0.5 ? 'volume' : 'brightness',
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gestureState.current.type) return;
    const deltaY = gestureState.current.startY - e.clientY;
    if (Math.abs(deltaY) < 10) return;

    if (gestureState.current.type === 'volume') {
      const step = deltaY / 400;
      const nextVol = Math.max(0, Math.min(1, volume + step));
      handleVolumeChange(nextVol);
      gestureState.current.startY = e.clientY;
    } else if (gestureState.current.type === 'brightness') {
      const step = deltaY / 3;
      const nextBrightness = Math.max(30, Math.min(150, brightness + step));
      setBrightness(nextBrightness);
      showHUD('brightness', `Kecerahan ${Math.round(nextBrightness)}%`);
      gestureState.current.startY = e.clientY;
    }
  };

  const handlePointerUp = () => {
    gestureState.current = { startY: 0, type: null };
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Download episode offline action
  const handleDownloadThisEpisode = async () => {
    setIsDownloading(true);
    if (onDownloadOffline) {
      onDownloadOffline(media, currentEpisode);
    } else {
      setTimeout(async () => {
        await saveDownloadedItem({
          id: currentEpisode ? currentEpisode.id : media.id,
          mediaId: media.id,
          episodeId: currentEpisode?.id,
          title: currentEpisode ? `${media.title} - ${currentEpisode.title}` : media.title,
          poster: media.poster,
          quality: selectedQuality,
          sizeBytes: 245 * 1024 * 1024,
          downloadedAt: Date.now(),
          type: media.type,
          isCompleted: true,
          progress: 100,
        });
        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, 1500);
    }
  };

  // Custom subtitle file upload
  const handleUploadCustomSubtitle = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newTrack: SubtitleTrack = {
      id: `custom-${Date.now()}`,
      label: `Lokal: ${file.name.replace(/\.[^/.]+$/, '')}`,
      language: 'id',
      src: objectUrl,
      default: true,
    };
    setCustomSubtitleTracks((prev) => [...prev, newTrack]);
    setActiveSubtitleId(newTrack.id);
    showHUD('subtitle', `Subtitle Dimuat: ${file.name}`);
  };

  const allSubtitles = [...availableSubtitles, ...customSubtitleTracks];
  const activeSub = allSubtitles.find((s) => s.id === activeSubtitleId);

  const currentServerLabel =
    activeSources[activeServerIndex]?.server || `Server ${activeServerIndex + 1} (${selectedQuality})`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-center select-none overflow-hidden"
      style={{
        filter: `${eyeComfort ? 'sepia(30%) hue-rotate(-15deg)' : ''} brightness(${brightness}%)`,
      }}
    >
      {/* Top Header Bar */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/50 to-transparent z-40 transition-opacity duration-300 flex items-center justify-between ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
            title="Kembali ke Beranda (Esc)"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
              {media.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              {currentEpisode && (
                <>
                  <span className="text-rose-400 font-medium">{currentEpisode.title}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="capitalize">{media.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono text-[11px]">{currentServerLabel}</span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Server Switcher Button */}
          <button
            onClick={() => {
              setShowServerMenu(!showServerMenu);
              setShowQualityMenu(false);
              setShowSubtitleMenu(false);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md flex items-center gap-1.5 text-xs font-medium"
            title="Pilih Server Sumber Video / Masukkan URL Streaming"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Pilih Server ({activeServerIndex + 1})</span>
          </button>

          {/* Eye Comfort Mode Toggle */}
          <button
            onClick={() => {
              setEyeComfort(!eyeComfort);
              showHUD('eye', !eyeComfort ? 'Mode Kenyamanan Mata Aktif' : 'Mode Normal');
            }}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all backdrop-blur-md ${
              eyeComfort
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
            }`}
            title="Filter Kenyamanan Mata (Mengurangi Cahaya Biru)"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Kenyamanan Mata</span>
          </button>

          {/* Download offline button */}
          <button
            onClick={handleDownloadThisEpisode}
            disabled={isDownloading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md flex items-center gap-1.5 text-xs font-medium"
            title="Unduh Konten Ini untuk Diputar Offline Kapan Saja"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Tersimpan</span>
              </>
            ) : isDownloading ? (
              <>
                <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Mengunduh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Unduh Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-black"
        onClick={togglePlay}
        onDoubleClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const isRight = e.clientX - rect.left > rect.width / 2;
          seekRelative(isRight ? 10 : -10);
        }}
      >
        <video
          ref={videoRef}
          playsInline
          onError={() => {
            setVideoError(
              'Server streaming ini sedang sibuk atau dibatasi oleh kebijakan CORS. Silakan klik tombol di bawah untuk beralih ke Server 2, Server HLS, atau gunakan Link Kustom.'
            );
            setIsBuffering(false);
          }}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onDurationChange={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
            setVideoError(null);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (media.episodes && currentEpisode && onEpisodeSelect) {
              const nextIndex = media.episodes.findIndex((e) => e.id === currentEpisode.id) + 1;
              if (nextIndex < media.episodes.length) {
                onEpisodeSelect(media.episodes[nextIndex]);
              }
            }
          }}
          className="w-full h-full object-contain pointer-events-auto"
        >
          {activeSub?.src && (
            <track
              key={activeSub.id}
              label={activeSub.label}
              kind="subtitles"
              srcLang={activeSub.language}
              src={activeSub.src}
              default
            />
          )}
        </video>

        {/* Big Prominent Center Play Button Overlay when Paused */}
        {!isPlaying && !isBuffering && !videoError && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity hover:bg-black/40 group cursor-pointer"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-600/95 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/60 transform group-hover:scale-110 transition-all duration-200">
              <Play className="w-9 h-9 sm:w-11 sm:h-11 ml-1.5 fill-white" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Klik untuk Memutar Film
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                {currentEpisode ? currentEpisode.title : media.title} · Subtitle Indonesia Siap
              </p>
            </div>
          </div>
        )}

        {/* Video Error Fallback Screen */}
        {videoError && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 p-6 text-center z-30"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Kendala Server Streaming</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6">{videoError}</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {activeSources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectServer(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeServerIndex === idx
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{source.server || `Server ${idx + 1}`}</span>
                </button>
              ))}
              <button
                onClick={() => setShowCustomUrlInput(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
              >
                Masukkan Link Stream Baru
              </button>
            </div>
          </div>
        )}

        {/* Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
            <div className="w-14 h-14 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-neutral-300 font-medium mt-3">Memuat streaming video...</span>
          </div>
        )}

        {/* Floating HUD Feedback Indicator */}
        {gestureNotice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-3 bg-neutral-900/90 text-white rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-3 pointer-events-none border border-white/10 animate-in fade-in zoom-in-95 duration-100">
            {gestureNotice.icon === 'volume' && <Volume2 className="w-6 h-6 text-rose-500" />}
            {gestureNotice.icon === 'play' && <Play className="w-6 h-6 text-rose-500" />}
            {gestureNotice.icon === 'pause' && <Pause className="w-6 h-6 text-rose-500" />}
            {gestureNotice.icon === 'forward' && <RotateCw className="w-6 h-6 text-rose-500" />}
            {gestureNotice.icon === 'rewind' && <RotateCcw className="w-6 h-6 text-rose-500" />}
            {gestureNotice.icon === 'brightness' && <Eye className="w-6 h-6 text-amber-400" />}
            {gestureNotice.icon === 'speed' && <Gauge className="w-6 h-6 text-cyan-400" />}
            {gestureNotice.icon === 'subtitle' && <Subtitles className="w-6 h-6 text-rose-400" />}
            <span className="text-sm font-semibold">{gestureNotice.text}</span>
          </div>
        )}
      </div>

      {/* Server & Stream Source Selector Popover */}
      {showServerMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-20 right-4 sm:right-32 w-80 bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-white z-50 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Pilih Server Streaming
              </span>
            </div>
            <button
              onClick={() => setShowServerMenu(false)}
              className="text-neutral-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 mb-3">
            {activeSources.map((source, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectServer(idx)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                  activeServerIndex === idx
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold'
                    : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="text-xs">{source.server || `Server ${idx + 1}`}</div>
                  <div className="text-[10px] text-neutral-400">
                    Kualitas: {source.quality} · {source.bitrate || 'Online Stream'}
                  </div>
                </div>
                {activeServerIndex === idx && <Check className="w-4 h-4 text-rose-400" />}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowServerMenu(false);
              setShowCustomUrlInput(true);
            }}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Masukkan Link Stream Sendiri (.m3u8/.mp4)</span>
          </button>
        </div>
      )}

      {/* Custom Stream URL Modal */}
      {showCustomUrlInput && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
        >
          <form
            onSubmit={handleApplyCustomUrl}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Masukkan Link Streaming Online</h3>
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Jika Anda memiliki link streaming HLS (.m3u8) atau MP4 dari situs drama/film favorit Anda, tempelkan di
              bawah ini untuk langsung diputar dengan subtitle Indonesia.
            </p>
            <input
              type="url"
              required
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://.../video.m3u8 atau .mp4"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Putar Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtitle Manager Overlay Modal */}
      {showSubtitleMenu && (
        <div onClick={(e) => e.stopPropagation()}>
          <SubtitleManager
            tracks={allSubtitles}
            activeTrackId={activeSubtitleId}
            onSelectTrack={(id) => {
              setActiveSubtitleId(id);
              setShowSubtitleMenu(false);
            }}
            offsetSeconds={subtitleOffset}
            onOffsetChange={(delta) => setSubtitleOffset((prev) => prev + delta)}
            onResetOffset={() => setSubtitleOffset(0)}
            fontSize={subtitleSize}
            onFontSizeChange={(size) => setSubtitleSize(size)}
            onUploadCustomSubtitle={handleUploadCustomSubtitle}
            onClose={() => setShowSubtitleMenu(false)}
          />
        </div>
      )}

      {/* Quality Switcher Popover */}
      {showQualityMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-20 right-16 sm:right-28 w-56 bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-3 text-white z-50 animate-in fade-in zoom-in-95"
        >
          <div className="text-xs font-semibold text-neutral-400 px-3 py-1.5 uppercase tracking-wider">
            Kualitas Resolusi
          </div>
          <div className="space-y-1 mt-1">
            {activeSources.map((source, idx) => (
              <button
                key={source.quality + idx}
                onClick={() => {
                  setSelectedQuality(source.quality);
                  setActiveServerIndex(idx);
                  setShowQualityMenu(false);
                  showHUD('speed', `Kualitas: ${source.quality}`);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeServerIndex === idx
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{source.quality}</span>
                  {source.bitrate && <span className="text-[10px] text-neutral-400">{source.bitrate}</span>}
                </div>
                {activeServerIndex === idx && <Check className="w-4 h-4 text-rose-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Equalizer & Audio Presets Menu */}
      {showAudioMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-20 right-28 sm:right-44 w-64 bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-white z-50 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-3">
            <AudioWaveform className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Equalizer & Audio Preset
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: 'flat', label: 'Standar (Original Balance)', desc: 'Suara natural tanpa boost' },
              { id: 'bass', label: 'Bass Boost (Menggelegar)', desc: 'Penguatan frekuensi rendah' },
              { id: 'vocal', label: 'Dialog Jernih (Vocal Focus)', desc: 'Percakapan drama lebih jelas' },
              { id: 'cinema', label: 'Cinema Surround (Bioskop)', desc: 'Sensasi audio ruang lebar' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setEqualizerPreset(preset.id as any);
                  setShowAudioMenu(false);
                  showHUD('volume', `Audio: ${preset.label.split(' ')[0]}`);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                  equalizerPreset === preset.id
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[10px] text-neutral-400">{preset.desc}</div>
                </div>
                {equalizerPreset === preset.id && <Check className="w-4 h-4 text-rose-400" />}
              </button>
            ))}
          </div>

          {/* Sleep Timer */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-[11px] font-medium text-neutral-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pengatur Waktu Tidur
              </span>
              {sleepTimerRemaining && (
                <span className="font-mono text-rose-400 text-[10px]">
                  {Math.floor(sleepTimerRemaining / 60)}m {sleepTimerRemaining % 60}s
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { min: null, label: 'Off' },
                { min: 15, label: '15m' },
                { min: 30, label: '30m' },
                { min: 60, label: '60m' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSleepTimerMinutes(item.min)}
                  className={`py-1 text-[11px] rounded-lg font-medium transition-colors ${
                    sleepTimerMinutes === item.min
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom HUD Player Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-40 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="relative group/progress flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={(e) => {
                const target = parseFloat(e.target.value);
                setCurrentTime(target);
                if (videoRef.current) videoRef.current.currentTime = target;
              }}
              className="w-full h-1.5 sm:h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none"
              title="Geser posisi pemutaran"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-neutral-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Action Buttons Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {media.episodes && currentEpisode && (
              <button
                onClick={() => {
                  const idx = media.episodes!.findIndex((e) => e.id === currentEpisode.id);
                  if (idx > 0 && onEpisodeSelect) {
                    onEpisodeSelect(media.episodes![idx - 1]);
                  }
                }}
                className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Episode Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => seekRelative(-10)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Mundur 10 Detik"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all transform active:scale-95"
              title={isPlaying ? 'Jeda' : 'Putar'}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(10)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Maju 10 Detik"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {media.episodes && currentEpisode && (
              <button
                onClick={() => {
                  const idx = media.episodes!.findIndex((e) => e.id === currentEpisode.id);
                  if (idx < media.episodes!.length - 1 && onEpisodeSelect) {
                    onEpisodeSelect(media.episodes![idx + 1]);
                  }
                }}
                className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Episode Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Intuitive Volume Slider with Mute Button */}
            <div className="ml-1 sm:ml-2">
              <VolumeSlider
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Subtitle Button */}
            <button
              onClick={() => {
                setShowSubtitleMenu(!showSubtitleMenu);
                setShowQualityMenu(false);
                setShowAudioMenu(false);
                setShowServerMenu(false);
              }}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
                activeSubtitleId
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Pengaturan Subtitle Bahasa Indonesia (Sub Indo)"
            >
              <Subtitles className="w-5 h-5" />
              <span className="hidden md:inline font-mono text-[11px]">Sub Indo</span>
            </button>

            {/* Quality Resolution Switcher */}
            <button
              onClick={() => {
                setShowQualityMenu(!showQualityMenu);
                setShowSubtitleMenu(false);
                setShowAudioMenu(false);
                setShowServerMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-colors flex items-center gap-1"
              title="Ubah Kualitas Resolusi"
            >
              <span>{selectedQuality}</span>
            </button>

            {/* Audio Presets & Equalizer */}
            <button
              onClick={() => {
                setShowAudioMenu(!showAudioMenu);
                setShowSubtitleMenu(false);
                setShowQualityMenu(false);
                setShowServerMenu(false);
              }}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Equalizer & Audio Presets"
            >
              <Sliders className="w-5 h-5" />
            </button>

            {/* Speed Selector */}
            <div className="relative group">
              <button
                className="px-2 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors"
                title="Kecepatan Pemutaran"
              >
                {playbackSpeed}x
              </button>
              <div className="absolute bottom-10 right-0 hidden group-hover:flex flex-col bg-neutral-900 border border-white/10 rounded-xl p-1 shadow-2xl">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-3 py-1 text-xs rounded-lg font-mono text-left ${
                      playbackSpeed === s ? 'bg-rose-600 text-white' : 'text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="hidden sm:inline-block p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
