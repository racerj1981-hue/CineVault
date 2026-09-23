import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  Mic,
  SlidersHorizontal,
  Globe,
  Sparkles,
  TrendingUp,
  Music,
  Tv,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  WifiOff,
  User,
  HardDriveDownload
} from 'lucide-react';
import { extractYouTubeId, getChannelAvatar, getFallbackAvatarDataUri } from '../../data/youtubeData';
import { YouTubeLogo } from '../YouTubeLogo';

const POPULAR_SUGGESTIONS = [
  'Lofi Hip Hop Radio - Beats to relax/study to',
  'Mark Rober science engineering',
  'Minecraft speedrun & builds',
  'Full Free HD Movies',
  'Ambient Synthwave & Chill Music',
  'MrBeast challenges',
  'NASA Space Exploration & Webb Telescope',
  '4K Relaxing Nature Documentary'
];

export const YouTubeWebHeader = ({
  onSearch,
  currentSearchQuery = '',
  onGoHome,
  onToggleSidebar,
  isSidebarCollapsed,
  selectedNodeIndex = 0,
  onSelectNode,
  onOpenDiagnostics,
  activeVideo = null,
  isOfflineMode = false,
  onToggleOfflineMode,
  activeProfile = null,
  onOpenProfileManager
}) => {
  const [query, setQuery] = useState(currentSearchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Sync external search query changes
  useEffect(() => {
    setQuery(currentSearchQuery || '');
  }, [currentSearchQuery]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    onSearch(trimmed);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
  };

  const filteredSuggestions = POPULAR_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/80 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 select-none">
      {/* 1. Left: Hamburger Menu & YouTube Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-full hover:bg-zinc-850 text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          id="youtube-browser-home-logo-btn"
          onClick={onGoHome}
          className="flex items-center gap-2.5 group cursor-pointer active:scale-95 transition-transform"
          title="YouTube Home (Tap to refresh YouTube browser feed)"
        >
          {/* Authentic YouTube Logo matching reference image */}
          <YouTubeLogo className="h-5 sm:h-5.5 w-auto group-hover:opacity-95 transition" textColor="#FFFFFF" />
        </button>

        {/* Profile of the Video next to YouTube icon */}
        {activeVideo && (
          <div
            onClick={onGoHome}
            title={`${activeVideo.channel} • ${activeVideo.title}`}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-zinc-800 cursor-pointer group/profile"
          >
            <img
              src={getChannelAvatar(activeVideo.channel, activeVideo)}
              alt={activeVideo.channel || 'Video Profile'}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-zinc-700/80 group-hover/profile:ring-rose-500 transition shrink-0 shadow-xs"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getFallbackAvatarDataUri(activeVideo.channel || 'YT');
              }}
            />
            <div className="hidden md:flex flex-col min-w-0 max-w-[120px] lg:max-w-[180px]">
              <span className="text-xs font-bold text-white group-hover/profile:text-rose-400 transition truncate leading-tight">
                {activeVideo.channel}
              </span>
              <span className="text-[10px] text-zinc-400 truncate leading-none">
                {activeVideo.title}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Center: YouTube Search Bar (The Core In-Browser Search Bar) */}
      <div
        ref={searchContainerRef}
        className="flex-1 max-w-2xl min-w-0 flex items-center justify-center relative mx-1 sm:mx-4"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center rounded-full bg-zinc-900 border border-zinc-700/80 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/40 shadow-inner overflow-hidden transition"
        >
          {/* Search Input Box */}
          <div className="flex-1 flex items-center px-3.5 py-1.5 gap-2 min-w-0">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={query ?? ''}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              placeholder="Search YouTube videos, songs, creators, or paste any video link..."
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* YouTube Search Button */}
          <button
            type="submit"
            className="px-4 sm:px-5 py-2 bg-zinc-800 hover:bg-zinc-750 border-l border-zinc-700/80 text-zinc-200 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
            title="Search YouTube"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>Suggested Searches</span>
              <span className="text-amber-400 font-normal">Unblocked & verified</span>
            </div>

            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {(filteredSuggestions.length > 0 ? filteredSuggestions : POPULAR_SUGGESTIONS).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Right: Quick Actions, Offline Mode, & Viewer Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Offline Mode Toggle Button */}
        {onToggleOfflineMode && (
          <button
            type="button"
            onClick={onToggleOfflineMode}
            title={isOfflineMode ? 'Disable Offline Mode' : 'Enable Offline Mode'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
              isOfflineMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Online</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenDiagnostics}
          title="Connection diagnostics"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-950/60 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected</span>
        </button>

        {/* Viewer Profile Selector Button */}
        {onOpenProfileManager && (
          <button
            type="button"
            onClick={onOpenProfileManager}
            title={`Active Profile: ${activeProfile?.name || 'Personal'} - Click to switch`}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-amber-400 transition cursor-pointer shadow-xs"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">
              {activeProfile?.avatarEmoji || '👤'}
            </div>
            <span className="text-xs font-bold text-zinc-200 hidden sm:inline max-w-[100px] truncate">
              {activeProfile?.name?.split(' ')[0] || 'Profile'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
