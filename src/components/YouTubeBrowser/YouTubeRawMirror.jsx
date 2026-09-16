import React, { useState } from 'react';
import { Globe, RotateCcw, ExternalLink, ShieldAlert, ArrowLeft } from 'lucide-react';

const RAW_MIRROR_URLS = [
  { id: 'nadeko', name: 'Invidious (inv.nadeko.net)', url: 'https://inv.nadeko.net' },
  { id: 'piped', name: 'Piped Video (piped.video)', url: 'https://piped.video' },
  { id: 'nerdvpn', name: 'Invidious 2 (invidious.nerdvpn.de)', url: 'https://invidious.nerdvpn.de' },
  { id: 'translate', name: 'Google Translate Web Proxy', url: 'https://translate.google.com/translate?sl=auto&tl=en&u=https%3A%2F%2Fwww.youtube.com' }
];

export const YouTubeRawMirror = ({ onSwitchToPortal }) => {
  const [selectedMirror, setSelectedMirror] = useState(RAW_MIRROR_URLS[0].url);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      {/* Mirror Sub-bar */}
      <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-semibold text-zinc-300">Live Web Mirror:</span>
          <select
            value={selectedMirror ?? ''}
            onChange={(e) => {
              setSelectedMirror(e.target.value);
              setReloadKey((prev) => prev + 1);
            }}
            className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
          >
            {RAW_MIRROR_URLS.map((m) => (
              <option key={m.id} value={m.url}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
            title="Reload mirror"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reload</span>
          </button>
          <button
            onClick={onSwitchToPortal}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Switch to YouTube Web App</span>
          </button>
        </div>
      </div>

      {/* Mirror Iframe */}
      <div className="flex-1 relative bg-black">
        <iframe
          key={`raw-mirror-${selectedMirror}-${reloadKey}`}
          src={selectedMirror}
          title="YouTube Live Mirror"
          className="w-full h-full border-0 absolute inset-0 bg-zinc-900"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
};
