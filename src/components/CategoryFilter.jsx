import React from 'react';

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none no-scrollbar">
        <button
          onClick={() => onSelectCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
          }`}
        >
          All Genres
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <label htmlFor="sort-select" className="text-xs text-zinc-400 font-medium">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortBy ?? 'popular'}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Year</option>
          <option value="alpha">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
