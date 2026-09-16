import React, { useState, useMemo } from 'react';
import {
  Play,
  ListPlus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Search,
  ArrowRight
} from 'lucide-react';
import { YOUTUBE_CATEGORIES, getVideoThumbnail, getChannelAvatar } from '../../data/youtubeData';
import { YouTubeLogo } from '../YouTubeLogo';

export const YouTubeHomeFeed = ({
  videos,
  selectedCategory,
  onSelectCategory,
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue,
  onSearchQuery
}) => {
  const [feedSearchInput, setFeedSearchInput] = useState('');

  const handleFeedSearchSubmit = (e) => {
    e.preventDefault();
    if (feedSearchInput.trim()) {
      onSearchQuery(feedSearchInput.trim());
    }
  };

  // Filter by category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    if (selectedCategory === '⭐ Guaranteed Working') return videos.filter((v) => v.isGuaranteed);
    return videos.filter(
      (v) => v.category === selectedCategory || (v.tags && v.tags.includes(selectedCategory))
    );
  }, [videos, selectedCategory]);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar bg-zinc-950">
      {/* YouTube Hero Banner with Search Bar */}
      <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-amber-950/30 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col items-start gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                100% Unblocked Network Gateway
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <YouTubeLogo className="h-6 sm:h-7 w-auto" textColor="#FFFFFF" />
              <span className="text-zinc-300 font-bold text-base sm:text-lg">Web Browser</span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl mt-1">
              Browse, search, and watch any YouTube video directly in this browser with multi-mirror failover.
            </p>
          </div>

          {/* Interactive In-Banner Search Bar */}
          <form onSubmit={handleFeedSearchSubmit} className="w-full max-w-xl flex items-center">
            <div className="flex-1 relative flex items-center rounded-xl bg-zinc-950/90 border border-zinc-700/90 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 shadow-inner px-3 py-2 transition">
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={feedSearchInput ?? ''}
                onChange={(e) => setFeedSearchInput(e.target.value)}
                placeholder="Search any video, song, creator or paste YouTube link..."
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="ml-2 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs"
              >
                <span>Search</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Trending Search Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-400">Trending:</span>
            <button
              onClick={() => onSearchQuery('Lofi')}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-[11px] font-semibold text-zinc-300 border border-zinc-700/60 transition cursor-pointer"
            >
              ☕ Lofi Beats
            </button>
            <button
              onClick={() => onSearchQuery('Mark Rober')}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-[11px] font-semibold text-zinc-300 border border-zinc-700/60 transition cursor-pointer"
            >
              🧪 Mark Rober
            </button>
            <button
              onClick={() => onSearchQuery('Minecraft')}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-[11px] font-semibold text-zinc-300 border border-zinc-700/60 transition cursor-pointer"
            >
              🎮 Minecraft
            </button>
            <button
              onClick={() => onSearchQuery('Free Movies')}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-[11px] font-semibold text-zinc-300 border border-zinc-700/60 transition cursor-pointer"
            >
              🍿 Movies
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips Horizontal Bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {YOUTUBE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredVideos.map((video) => {
          const thumbUrl = getVideoThumbnail(video.id, video.thumbnail);

          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/60 cursor-pointer relative"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                <img
                  src={thumbUrl}
                  alt={video.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-[11px] font-mono font-bold text-white tracking-wider backdrop-blur-xs">
                    {video.duration}
                  </div>
                )}

                {/* Guaranteed Badge */}
                {video.isGuaranteed && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Guaranteed</span>
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <div className="w-11 h-11 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Quick Actions Top Right */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVideoInNewTab(video);
                    }}
                    title="Open in new browser tab"
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToQueue(video, e);
                    }}
                    title="Add to queue"
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md transition cursor-pointer"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-3.5 flex items-start gap-3 flex-1">
                {/* Channel Profile Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-zinc-700/60 shrink-0 shadow-xs flex items-center justify-center">
                  <img
                    src={getChannelAvatar(video.channel, video)}
                    alt={video.channel || 'Channel Profile'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="font-medium truncate hover:text-zinc-200">{video.channel}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="shrink-0">{video.views || 'Verified'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

