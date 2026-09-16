import React from 'react';
import {
  Search,
  Play,
  ListPlus,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles,
  Film
} from 'lucide-react';
import { getVideoThumbnail, getChannelAvatar } from '../../data/youtubeData';
import { YouTubePlayIcon } from '../YouTubeLogo';

export const YouTubeSearchPage = ({
  query,
  results = [],
  isLoading = false,
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue
}) => {
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
          <span>{isLoading ? 'Searching...' : `${results.length} unblocked results found`}</span>
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
      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((item) => {
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
                      <img
                        src={getChannelAvatar(item.channel, item)}
                        alt={item.channel || 'Channel Profile'}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700/60 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="font-semibold text-zinc-300 hover:text-white truncate">{item.channel}</span>
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && (
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
