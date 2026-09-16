import React, { useEffect } from 'react';
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
                  src="https://i.ibb.co/Y4VrQC5n/Screenshot-2026-09-10-181041-1.png"
                  alt="Search"
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain select-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/search-icon.png';
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
