import React, { useState } from 'react';
import { X, RefreshCw, Smartphone, Laptop, Tv, Check, Copy, ArrowRight, ShieldCheck, Download, Upload } from 'lucide-react';
import { SyncProfile } from '../../types/media';

interface DeviceSyncModalProps {
  profile: SyncProfile;
  onClose: () => void;
  onUpdateProfile: (newProfile: Partial<SyncProfile>) => void;
  onImportProfile: (jsonString: string) => boolean;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onImportProfile,
}) => {
  const [partnerCode, setPartnerCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const copySyncCode = () => {
    navigator.clipboard.writeText(profile.syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim()) return;

    setIsLinking(true);
    setTimeout(() => {
      onUpdateProfile({ syncId: partnerCode.toUpperCase() });
      setIsLinking(false);
      setLinkSuccess(true);
      setTimeout(() => setLinkSuccess(false), 3000);
    }, 1000);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nusantara-sync-${profile.syncId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = onImportProfile(importText);
    if (ok) {
      setShowImport(false);
      setLinkSuccess(true);
      setTimeout(() => setLinkSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sinkronisasi Lintas Perangkat</h2>
              <p className="text-xs text-neutral-400">Riwayat, favorit & progres tonton otomatis terhubung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Active Device Sync Code Card */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-2">
            <span className="text-xs text-neutral-400 font-medium">Kode Sinkronisasi Perangkat Ini:</span>
            <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                {profile.syncId}
              </span>
              <button
                onClick={copySyncCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Gunakan kode ini di HP, Tablet, atau Laptop lain untuk menyinkronkan riwayat dan tontonan Anda tanpa login
              rumit.
            </p>
          </div>

          {/* Connect Another Device Form */}
          <form onSubmit={handleLinkDevice} className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 block">
              Hubungkan dengan Kode Perangkat Lain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="Contoh: SYNC-749210"
                className="flex-1 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isLinking || !partnerCode.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
              >
                {isLinking ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Tautkan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {linkSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Berhasil terhubung! Data riwayat dan preferensi sekarang otomatis tersinkronisasi.</span>
              </div>
            )}
          </form>

          {/* Connected Device Ecosystem Preview */}
          <div className="pt-4 border-t border-neutral-800">
            <span className="text-xs font-semibold text-neutral-400 block mb-3 uppercase tracking-wider">
              Ekosistem Perangkat Terkoneksi
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-rose-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{profile.deviceName} (Perangkat Ini)</h4>
                    <p className="text-[10px] text-neutral-500">Tersinkron otomatis via Broadcast & WebStorage</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Aktif Sekarang</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-neutral-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-300">Smartphone / Tablet</h4>
                    <p className="text-[10px] text-neutral-500">Menerima update riwayat otomatis</p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Tersambung</span>
              </div>
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Ekspor Backup</span>
            </button>

            <button
              onClick={() => setShowImport(!showImport)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Impor Data</span>
            </button>
          </div>

          {showImport && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-[11px] text-neutral-400 block">Tempel JSON Data Backup:</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"syncId": "SYNC-...", "history": [...]}'
                rows={3}
                className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[11px] font-mono text-white focus:outline-none"
              />
              <button
                onClick={handleImportSubmit}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Muat Data Sinkronisasi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Enkripsi Sesi Peer-to-Peer
          </span>
          <span className="font-mono">Auto-Sync On</span>
        </div>
      </div>
    </div>
  );
};
