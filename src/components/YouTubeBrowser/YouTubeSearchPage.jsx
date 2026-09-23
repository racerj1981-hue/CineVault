import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Play,
  ListPlus,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles,
  Film,
  Tag,
  HardDriveDownload,
  ArrowDown
} from 'lucide-react';
import { getVideoThumbnail, getChannelAvatar, getFallbackAvatarDataUri, fetchYouTubeSearch } from '../../data/youtubeData';
import { isVideoSavedOffline } from '../../utils/youtubeProfilesAndOffline';
import { YouTubePlayIcon } from '../YouTubeLogo';

export const YouTubeSearchPage = ({
  query,
  results = [],
  isLoading = false,
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue,
  onOpenVideoProfileModal
}) => {
  const [displayResults, setDisplayResults] = useState(results);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Sync displayResults when initial results or query change
  useEffect(() => {
    setDisplayResults(results);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [query, results]);

  // Load next page function
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !query || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const nextBatch = await fetchYouTubeSearch(query, nextPage);
      if (Array.isArray(nextBatch) && nextBatch.length > 0) {
        setDisplayResults((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const fresh = nextBatch.filter((item) => item && item.id && item.available !== false && !seen.has(item.id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        if (nextBatch.length < 4) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Infinite scroll load more error:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, query, page, isLoading]);

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      { rootMargin: '400px', threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleLoadMore, hasMore, isLoadingMore, isLoading]);

  const activeList = displayResults.length > 0 ? displayResults : results;

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar bg-zinc-950">
      {/* Search Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <YouTubePlayIcon className="w-3.5 h-2.5 shrink-0" />
            <span>YouTube Search Results</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Results for <span className="text-amber-400">"{query}"</span>
          </h1>
        </div>
        <div className="text-xs text-zinc-400">
          <span>{isLoading ? 'Searching...' : `${activeList.length} unblocked results`}</span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-850 animate-pulse"
            >
              <div className="w-full sm:w-64 aspect-video rounded-xl bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800/80 rounded w-1/3" />
                <div className="h-3 bg-zinc-800/50 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results List */}
      {!isLoading && activeList.length > 0 && (
        <div className="space-y-4">
          {activeList.map((item) => {
            const thumbUrl = getVideoThumbnail(item.id, item.thumbnail);
            return (
              <div
                key={item.id}
                onClick={() => onSelectVideo(item)}
                className="group flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-amber-400/50 transition cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                  <img
                    src={thumbUrl}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-mono font-bold text-white">
                      {item.duration}
                    </span>
                  )}
                  {/* Hover Play Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-zinc-750 shrink-0 shadow-xs flex items-center justify-center">
                        <img
                          src={getChannelAvatar(item.channel, item)}
                          alt={item.channel || 'Channel Profile'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackAvatarDataUri(item.channel || 'YT');
                          }}
                        />
                      </div>
                      <span className="font-semibold text-zinc-300 hover:text-white truncate">{item.channel}</span>
                      {(item.isVerified || ['lofi girl', 'veritasium', 'mrbeast', 'mark rober', '3blue1brown', 'blender foundation', 'nasa', 'crashcourse'].includes(item.channel?.toLowerCase())) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400/20 shrink-0" title="Verified Channel" />
                      )}
                      <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                      <span className="shrink-0">{item.views || 'Verified'}</span>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVideoInNewTab(item);
                      }}
                      title="Open in new browser tab"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>New Tab</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(item, e);
                      }}
                      title="Add to queue"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                    >
                      <ListPlus className="w-3 h-3" />
                      <span>Queue</span>
                    </button>
                    {onOpenVideoProfileModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVideoProfileModal(item);
                        }}
                        title="Profile & custom tags"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Infinite Scroll Sentinel & Loading Indicator */}
          <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more videos...</span>
              </div>
            )}

            {!isLoadingMore && hasMore && activeList.length >= 6 && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Load More Videos</span>
              </button>
            )}

            {!hasMore && activeList.length > 0 && (
              <p className="text-xs text-zinc-500 py-2">
                All unblocked results loaded for this search
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && activeList.length === 0 && (
        <div className="p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No results found for "{query}"</h3>
          <p className="text-xs text-zinc-400">
            Try searching for a different keyword or paste a direct YouTube URL into the address bar.
          </p>
        </div>
      )}
    </div>
  );
};
