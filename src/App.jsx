import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_MEDIA_ITEMS } from './data/defaultMovies';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { MediaGrid } from './components/MediaGrid';
import { PlayerView } from './components/PlayerView';
import { YouTubeView } from './components/YouTubeView';
import { AddMediaModal } from './components/AddMediaModal';
import { SettingsModal } from './components/SettingsModal';
import { StealthCloakOverlay } from './components/StealthCloakOverlay';
import { MovieIcon } from './components/MovieIcon';
import { Settings } from 'lucide-react';
import {
  getStoredSettings,
  saveStoredSettings,
  applyTabCloak
} from './utils/cloaker';

const STORAGE_CATALOG_KEY = 'unblocked_movies_catalog_v3';
const STORAGE_FAV_KEY = 'unblocked_movies_favorites_v2';

export default function App() {
  // Active navigation tab: 'movies' | 'youtube'
  const [currentTab, setCurrentTab] = useState('movies');

  // Catalog state - strictly movies only, games filtered out
  const [mediaItems, setMediaItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOG_KEY) || localStorage.getItem('unblocked_movies_catalog_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly remove any lingering games
          const onlyMovies = parsed.filter((i) => i.type !== 'game');
          // Merge with default items to ensure latest verified stream URLs and valid thumbnails
          const merged = onlyMovies.map((item) => {
            const def = DEFAULT_MEDIA_ITEMS.find((d) => d.id === item.id);
            if (def) {
              return {
                ...item,
                iframeUrl: def.iframeUrl,
                iframe: def.iframe,
                thumbnail: def.thumbnail,
                streamUrl: def.streamUrl,
                archiveId: def.archiveId,
              };
            }
            return item;
          });
          const missingDefaults = DEFAULT_MEDIA_ITEMS.filter((def) => !merged.some((m) => m.id === def.id));
          return [...missingDefaults, ...merged];
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_MEDIA_ITEMS.filter((i) => i.type !== 'game');
  });

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAV_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Player state
  const [activeItem, setActiveItem] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modals & Overlays
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStealthCloakOpen, setIsStealthCloakOpen] = useState(false);

  // User Settings
  const [settings, setSettings] = useState(getStoredSettings);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleTriggerCloak = () => {
    applyTabCloak(settings.cloakPreset);
    if (settings.enableInPageOverlay) {
      setIsStealthCloakOpen(true);
    }
  };

  // Auto-cloak on tab blur/switch (teacher walk-by protection)
  useEffect(() => {
    if (!settings.autoCloakOnBlur) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        applyTabCloak(settings.cloakPreset);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.autoCloakOnBlur, settings.cloakPreset]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Save catalog changes to localStorage (excluding any games)
  useEffect(() => {
    try {
      const onlyMovies = mediaItems.filter((i) => i.type !== 'game');
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(onlyMovies));
    } catch {
      // ignore
    }
  }, [mediaItems]);

  // Handle URL hash for deep linking (e.g. #play=night-of-the-living-dead)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#play=')) {
        const id = hash.replace('#play=', '');
        const found = mediaItems.find((i) => i.id === id);
        if (found) {
          setActiveItem(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (!hash) {
        setActiveItem(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [mediaItems]);

  // Toggle favorite
  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Launch Player
  const handlePlay = (item) => {
    setActiveItem(item);
    window.location.hash = `play=${item.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Catalog (Exit)
  const handleBack = () => {
    setActiveItem(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add Item to Catalog
  const handleAddItem = (newItem) => {
    setMediaItems((prev) => [newItem, ...prev.filter((i) => i.type !== 'game')]);
    setActiveItem(newItem);
    window.location.hash = `play=${newItem.id}`;
  };

  // Reset to Default
  const handleResetToDefault = () => {
    const onlyMovies = DEFAULT_MEDIA_ITEMS.filter((i) => i.type !== 'game');
    setMediaItems(onlyMovies);
    localStorage.removeItem(STORAGE_CATALOG_KEY);
  };

  // Random Pick
  const handleRandomPick = () => {
    const available = mediaItems.length > 0 ? mediaItems : DEFAULT_MEDIA_ITEMS;
    const randomIndex = Math.floor(Math.random() * available.length);
    handlePlay(available[randomIndex]);
  };

  // Dynamic genres based on movies
  const categories = useMemo(() => {
    const set = new Set();
    mediaItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [mediaItems]);

  // Filtered & Sorted movies
  const filteredItems = useMemo(() => {
    return mediaItems
      .filter((item) => {
        // Exclude any games
        if (item.type === 'game') return false;

        // Favorites filter
        if (showFavoritesOnly && !favorites.includes(item.id)) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          const matchYear = item.year?.toString().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchTags && !matchYear) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating' || sortBy === 'popular') {
          const rA = parseFloat(a.rating || '0') || 0;
          const rB = parseFloat(b.rating || '0') || 0;
          return rB - rA;
        }
        if (sortBy === 'newest') {
          const yA = typeof a.year === 'number' ? a.year : 0;
          const yB = typeof b.year === 'number' ? b.year : 0;
          return yB - yA;
        }
        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    mediaItems,
    showFavoritesOnly,
    favorites,
    selectedCategory,
    searchQuery,
    sortBy,
  ]);

  // If in Player View, render player
  if (activeItem) {
    return (
      <>
        <PlayerView
          item={activeItem}
          allCatalog={mediaItems}
          onBack={handleBack}
          onSelectNext={handlePlay}
          onSelectPrev={handlePlay}
          isFavorite={favorites.includes(activeItem.id)}
          onToggleFavorite={handleToggleFavorite}
          onTriggerCloak={handleTriggerCloak}
        />
        <StealthCloakOverlay
          isOpen={isStealthCloakOpen}
          onClose={() => setIsStealthCloakOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (activeItem) setActiveItem(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'movies') {
            setCurrentTab('movies');
          }
        }}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoritesCount={favorites.length}
        totalItemsCount={mediaItems.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTriggerCloak={handleTriggerCloak}
        onRandomPick={handleRandomPick}
      />

      {/* Main Content Area */}
      {currentTab === 'youtube' ? (
        <YouTubeView
          onTriggerCloak={handleTriggerCloak}
          savedCloakPreset={settings.cloakPreset}
        />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {showFavoritesOnly ? (
                  <span>Saved Favorites ({filteredItems.length})</span>
                ) : (
                  <span>Cinema Catalog ({filteredItems.length})</span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Cinema collection with unblocked high definition streaming
              </p>
            </div>


          </div>

          {/* Categories & Sorting Toolbar */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Cards Grid */}
          <MediaGrid
            items={filteredItems}
            onPlay={handlePlay}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onClearFilters={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setShowFavoritesOnly(false);
            }}
          />
        </main>
      )}

      {/* Modals & Overlays */}
      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetCatalog={handleResetToDefault}
      />

      <StealthCloakOverlay
        isOpen={isStealthCloakOpen}
        onClose={() => setIsStealthCloakOpen(false)}
      />

      {/* Cinema Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-zinc-950/80 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MovieIcon className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-zinc-300">CINEVAULT</span>
            <span className="text-zinc-600">|</span>
            <span>Curated Cinema Archive</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="footer-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Open Settings"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer font-medium text-xs shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
