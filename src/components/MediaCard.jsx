import React, { useState } from 'react';
import { Play, Film, Star, Clock } from 'lucide-react';

export const MediaCard = ({
  item,
  onPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      id={`card-${item.id}`}
      className="group relative flex flex-col bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-400/60 shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-black/80 hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video sm:aspect-16/10 w-full overflow-hidden bg-zinc-950 rounded-t-xl">
        {/* Shimmer Skeleton placeholder while thumbnail is loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-zinc-900 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent -translate-x-full animate-shimmer" />
            <div className="flex flex-col items-center gap-1.5 text-zinc-700">
              <Film className="w-8 h-8 animate-pulse text-amber-500/30" />
            </div>
          </div>
        )}

        {!imgError ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (item.id && !item.thumbnail?.includes('/api/youtube/thumbnail')) {
                // Try unblocked backend proxy thumbnail
                item.thumbnail = `/api/youtube/thumbnail?id=${item.id}`;
                setImgLoaded(true);
              } else {
                setImgError(true);
              }
            }}
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out select-none pointer-events-none opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-950">
            <Film className="w-10 h-10 text-amber-500/60 mb-2" />
            <span className="text-xs font-semibold text-zinc-400">{item.title}</span>
          </div>
        )}

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-zinc-950 shadow-xs">
            <Film className="w-2.5 h-2.5" />
            {item.category}
          </span>
          {item.year && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-700/60">
              {item.year}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`card-fav-${item.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-amber-400 transition cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* Play Button Overlay */}
        <button
          onClick={() => onPlay(item)}
          className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer outline-none focus:outline-none focus-visible:outline-none border-0"
          aria-label={`Watch ${item.title}`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
          </div>
        </button>

        {/* Duration / Rating Bar at Bottom of Image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-zinc-300 z-10 pointer-events-none">
          {item.duration && (
            <span className="flex items-center gap-1 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800 font-medium">
              <Clock className="w-2.5 h-2.5 text-zinc-400" />
              {item.duration}
            </span>
          )}
          {item.rating && (
            <span className="flex items-center gap-1 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800 font-bold text-amber-400">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {item.rating}
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-zinc-900">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => onPlay(item)}
              className="font-bold text-sm sm:text-base text-zinc-100 hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
              title={item.title}
            >
              {item.title}
            </h3>
            {item.year && (
              <span className="text-xs text-zinc-500 font-mono shrink-0">
                {item.year}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 mt-auto">
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
            {item.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
          <button
            id={`watch-btn-${item.id}`}
            onClick={() => onPlay(item)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer outline-none focus:outline-none"
          >
            <span>Watch Movie</span>
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
