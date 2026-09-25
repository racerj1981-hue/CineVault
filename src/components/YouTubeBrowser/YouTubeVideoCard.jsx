import React, { useState, useEffect } from 'react';
import { Play, ListPlus, ExternalLink, CheckCircle2, Tag, HardDriveDownload } from 'lucide-react';
import { getVideoThumbnail, getChannelAvatar, getFallbackAvatarDataUri } from '../../data/youtubeData';
import { isVideoSavedOffline, toggleSaveVideoOffline, getVideoProfile } from '../../utils/youtubeProfilesAndOffline';

const VERIFIED_CHANNELS = new Set([
  'blender foundation',
  'google for developers',
  'lofi girl',
  'officialpsy',
  'ed sheeran',
  'fireplace atmosphere',
  'veritasium',
  'mrbeast',
  'mark rober',
  'kurzgesagt – in a nutshell',
  '3blue1brown',
  'crashcourse',
  'nasa',
  'rick astley',
  'jawed',
  'jacob + katie schwarz',
  'mkbhd',
  'marques brownlee',
  'linus tech tips',
  'ted',
  'smartereveryday',
  'vsauce',
  'ign',
  'pewdiepie',
  'bbc',
  'national geographic'
]);

export const YouTubeVideoCard = ({
  video,
  onSelectVideo,
  onOpenVideoInNewTab,
  onAddToQueue,
  onOpenVideoProfileModal,
  isOffline: isOfflineProp,
  compact = false
}) => {
  if (!video) return null;

  const [isSavedOffline, setIsSavedOffline] = useState(isOfflineProp || video.savedOffline || false);
  const [videoProfile, setVideoProfile] = useState(() => getVideoProfile(video?.id));

  useEffect(() => {
    if (video?.id) {
      setIsSavedOffline(isOfflineProp !== undefined ? isOfflineProp : isVideoSavedOffline(video.id));
      setVideoProfile(getVideoProfile(video.id));
    }
  }, [video?.id, isOfflineProp]);

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail?.videoId === video?.id) {
        setVideoProfile(e.detail.data || getVideoProfile(video.id));
      }
    };
    window.addEventListener('cinevault_video_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('cinevault_video_profile_updated', handleProfileUpdate);
  }, [video?.id]);

  const thumbUrl = getVideoThumbnail(video, video.thumbnail);
  const avatarUrl = getChannelAvatar(video.channel, video);
  const isVerified = video.isVerified || (video.channel && VERIFIED_CHANNELS.has(video.channel.toLowerCase()));

  const handleToggleOffline = (e) => {
    e.stopPropagation();
    const nextState = toggleSaveVideoOffline(video);
    setIsSavedOffline(nextState);
  };

  return (
    <div
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
          onError={(e) => {
            if (!e.currentTarget.dataset.triedFallback1) {
              e.currentTarget.dataset.triedFallback1 = 'true';
              if (video.archiveId) {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80';
              } else if (video.id && /^[a-zA-Z0-9_-]{11}$/.test(video.id)) {
                e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
              } else {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
              }
            } else if (!e.currentTarget.dataset.triedFallback2) {
              e.currentTarget.dataset.triedFallback2 = 'true';
              e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-[11px] font-mono font-bold text-white tracking-wider backdrop-blur-xs">
            {video.duration}
          </div>
        )}

        {/* Badges: Guaranteed, Offline & Profile Status */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {video.isGuaranteed && (
            <div className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Guaranteed</span>
            </div>
          )}
          {isSavedOffline && (
            <div className="px-1.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold shadow-md backdrop-blur-xs flex items-center gap-1">
              <HardDriveDownload className="w-2.5 h-2.5" />
              <span>Offline Ready</span>
            </div>
          )}
          {videoProfile?.status && videoProfile.status !== 'none' && (
            <div className="px-1.5 py-0.5 rounded-md bg-amber-500/90 text-zinc-950 text-[10px] font-bold shadow-md backdrop-blur-xs flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span className="capitalize">{videoProfile.status.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <div className="w-11 h-11 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Quick Actions Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* Quick Video Profile / Tag Button */}
          {onOpenVideoProfileModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVideoProfileModal(video);
              }}
              title="Set Video Profile & Tags"
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-amber-400 hover:text-amber-300 backdrop-blur-md transition cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Save Offline Button */}
          <button
            type="button"
            onClick={handleToggleOffline}
            title={isSavedOffline ? 'Remove from offline cache' : 'Save for offline playback'}
            className={`p-1.5 rounded-lg backdrop-blur-md transition cursor-pointer ${
              isSavedOffline
                ? 'bg-emerald-600 text-white'
                : 'bg-black/70 hover:bg-black text-zinc-300 hover:text-white'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
          </button>

          {onOpenVideoInNewTab && (
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
          )}
          {onAddToQueue && (
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
          )}
        </div>
      </div>

      {/* Video Info Container */}
      <div className="p-3.5 flex items-start gap-3 flex-1">
        {/* Exact Creator Channel Profile Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-zinc-700/60 shrink-0 shadow-xs flex items-center justify-center">
          <img
            src={avatarUrl}
            alt={video.channel || 'Channel Profile'}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Instant SVG fallback with creator initials (zero network required)
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFallbackAvatarDataUri(video.channel || 'YT');
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
            {video.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="font-medium truncate hover:text-zinc-200">{video.channel}</span>
            {isVerified && (
              <span title="Verified Channel">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400/20 shrink-0" />
              </span>
            )}
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span className="shrink-0">{video.views || 'Verified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
