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
  Play,
  AlertTriangle
} from 'lucide-react';
import { isDirectMediaUrl } from '../utils/streamFetch';

export const PlayerView = ({
  item,
  allCatalog,
  onBack,
  onSelectNext,
  onSelectPrev,
  isFavorite,
  onToggleFavorite,
  onTriggerCloak,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Direct Stream State
  const [streamError, setStreamError] = useState(false);

  const containerRef = useRef(null);

  // Extract iframe src URL
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
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (item?.streamUrl) {
      setResolvedStreamUrl(item.streamUrl);
      return;
    }
    const match = (item?.archiveId || iframeSrc || '').match(/archive\.org\/(?:embed|details|download)\/([a-zA-Z0-9._-]+)/) ||
      (item?.archiveId ? ['', item.archiveId] : null);

    if (match && match[1]) {
      setIsResolving(true);
      fetch(`/api/movie/resolve/${encodeURIComponent(match[1])}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.directStreamUrl) {
            setResolvedStreamUrl(data.directStreamUrl);
          }
        })
        .catch(err => console.warn('Dynamic stream resolve error:', err))
        .finally(() => setIsResolving(false));
    }
  }, [item?.id, item?.archiveId, iframeSrc]);

  // Extract direct stream candidate URL if available
  const extractDirectCandidate = (mediaItem, src) => {
    if (resolvedStreamUrl) return resolvedStreamUrl;
    if (mediaItem?.streamUrl) return mediaItem.streamUrl;
    if (mediaItem?.directStreamUrl) return mediaItem.directStreamUrl;
    if (isDirectMediaUrl(src)) return src;
    const archiveMatch = src.match(/archive\.org\/embed\/([a-zA-Z0-9._-]+)/);
    if (archiveMatch) {
      return `https://archive.org/download/${archiveMatch[1]}/${archiveMatch[1]}.mp4`;
    }
    return null;
  };

  const rawCandidate = extractDirectCandidate(item, iframeSrc);
  
  // Linwize Cloud Relay URL: routes media stream through local Cloud Run origin with Byte Range support
  const linwizeRelayUrl = rawCandidate
    ? `/api/proxy/stream?url=${encodeURIComponent(rawCandidate)}`
    : (item?.archiveId ? `/api/movie/stream/${encodeURIComponent(item.archiveId)}` : '');

  // Streaming node state: default to 'relay' for guaranteed Linwize school filter bypass
  const [streamNode, setStreamNode] = useState('relay'); // 'relay' | 'direct' | 'cors'

  const activeStreamUrl = (streamNode === 'relay' && linwizeRelayUrl)
    ? linwizeRelayUrl
    : (streamNode === 'cors' && rawCandidate)
    ? `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawCandidate)}`
    : (rawCandidate || resolvedStreamUrl);

  const isDirectCandidate = !!(rawCandidate || resolvedStreamUrl || linwizeRelayUrl);

  // Direct Stream is the primary and direct playback mode
  const [playbackMode, setPlaybackMode] = useState('direct');
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Reset stream loading and error when movie, mode, or active stream changes
  useEffect(() => {
    setIsVideoLoading(true);
    setIsIframeLoading(true);
    setStreamError(false);
  }, [item?.id, activeStreamUrl, playbackMode, streamNode, reloadKey]);

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
      console.warn('Fullscreen request failed:', err);
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

  const handleOpenCloakedPlayer = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "Google Drive - My Drive";
      const link = win.document.createElement('link');
      link.rel = 'icon';
      link.href = 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png';
      win.document.head.appendChild(link);
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      win.document.body.style.background = '#000';
      const playerUrl = item.archiveId
        ? `/api/movie/player/${encodeURIComponent(item.archiveId)}`
        : (linwizeRelayUrl || activeStreamUrl);
      const frame = win.document.createElement('iframe');
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.border = 'none';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
      frame.allowFullscreen = true;
      frame.src = playerUrl;
      win.document.body.appendChild(frame);
    }
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

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
              {/* Toggle Embed vs Direct Stream */}
              {isDirectCandidate && iframeSrc && (
                <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px] mr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPlaybackMode('direct');
                      setStreamError(false);
                    }}
                    title="Direct Stream"
                    className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer flex items-center gap-1.5 ${
                      playbackMode === 'direct'
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-emerald-400'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Stream</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaybackMode('embed');
                      setStreamError(false);
                    }}
                    title="Legacy Iframe Embed"
                    className={`px-2 py-1 rounded-md transition font-medium cursor-pointer ${
                      playbackMode === 'embed'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Embed
                  </button>
                </div>
              )}

              {/* Linwize Relay Toggle */}
              {playbackMode === 'direct' && linwizeRelayUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const next = streamNode === 'relay' ? 'direct' : 'relay';
                    setStreamNode(next);
                    setStreamError(false);
                    setIsVideoLoading(true);
                  }}
                  title={streamNode === 'relay' ? 'Linwize Filter Bypass Active. Click to switch to Direct Origin.' : 'Direct Origin Active. Click to switch to Linwize Relay.'}
                  className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer text-[11px] flex items-center gap-1 border ${
                    streamNode === 'relay'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <span>{streamNode === 'relay' ? '🛡️ Linwize Relay' : '⚡ Direct Origin'}</span>
                </button>
              )}

              {/* Cloaked Tab Button */}
              <button
                id="cloak-tab-btn"
                onClick={handleOpenCloakedPlayer}
                title="Watch Movie in Stealth about:blank Tab disguised as Google Drive"
                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <span>🕶️ Cloaked Tab</span>
              </button>

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
            {/* Cinematic Loading Animation Stage */}
            {((playbackMode === 'direct' && isVideoLoading && !streamError) || (playbackMode === 'embed' && isIframeLoading)) && (
              <div className="absolute inset-0 z-15 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none">
                {/* Ambient Soft Poster Backdrop */}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none transition-opacity duration-700"
                  />
                )}

                <div className="relative z-20 flex flex-col items-center justify-center">
                  {/* Glowing Orbiting Cinema Reel Spinner */}
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-amber-500/50 border-b-transparent border-l-transparent animate-spin" />
                    <div className="w-14 h-14 rounded-full bg-zinc-900 border border-amber-500/40 shadow-xl shadow-amber-500/20 flex items-center justify-center">
                      <Film className="w-6 h-6 text-amber-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                    <span>Loading Cinema Stream</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 font-medium">Connecting to direct origin • HD 1080p</p>

                  {/* Shimmering Golden Progress Wave */}
                  <div className="w-48 h-1 bg-zinc-800/80 rounded-full overflow-hidden mt-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {playbackMode === 'direct' && activeStreamUrl ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  key={`video-${item.id}-${reloadKey}`}
                  src={activeStreamUrl}
                  controls
                  autoPlay
                  playsInline
                  className={`w-full h-full object-contain absolute inset-0 bg-black transition-opacity duration-500 ${
                    isVideoLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoadStart={() => setIsVideoLoading(true)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setStreamError(true);
                  }}
                />

                {streamError && (
                  <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">
                      Direct Stream Interrupted or Blocked
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-md mb-4">
                      The direct media origin could not be reached or was blocked by the network filter.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamError(false);
                          setIsVideoLoading(true);
                          handleReload();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Stream</span>
                      </button>
                      {linwizeRelayUrl && streamNode !== 'relay' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStreamNode('relay');
                            setStreamError(false);
                            setIsVideoLoading(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <span>🛡️ Switch to Linwize Cloud Relay</span>
                        </button>
                      )}
                      {linwizeRelayUrl && streamNode === 'relay' && rawCandidate && (
                        <button
                          type="button"
                          onClick={() => {
                            setStreamNode('direct');
                            setStreamError(false);
                            setIsVideoLoading(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>⚡ Switch to Direct Origin</span>
                        </button>
                      )}
                      {iframeSrc && (
                        <button
                          type="button"
                          onClick={() => {
                            setPlaybackMode('embed');
                            setStreamError(false);
                            setIsIframeLoading(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-amber-400 transition cursor-pointer"
                        >
                          Switch to Iframe Embed
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : iframeSrc ? (
              <div className="w-full h-full relative">
                <iframe
                  key={`iframe-${item.id}-${reloadKey}`}
                  src={iframeSrc}
                  title={item.title}
                  onLoad={() => setIsIframeLoading(false)}
                  className={`w-full h-full border-0 absolute inset-0 transition-opacity duration-500 ${
                    isIframeLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="eager"
                />
                {isDirectCandidate && (
                  <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/90 border border-emerald-500/50 p-2.5 rounded-xl text-xs text-zinc-300 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md z-30">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-400" />
                      <span>Direct media stream available with instant playback and seeking.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybackMode('direct');
                        setStreamError(false);
                      }}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-md transition flex items-center gap-1"
                    >
                      ⚡ Switch to Direct Stream
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-950">
                <Film className="w-12 h-12 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Stream Unavailable</h3>
                <p className="text-sm text-zinc-400 max-w-md">
                  No video embed stream found for this movie.
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
