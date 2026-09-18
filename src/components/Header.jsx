import React, { useEffect, useState } from 'react';
import {
  Film,
  Search,
  Plus,
  Star,
  Shuffle,
  Settings,
  Youtube,
  ShieldCheck
} from 'lucide-react';
import { MovieIcon } from './MovieIcon';
import { YouTubePlayIcon } from './YouTubeLogo';
import { triggerPanicButton } from '../utils/cloaker';
import searchIconAsset from '../assets/search-icon.png';

// Inline base64 search icon data URI to guarantee 100% availability in GitHub Pages, offline, and firewalls
const EMBEDDED_SEARCH_ICON =
  'data:image/png;base64,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';

export const Header = ({
  currentTab = 'movies',
  onTabChange,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
  favoritesCount,
  totalItemsCount,
  onOpenAddModal,
  onOpenSettings,
  onRandomPick,
}) => {
  // Panic shortcut listener (pressing ] or \ or `)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ']' || e.key === '`') {
        triggerPanicButton();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                if (onTabChange) onTabChange('movies');
                if (showFavoritesOnly) onToggleFavorites();
              }}
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-rose-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20">
                <MovieIcon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                    CINE<span className="text-amber-400">VAULT</span>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium hidden md:block">
                  Cinema & Unblocked Media
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Mode Tabs: Cinema vs YouTube Unblocked */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            <button
              id="nav-tab-movies"
              onClick={() => onTabChange && onTabChange('movies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentTab === 'movies'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>

            <button
              id="nav-tab-youtube"
              onClick={() => onTabChange && onTabChange('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentTab === 'youtube'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <YouTubePlayIcon className="w-4 h-3 shrink-0" />
              <span>YouTube Browser</span>
            </button>
          </div>

          {/* Search Input Field in Header with Requested Search Icon */}
          {currentTab === 'movies' ? (
            <div className="relative flex-1 max-w-[200px] sm:max-w-xs md:max-w-md min-w-0">
              <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                <img
                  src={searchIconAsset || EMBEDDED_SEARCH_ICON}
                  alt="Search"
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain select-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = EMBEDDED_SEARCH_ICON;
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <input
                id="search-media-input"
                type="text"
                value={searchQuery ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies in real-time..."
                className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 bg-zinc-900/90 border border-zinc-800 focus:border-amber-400 focus:bg-zinc-900 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 hidden sm:flex items-center justify-end text-xs text-zinc-400 gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                Linwize Proxy Active
              </span>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {currentTab === 'movies' && (
              <>
                {/* Random Pick Button */}
                <button
                  id="random-pick-btn"
                  onClick={onRandomPick}
                  title="Surprise me with a random movie"
                  className="p-2 text-zinc-400 hover:text-amber-400 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Favorites Filter */}
                <button
                  id="favorites-toggle-btn"
                  onClick={onToggleFavorites}
                  title="Show Favorites"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    showFavoritesOnly
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span className="hidden sm:inline">Favorites</span>
                  {favoritesCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-zinc-800 text-amber-300 rounded-full text-[10px] font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Add Movie button */}
                <button
                  id="add-media-btn"
                  onClick={onOpenAddModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Movie</span>
                </button>
              </>
            )}

            {/* Settings Button */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettings}
              title="Settings (Tab disguise, panic URL)"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
