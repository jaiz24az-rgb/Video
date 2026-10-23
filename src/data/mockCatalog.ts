import { MediaItem } from '../types/media';

// WebVTT Indonesian Subtitles Helper
export function createVttDataUrl(subtitles: { start: string; end: string; text: string }[]): string {
  const content = [
    'WEBVTT',
    '',
    ...subtitles.map((sub, i) => `${i + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`),
  ].join('\n');
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(content)}`;
}

// Built-in Indonesian Subtitles for Drakor
export const drakorIndoSubtitles = createVttDataUrl([
  { start: '00:00:01.000', end: '00:00:04.500', text: 'Di tengah gemerlap kota Seoul...' },
  { start: '00:00:05.000', end: '00:00:08.200', text: 'Aku selalu bertanya, apakah takdir mempertemukan kita?' },
  { start: '00:00:09.000', end: '00:00:12.800', text: 'Jika waktu bisa berputar kembali, aku akan tetap memilihmu.' },
  { start: '00:00:13.500', end: '00:00:18.000', text: 'Jangan pernah melepaskan genggaman tangan ini lagi.' },
  { start: '00:00:19.000', end: '00:00:23.500', text: 'Malam ini, biarkan bintang menjadi saksi cinta kita.' },
  { start: '00:00:24.000', end: '00:00:28.000', text: 'Walau badai menghadang, kita akan menghadapinya bersama.' },
  { start: '00:00:29.000', end: '00:00:34.000', text: '[Musik Emosional K-Drama Mengalun]' },
  { start: '00:00:35.000', end: '00:00:40.000', text: 'Terima kasih telah hadir di hidupku.' },
]);

export const dracinIndoSubtitles = createVttDataUrl([
  { start: '00:00:01.000', end: '00:00:05.000', text: 'Di puncak Gunung Kunlun yang berselimut kabut abadi...' },
  { start: '00:00:05.500', end: '00:00:09.500', text: 'Pedang Giok Langit ini telah tertidur selama seribu tahun.' },
  { start: '00:00:10.000', end: '00:00:14.200', text: 'Kultivator muda, takdirmu bukan untuk bertarung demi kekuasaan.' },
  { start: '00:00:15.000', end: '00:00:19.800', text: 'Melainkan untuk menjaga keharmonisan tiga alam semesta.' },
  { start: '00:00:21.000', end: '00:00:25.500', text: 'Guru, jika aku harus menentang langit demi melindunginya, aku rela!' },
  { start: '00:00:26.500', end: '00:00:31.000', text: '[Dentuman Energi Spiritual Xianxia Bergetar]' },
  { start: '00:00:32.000', end: '00:00:37.000', text: 'Ingatlah sumpahmu saat pertama kali memegang pedang ini.' },
]);

export const movieIndoSubtitles = createVttDataUrl([
  { start: '00:00:01.000', end: '00:00:04.000', text: 'Tahun 2045. Dunia telah berubah.' },
  { start: '00:00:05.000', end: '00:00:09.000', text: 'Hanya mereka yang memiliki keberanian yang bisa bertahan.' },
  { start: '00:00:10.000', end: '00:00:14.500', text: 'Nusantara Player: Kualitas 4K Ultra HD & Audio Lossless Aktif.' },
  { start: '00:00:15.000', end: '00:00:19.000', text: 'Semua sistem terkoneksi dan tersinkronisasi otomatis.' },
]);

// Multi-server streaming endpoints for maximum reliability across devices and networks
const sampleVideoSources = {
  highQuality: [
    { quality: '1080p' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', bitrate: '8.2 Mbps', server: 'Server 1 (Google Fast CDN)' },
    { quality: '720p' as const, url: 'https://vjs.zencdn.net/v/oceans.mp4', bitrate: '4.5 Mbps', server: 'Server 2 (Fast Mirror)' },
    { quality: '4K' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', bitrate: '18.5 Mbps', server: 'Server 1 (Ultra HD)' },
    { quality: 'Auto' as const, url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', bitrate: 'Adaptif Multi-Bitrate', server: 'Server 3 (HLS Live Stream)' },
    { quality: '480p' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', bitrate: '2.1 Mbps', server: 'Server 4 (Hemat Data)' },
  ],
  tearsOfSteel: [
    { quality: '1080p' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', bitrate: '8.5 Mbps', server: 'Server 1 (Google Fast CDN)' },
    { quality: '720p' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', bitrate: '4.8 Mbps', server: 'Server 2 (Mirror HD)' },
    { quality: 'Auto' as const, url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', bitrate: 'Adaptif HLS', server: 'Server 3 (HLS Live Stream)' },
  ],
  sintel: [
    { quality: '1080p' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', bitrate: '7.8 Mbps', server: 'Server 1 (Google Fast CDN)' },
    { quality: '720p' as const, url: 'https://vjs.zencdn.net/v/oceans.mp4', bitrate: '4.2 Mbps', server: 'Server 2 (Fast Mirror)' },
  ],
};

export const CATALOG_ITEMS: MediaItem[] = [
  {
    id: 'drakor-1',
    title: 'Seoul Night: Queen of Destiny',
    originalTitle: '별이 빛나는 밤 (Seoul Night)',
    type: 'video',
    category: 'drakor',
    genre: ['Romansa', 'Drama', 'Konglomerat', 'Emosional'],
    year: 2024,
    rating: 9.6,
    episodesCount: 16,
    poster: '/src/assets/images/drakor_queen_destiny_1792734795437.jpg',
    backdrop: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
    synopsis:
      'Kisah cinta epik antara pewaris tahta konglomerat yang dingin dan seorang arsitek muda idealis. Di tengah perebutan kekuasaan keluarga chaebol dan intrik Seoul modern, ikatan tak terduga memicu pengorbanan yang mengubah hidup mereka selamanya.',
    cast: ['Park Hae-jin', 'Kim Ji-won', 'Lee Dong-wook', 'Han So-hee'],
    director: 'Lee Mo-geol',
    sources: sampleVideoSources.highQuality,
    subtitles: [
      { id: 'sub-id-1', label: 'Indonesia (Resmi)', language: 'id', src: drakorIndoSubtitles, default: true },
      { id: 'sub-en-1', label: 'English (SDH)', language: 'en', src: movieIndoSubtitles },
    ],
    episodes: [
      {
        id: 'ep-1-1',
        episodeNumber: 1,
        title: 'Episode 1: Pertemuan Tak Terduga di Bawah Hujan Gangnam',
        duration: 3600,
        thumbnail: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
        sources: sampleVideoSources.highQuality,
        subtitles: [{ id: 'ep1-sub-id', label: 'Indonesia (Resmi)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
      {
        id: 'ep-1-2',
        episodeNumber: 2,
        title: 'Episode 2: Rahasia di Balik Tahta Chaebol',
        duration: 3820,
        thumbnail: '/src/assets/images/drakor_queen_destiny_1792734795437.jpg',
        sources: sampleVideoSources.tearsOfSteel,
        subtitles: [{ id: 'ep2-sub-id', label: 'Indonesia (Resmi)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
      {
        id: 'ep-1-3',
        episodeNumber: 3,
        title: 'Episode 3: Pengakuan di Menara Namsan',
        duration: 4100,
        thumbnail: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
        sources: sampleVideoSources.sintel,
        subtitles: [{ id: 'ep3-sub-id', label: 'Indonesia (Resmi)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
      {
        id: 'ep-1-4',
        episodeNumber: 4,
        title: 'Episode 4: Badai Persaingan Bisnis',
        duration: 3950,
        thumbnail: '/src/assets/images/drakor_queen_destiny_1792734795437.jpg',
        sources: sampleVideoSources.highQuality,
        subtitles: [{ id: 'ep4-sub-id', label: 'Indonesia (Resmi)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
    ],
  },
  {
    id: 'dracin-1',
    title: 'An Ethereal Xianxia Legend: Pedang Giok Langit',
    originalTitle: '剑影仙踪 (Sword Shadow Immortal)',
    type: 'video',
    category: 'dracin',
    genre: ['Wuxia', 'Xianxia', 'Romansa Fantasi', 'Aksi Seni Bela Diri'],
    year: 2024,
    rating: 9.8,
    episodesCount: 40,
    poster: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
    backdrop: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
    synopsis:
      'Di era tiga alam mitologi Tiongkok kuno, seorang murid sekte pedang bereinkarnasi membawa pusaka langit purba. Demi membebaskan dewi bunga lotus dari kutukan seribu tahun, ia menempuh jalan kultivasi berbahaya melintasi gunung dewa dan alam iblis.',
    cast: ['Song Wei-long', 'Gu Li-nazha', 'Wang He-di', 'Bai Lu'],
    director: 'Chen Kaige Studio',
    sources: sampleVideoSources.tearsOfSteel,
    subtitles: [
      { id: 'sub-dracin-id', label: 'Indonesia (Sub Indo)', language: 'id', src: dracinIndoSubtitles, default: true },
      { id: 'sub-dracin-zh', label: 'Mandarin (Simplified)', language: 'zh', src: movieIndoSubtitles },
    ],
    episodes: [
      {
        id: 'ep-dracin-1',
        episodeNumber: 1,
        title: 'Episode 1: Kebangkitan Pusaka Pedang Kunlun',
        duration: 2700,
        thumbnail: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
        sources: sampleVideoSources.tearsOfSteel,
        subtitles: [{ id: 'ep-dr-sub1', label: 'Indonesia (Sub Indo)', language: 'id', src: dracinIndoSubtitles, default: true }],
      },
      {
        id: 'ep-dracin-2',
        episodeNumber: 2,
        title: 'Episode 2: Pertarungan di Danau Teratai Mistis',
        duration: 2850,
        thumbnail: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
        sources: sampleVideoSources.highQuality,
        subtitles: [{ id: 'ep-dr-sub2', label: 'Indonesia (Sub Indo)', language: 'id', src: dracinIndoSubtitles, default: true }],
      },
      {
        id: 'ep-dracin-3',
        episodeNumber: 3,
        title: 'Episode 3: Sumpah Darah di Lembah Giok',
        duration: 2900,
        thumbnail: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
        sources: sampleVideoSources.sintel,
        subtitles: [{ id: 'ep-dr-sub3', label: 'Indonesia (Sub Indo)', language: 'id', src: dracinIndoSubtitles, default: true }],
      },
    ],
  },
  {
    id: 'drakor-2',
    title: 'Melodi Masa Muda (Youth Echoes)',
    originalTitle: '노을의 아이들 (Children of the Sunset)',
    type: 'video',
    category: 'drakor',
    genre: ['Coming-of-Age', 'Persahabatan', 'Musik', 'Nostalgia'],
    year: 2024,
    rating: 9.3,
    episodesCount: 12,
    poster: '/src/assets/images/drakor_youth_melody_1792734796686.jpg',
    backdrop: '/src/assets/images/drakor_youth_melody_1792734796686.jpg',
    synopsis:
      'Kisah persahabatan tiga remaja di tepi Sungai Han yang bermimpi mendirikan band akustik legendaris. Menghadapi ujian kelulusan, patah hati pertama, dan tekanan impian orang tua, musik menjadi bahasa cinta dan keabadian masa muda mereka.',
    cast: ['Kim Dong-hyun', 'Kim So-hyun', 'Park Seo-jun'],
    director: 'Kim Jin-min',
    sources: sampleVideoSources.sintel,
    subtitles: [
      { id: 'sub-ym-id', label: 'Indonesia (Sub Indo)', language: 'id', src: drakorIndoSubtitles, default: true },
    ],
    episodes: [
      {
        id: 'ep-ym-1',
        episodeNumber: 1,
        title: 'Episode 1: Kaset Pita Pertama & Senja Han River',
        duration: 3300,
        thumbnail: '/src/assets/images/drakor_youth_melody_1792734796686.jpg',
        sources: sampleVideoSources.sintel,
        subtitles: [{ id: 'sub-ym-1-id', label: 'Indonesia (Sub Indo)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
      {
        id: 'ep-ym-2',
        episodeNumber: 2,
        title: 'Episode 2: Melodi Gitar yang Tak Selesai',
        duration: 3450,
        thumbnail: '/src/assets/images/drakor_youth_melody_1792734796686.jpg',
        sources: sampleVideoSources.highQuality,
        subtitles: [{ id: 'sub-ym-2-id', label: 'Indonesia (Sub Indo)', language: 'id', src: drakorIndoSubtitles, default: true }],
      },
    ],
  },
  {
    id: 'movie-1',
    title: 'Cyber Heist: Jakarta Neo 2049',
    originalTitle: 'Jakarta 2049: The Digital Citadel',
    type: 'video',
    category: 'movie',
    genre: ['Sci-Fi', 'Cyberpunk', 'Thriller', 'Aksi Spektakuler'],
    year: 2025,
    rating: 9.1,
    episodesCount: 1,
    poster: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
    backdrop: '/src/assets/images/hero_cinematic_stream_1792734794929.jpg',
    synopsis:
      'Di Jakarta masa depan dengan gedung pencakar langit berlumur neon dan kabel kuantum, sebuah tim hacker etis berpacu membongkar konspirasi AI raksasa yang mengancam jaringan energi Nusantara. Efek visual sinematik memukau dengan audio Dolby Atmos siap dinikmati.',
    cast: ['Reza Rahadian', 'Laura Basuki', 'Chicco Jerikho'],
    director: 'Joko Anwar',
    sources: sampleVideoSources.highQuality,
    subtitles: [
      { id: 'sub-jb-id', label: 'Bahasa Indonesia (Audio Asli + Subtitle)', language: 'id', src: movieIndoSubtitles, default: true },
      { id: 'sub-jb-en', label: 'English Translation', language: 'en', src: movieIndoSubtitles },
    ],
  },
  {
    id: 'audio-1',
    title: 'Stay With Me (K-Drama OST Acoustic)',
    originalTitle: '내 곁에 머물러줘',
    type: 'audio',
    category: 'music',
    genre: ['K-OST', 'Akustik Emosional', 'Piano & Strings'],
    year: 2024,
    rating: 9.9,
    poster: '/src/assets/images/drakor_queen_destiny_1792734795437.jpg',
    backdrop: '/src/assets/images/drakor_queen_destiny_1792734795437.jpg',
    synopsis: 'Soundtrack resmi serial drama "Seoul Night". Menampilkan aransemen orkestra megah berpadu vokal emosional dengan kejernihan audio format FLAC / High-Res.',
    cast: ['Chanyeol & Punch Inspired Ensemble', 'Seoul Philharmonic Orchestra'],
    sources: [
      { quality: 'Auto' as const, url: 'https://cdn.freesound.org/previews/612/612643_5674468-lq.mp3', bitrate: '320 kbps High-Res' },
      { quality: '1080p' as const, url: 'https://cdn.freesound.org/previews/612/612643_5674468-lq.mp3', bitrate: 'FLAC Lossless' },
    ],
    subtitles: [
      { id: 'sub-audio-1', label: 'Lirik Romaji & Arti Bahasa Indonesia', language: 'id', src: drakorIndoSubtitles, default: true },
    ],
  },
  {
    id: 'audio-2',
    title: 'Bamboo Whisper (Dracin Xianxia Flute & Guqin OST)',
    originalTitle: '竹林听雨 (Bamboo Rain Melody)',
    type: 'audio',
    category: 'music',
    genre: ['C-OST', 'Tradisional Tiongkok', 'Meditasi Flute & Guqin'],
    year: 2024,
    rating: 9.7,
    poster: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
    backdrop: '/src/assets/images/dracin_immortal_sword_1792734796734.jpg',
    synopsis: 'Lagu tema pertarungan pedang dan meditasi batin dari serial "Pedang Giok Langit". Suara seruling bambu Dizi berpadu petikan senar Guqin yang menenangkan jiwa.',
    cast: ['Master Zhou Xianlin', 'National Chinese Traditional Orchestra'],
    sources: [
      { quality: 'Auto' as const, url: 'https://cdn.freesound.org/previews/561/561845_11861866-lq.mp3', bitrate: '320 kbps Studio Master' },
    ],
    subtitles: [
      { id: 'sub-audio-2', label: 'Syair Puisi Dinasti & Terjemahan Indonesia', language: 'id', src: dracinIndoSubtitles, default: true },
    ],
  },
];
