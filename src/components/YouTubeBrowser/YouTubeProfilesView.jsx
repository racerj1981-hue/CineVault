import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  HardDriveDownload,
  Tag,
  Play,
  Trash2,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
  FolderOpen,
  Filter,
  Plus,
  Clock,
  Layers
} from 'lucide-react';
import {
  loadUserProfiles,
  getActiveProfileId,
  loadOfflineVideos,
  loadAllVideoProfiles,
  loadOfflineModeState,
  setOfflineModeState,
  toggleSaveVideoOffline
} from '../../utils/youtubeProfilesAndOffline';
import { YouTubeVideoCard } from './YouTubeVideoCard';

export const YouTubeProfilesView = ({
  allVideos = [],
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue,
  onOpenProfileManager,
  onOpenVideoProfileModal,
  initialFilter = 'all' // 'all' | 'offline' | 'must_watch'
}) => {
  const [activeProfileId, setActiveProfileId] = useState(getActiveProfileId());
  const [profiles, setProfiles] = useState([]);
  const [offlineVideos, setOfflineVideos] = useState([]);
  const [videoProfiles, setVideoProfiles] = useState({});
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const refreshData = () => {
    setProfiles(loadUserProfiles());
    setActiveProfileId(getActiveProfileId());
    setOfflineVideos(loadOfflineVideos());
    setVideoProfiles(loadAllVideoProfiles());
    setIsOfflineMode(loadOfflineModeState());
  };

  useEffect(() => {
    refreshData();

    const handleProfileChange = () => refreshData();
    window.addEventListener('cinevault_profile_changed', handleProfileChange);
    window.addEventListener('cinevault_video_profile_updated', handleProfileChange);
    window.addEventListener('cinevault_offline_videos_updated', handleProfileChange);
    window.addEventListener('cinevault_offline_mode_changed', handleProfileChange);

    return () => {
      window.removeEventListener('cinevault_profile_changed', handleProfileChange);
      window.removeEventListener('cinevault_video_profile_updated', handleProfileChange);
      window.removeEventListener('cinevault_offline_videos_updated', handleProfileChange);
      window.removeEventListener('cinevault_offline_mode_changed', handleProfileChange);
    };
  }, []);

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || {
      id: 'default',
      name: 'Personal Profile',
      avatarEmoji: '👤',
      description: 'Main viewer profile'
    };
  }, [profiles, activeProfileId]);

  // Merge videos with profile metadata
  const displayedVideos = useMemo(() => {
    if (activeFilter === 'offline') {
      return offlineVideos;
    }

    // Combine all available videos with offline videos
    const map = new Map();
    [...offlineVideos, ...allVideos].forEach((v) => {
      if (v?.id) map.set(v.id, v);
    });
    const combined = Array.from(map.values());

    if (activeFilter === 'linwize') {
      return combined.filter(
        (v) =>
          v.isGuaranteed ||
          v.category === 'Education' ||
          v.category === 'Science & Tech' ||
          v.category === 'Music & Lofi' ||
          v.directStreamUrl ||
          videoProfiles[v.id]?.tags?.some((t) => t.toLowerCase().includes('linwize') || t.toLowerCase().includes('school'))
      );
    }

    if (activeFilter === 'must_watch') {
      return combined.filter((v) => videoProfiles[v.id]?.status === 'must_watch');
    }

    if (activeFilter === 'profile_only') {
      return combined.filter(
        (v) => videoProfiles[v.id]?.profileId === activeProfileId || (!videoProfiles[v.id] && activeProfileId === 'default')
      );
    }

    // 'all' shows all videos in vault
    return combined;
  }, [activeFilter, offlineVideos, allVideos, videoProfiles, activeProfileId]);

  const handleToggleOfflineMode = () => {
    const next = !isOfflineMode;
    setIsOfflineMode(next);
    setOfflineModeState(next);
  };

  const isLinwizeProfileActive = activeProfileId === 'linwize';

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar bg-zinc-950">
      {/* Active Profile Header Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {activeProfile.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">{activeProfile.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300">
                Active Profile
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{activeProfile.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {!isLinwizeProfileActive && (
            <button
              type="button"
              onClick={() => {
                const linwizeProf = profiles.find((p) => p.id === 'linwize');
                if (linwizeProf) {
                  setActiveProfileId('linwize');
                  window.dispatchEvent(new CustomEvent('cinevault_profile_changed', { detail: 'linwize' }));
                }
              }}
              className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="Activate Linwize School Bypass Profile"
            >
              <span>🛡️ Linwize Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleOfflineMode}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              isOfflineMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOfflineMode ? 'Offline Mode ON' : 'Go Offline'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfileManager}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Switch Profile</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Videos ({displayedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('linwize')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'linwize'
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-zinc-800'
          }`}
        >
          <span>🛡️ Linwize Bypass Safe</span>
        </button>

        <button
          onClick={() => setActiveFilter('offline')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'offline'
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <HardDriveDownload className="w-3.5 h-3.5" />
          <span>Offline Downloads ({offlineVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('must_watch')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'must_watch'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <span>⭐ Must Watch</span>
        </button>

        <button
          onClick={() => setActiveFilter('profile_only')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'profile_only'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <span>{activeProfile.avatarEmoji} {activeProfile.name} Only</span>
        </button>
      </div>

      {/* Videos List / Grid */}
      {displayedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedVideos.map((video, idx) => {
            const isSaved = offlineVideos.some((ov) => ov.id === video.id);
            const prof = videoProfiles[video.id];

            return (
              <div key={`${video.id}-${idx}`} className="relative group">
                <YouTubeVideoCard
                  video={video}
                  onSelectVideo={onSelectVideo}
                  onOpenVideoInNewTab={onOpenVideoInNewTab}
                  onAddToQueue={onAddToQueue}
                  onOpenVideoProfileModal={onOpenVideoProfileModal}
                  isOffline={isSaved}
                />

                {/* Profile & Offline Quick Bar */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] px-1 text-zinc-400">
                  <div className="flex items-center gap-1">
                    {isSaved && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] flex items-center gap-1">
                        <HardDriveDownload className="w-2.5 h-2.5" />
                        <span>Offline</span>
                      </span>
                    )}
                    {prof?.status && prof.status !== 'none' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-[10px]">
                        {prof.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVideoProfileModal?.(video);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-850">
          <FolderOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No videos found in this shelf</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            {activeFilter === 'offline'
              ? 'Save any video for offline viewing from the video card or watch page to enjoy without network.'
              : 'Assign profiles or tags to videos to organize your personal YouTube vault.'}
          </p>
        </div>
      )}
    </div>
  );
};
