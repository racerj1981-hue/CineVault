import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Star,
  Film,
  Tv,
  Eye,
  EyeOff,
  AlertTriangle,
  FileVideo,
  Download,
  ExternalLink,
  Loader2,
  HardDrive,
  Clapperboard
} from 'lucide-react';
import { isDirectMediaUrl } from '../utils/streamFetch';
import { isStaticHost } from '../utils/assetHelper';
import { getStoredSettings } from '../utils/appSettings';

export const PlayerView = ({
  item,
  allCatalog,
  onBack,
  onSelectNext,
  onSelectPrev,
  isFavorite,
  onToggleFavorite,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Direct Stream State
  const [streamError, setStreamError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const pointerDownPausedRef = useRef(null);
  const userHasPausedRef = useRef(false);

  // Extract iframe src URL if present
  const extractSrc = (htmlOrUrl) => {
    if (!htmlOrUrl) return '';
    if (htmlOrUrl.startsWith('http://') || htmlOrUrl.startsWith('https://')) {
      return htmlOrUrl;
    }
    const match = htmlOrUrl.match(/src=["']([^"']+)["']/);
    return match ? match[1] : item.iframeUrl || '';
  };

  const iframeSrc = extractSrc(item.iframe || item.iframeUrl);

  // Dynamic Archive.org stream resolver state for movies without pre-set streamUrl
  const [resolvedStreamUrl, setResolvedStreamUrl] = useState(item?.streamUrl || item?.directStreamUrl || '');
  const [streamAttempt, setStreamAttempt] = useState(0);

  // Streaming node state: 'direct' (fast CDN) | 'relay' (Cloud Run proxy) | 'embed' (Archive iframe)
  const [streamNode, setStreamNode] = useState(() => {
    try {
      return getStoredSettings()?.defaultPlaybackMode || 'direct';
    } catch {
      return 'direct';
    }
  });

  useEffect(() => {
    try {
      const mode = getStoredSettings()?.defaultPlaybackMode || 'direct';
      setStreamNode(mode);
    } catch {
      setStreamNode('direct');
    }
    setStreamAttempt(0);
    setResolvedStreamUrl(item?.streamUrl || item?.directStreamUrl || '');
    setStreamError(false);
    setIsVideoLoading(true);
    setIsBuffering(false);
    setIsSeeking(false);
    setIsPaused(false);
    userHasPausedRef.current = false;

    if (item?.isLocalFile || item?.streamUrl) {
      return;
    }
    const match = (item?.archiveId || iframeSrc || '').match(/archive\.org\/(?:embed|details|download)\/([a-zA-Z0-9._-]+)/) ||
      (item?.archiveId ? ['', item.archiveId] : null);

    if (match && match[1]) {
      fetch(`/api/movie/resolve/${encodeURIComponent(match[1])}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.directStreamUrl) {
            setResolvedStreamUrl(data.directStreamUrl);
          }
        })
        .catch(err => console.warn('Dynamic stream resolve error:', err));
    }
  }, [item?.id, item?.archiveId, iframeSrc, item?.isLocalFile]);

  // Extract direct stream candidate URL if available
  const extractDirectCandidate = (mediaItem, src) => {
    if (mediaItem?.isLocalFile && mediaItem?.streamUrl) return mediaItem.streamUrl;
    if (mediaItem?.streamUrl) return mediaItem.streamUrl;
    if (mediaItem?.directStreamUrl) return mediaItem.directStreamUrl;
    if (resolvedStreamUrl) return resolvedStreamUrl;
    if (isDirectMediaUrl(src)) return src;
    return null;
  };

  const rawCandidate = extractDirectCandidate(item, iframeSrc);
  
  const movieFileSlug = (item?.title || 'movie').replace(/[^a-zA-Z0-9_-]/g, '_') + '.mp4';

  // Direct MP4 file stream endpoints through backend with Content-Disposition inline header
  const fileRelayUrl = rawCandidate
    ? `/api/movie/file/${encodeURIComponent(item?.archiveId || item?.id || 'movie')}/${encodeURIComponent(movieFileSlug)}?url=${encodeURIComponent(rawCandidate)}`
    : (item?.archiveId
    ? `/api/movie/file/${encodeURIComponent(item.archiveId)}/${encodeURIComponent(movieFileSlug)}`
    : (item?.id && !item.isLocalFile
    ? `/api/movie/file/${encodeURIComponent(item.id)}/${encodeURIComponent(movieFileSlug)}`
    : ''));

  const downloadFileUrl = rawCandidate
    ? `/api/movie/download/${encodeURIComponent(item?.archiveId || item?.id || 'movie')}/${encodeURIComponent(movieFileSlug)}?url=${encodeURIComponent(rawCandidate)}`
    : (item?.archiveId
    ? `/api/movie/download/${encodeURIComponent(item.archiveId)}/${encodeURIComponent(movieFileSlug)}`
    : '');

  // Best direct standalone file URL for opening in native browser file player
  const standaloneFileUrl = item?.isLocalFile ? item?.streamUrl : (rawCandidate || fileRelayUrl || resolvedStreamUrl || '');

  const activeStreamUrl = item?.isLocalFile
    ? (item?.streamUrl || '')
    : (streamNode === 'relay' && fileRelayUrl)
    ? fileRelayUrl
    : (streamNode === 'cors' && rawCandidate)
    ? `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawCandidate)}`
    : (rawCandidate || resolvedStreamUrl || fileRelayUrl);

  // Active media loading state (true during initial load, time seeking, or stream buffering)
  const isMediaLoading = (isVideoLoading || isSeeking || isBuffering) && !streamError;

  // Reset stream loading and error when movie, active stream, or node changes
  useEffect(() => {
    setIsVideoLoading(true);
    setIsBuffering(false);
    setIsSeeking(false);
    setStreamError(false);
  }, [item?.id, activeStreamUrl, streamNode, reloadKey]);

  // Attempt playback with graceful fallback when autoplay policy restricts unmuted play
  useEffect(() => {
    if (streamNode === 'embed') {
      setIsVideoLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Never force playback if user has paused the movie
    if (userHasPausedRef.current) {
      return;
    }

    let isMounted = true;
    video.preload = 'auto';

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (isMounted) {
            setIsPaused(false);
            setIsVideoLoading(false);
            setIsBuffering(false);
          }
        })
        .catch((err) => {
          // Autoplay blocked by browser policy (expected inside iframes/unmuted)
          if (isMounted) {
            setIsPaused(true);
            setIsVideoLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeStreamUrl, streamNode, reloadKey]);

  // Track whether video was paused at the moment user initiated pointer/touch down
  const handlePointerDown = () => {
    const video = videoRef.current;
    if (video) {
      pointerDownPausedRef.current = video.paused;
    }
  };

  // Toggle play/pause on player click in the video frame without fighting native controls
  const handleTogglePlay = (e) => {
    e?.stopPropagation?.();
    const video = videoRef.current;
    if (!video) return;

    // If the click occurred in the bottom controls area (approx bottom 56px),
    // let the native browser controls handle play/pause/seek/volume exclusively.
    if (e?.clientY && typeof video.getBoundingClientRect === 'function') {
      const rect = video.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > rect.height - 56) {
        pointerDownPausedRef.current = null;
        return;
      }
    }

    const wasPausedBeforeClick = pointerDownPausedRef.current !== null
      ? pointerDownPausedRef.current
      : video.paused;
    pointerDownPausedRef.current = null;

    if (wasPausedBeforeClick) {
      // User clicked while paused -> resume playback
      userHasPausedRef.current = false;
      if (video.paused) {
        video.play().catch((err) => {
          console.warn('Play attempt failed:', err?.message || 'Playback blocked');
        });
      }
      setIsPaused(false);
    } else {
      // User clicked while playing -> PAUSE the movie and keep it paused!
      userHasPausedRef.current = true;
      if (!video.paused) {
        video.pause();
      }
      setIsPaused(true);
    }
  };

  // Video error handler with seamless failover
  const handleVideoError = (err) => {
    err?.stopPropagation?.();
    const errMsg = err?.message || (err?.target?.error ? `MediaError code ${err.target.error.code}` : 'Video load error');
    console.warn('Video stream error on node:', streamNode, errMsg);

    // If direct failed and cloud relay is available, try cloud relay automatically
    if (streamNode === 'direct' && fileRelayUrl) {
      console.log('Direct stream failed, falling back to Cloud Relay...');
      setStreamNode('relay');
      setStreamAttempt(prev => prev + 1);
      setIsVideoLoading(true);
      return;
    }

    // If relay had an initial error, attempt a clean retry
    if (streamNode === 'relay' && streamAttempt === 0) {
      console.log('Cloud Relay stream retry attempt...');
      setStreamAttempt(1);
      setIsVideoLoading(true);
      return;
    }

    if (iframeSrc && streamNode !== 'embed') {
      console.log('Stream error, falling back to Embed Player...');
      setStreamNode('embed');
      setIsVideoLoading(false);
      return;
    }
    setIsVideoLoading(false);
    setStreamError(true);
  };

  // Fullscreen handler
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err?.message || 'Blocked');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut: Escape exits
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Reload handler
  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        lightsOff ? 'bg-black text-zinc-400' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      {/* Main Player Screen Area */}
      <main
        className={`mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ${
          isTheaterMode ? 'max-w-full' : 'max-w-6xl'
        }`}
      >
        {/* Video / Player Stage Box */}
        <div
          ref={containerRef}
          className={`relative w-full rounded-2xl overflow-hidden bg-black border ${
            lightsOff
              ? 'border-zinc-900 shadow-2xl'
              : 'border-zinc-800 shadow-2xl shadow-amber-500/5'
          } flex flex-col`}
        >
          {/* Top Control Bar within Player Frame */}
          <div className="bg-zinc-950/95 border-b border-zinc-800/80 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 select-none">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {item.title}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {item.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
              {/* File Player Status Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                <FileVideo className="w-3.5 h-3.5" />
                <span>{item.isLocalFile ? 'Local File' : 'MP4 File Player'}</span>
              </div>

              {/* Run as Standalone File in Browser */}
              {standaloneFileUrl && (
                <a
                  href={standaloneFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Run movie directly as an MP4 media file in a new browser window"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] transition shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  <span>Run as File (.mp4)</span>
                </a>
              )}

              {/* Download Movie File */}
              {!item.isLocalFile && standaloneFileUrl && (
                <a
                  href={downloadFileUrl || standaloneFileUrl}
                  download={movieFileSlug}
                  title="Download MP4 movie file to play offline"
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              {/* Stream Node Toggle (Direct / Cloud Relay / Embed Player) */}
              {!item.isLocalFile && (
                <button
                  type="button"
                  onClick={() => {
                    const nodes = iframeSrc ? ['direct', 'relay', 'embed'] : ['direct', 'relay'];
                    const nextIndex = (nodes.indexOf(streamNode) + 1) % nodes.length;
                    const next = nodes[nextIndex];
                    setStreamNode(next);
                    setStreamAttempt(prev => prev + 1);
                    setStreamError(false);
                    if (next !== 'embed') {
                      setIsVideoLoading(true);
                    } else {
                      setIsVideoLoading(false);
                    }
                  }}
                  title={
                    streamNode === 'direct'
                      ? 'Direct Origin Active (Fastest CDN). Click to switch to Cloud Relay.'
                      : streamNode === 'relay'
                      ? (iframeSrc ? 'Cloud Relay Active. Click to switch to Embed Player.' : 'Cloud Relay Active. Click to switch to Direct Origin.')
                      : 'Archive Embed Player Active. Click to switch to Direct Origin.'
                  }
                  className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer text-[11px] flex items-center gap-1 border ${
                    streamNode === 'direct'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                      : streamNode === 'relay'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                  }`}
                >
                  <span>
                    {streamNode === 'direct'
                      ? '⚡ Direct Origin'
                      : streamNode === 'relay'
                      ? '🛡️ Cloud Relay'
                      : '🎬 Embed Player'}
                  </span>
                </button>
              )}

              {/* Favorite Toggle Button (Icon Only) */}
              <button
                id={`player-fav-btn-${item.id}`}
                onClick={() => onToggleFavorite(item.id)}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border-zinc-800'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              {/* Lights Off toggle */}
              <button
                id="lights-toggle-btn"
                onClick={() => setLightsOff(!lightsOff)}
                title={lightsOff ? 'Turn Lights On' : 'Lights Off (Cinema Focus)'}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  lightsOff
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                {lightsOff ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Theater Mode toggle */}
              <button
                id="theater-mode-btn"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? 'Standard View' : 'Theater Wide View'}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isTheaterMode
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Reload */}
              <button
                id="reload-player-btn"
                onClick={handleReload}
                title="Reload Movie Stream"
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                id="fullscreen-player-btn"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                className="p-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold rounded-lg transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* EXIT BUTTON: 'X' */}
              <button
                id="exit-player-btn"
                onClick={onBack}
                title="Exit Movie (X)"
                aria-label="Exit movie"
                className="p-1.5 bg-zinc-800 hover:bg-rose-600 active:scale-95 text-zinc-200 hover:text-white rounded-lg border border-zinc-700 hover:border-rose-500 transition cursor-pointer font-bold"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Player Frame */}
          <div className="relative w-full aspect-video sm:aspect-16/10 min-h-[380px] sm:min-h-[520px] bg-black flex items-center justify-center overflow-hidden">
            {streamNode === 'embed' && iframeSrc ? (
              <iframe
                key={`embed-${item.id}-${reloadKey}`}
                src={iframeSrc}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                title={item.title}
              />
            ) : activeStreamUrl ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  key={`video-${item.id}-${streamNode}-${streamAttempt}-${reloadKey}`}
                  src={activeStreamUrl}
                  controls={!isMediaLoading}
                  playsInline
                  preload="auto"
                  onPointerDown={handlePointerDown}
                  onMouseDown={handlePointerDown}
                  onClick={handleTogglePlay}
                  className={`w-full h-full object-contain absolute inset-0 bg-black cursor-pointer transition-opacity duration-300 ${
                    isMediaLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  onLoadStart={() => {
                    setIsVideoLoading(true);
                    setStreamError(false);
                  }}
                  onLoadedMetadata={() => setIsVideoLoading(false)}
                  onLoadedData={() => {
                    setIsVideoLoading(false);
                    setIsSeeking(false);
                  }}
                  onCanPlay={() => {
                    setIsVideoLoading(false);
                    setIsBuffering(false);
                    setIsSeeking(false);
                  }}
                  onPlaying={() => {
                    setIsVideoLoading(false);
                    setIsBuffering(false);
                    setIsSeeking(false);
                    setIsPaused(false);
                  }}
                  onPlay={() => {
                    userHasPausedRef.current = false;
                    setIsPaused(false);
                  }}
                  onPause={() => {
                    userHasPausedRef.current = true;
                    setIsPaused(true);
                  }}
                  onSeeking={() => {
                    setIsSeeking(true);
                    setIsBuffering(true);
                  }}
                  onSeeked={() => {
                    setTimeout(() => {
                      setIsSeeking(false);
                      setIsBuffering(false);
                    }, 120);
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onError={(e) => {
                    e?.stopPropagation?.();
                    handleVideoError(e);
                  }}
                />

                {/* Loading / Seeking / Buffering Screen Overlay - strictly covers the player with a 100% opaque background and hides all controls */}
                {isMediaLoading && (
                  <div
                    className="absolute inset-0 z-30 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-auto select-none"
                  >
                    {/* Ambient Soft Poster Backdrop */}
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-110 pointer-events-none transition-opacity duration-700"
                      />
                    )}

                    {/* Dark gradient base to guarantee 100% solid opacity over video */}
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/95 via-zinc-950 to-zinc-950 pointer-events-none" />

                    <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto">
                      {/* Cinema Film Reel & Media Container Loader */}
                      <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
                        {/* Outer Glow Halo */}
                        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse" />

                        {/* Outer Rotating Cinema Sprocket Ring */}
                        <div
                          className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin"
                          style={{ animationDuration: '8s' }}
                        />

                        {/* Middle Reverse Ring with Gold Accents */}
                        <div className="absolute inset-2 rounded-full border border-t-amber-400 border-r-amber-500/40 border-b-transparent border-l-amber-400/30 animate-spin-reverse" />

                        {/* Central Hub with Cinema Reel Disc */}
                        <div className="relative w-14 h-14 rounded-full bg-zinc-900 border border-amber-500/50 shadow-2xl shadow-amber-500/25 flex items-center justify-center animate-film-pulse">
                          {item.isLocalFile ? (
                            <HardDrive className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <FileVideo className="w-6 h-6 text-amber-400" />
                          )}

                          {/* Center Projector Lens Glint */}
                          <div className="absolute top-2.5 right-3 w-1.5 h-1.5 rounded-full bg-white/70 blur-[0.5px]" />
                        </div>

                        {/* Audio/Video Demuxing Equalizer Waveform Bars */}
                        <div className="absolute -bottom-1 flex items-end gap-1 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 shadow-xs">
                          <div className="w-1 bg-amber-400 rounded-full animate-eq-1" />
                          <div className="w-1 bg-amber-400 rounded-full animate-eq-2" />
                          <div className="w-1 bg-amber-400 rounded-full animate-eq-3" />
                          <div className="w-1 bg-amber-400 rounded-full animate-eq-4" />
                        </div>
                      </div>

                      {/* Status Headline */}
                      <div className="flex items-center gap-2 text-white font-bold text-base tracking-wide mb-1">
                        <span>
                          {isSeeking
                            ? 'Scrubbing Video Frames'
                            : isBuffering
                            ? 'Buffering MP4 Stream'
                            : item.isLocalFile
                            ? 'Reading Local Movie File'
                            : streamNode === 'relay'
                            ? 'Streaming Cloud Relay File'
                            : 'Loading Direct Movie File'}
                        </span>
                        <span className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </div>

                      {/* Movie Title */}
                      <p className="text-sm font-semibold text-zinc-300 truncate max-w-xs sm:max-w-md mb-2">
                        {item.title}
                      </p>

                      {/* Clean Unboxed Metadata Line (frontend-design zero-pill discipline) */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mb-4 flex-wrap justify-center">
                        <span className={item.isLocalFile ? "text-emerald-400" : "text-amber-400/90"}>
                          {item.isLocalFile ? 'Local Storage File' : streamNode === 'direct' ? 'Direct CDN Stream' : 'Cloud Relay'}
                        </span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span>{item.duration || 'Full Feature'}</span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span>Hardware Decoded</span>
                      </div>

                      {/* Shimmering Golden Progress Wave */}
                      <div className="w-56 sm:w-64 h-1.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden relative shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />
                      </div>

                      {/* Micro Subtext */}
                      <p className="text-[11px] text-zinc-500 mt-2 font-mono">
                        {item.isLocalFile
                          ? 'Zero network latency • Offline storage playback'
                          : 'Frame-accurate seek • 1080p MP4 audio & video demuxing'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Fallback Panel */}
                {streamError && (
                  <div className="absolute inset-0 z-25 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">
                      Stream Connection Interrupted
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-md mb-4">
                      Unable to stream via current mode. Choose another streaming node or retry below:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamError(false);
                          setIsVideoLoading(true);
                          handleReload();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Stream</span>
                      </button>
                      {fileRelayUrl && streamNode !== 'relay' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStreamNode('relay');
                            setStreamError(false);
                            setIsVideoLoading(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <span>🛡️ Switch to Cloud Relay</span>
                        </button>
                      )}
                      {rawCandidate && streamNode !== 'direct' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStreamNode('direct');
                            setStreamError(false);
                            setIsVideoLoading(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>⚡ Switch to Direct Origin</span>
                        </button>
                      )}
                      {iframeSrc && streamNode !== 'embed' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStreamNode('embed');
                            setStreamError(false);
                            setIsVideoLoading(false);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <span>🎬 Switch to Embed Player</span>
                        </button>
                      )}
                      {standaloneFileUrl && (
                        <a
                          href={standaloneFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Run as File in New Tab</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-950">
                <FileVideo className="w-12 h-12 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Movie File Preparing</h3>
                <p className="text-sm text-zinc-400 max-w-md">
                  Resolving direct video media file stream...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Movie Info & Actions Below Player */}
        <div
          className={`mt-6 transition-opacity duration-300 ${
            lightsOff ? 'opacity-40 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <div className="pb-6 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  MOVIE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {item.category}
                </span>
                {item.year && (
                  <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {item.year}
                  </span>
                )}
                {item.duration && (
                  <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {item.duration}
                  </span>
                )}
                {item.rating && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {item.rating}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Synopsis */}
          <div className="mt-6 max-w-3xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Synopsis
            </h3>
            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
              {item.description}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media File Stream Information */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 max-w-3xl space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Direct Media File Specifications
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {item.isLocalFile ? 'Local Offline File' : 'MP4 Direct Stream • Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-500 block">File Name</span>
                <span className="font-mono text-zinc-200 truncate block font-medium" title={movieFileSlug}>
                  {movieFileSlug}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-500 block">File Architecture</span>
                <span className="text-zinc-200 font-medium block">
                  Native HTML5 (MP4 / H.264)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-500 block">Streaming Protocol</span>
                <span className="text-zinc-200 font-medium block">
                  {item.isLocalFile ? 'Local File Blob (0ms)' : 'HTTP Byte-Range (206 Partial)'}
                </span>
              </div>
            </div>

            {standaloneFileUrl && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={standaloneFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Run as Standalone File in Browser</span>
                </a>
                {!item.isLocalFile && (
                  <a
                    href={downloadFileUrl || standaloneFileUrl}
                    download={movieFileSlug}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download MP4 File</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* More Movies from Catalog */}
          <div className="mt-12 pt-8 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <span>More Movies from Catalog</span>
              </h3>
              <button
                onClick={onBack}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Browse All Movies ({allCatalog.length}) →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allCatalog
                .filter((i) => i.id !== item.id)
                .slice(0, 6)
                .map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onSelectNext(rec);
                    }}
                    className="group cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-400/60 transition-[transform,border-color] duration-200 p-2 transform-gpu will-change-transform outline-none"
                    style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 mb-2 relative isolate">
                      <img
                        src={rec.thumbnail}
                        alt={rec.title}
                        className="block w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out select-none pointer-events-none transform-gpu [backface-visibility:hidden]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 truncate">
                      {rec.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500">{rec.category}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
