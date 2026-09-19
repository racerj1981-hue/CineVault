import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  ListPlus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  History,
  Compass,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  Rows,
  Loader2,
  RefreshCw,
  Search,
  ArrowRight,
  X,
  Zap,
  HardDriveDownload,
  WifiOff,
  Wifi,
  Tag
} from 'lucide-react';
import { YOUTUBE_CATEGORIES, getVideoThumbnail, getChannelAvatar, fetchYouTubeFeed } from '../../data/youtubeData';
import { YouTubeLogo } from '../YouTubeLogo';
import { YouTubeVideoCard } from './YouTubeVideoCard';
import {
  loadAlgoProfile,
  saveAlgoProfile,
  getDefaultAlgoProfile,
  getAlgorithmicSections,
  getAlgorithmicFeed,
  detectSessionIntent
} from '../../utils/youtubeAlgorithm';
import { loadOfflineVideos } from '../../utils/youtubeProfilesAndOffline';

export const YouTubeHomeFeed = ({
  videos = [],
  selectedCategory = 'All',
  onSelectCategory,
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue,
  onSearchQuery,
  onOpenVideoProfileModal,
  isOfflineMode = false,
  onToggleOfflineMode
}) => {
  const [feedSearchInput, setFeedSearchInput] = useState('');
  const [algoProfile, setAlgoProfile] = useState(() => loadAlgoProfile());
  const [viewMode, setViewMode] = useState('shelves'); // 'shelves' | 'grid'
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);
  const [liveVideos, setLiveVideos] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const loadedCategoriesRef = useRef(new Set());
  const algoProfileRef = useRef(algoProfile);

  useEffect(() => {
    algoProfileRef.current = algoProfile;
  }, [algoProfile]);

  // Combined video pool of base/cached videos + live fetched videos
  const allAvailableVideos = useMemo(() => {
    const map = new Map();
    const offlineList = loadOfflineVideos();

    if (isOfflineMode) {
      offlineList.forEach((v) => map.set(v.id, { ...v, savedOffline: true }));
      (videos || []).forEach((v) => {
        if (v.isGuaranteed) map.set(v.id, v);
      });
      return Array.from(map.values());
    }

    // First add default videos
    (videos || []).forEach((v) => map.set(v.id, v));
    // Overlay offline cached markers
    offlineList.forEach((v) => {
      if (map.has(v.id)) {
        map.set(v.id, { ...map.get(v.id), savedOffline: true });
      } else {
        map.set(v.id, { ...v, savedOffline: true });
      }
    });
    // Overlay live videos
    liveVideos.forEach((v) => {
      if (!map.has(v.id)) {
        map.set(v.id, v);
      }
    });
    return Array.from(map.values());
  }, [videos, liveVideos, isOfflineMode]);

  // Fetch live YouTube feed for the selected category or algorithmic seed
  const loadCategoryFeed = useCallback(async (cat, force = false) => {
    const categoryKey = cat || 'All';
    if (!force && loadedCategoriesRef.current.has(categoryKey)) return;

    setIsLoadingFeed(true);
    try {
      // Pick dynamic seed from user history if "✨ For You"
      let seed = '';
      if (cat === '✨ For You' || cat === 'For You (Algorithm)') {
        const profile = algoProfileRef.current;
        const topHistory = profile.watchHistory?.[0]?.title || profile.recentQueries?.[0]?.query;
        if (topHistory) seed = topHistory;
      }

      const fetched = await fetchYouTubeFeed(categoryKey, seed);
      if (fetched && fetched.length > 0) {
        setLiveVideos((prev) => {
          const map = new Map(prev.map((v) => [v.id, v]));
          fetched.forEach((v) => map.set(v.id, v));
          return Array.from(map.values());
        });
        loadedCategoriesRef.current.add(categoryKey);
      }
    } catch (err) {
      console.warn('Failed to load live YouTube feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  // Load feed on mount and whenever category changes
  useEffect(() => {
    loadCategoryFeed(selectedCategory);
  }, [selectedCategory, loadCategoryFeed]);

  // Reload profile when algorithmic updates or storage changes happen
  useEffect(() => {
    const handleAlgoSync = () => {
      setAlgoProfile(loadAlgoProfile());
    };
    window.addEventListener('storage', handleAlgoSync);
    window.addEventListener('cinevault_algo_updated', handleAlgoSync);
    window.addEventListener('cinevault_interaction_updated', handleAlgoSync);
    window.addEventListener('cinevault_subscriptions_updated', handleAlgoSync);
    return () => {
      window.removeEventListener('storage', handleAlgoSync);
      window.removeEventListener('cinevault_algo_updated', handleAlgoSync);
      window.removeEventListener('cinevault_interaction_updated', handleAlgoSync);
      window.removeEventListener('cinevault_subscriptions_updated', handleAlgoSync);
    };
  }, []);

  const handleFeedSearchSubmit = (e) => {
    e.preventDefault();
    if (feedSearchInput.trim()) {
      onSearchQuery(feedSearchInput.trim());
    }
  };

  const handleResetAlgorithm = () => {
    const fresh = getDefaultAlgoProfile();
    saveAlgoProfile(fresh);
    setAlgoProfile(fresh);
  };

  // Top affinities for display
  const topChannelAffinities = useMemo(() => {
    return Object.entries(algoProfile.channelAffinities || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([chan]) => chan);
  }, [algoProfile]);

  // Session intent & top semantic keywords
  const sessionInfo = useMemo(() => detectSessionIntent(algoProfile), [algoProfile]);

  const topKeywords = useMemo(() => {
    return Object.entries(algoProfile.keywordAffinities || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([kw]) => kw);
  }, [algoProfile]);

  // Algorithmic Shelves
  const algorithmicSections = useMemo(() => {
    return getAlgorithmicSections(allAvailableVideos, algoProfile);
  }, [allAvailableVideos, algoProfile]);

  // Filtered / Ranked Videos for Grid Mode
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'For You (Algorithm)' || selectedCategory === '✨ For You') {
      return getAlgorithmicFeed(allAvailableVideos, algoProfile, 'All');
    }
    return getAlgorithmicFeed(allAvailableVideos, algoProfile, selectedCategory);
  }, [allAvailableVideos, algoProfile, selectedCategory]);

  const allCategories = useMemo(() => {
    return ['✨ For You', ...YOUTUBE_CATEGORIES];
  }, []);

  const isForYouActive = selectedCategory === 'For You (Algorithm)' || selectedCategory === '✨ For You';

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar bg-zinc-950">
      {/* Offline Mode Active Banner */}
      {isOfflineMode && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Offline Vault Active</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  No Internet Required
                </span>
              </div>
              <div className="text-[11px] text-zinc-300">
                Browsing locally cached videos and pre-loaded stream packages. You can watch anytime!
              </div>
            </div>
          </div>

          {onToggleOfflineMode && (
            <button
              type="button"
              onClick={onToggleOfflineMode}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
            >
              Switch Online
            </button>
          )}
        </div>
      )}

      {/* Algorithmic Taste & Session Indicator Bar */}
      {isForYouActive && (
        <div className="mb-5 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Algorithm Taste Profile:</span>
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {sessionInfo.label}
                </span>
                {topChannelAffinities.length > 0 && (
                  <span className="text-[11px] text-zinc-400 hidden md:inline">
                    Top creators: <strong className="text-zinc-200">{topChannelAffinities.join(', ')}</strong>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Ranks videos based on your watched videos, likes, and channel subscriptions in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* View Mode Toggle: Shelves vs Grid */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('shelves')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'shelves'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Curated category shelves"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>Shelves</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Continuous MMR ranked grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetAlgorithm}
              title="Reset algorithmic weights and start fresh"
              className="p-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Chips Horizontal Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {allCategories.map((cat) => {
            const isSelected =
              (cat === '✨ For You' && isForYouActive) ||
              selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  if (cat === '✨ For You') {
                    onSelectCategory('For You (Algorithm)');
                  } else {
                    onSelectCategory(cat);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Refresh feed button */}
        <button
          type="button"
          onClick={() => loadCategoryFeed(selectedCategory, true)}
          disabled={isLoadingFeed}
          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer shrink-0 disabled:opacity-50"
          title="Fetch latest YouTube uploads"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeed ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      {isForYouActive && viewMode === 'shelves' && algorithmicSections.length > 0 ? (
        /* Algorithmic Shelves Layout */
        <div className="space-y-8">
          {algorithmicSections.map((section) => {
            const SectionIcon =
              section.iconType === 'sparkles'
                ? Sparkles
                : section.iconType === 'history'
                ? History
                : section.iconType === 'trending'
                ? Flame
                : UserCheck;

            return (
              <section key={section.id} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
                      <SectionIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                        <span>{section.title}</span>
                        {section.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {section.badge}
                          </span>
                        )}
                      </h3>
                      {section.subtitle && (
                        <p className="text-xs text-zinc-400 leading-tight mt-0.5">{section.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {section.videos.map((video) => (
                    <YouTubeVideoCard
                      key={`${section.id}-${video.id}`}
                      video={video}
                      onSelectVideo={onSelectVideo}
                      onOpenVideoInNewTab={onOpenVideoInNewTab}
                      onAddToQueue={onAddToQueue}
                      onOpenVideoProfileModal={onOpenVideoProfileModal}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Continuous Ranked Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredVideos.map((video) => (
            <YouTubeVideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
              onOpenVideoInNewTab={onOpenVideoInNewTab}
              onAddToQueue={onAddToQueue}
              onOpenVideoProfileModal={onOpenVideoProfileModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
