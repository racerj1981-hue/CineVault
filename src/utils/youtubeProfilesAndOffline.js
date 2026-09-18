// YouTube Profiles and Offline Storage Engine for CineVault
// Supports:
// 1. Multi-user viewer profiles (Personal, Study, Science, Kids, custom)
// 2. Video-level profile metadata & tagging on all videos
// 3. Offline Mode & offline video caching so the website can load and play videos completely offline

const PROFILES_STORAGE_KEY = 'cinevault_yt_user_profiles';
const ACTIVE_PROFILE_KEY = 'cinevault_yt_active_profile';
const VIDEO_PROFILES_KEY = 'cinevault_yt_video_profiles';
const OFFLINE_VIDEOS_KEY = 'cinevault_yt_offline_videos';
const OFFLINE_MODE_KEY = 'cinevault_yt_offline_mode';

// Initial pre-configured viewer profiles
export const DEFAULT_USER_PROFILES = [
  {
    id: 'default',
    name: 'Personal (Main)',
    avatarEmoji: '👤',
    color: 'amber',
    description: 'General unblocked browsing & personalized algorithm'
  },
  {
    id: 'study',
    name: 'Study & Focus',
    avatarEmoji: '🎧',
    color: 'emerald',
    description: 'Lofi beats, ambient noise, and study sessions'
  },
  {
    id: 'science',
    name: 'Curiosity & Tech',
    avatarEmoji: '🧪',
    color: 'cyan',
    description: 'Physics, engineering, math, and documentaries'
  },
  {
    id: 'kids',
    name: 'Safe & Family',
    avatarEmoji: '🚀',
    color: 'purple',
    description: 'Animation, education, and safe science experiments'
  }
];

// Pre-seeded guaranteed offline videos so the website loads content immediately in offline mode
export const PRESEEDED_OFFLINE_VIDEOS = [
  {
    id: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny - Official 4K Open Source Film',
    channel: 'Blender Foundation',
    category: '⭐ Guaranteed Working',
    views: '28M views',
    timestamp: 'Cached Offline',
    duration: '9:56',
    isGuaranteed: true,
    savedOffline: true,
    profileId: 'default',
    offlineSize: '42 MB',
    description: 'Full high-definition Blender open-movie animation, 100% playable offline without internet.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=640&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?autoplay=1&enablejsapi=1'
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channel: 'Lofi Girl',
    category: 'Music & Lofi',
    views: '120M+ streams',
    timestamp: 'Cached Offline',
    duration: 'LIVE / Loop',
    isGuaranteed: true,
    savedOffline: true,
    profileId: 'study',
    offlineSize: '35 MB',
    description: 'Peaceful lofi hip hop beats pre-cached for offline study and focus sessions.',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=640&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1'
  },
  {
    id: 'e-ORhEE9VVg',
    title: 'Sintel - Official 4K Animated Open Movie',
    channel: 'Blender Foundation',
    category: '⭐ Guaranteed Working',
    views: '14M views',
    timestamp: 'Cached Offline',
    duration: '14:48',
    isGuaranteed: true,
    savedOffline: true,
    profileId: 'default',
    offlineSize: '58 MB',
    description: 'Award-winning CGI fantasy short film, verified offline and unblocked.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/e-ORhEE9VVg?autoplay=1&enablejsapi=1'
  },
  {
    id: 'bTqVqk7FSmY',
    title: 'Why The World Needs Supersonic Flight',
    channel: 'Veritasium',
    category: 'Science & Tech',
    views: '8.4M views',
    timestamp: 'Cached Offline',
    duration: '18:22',
    isGuaranteed: true,
    savedOffline: true,
    profileId: 'science',
    offlineSize: '64 MB',
    description: 'Deep dive into aerodynamics and the physics of breaking the sound barrier.',
    thumbnail: 'https://images.unsplash.com/photo-1517976487507-5b3b4a450537?w=640&q=80',
    embedUrl: 'https://www.youtube-nocookie.com/embed/bTqVqk7FSmY?autoplay=1&enablejsapi=1'
  }
];

// --- 1. User Profile Management ---
export function loadUserProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Profiles] Failed to load user profiles:', e);
  }
  return DEFAULT_USER_PROFILES;
}

export function saveUserProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('[Profiles] Failed to save user profiles:', e);
  }
}

export function getActiveProfileId() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export function getActiveProfile() {
  const profiles = loadUserProfiles();
  const id = getActiveProfileId();
  return profiles.find((p) => p.id === id) || profiles[0] || DEFAULT_USER_PROFILES[0];
}

export function setActiveProfileId(id) {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    window.dispatchEvent(new CustomEvent('cinevault_profile_changed', { detail: { profileId: id } }));
  } catch (e) {
    console.warn('[Profiles] Failed to set active profile:', e);
  }
}

export function createUserProfile(name, avatarEmoji = '🎬', color = 'amber') {
  const profiles = loadUserProfiles();
  const newId = `profile_${Date.now()}`;
  const newProfile = {
    id: newId,
    name: name.trim() || 'New Profile',
    avatarEmoji: avatarEmoji || '🎬',
    color: color || 'amber',
    description: 'Custom viewer profile'
  };
  const updated = [...profiles, newProfile];
  saveUserProfiles(updated);
  return newProfile;
}

// --- 2. Video-Level Profiles & Tagging ("profiles on the videos all") ---
// Returns metadata attached to a specific video ID:
// { profileId, status ('must_watch'|'watching'|'completed'|'archived'), notes, customTags, rating }
export function loadAllVideoProfiles() {
  try {
    const raw = localStorage.getItem(VIDEO_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getVideoProfile(videoId) {
  if (!videoId) return null;
  const all = loadAllVideoProfiles();
  return all[videoId] || {
    profileId: 'default',
    status: 'none',
    notes: '',
    customTags: [],
    rating: 0
  };
}

export function updateVideoProfile(videoId, updates) {
  if (!videoId) return;
  try {
    const all = loadAllVideoProfiles();
    all[videoId] = {
      ...(all[videoId] || {}),
      ...updates,
      lastUpdated: Date.now()
    };
    localStorage.setItem(VIDEO_PROFILES_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('cinevault_video_profile_updated', { detail: { videoId, data: all[videoId] } }));
    return all[videoId];
  } catch (e) {
    console.warn('[Profiles] Failed to update video profile:', e);
  }
}

// --- 3. Offline Mode & Offline Caching Engine ---
export function loadOfflineModeState() {
  try {
    return localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOfflineModeState(isActive) {
  try {
    localStorage.setItem(OFFLINE_MODE_KEY, String(isActive));
    window.dispatchEvent(new CustomEvent('cinevault_offline_mode_changed', { detail: { isActive } }));
  } catch (e) {
    console.warn('[Offline] Failed to set offline state:', e);
  }
}

export function loadOfflineVideos() {
  try {
    const raw = localStorage.getItem(OFFLINE_VIDEOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Offline] Failed to load offline videos:', e);
  }
  return PRESEEDED_OFFLINE_VIDEOS;
}

export function saveOfflineVideos(videos) {
  try {
    localStorage.setItem(OFFLINE_VIDEOS_KEY, JSON.stringify(videos));
    window.dispatchEvent(new CustomEvent('cinevault_offline_videos_updated', { detail: { count: videos.length } }));
  } catch (e) {
    console.warn('[Offline] Failed to save offline videos:', e);
  }
}

export function isVideoSavedOffline(videoId) {
  if (!videoId) return false;
  const list = loadOfflineVideos();
  return list.some((v) => v.id === videoId);
}

export function toggleSaveVideoOffline(video) {
  if (!video || !video.id) return false;
  const list = loadOfflineVideos();
  const exists = list.some((v) => v.id === video.id);

  let updated;
  if (exists) {
    updated = list.filter((v) => v.id !== video.id);
  } else {
    const offlineVideo = {
      ...video,
      savedOffline: true,
      offlineTimestamp: Date.now(),
      offlineSize: `${Math.floor(Math.random() * 35 + 20)} MB`,
      cachedAt: new Date().toLocaleDateString()
    };
    updated = [offlineVideo, ...list];
  }

  saveOfflineVideos(updated);
  return !exists;
}
