import React, { useState } from 'react';
import { X, Film, Plus, AlertCircle, Server, Radio, Sparkles } from 'lucide-react';
import { isDirectMediaUrl } from '../utils/streamFetch';

export const AddMediaModal = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Horror');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [duration, setDuration] = useState('90 min');
  const [rating, setRating] = useState('7.5/10');
  const [thumbnail, setThumbnail] = useState('');
  const [iframeInput, setIframeInput] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a movie title');
      return;
    }
    if (!iframeInput.trim()) {
      setError('Please provide an iframe embed code or streaming URL');
      return;
    }

    let cleanIframe = iframeInput.trim();
    let iframeUrl = '';

    if (cleanIframe.startsWith('http://') || cleanIframe.startsWith('https://')) {
      iframeUrl = cleanIframe;
      cleanIframe = `<iframe src="${iframeUrl}" width="100%" height="100%" frameborder="0" allowfullscreen="true" allow="autoplay; fullscreen"></iframe>`;
    } else if (cleanIframe) {
      const srcMatch = cleanIframe.match(/src=["']([^"']+)["']/);
      iframeUrl = srcMatch ? srcMatch[1] : '';
      if (!iframeUrl) {
        setError('Could not parse a valid src URL inside the iframe code.');
        return;
      }
    }

    const isDirect = isDirectMediaUrl(iframeUrl);
    const defaultImg = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

    const newItem = {
      id: `movie-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: title.trim(),
      type: 'movie',
      category: category.trim() || 'Cinema',
      year: year ? parseInt(year, 10) || year : undefined,
      duration: duration.trim() || 'Feature',
      rating: rating.trim() || '7.5/10',
      description: description.trim() || `${title} streaming via embedded cinema catalog.`,
      thumbnail: thumbnail.trim() || defaultImg,
      iframe: cleanIframe,
      iframeUrl,
      streamUrl: isDirect ? iframeUrl : undefined,
      isDirectStream: isDirect,
      tags: [category, 'Movie', 'Cinema', isDirect ? 'Direct Stream' : 'Embed'],
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Movie to Catalog</h3>
              <p className="text-xs text-zinc-400">Stores as an iframe / embed stream entry in the catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Movie Title *
            </label>
            <input
              type="text"
              required
              value={title ?? ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Interstellar"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category ?? 'Horror'}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Animation">Animation</option>
                <option value="Mystery">Mystery</option>
                <option value="Classic">Classic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Year
              </label>
              <input
                type="text"
                value={year ?? ''}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration ?? ''}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="102 min"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Rating
              </label>
              <input
                type="text"
                value={rating ?? ''}
                onChange={(e) => setRating(e.target.value)}
                placeholder="8.1/10"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Iframe Embed Code OR Direct Video URL *
              </label>
              {isDirectMediaUrl(iframeInput.trim()) && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full animate-fadeIn">
                  <Server className="w-2.5 h-2.5" />
                  Direct Video Stream Detected
                </span>
              )}
            </div>
            <textarea
              rows={2}
              required
              value={iframeInput ?? ''}
              onChange={(e) => setIframeInput(e.target.value)}
              placeholder='<iframe src="https://archive.org/embed/..." allowfullscreen></iframe> or https://.../video.mp4'
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
            />
            {isDirectMediaUrl(iframeInput.trim()) && (
              <p className="mt-1 text-[11px] text-emerald-400/90 flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                Routes automatically through Secondary Cloud Worker & CORS-Proxy cascade to bypass school firewalls (Linwize).
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Poster / Thumbnail URL
            </label>
            <input
              type="url"
              value={thumbnail ?? ''}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Movie Synopsis
            </label>
            <textarea
              rows={2}
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the movie..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/80 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Movie to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
