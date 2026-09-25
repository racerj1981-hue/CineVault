// Universal Asset & Static Host Resolution Helper
// Ensures assets (posters, avatars, thumbnails, manifests) resolve correctly
// across local development, Cloud Run containers, and GitHub Pages sub-directories.

export function isStaticHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.includes('github.io') ||
    host.includes('pages.dev') ||
    host.includes('netlify.app') ||
    host.includes('vercel.app') ||
    window.location.protocol === 'file:'
  );
}

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Remove leading slashes or relative dots
  const cleanPath = path.replace(/^(\.|\/)+/, '');

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    // On GitHub Pages (e.g. /CineVault/), the first path segment is the repository name
    if (window.location.hostname.includes('github.io') && parts.length > 0) {
      const repo = parts[0];
      return `/${repo}/${cleanPath}`;
    }
  }

  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  return `${normalizedBase}${cleanPath}`;
}

export function resolveMediaThumbnail(itemOrUrl, fallbackUrl) {
  if (!itemOrUrl) return fallbackUrl || '';

  // If passed a plain string URL
  if (typeof itemOrUrl === 'string') {
    const url = itemOrUrl.trim();
    // If it was corrupted to /api/youtube/thumbnail previously in localStorage:
    if (url.includes('/api/youtube/thumbnail')) {
      const match = url.match(/id=([^&]+)/);
      if (match) {
        const id = match[1];
        if (id === 'tom-and-jerry-the-movie-1992') {
          return resolveAssetUrl('posters/tom_and_jerry.png');
        }
        if (id === 'tom-and-jerry-fast-and-furry') {
          return resolveAssetUrl('posters/tom_and_jerry_fast_and_furry.jpg');
        }
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }
      }
    }
    return resolveAssetUrl(url);
  }

  // If passed an object (media item or video)
  const item = itemOrUrl;

  // Specific check for known Tom and Jerry archive items
  if (item.id === 'tom-and-jerry-the-movie-1992') {
    return resolveAssetUrl('posters/tom_and_jerry.png');
  }
  if (item.id === 'tom-and-jerry-fast-and-furry') {
    return resolveAssetUrl('posters/tom_and_jerry_fast_and_furry.jpg');
  }

  // Check if item has archiveId
  if (item.archiveId) {
    if (item.thumbnail && !item.thumbnail.includes('/api/')) {
      return resolveAssetUrl(item.thumbnail);
    }
    return fallbackUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
  }

  if (item.thumbnail) {
    if (item.thumbnail.includes('/api/youtube/thumbnail')) {
      if (item.id && /^[a-zA-Z0-9_-]{11}$/.test(item.id)) {
        return `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
      }
    } else {
      return resolveAssetUrl(item.thumbnail);
    }
  }

  if (item.id && /^[a-zA-Z0-9_-]{11}$/.test(item.id)) {
    return `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
  }

  return fallbackUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
}
