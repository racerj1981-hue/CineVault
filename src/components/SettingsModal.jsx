import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Tv,
  RotateCcw,
  Check,
  Play,
  Download,
  Puzzle
} from 'lucide-react';

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetCatalog,
  totalMoviesCount = 0
}) => {
  const [formData, setFormData] = useState(() => ({
    ...(settings || {})
  }));
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="settings-modal"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Cinema & Playback Settings</h2>
              <p className="text-xs text-zinc-400">Configure playback architecture, Chrome extension, and cinema catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 text-sm text-zinc-300">
          {/* Section 1: Stream Architecture */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <h3 className="font-semibold text-white text-sm">
                Stream Architecture & Network Proxy
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Choose your preferred streaming route. Both modes support full MP4 byte-range seeking and native HTML5 playback.
            </p>

            <div className="space-y-2.5">
              {/* Direct Origin Option */}
              <label
                onClick={() => setFormData(prev => ({ ...prev, defaultPlaybackMode: 'direct' }))}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                  (formData.defaultPlaybackMode || 'direct') === 'direct'
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-xs'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    (formData.defaultPlaybackMode || 'direct') === 'direct'
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-zinc-600'
                  }`}>
                    {(formData.defaultPlaybackMode || 'direct') === 'direct' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">⚡ Direct Origin (Fastest CDN)</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Connect directly to source CDN with 0ms proxy lag and full hardware acceleration
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                  (formData.defaultPlaybackMode || 'direct') === 'direct'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  Fast CDN
                </span>
              </label>

              {/* Cloud Stream Relay Option */}
              <label
                onClick={() => setFormData(prev => ({ ...prev, defaultPlaybackMode: 'relay' }))}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                  formData.defaultPlaybackMode === 'relay'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.defaultPlaybackMode === 'relay'
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-zinc-600'
                  }`}>
                    {formData.defaultPlaybackMode === 'relay' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">🛡️ Cloud Stream Relay (Filter Bypass)</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Proxies video through this origin with HTTP range forwarding to bypass Linwize and school filters
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                  formData.defaultPlaybackMode === 'relay'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  Filter Bypass
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Chrome Extension & Web App */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Puzzle className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Chrome Extension & Web App</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Download or install CineVault directly into Google Chrome. The app and extension display the official CineVault cinema icon.
            </p>

            {/* Icon Preview Card */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.ibb.co/Rpk3DsQb/Screenshot-2026-09-10-181041-1-1.jpg"
                  alt="CineVault App Icon"
                  className="w-10 h-10 rounded-xl shadow-md border border-zinc-800 object-contain bg-zinc-950 p-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Official CineVault Website Icon</span>
                  <span className="text-[11px] text-zinc-400 block">
                    High definition custom site favicon and web application icon
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 shrink-0">
                Active
              </span>
            </div>

            {/* Download Chrome Extension action */}
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    Download Chrome Extension (.zip)
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Pre-packaged Manifest V3 extension ready to load in Chrome Developer Mode
                  </span>
                </div>
                <a
                  href="/api/download-chrome-extension"
                  download="cinevault-chrome-extension.zip"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Extension</span>
                </a>
              </div>

              {/* Installation steps */}
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-300 text-xs mb-1">How to load in Google Chrome:</div>
                <p>1. Download and extract <code className="text-amber-400">cinevault-chrome-extension.zip</code></p>
                <p>2. Open <code className="text-amber-400">chrome://extensions</code> and turn ON <strong className="text-zinc-200">Developer mode</strong> (top right)</p>
                <p>3. Click <strong className="text-zinc-200">Load unpacked</strong> and select the extracted folder</p>
              </div>
            </div>
          </div>

          {/* Section 3: Catalog & Cinema Defaults */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Catalog & Cinema Defaults</h3>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">
                  Movie Catalog ({totalMoviesCount} titles loaded)
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Restore original default cinema list if needed
                </span>
              </div>
              <button
                type="button"
                onClick={onResetCatalog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-amber-400 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Catalog</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">
              {savedNotice ? '✓ Settings Saved!' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
