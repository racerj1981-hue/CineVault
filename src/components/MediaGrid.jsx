import React from 'react';
import { SearchX } from 'lucide-react';
import { MediaCard } from './MediaCard';

export const MediaGrid = ({
  items,
  onPlay,
  favorites,
  onToggleFavorite,
  onClearFilters,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 my-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No movies found</h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
          We couldn't find any movies matching your current search or genre filter.
        </p>
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
        >
          Reset Filters & Search
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item, idx) => (
        <MediaCard
          key={`${item.id || 'item'}-${idx}`}
          item={item}
          onPlay={onPlay}
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
