import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Lock,
  Search,
  Star,
  Plus,
  X,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  Globe,
  Check,
  Tv,
  LayoutGrid,
  Zap,
  HelpCircle,
  TrendingUp,
  Music,
  Gamepad2,
  GraduationCap,
  Film,
  History,
  Sparkles
} from 'lucide-react';
import { YOUTUBE_PROXY_NODES } from '../../data/youtubeData';
import { YouTubePlayIcon } from '../YouTubeLogo';

export const BrowserChrome = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  currentUrl,
  onNavigateUrl,
  selectedNodeIndex,
  onSelectNode,
  viewMode,
  onToggleViewMode,
  isBrowserFullscreen,
  onToggleFullscreen,
}) => {
  const [omniboxValue, setOmniboxValue] = useState(currentUrl || 'https://www.youtube.com');
  const [isFocused, setIsFocused] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);

  // Sync omnibox with currentUrl when it changes externally
  useEffect(() => {
    if (!isFocused) {
      setOmniboxValue(currentUrl || 'https://www.youtube.com');
    }
  }, [currentUrl, isFocused]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNavigateUrl) {
      onNavigateUrl(omniboxValue.trim());
    }
  };

  const currentNode = YOUTUBE_PROXY_NODES[selectedNodeIndex] || YOUTUBE_PROXY_NODES[0];

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 select-none">
      {/* 1. Window Controls & Tab Strip */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-2 bg-zinc-950 border-b border-zinc-850">
        {/* macOS Style Window Dots */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <div
            title="Window Close"
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition shadow-xs"
          />
          <div
            onClick={onToggleFullscreen}
            title="Minimize / Window Mode"
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition shadow-xs"
          />
          <div
            onClick={onToggleFullscreen}
            title="Maximize Browser"
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition shadow-xs"
          />
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-semibold cursor-pointer max-w-[200px] sm:max-w-[240px] transition shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white border-t border-x border-zinc-800 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                {/* Tab Icon / Loading Indicator */}
                {tab.isLoading ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <YouTubePlayIcon className="w-3.5 h-2.5 shrink-0" />
                )}

                {/* Tab Title */}
                <span className="truncate text-xs">
                  {tab.title || 'YouTube'}
                </span>

                {/* Close Tab Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition cursor-pointer ml-auto shrink-0"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer shrink-0"
            title="Open new YouTube tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Browser Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Fullscreen Browser Toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isBrowserFullscreen ? 'Exit Browser Fullscreen' : 'Browser Fullscreen (F)'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            {isBrowserFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Navigation & Omnibox Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Click to go back (Alt+Left)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Click to go forward (Alt+Right)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Reload this page"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onGoHome}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="YouTube Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Smart Address Bar (Omnibox) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0">
          <div className="relative flex-1 flex items-center rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/40 shadow-inner px-3 py-1.5 transition">
            {/* SSL Lock & Unblocked Shield */}
            <div className="flex items-center gap-1 text-emerald-400 mr-2 shrink-0 select-none">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 hidden sm:inline">
                Unblocked
              </span>
            </div>

            {/* URL Input */}
            <input
              type="text"
              value={omniboxValue ?? ''}
              onChange={(e) => setOmniboxValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search YouTube or enter web address (e.g. youtube.com/watch?v=...)"
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
            />

            {/* Omnibox Actions */}
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              {/* Node / Mirror Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNodeMenu(!showNodeMenu)}
                  title="Switch bypass mirror engine"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-amber-400 cursor-pointer transition"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span className="hidden md:inline">{currentNode.name.split('(')[1]?.replace(')', '') || 'Node 1'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
                </button>

                {showNodeMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-500">
                      Select Bypass Node:
                    </div>
                    {YOUTUBE_PROXY_NODES.map((node, idx) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => {
                          onSelectNode(idx);
                          setShowNodeMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                          selectedNodeIndex === idx
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold">{node.name}</div>
                          <div className="text-[10px] text-zinc-500">{node.badge}</div>
                        </div>
                        {selectedNodeIndex === idx && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* View Mode Toggle: Interactive YouTube Portal vs Raw Web Mirror */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
          <button
            onClick={() => onToggleViewMode('portal')}
            title="Interactive YouTube Web App"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              viewMode === 'portal'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden sm:inline">Web App</span>
          </button>
          <button
            onClick={() => onToggleViewMode('mirror')}
            title="Raw Unblocked Web Mirror"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              viewMode === 'mirror'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span className="hidden sm:inline">Live Mirror</span>
          </button>
        </div>
      </div>
    </div>
  );
};
