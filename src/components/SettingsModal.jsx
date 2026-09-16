import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Tv,
  RotateCcw,
  Check,
  ExternalLink,
  Laptop,
  Play,
  Globe
} from 'lucide-react';
import { CLOAK_PRESETS, DEFAULT_SETTINGS, applyTabCloak } from '../utils/cloaker';

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetCatalog,
  totalMoviesCount = 0
}) => {
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...(settings || {})
  }));
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        ...DEFAULT_SETTINGS,
        ...settings
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetId) => {
    setFormData((prev) => ({ ...prev, cloakPreset: presetId }));
    applyTabCloak(presetId);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    applyTabCloak(formData.cloakPreset);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const currentPresetObj = CLOAK_PRESETS.find((p) => p.id === formData.cloakPreset) || CLOAK_PRESETS[0];

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
              <h2 className="text-base font-bold text-white tracking-tight">Cinema & Cloak Settings</h2>
              <p className="text-xs text-zinc-400">Configure tab disguise, in-page stealth, panic button, and playback</p>
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
          {/* Section 1: Tab Cloaking Presets */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Stealth Tab Camouflage</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Changes browser tab title and favicon in-place to prevent teachers and screen monitors from seeing movie titles.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CLOAK_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    formData.cloakPreset === preset.id
                      ? 'bg-amber-500/15 border-amber-400/80 text-amber-300 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium text-xs truncate">{preset.name}</span>
                    {formData.cloakPreset === preset.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono truncate w-full">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Live tab preview */}
            <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold shrink-0">
                Tab Preview:
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 truncate">
                <img
                  src={currentPresetObj.icon}
                  alt=""
                  className="w-3.5 h-3.5 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-medium truncate">{currentPresetObj.title}</span>
              </div>
            </div>
          </div>

          {/* Section 2: In-Page Stealth Disguise & Behavior */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">In-Page Stealth Disguise</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Cloak stays directly on this page without opening any new tabs or windows.
            </p>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={Boolean(formData.enableInPageOverlay)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, enableInPageOverlay: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-zinc-700 text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="font-medium text-xs text-zinc-200 block">
                    Show In-Page Classroom Disguise on Cloak
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Clicking Cloak immediately overlays an authentic Google Classroom dashboard right in this tab. Press Esc anytime to exit.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={Boolean(formData.autoCloakOnBlur)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, autoCloakOnBlur: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-zinc-700 text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="font-medium text-xs text-zinc-200 block">
                    Auto-Disguise Tab on Blur (When Switching Tabs)
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Automatically cloaks tab title whenever you click another window or tab.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Panic Emergency Exit Button */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-white text-sm">Panic Emergency Exit</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Instantly replaces the current tab with an innocent educational site when pressed or via hotkey.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Panic Redirect URL
                </label>
                <input
                  type="url"
                  value={formData.panicUrl ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, panicUrl: e.target.value }))}
                  placeholder="https://classroom.google.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Quick URL presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Classroom', url: 'https://classroom.google.com' },
                  { name: 'Google Drive', url: 'https://drive.google.com' },
                  { name: 'Google Docs', url: 'https://docs.google.com' },
                  { name: 'Google Search', url: 'https://www.google.com' },
                  { name: 'Canvas LMS', url: 'https://canvas.instructure.com' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.url}
                    onClick={() => setFormData((prev) => ({ ...prev, panicUrl: item.url }))}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div>
                  <span className="text-xs font-medium text-zinc-200 block">Panic Hotkey</span>
                  <span className="text-[11px] text-zinc-500 block">
                    Pressing this key triggers immediate emergency redirect
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-amber-400 font-mono text-xs border border-zinc-700">
                  ` (Backtick) or ]
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Direct Stream Architecture */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <h3 className="font-semibold text-white text-sm">
                Direct Stream Architecture
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Media connects directly to origin CDN video streams using native HTML5 playback with zero proxy latency, maximum bandwidth, and complete byte-range seek support.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Direct Stream: Active</span>
                  <span className="text-[11px] text-emerald-400/90 block">
                    Zero intermediary proxies • Native hardware acceleration • Full range seeking
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 shrink-0">
                Direct Only
              </span>
            </div>
          </div>

          {/* Section 5: Catalog & Cinema Defaults */}
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
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
