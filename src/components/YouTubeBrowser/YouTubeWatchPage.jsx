import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ListPlus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Globe,
  AlertTriangle,
  X,
  Clock,
  ExternalLink,
  MessageSquare,
  Check,
  ChevronDown,
  ChevronUp,
  Repeat,
  Volume2,
  Tv,
  Maximize2
} from 'lucide-react';
import { YOUTUBE_PROXY_NODES, getVideoThumbnail, getChannelAvatar } from '../../data/youtubeData';

export const YouTubeWatchPage = ({
  video,
  videos = [],
  onSelectVideo,
  onOpenVideoInNewTab,
  selectedNodeIndex = 0,
  onSelectNode,
  onAddToQueue,
  stealthTitleActive
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(14200);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [autoFailoverToast, setAutoFailoverToast] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Alex Chen',
      avatar: 'AC',
      text: 'Finally a YouTube browser that works smoothly through school firewalls without annoying blocks!',
      time: '2 hours ago',
      likes: 84
    },
    {
      id: 2,
      user: 'Maya Rodriguez',
      avatar: 'MR',
      text: 'The 1080p quality on this unblocked player is incredible. Audio is in sync too.',
      time: '5 hours ago',
      likes: 42
    },
    {
      id: 3,
      user: 'David Kim',
      avatar: 'DK',
      text: 'Thanks for putting this together! Great tool for studying and listening to lofi in class.',
      time: '1 day ago',
      likes: 19
    }
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const currentNode = YOUTUBE_PROXY_NODES[selectedNodeIndex] || YOUTUBE_PROXY_NODES[0];

  // Calculate embed URL
  const embedUrl =
    typeof currentNode?.formatUrl === 'function'
      ? currentNode.formatUrl(video?.id || 'aqz-KE-bpKQ', {
          captions: captionsEnabled
        })
      : `https://www.youtube.com/embed/${video?.id || 'aqz-KE-bpKQ'}?autoplay=1&rel=0&playsinline=1`;

  // Reset loading state on video change or node change
  useEffect(() => {
    setIsVideoLoading(true);
    setAutoFailoverToast(false);
    const timer = setTimeout(() => {
      // If still loading after 9 seconds, offer failover switch
      setAutoFailoverToast(true);
    }, 9000);
    return () => clearTimeout(timer);
  }, [video?.id, selectedNodeIndex, reloadKey]);

  // Handle Share
  const handleShare = () => {
    const shareUrl = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2000);
  };

  // Handle Like
  const handleToggleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
      if (hasDisliked) setHasDisliked(false);
      onLikeVideo?.(video);
    }
  };

  // Handle Dislike
  const handleToggleDislike = () => {
    if (hasDisliked) {
      setHasDisliked(false);
    } else {
      setHasDisliked(true);
      if (hasLiked) {
        setHasLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    }
  };

  // Handle Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: 'You',
      avatar: 'ME',
      text: newCommentText.trim(),
      time: 'Just now',
      likes: 0
    };
    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  // Cycle next mirror
  const cycleNextMirror = () => {
    const nextIdx = (selectedNodeIndex + 1) % YOUTUBE_PROXY_NODES.length;
    onSelectNode(nextIdx);
    setReloadKey((prev) => prev + 1);
    setAutoFailoverToast(false);
  };

  const otherVideos = useMemo(
    () => videos.filter((v) => v.id !== video?.id),
    [videos, video?.id]
  );

  const recommendedVideos = useMemo(() => {
    return otherVideos.slice(0, 12);
  }, [otherVideos]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column: Player & Video Info */}
        <div className="flex-1 w-full min-w-0">
          {/* Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl shadow-black/80">
            {/* Cinematic Loading Overlay */}
            {isVideoLoading && (
              <div className="absolute inset-0 z-15 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                <img
                  src={getVideoThumbnail(video.id, video.thumbnail)}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none transition-opacity duration-700"
                />
                <div className="relative z-20 flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/25 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-amber-500/50 border-b-transparent border-l-transparent animate-spin" />
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-amber-500/40 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-amber-400 fill-amber-400 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-white text-xs sm:text-sm font-bold tracking-wide">
                    <span>Connecting via {currentNode.name.split('(')[0] || 'Gateway'}</span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Multi-mirror bypass gateway • 1080p HD</p>
                  <div className="w-44 h-1 bg-zinc-800/80 rounded-full overflow-hidden mt-3 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Video Player Render (Iframe or Native) */}
            {currentNode.id === 'native' ? (
              <video
                key={`native-${video.id}-${reloadKey}`}
                controls
                autoPlay
                playsInline
                onCanPlay={() => setIsVideoLoading(false)}
                className="w-full h-full object-contain"
                src={video.directStreamUrl || 'https://vjs.zencdn.net/v/oceans.mp4'}
                poster={getVideoThumbnail(video.id, video.thumbnail)}
              >
                <source src={video.directStreamUrl || 'https://vjs.zencdn.net/v/oceans.mp4'} type="video/mp4" />
                {video.backupStreamUrl && <source src={video.backupStreamUrl} type="video/mp4" />}
                Your browser does not support HTML5 video streaming.
              </video>
            ) : (
              <iframe
                key={`yt-watch-${video.id}-${selectedNodeIndex}-${reloadKey}`}
                src={embedUrl}
                title={video.title}
                onLoad={() => setIsVideoLoading(false)}
                className={`w-full h-full border-0 absolute inset-0 transition-opacity duration-500 ${
                  isVideoLoading ? 'opacity-0' : 'opacity-100'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}

            {/* Failover Toast if Buffering */}
            {autoFailoverToast && currentNode.id !== 'native' && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md z-30 bg-zinc-950/95 border border-amber-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-zinc-200">
                    Buffering on <strong className="text-amber-300">{currentNode.name}</strong>?
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={cycleNextMirror}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg cursor-pointer transition text-[11px]"
                  >
                    ⚡ Switch Mirror
                  </button>
                  <button
                    onClick={() => {
                      const nativeIdx = YOUTUBE_PROXY_NODES.findIndex((n) => n.id === 'native');
                      if (nativeIdx !== -1) onSelectNode(nativeIdx);
                      setReloadKey((prev) => prev + 1);
                      setAutoFailoverToast(false);
                    }}
                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg cursor-pointer transition text-[11px]"
                  >
                    ⭐ Native
                  </button>
                  <button
                    onClick={() => setAutoFailoverToast(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player Bottom Mirror Controls */}
          <div className="mt-3 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400 font-medium">Active Mirror:</span>
              <span className="text-amber-400 font-bold">{currentNode.name}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {YOUTUBE_PROXY_NODES.map((node, idx) => (
                <button
                  key={node.id}
                  onClick={() => {
                    onSelectNode(idx);
                    setReloadKey((prev) => prev + 1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    selectedNodeIndex === idx
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {node.name.split(' ')[1] || node.name}
                </button>
              ))}
              <button
                onClick={() => setReloadKey((prev) => prev + 1)}
                title="Reload stream player"
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Video Title & Actions */}
          <div className="mt-4">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              {stealthTitleActive ? 'Educational Multimedia Resource' : video.title}
            </h1>

            {/* Channel Row & Action Buttons */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-zinc-700/80 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={getChannelAvatar(video.channel, video)}
                    alt={video.channel || 'Channel Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{video.channel}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
                  </div>
                  <span className="text-xs text-zinc-400">1.2M subscribers</span>
                </div>
                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    isSubscribed
                      ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      : 'bg-white text-zinc-950 hover:bg-zinc-200'
                  }`}
                >
                  {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons: Like/Dislike, Share, Bookmark, Queue */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like / Dislike Group */}
                <div className="flex items-center rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer ${
                      hasLiked ? 'text-amber-400' : 'text-zinc-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-amber-400' : ''}`} />
                    <span>{(likesCount / 1000).toFixed(1)}k</span>
                  </button>
                  <div className="w-px h-4 bg-zinc-800" />
                  <button
                    onClick={handleToggleDislike}
                    className={`px-3 py-1.5 text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer ${
                      hasDisliked ? 'text-rose-400' : 'text-zinc-200'
                    }`}
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-rose-400' : ''}`} />
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition cursor-pointer"
                >
                  {shareNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareNotice ? 'Copied Link' : 'Share'}</span>
                </button>

                {/* Add to Queue Button */}
                <button
                  onClick={(e) => onAddToQueue(video, e)}
                  title="Add to Up Next Queue"
                  className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-900/80 transition text-xs text-zinc-300 leading-relaxed">
              <div className="flex items-center gap-3 font-semibold text-white mb-2">
                <span>{video.views || '1.4M views'}</span>
                <span>•</span>
                <span>Released 2024</span>
                <span>•</span>
                <span className="text-amber-400">{video.category || 'Music'}</span>
              </div>
              <p className={isDescriptionExpanded ? '' : 'line-clamp-2'}>
                {video.description ||
                  `Watch ${video.title} on unblocked high-speed player without ads or domain tracking cookies.`}
              </p>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-zinc-400 hover:text-white font-bold cursor-pointer flex items-center gap-1"
              >
                <span>{isDescriptionExpanded ? 'Show less' : '...more'}</span>
                {isDescriptionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 font-bold text-white text-sm mb-4">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>{comments.length} Comments</span>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center shrink-0">
                  YOU
                </div>
                <input
                  type="text"
                  value={newCommentText ?? ''}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-900/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                >
                  Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{comment.user}</span>
                        <span className="text-[10px] text-zinc-500">{comment.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-300 leading-normal">{comment.text}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-500">
                        <button className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="hover:text-zinc-300 cursor-pointer">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <button className="hover:text-zinc-300 cursor-pointer font-semibold">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Up Next Feed */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-zinc-300 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span>Up Next</span>
            </div>
          </div>

          <div className="space-y-3">
            {recommendedVideos.map((rec) => {
              const thumb = getVideoThumbnail(rec.id, rec.thumbnail);

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectVideo(rec)}
                  className="group flex gap-2.5 p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-amber-400/40 transition cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={thumb}
                      alt={rec.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {rec.duration && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono font-bold text-white">
                        {rec.duration}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {rec.title}
                      </h4>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        <p className="truncate hover:text-zinc-200">{rec.channel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-zinc-850/60 mt-1">
                      <span>{rec.views}</span>
                      <span>•</span>
                      <span>{rec.uploadedTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
