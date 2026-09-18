import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Lock,
  Star,
  Activity,
  HelpCircle,
  X,
  Zap,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Trash2,
  Clock,
  Play,
  ListMusic,
  ExternalLink
} from 'lucide-react';
import {
  YOUTUBE_PROXY_NODES,
  DEFAULT_YOUTUBE_VIDEOS,
  extractYouTubeId,
  testYouTubeNodes,
  openAboutBlankCloak,
  fetchYouTubeSearch,
  getVideoThumbnail,
  fetchYouTubeFeed
} from '../data/youtubeData';
import {
  recordSearchEvent,
  recordWatchEvent,
  recordInteractionEvent,
  loadAlgoProfile
} from '../utils/youtubeAlgorithm';
import { applyTabCloak, resetTabCloak } from '../utils/cloaker';
import {
  loadUserProfiles,
  getActiveProfileId,
  setActiveProfileId,
  loadOfflineModeState,
  setOfflineModeState,
  loadOfflineVideos,
  loadAllVideoProfiles,
  isVideoSavedOffline
} from '../utils/youtubeProfilesAndOffline';
import { BrowserChrome } from './YouTubeBrowser/BrowserChrome';
import { YouTubeWebHeader } from './YouTubeBrowser/YouTubeWebHeader';
import { YouTubeSidebar } from './YouTubeBrowser/YouTubeSidebar';
import { YouTubeHomeFeed } from './YouTubeBrowser/YouTubeHomeFeed';
import { YouTubeWatchPage } from './YouTubeBrowser/YouTubeWatchPage';
import { YouTubeSearchPage } from './YouTubeBrowser/YouTubeSearchPage';
import { YouTubeRawMirror } from './YouTubeBrowser/YouTubeRawMirror';
import { YouTubeProfilesView } from './YouTubeBrowser/YouTubeProfilesView';
import { UserProfileManagerModal } from './YouTubeBrowser/UserProfileManagerModal';
import { VideoProfileModal } from './YouTubeBrowser/VideoProfileModal';
import { YouTubePlayIcon } from './YouTubeLogo';

export const YouTubeView = ({
  onTriggerCloak,
  savedCloakPreset = 'docs'
}) => {
  // Catalog of base & cached videos
  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('cinevault_custom_yt');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validCustom = parsed.filter(
          (v) =>
            !['Y3k30B2zD5E', '31U3G1vJ_6E', '7n9Uj4BxS68', 'r_pZlI19V4I', 'V1bFr2KGq1g', 'd9b6l92q_J0', 'kJQP7kiw5Fk'].includes(v.id)
        );
        const customOnly = validCustom.filter((p) => !DEFAULT_YOUTUBE_VIDEOS.some((d) => d.id === p.id));
        return [...DEFAULT_YOUTUBE_VIDEOS, ...customOnly];
      }
    } catch {
      // fallback
    }
    return DEFAULT_YOUTUBE_VIDEOS;
  });

  // Up Next Queue
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('cinevault_yt_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watch History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cinevault_yt_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Offline Mode & Video/User Profiles State
  const [isOfflineMode, setIsOfflineMode] = useState(() => loadOfflineModeState());
  const [userProfiles, setUserProfiles] = useState(() => loadUserProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState(() => getActiveProfileId());
  const [showProfileManagerModal, setShowProfileManagerModal] = useState(false);
  const [videoProfileModalTarget, setVideoProfileModalTarget] = useState(null);
  const [offlineVideosCount, setOfflineVideosCount] = useState(() => loadOfflineVideos().length);
  const [profilesCount, setProfilesCount] = useState(() => Object.keys(loadAllVideoProfiles()).length);

  // Global Bypass Node Index
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);

  // Stealth & Camouflage
  const [stealthTitleActive, setStealthTitleActive] = useState(false);

  // Browser Fullscreen mode
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  // Modals & Diagnostics
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Sidebar Collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Browser Tabs State
  const [tabs, setTabs] = useState([
    {
      id: 'tab-home',
      title: 'YouTube',
      url: 'https://www.youtube.com',
      history: ['https://www.youtube.com'],
      historyIndex: 0,
      activeVideo: null,
      searchQuery: '',
      searchResults: [],
      selectedCategory: 'All',
      selectedSection: 'home',
      viewMode: 'portal',
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-home');

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const browserContainerRef = useRef(null);

  // Save persistent state
  useEffect(() => {
    try {
      localStorage.setItem('cinevault_yt_queue', JSON.stringify(queue));
      localStorage.setItem('cinevault_yt_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [queue, history]);

  // Sync with offline and profile changes across components
  useEffect(() => {
    const handleOfflineModeChange = (e) => {
      setIsOfflineMode(e.detail?.isOfflineMode ?? loadOfflineModeState());
    };
    const handleProfilesChange = (e) => {
      setUserProfiles(e.detail?.profiles ?? loadUserProfiles());
      setActiveProfileIdState(e.detail?.activeProfileId ?? getActiveProfileId());
    };
    const handleOfflineVideosUpdated = (e) => {
      setOfflineVideosCount(e.detail?.videos?.length ?? loadOfflineVideos().length);
    };
    const handleVideoProfileUpdated = () => {
      setProfilesCount(Object.keys(loadAllVideoProfiles()).length);
    };

    window.addEventListener('cinevault_offline_mode_changed', handleOfflineModeChange);
    window.addEventListener('cinevault_profile_changed', handleProfilesChange);
    window.addEventListener('cinevault_offline_videos_updated', handleOfflineVideosUpdated);
    window.addEventListener('cinevault_video_profile_updated', handleVideoProfileUpdated);

    return () => {
      window.removeEventListener('cinevault_offline_mode_changed', handleOfflineModeChange);
      window.removeEventListener('cinevault_profile_changed', handleProfilesChange);
      window.removeEventListener('cinevault_offline_videos_updated', handleOfflineVideosUpdated);
      window.removeEventListener('cinevault_video_profile_updated', handleVideoProfileUpdated);
    };
  }, []);

  // Stealth Title Effect
  useEffect(() => {
    if (stealthTitleActive) {
      applyTabCloak(savedCloakPreset || 'docs');
    }
    return () => {
      if (stealthTitleActive) {
        resetTabCloak();
      }
    };
  }, [stealthTitleActive, savedCloakPreset]);

  // Preload authentic YouTube feed into videos state
  useEffect(() => {
    let mounted = true;
    const preload = async () => {
      try {
        const live = await fetchYouTubeFeed('All');
        if (mounted && live && live.length > 0) {
          setVideos((prev) => {
            const map = new Map(prev.map((v) => [v.id, v]));
            live.forEach((v) => map.set(v.id, v));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Initial live YouTube feed preload failed:', err);
      }
    };
    preload();
    return () => {
      mounted = false;
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsBrowserFullscreen((prev) => !prev);
      } else if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleNewTab();
      } else if (e.key === 'w' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleRunDiagnostics();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);

  // Update a single tab by ID
  const updateTab = (tabId, updates) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  };

  // Navigate Active Tab URL
  const handleNavigateUrl = async (input) => {
    if (!input) return;
    const clean = input.trim();

    // 1. Check if user typed home URL
    if (
      clean === 'https://www.youtube.com' ||
      clean === 'http://www.youtube.com' ||
      clean === 'youtube.com' ||
      clean === 'https://youtube.com' ||
      clean === '/'
    ) {
      navigateTabTo(activeTab.id, {
        url: 'https://www.youtube.com',
        title: 'YouTube',
        activeVideo: null,
        searchQuery: '',
        selectedSection: 'home',
        selectedCategory: 'All',
        isLoading: false
      });
      return;
    }

    // 2. Check if user typed or pasted a YouTube video URL or ID
    const extractedId = extractYouTubeId(clean);
    if (extractedId) {
      const existing = videos.find((v) => v.id === extractedId);
      const videoObj = existing || {
        id: extractedId,
        title: `YouTube Video (${extractedId})`,
        channel: 'YouTube Creator',
        views: 'Available',
        duration: 'Stream',
        thumbnail: `https://i.ytimg.com/vi/${extractedId}/hqdefault.jpg`,
        description: 'Unblocked YouTube stream loaded via address bar.'
      };

      // Add to watch history
      addToHistory(videoObj);

      navigateTabTo(activeTab.id, {
        url: `https://www.youtube.com/watch?v=${extractedId}`,
        title: `${videoObj.title} - YouTube`,
        activeVideo: videoObj,
        searchQuery: '',
        isLoading: false
      });
      return;
    }

    // 3. Check if user entered a search URL
    let query = clean;
    if (clean.includes('search_query=')) {
      try {
        const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
        query = urlObj.searchParams.get('search_query') || clean;
      } catch {
        query = clean;
      }
    }

    // 4. Perform Search
    updateTab(activeTab.id, { isLoading: true });
    // Record search in algorithm profile
    try {
      const profile = loadAlgoProfile();
      recordSearchEvent(query, profile);
    } catch {}
    try {
      const results = await fetchYouTubeSearch(query);
      navigateTabTo(activeTab.id, {
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        title: `${query} - YouTube Search`,
        activeVideo: null,
        searchQuery: query,
        searchResults: results,
        isLoading: false
      });
    } catch {
      // fallback search with local catalog
      const localMatches = videos.filter((v) =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.channel.toLowerCase().includes(query.toLowerCase())
      );
      navigateTabTo(activeTab.id, {
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        title: `${query} - YouTube Search`,
        activeVideo: null,
        searchQuery: query,
        searchResults: localMatches,
        isLoading: false
      });
    }
  };

  // Helper to update tab and push to history
  const navigateTabTo = (tabId, pageData) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(pageData.url);
        return {
          ...tab,
          ...pageData,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      })
    );
  };

  // Back button
  const handleGoBack = () => {
    if (activeTab.historyIndex <= 0) return;
    const newIdx = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[newIdx];
    restoreTabToUrl(activeTab.id, prevUrl, newIdx);
  };

  // Forward button
  const handleGoForward = () => {
    if (activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIdx = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[newIdx];
    restoreTabToUrl(activeTab.id, nextUrl, newIdx);
  };

  // Restore tab state from history URL
  const restoreTabToUrl = async (tabId, url, historyIndex) => {
    if (url.includes('/watch?v=')) {
      const vidId = extractYouTubeId(url);
      const videoObj = videos.find((v) => v.id === vidId) || {
        id: vidId,
        title: `YouTube Video (${vidId})`,
        channel: 'YouTube Creator',
        thumbnail: `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`
      };
      updateTab(tabId, {
        url,
        title: `${videoObj.title} - YouTube`,
        activeVideo: videoObj,
        searchQuery: '',
        historyIndex
      });
    } else if (url.includes('/results?search_query=')) {
      const params = new URL(url).searchParams;
      const query = params.get('search_query') || '';
      updateTab(tabId, { isLoading: true });
      const results = await fetchYouTubeSearch(query);
      updateTab(tabId, {
        url,
        title: `${query} - YouTube Search`,
        activeVideo: null,
        searchQuery: query,
        searchResults: results,
        historyIndex,
        isLoading: false
      });
    } else {
      updateTab(tabId, {
        url: 'https://www.youtube.com',
        title: 'YouTube',
        activeVideo: null,
        searchQuery: '',
        selectedSection: 'home',
        historyIndex
      });
    }
  };

  // Reload current view
  const handleReload = () => {
    updateTab(activeTab.id, { isLoading: true });
    setTimeout(() => {
      updateTab(activeTab.id, { isLoading: false });
    }, 400);
  };

  // Home button
  const handleGoHome = () => {
    navigateTabTo(activeTab.id, {
      url: 'https://www.youtube.com',
      title: 'YouTube',
      activeVideo: null,
      searchQuery: '',
      selectedSection: 'home',
      selectedCategory: 'All',
      isLoading: false
    });
  };

  // New Tab
  const handleNewTab = (initialUrl = 'https://www.youtube.com', initialVideo = null) => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: initialVideo ? `${initialVideo.title} - YouTube` : 'YouTube',
      url: initialUrl,
      history: [initialUrl],
      historyIndex: 0,
      activeVideo: initialVideo,
      searchQuery: '',
      searchResults: [],
      selectedCategory: 'All',
      selectedSection: 'home',
      viewMode: 'portal',
      isLoading: false
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Close Tab
  const handleCloseTab = (tabId) => {
    if (tabs.length <= 1) {
      // If closing last tab, reset to YouTube Home
      updateTab(tabId, {
        title: 'YouTube',
        url: 'https://www.youtube.com',
        history: ['https://www.youtube.com'],
        historyIndex: 0,
        activeVideo: null,
        searchQuery: '',
        selectedSection: 'home'
      });
      return;
    }

    const index = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextActive = newTabs[Math.max(0, index - 1)];
      setActiveTabId(nextActive.id);
    }
  };

  // Select Video to watch
  const handleSelectVideo = (video, inNewTab = false) => {
    if (inNewTab) {
      handleNewTab(`https://www.youtube.com/watch?v=${video.id}`, video);
      return;
    }

    addToHistory(video);
    navigateTabTo(activeTab.id, {
      url: `https://www.youtube.com/watch?v=${video.id}`,
      title: `${video.title} - YouTube`,
      activeVideo: video,
      searchQuery: '',
      isLoading: false
    });
  };

  // Add video to watch history
  const addToHistory = (video) => {
    try {
      const profile = loadAlgoProfile();
      recordWatchEvent(video, profile);
    } catch {}

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== video.id);
      return [
        {
          ...video,
          watchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...filtered
      ].slice(0, 50);
    });
  };

  // Toggle Offline Mode
  const handleToggleOfflineMode = () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    setOfflineModeState(nextState);
  };

  // Add to Up Next queue
  const handleAddToQueue = (video, e) => {
    e?.stopPropagation();
    try {
      const profile = loadAlgoProfile();
      recordInteractionEvent(video.id, video, 'queue', profile);
    } catch {}
    setQueue((prev) => {
      if (prev.some((item) => item.id === video.id)) return prev;
      return [...prev, video];
    });
  };

  // Remove from queue
  const removeFromQueue = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Select Sidebar Section
  const handleSelectSection = (sectionId) => {
    updateTab(activeTab.id, { selectedSection: sectionId });

    if (sectionId === 'home') {
      handleGoHome();
    } else if (sectionId === 'trending') {
      handleNavigateUrl('Trending');
    } else if (sectionId === 'music') {
      handleNavigateUrl('Music');
    } else if (sectionId === 'gaming') {
      handleNavigateUrl('Gaming');
    } else if (sectionId === 'education') {
      handleNavigateUrl('Science Education');
    } else if (sectionId === 'movies') {
      handleNavigateUrl('Movies');
    } else if (sectionId === 'guaranteed') {
      updateTab(activeTab.id, {
        url: 'https://www.youtube.com',
        title: 'Guaranteed Working - YouTube',
        activeVideo: null,
        searchQuery: '',
        selectedCategory: '⭐ Guaranteed Working'
      });
    } else if (sectionId === 'offline') {
      updateTab(activeTab.id, {
        url: 'https://www.youtube.com/offline',
        title: 'Offline Vault - YouTube',
        activeVideo: null,
        searchQuery: '',
        selectedSection: 'offline'
      });
    } else if (sectionId === 'profiles') {
      updateTab(activeTab.id, {
        url: 'https://www.youtube.com/profiles',
        title: 'Video Profiles - YouTube',
        activeVideo: null,
        searchQuery: '',
        selectedSection: 'profiles'
      });
    }
  };

  // Run Node Diagnostics
  const handleRunDiagnostics = async () => {
    setShowDiagnosticsModal(true);
    setDiagnosticsLoading(true);
    try {
      const activeId = activeTab?.activeVideo?.id || 'aqz-KE-bpKQ';
      const data = await testYouTubeNodes(activeId);
      setDiagnosticsData(data);
    } catch (err) {
      console.warn('Diagnostics error:', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const currentNode = YOUTUBE_PROXY_NODES[selectedNodeIndex] || YOUTUBE_PROXY_NODES[0];

  return (
    <div
      ref={browserContainerRef}
      className={`flex flex-col bg-zinc-950 transition-all duration-300 ${
        isBrowserFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'w-full flex-1 min-h-[calc(100vh-4rem)]'
      }`}
    >
      {/* 1. Real Browser Window Header & Chrome */}
      <BrowserChrome
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onNewTab={() => handleNewTab()}
        onCloseTab={handleCloseTab}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        currentUrl={activeTab.url}
        onNavigateUrl={handleNavigateUrl}
        selectedNodeIndex={selectedNodeIndex}
        onSelectNode={setSelectedNodeIndex}
        viewMode={activeTab.viewMode}
        onToggleViewMode={(mode) => updateTab(activeTab.id, { viewMode: mode })}
        isBrowserFullscreen={isBrowserFullscreen}
        onToggleFullscreen={() => setIsBrowserFullscreen(!isBrowserFullscreen)}
        onTriggerCloak={onTriggerCloak}
        savedCloakPreset={savedCloakPreset}
        stealthTitleActive={stealthTitleActive}
        onToggleStealthTitle={() => setStealthTitleActive(!stealthTitleActive)}
        activeVideoId={activeTab.activeVideo?.id || 'aqz-KE-bpKQ'}
        embedUrl={
          typeof currentNode.formatUrl === 'function'
            ? currentNode.formatUrl(activeTab.activeVideo?.id || 'aqz-KE-bpKQ')
            : `https://www.youtube.com/embed/${activeTab.activeVideo?.id || 'aqz-KE-bpKQ'}`
        }
      />

      {/* 2. In-Browser Web Application Window */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dedicated YouTube Search Bar inside the browser */}
        <YouTubeWebHeader
          onSearch={(q) => handleNavigateUrl(q)}
          currentSearchQuery={activeTab.searchQuery || ''}
          onGoHome={handleGoHome}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          selectedNodeIndex={selectedNodeIndex}
          onSelectNode={setSelectedNodeIndex}
          onOpenDiagnostics={handleRunDiagnostics}
          activeVideo={activeTab.activeVideo}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={handleToggleOfflineMode}
          activeProfile={userProfiles.find((p) => p.id === activeProfileId) || userProfiles[0]}
          onOpenProfileManager={() => setShowProfileManagerModal(true)}
        />

        {/* Browser Content & Sidebar Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible YouTube Sidebar */}
          <YouTubeSidebar
            activeSection={activeTab.selectedSection || 'home'}
            onSelectSection={handleSelectSection}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            historyCount={history.length}
            queueCount={queue.length}
            offlineCount={offlineVideosCount}
            profilesCount={profilesCount}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={handleToggleOfflineMode}
            onOpenDiagnostics={handleRunDiagnostics}
            onOpenShortcuts={() => setShowShortcutsModal(true)}
          />

          {/* Browser Content Stage */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
          {/* A. Raw Web Mirror View */}
          {activeTab.viewMode === 'mirror' ? (
            <YouTubeRawMirror onSwitchToPortal={() => updateTab(activeTab.id, { viewMode: 'portal' })} />
          ) : activeTab.activeVideo ? (
            /* B. YouTube Watch Page */
            <YouTubeWatchPage
              video={activeTab.activeVideo}
              videos={videos}
              onSelectVideo={(v) => handleSelectVideo(v, false)}
              onOpenVideoInNewTab={(v) => handleSelectVideo(v, true)}
              selectedNodeIndex={selectedNodeIndex}
              onSelectNode={setSelectedNodeIndex}
              onAddToQueue={handleAddToQueue}
              stealthTitleActive={stealthTitleActive}
              onOpenVideoProfileModal={(v) => setVideoProfileModalTarget(v)}
            />
          ) : activeTab.searchQuery ? (
            /* C. YouTube Search Results Page */
            <YouTubeSearchPage
              query={activeTab.searchQuery}
              results={activeTab.searchResults}
              isLoading={activeTab.isLoading}
              onSelectVideo={(v) => handleSelectVideo(v, false)}
              onOpenVideoInNewTab={(v) => handleSelectVideo(v, true)}
              onAddToQueue={handleAddToQueue}
              onOpenVideoProfileModal={(v) => setVideoProfileModalTarget(v)}
            />
          ) : activeTab.selectedSection === 'offline' ? (
            /* D. Offline Video Vault View */
            <YouTubeProfilesView
              allVideos={videos}
              onSelectVideo={(v) => handleSelectVideo(v, false)}
              onOpenVideoInNewTab={(v) => handleSelectVideo(v, true)}
              onAddToQueue={handleAddToQueue}
              onOpenProfileManager={() => setShowProfileManagerModal(true)}
              onOpenVideoProfileModal={(v) => setVideoProfileModalTarget(v)}
              initialFilter="offline"
            />
          ) : activeTab.selectedSection === 'profiles' ? (
            /* E. Video Profiles & Tagged Library View */
            <YouTubeProfilesView
              allVideos={videos}
              onSelectVideo={(v) => handleSelectVideo(v, false)}
              onOpenVideoInNewTab={(v) => handleSelectVideo(v, true)}
              onAddToQueue={handleAddToQueue}
              onOpenProfileManager={() => setShowProfileManagerModal(true)}
              onOpenVideoProfileModal={(v) => setVideoProfileModalTarget(v)}
              initialFilter="all"
            />
          ) : activeTab.selectedSection === 'history' ? (
            /* F. Watch History View */
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-zinc-950">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold text-white">Watch History ({history.length})</h2>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 text-xs font-semibold border border-zinc-800 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-16 text-center text-zinc-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                  <p className="text-sm">No watch history yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  {history.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => handleSelectVideo(item)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-amber-400/40 transition cursor-pointer group"
                    >
                      <img
                        src={getVideoThumbnail(item.id, item.thumbnail)}
                        alt={item.title}
                        className="w-28 aspect-video rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400">{item.channel}</p>
                        <span className="text-[10px] text-zinc-500">{item.watchedAt || 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab.selectedSection === 'queue' ? (
            /* F. Up Next Queue View */
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-zinc-950">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold text-white">Up Next Playback Queue ({queue.length})</h2>
                </div>
                {queue.length > 0 && (
                  <button
                    onClick={() => setQueue([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 text-xs font-semibold border border-zinc-800 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Queue</span>
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="py-16 text-center text-zinc-500">
                  <ListMusic className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                  <p className="text-sm">Queue is empty.</p>
                  <p className="text-xs text-zinc-600 mt-1">Hover over any video and click the +Queue button.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-w-3xl">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 transition group"
                    >
                      <span className="font-mono text-xs text-zinc-500 w-4">{idx + 1}</span>
                      <img
                        src={getVideoThumbnail(item.id, item.thumbnail)}
                        alt={item.title}
                        className="w-24 aspect-video rounded-lg object-cover shrink-0 cursor-pointer"
                        onClick={() => {
                          handleSelectVideo(item);
                          removeFromQueue(item.id);
                        }}
                      />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          handleSelectVideo(item);
                          removeFromQueue(item.id);
                        }}
                      >
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400">{item.channel}</p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* G. Default YouTube Home Feed */
            <YouTubeHomeFeed
              videos={videos}
              selectedCategory={activeTab.selectedCategory || 'All'}
              onSelectCategory={(cat) => updateTab(activeTab.id, { selectedCategory: cat })}
              onSelectVideo={(v) => handleSelectVideo(v, false)}
              onOpenVideoInNewTab={(v) => handleSelectVideo(v, true)}
              onAddToQueue={handleAddToQueue}
              onSearchQuery={(q) => handleNavigateUrl(q)}
              onOpenVideoProfileModal={(v) => setVideoProfileModalTarget(v)}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={handleToggleOfflineMode}
            />
          )}
        </div>
      </div>
    </div>

      {/* 3. Bypass Node Diagnostics Modal */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Bypass Gateway Health & Latency Probe</h3>
                  <p className="text-xs text-zinc-400">
                    Live probe across all 7 YouTube proxy and stream nodes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {diagnosticsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <p className="text-sm font-semibold text-zinc-200">Pinging all proxy mirrors...</p>
              </div>
            ) : (
              <div className="space-y-2 mt-4 max-h-[320px] overflow-y-auto pr-1">
                {YOUTUBE_PROXY_NODES.map((node, idx) => {
                  const res = diagnosticsData?.results?.[node.id];
                  const isCurrent = selectedNodeIndex === idx;
                  const latency = node.id === 'native' ? 18 : res?.latencyMs || 120;

                  return (
                    <div
                      key={node.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isCurrent
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : 'bg-zinc-950/60 border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{node.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-300">
                            {node.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{node.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {latency}ms
                        </span>
                        <button
                          onClick={() => {
                            setSelectedNodeIndex(idx);
                            setShowDiagnosticsModal(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                          }`}
                        >
                          {isCurrent ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={handleRunDiagnostics}
                disabled={diagnosticsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
                <span>Re-test Nodes</span>
              </button>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Keyboard Shortcuts Cheatsheet Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <YouTubePlayIcon className="w-5 h-3.5 shrink-0" />
                <h3 className="font-bold text-white text-base">YouTube Browser Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {[
                { key: 'Ctrl/Cmd + T', action: 'Open New Browser Tab' },
                { key: 'Ctrl/Cmd + W', action: 'Close Current Tab' },
                { key: 'F', action: 'Toggle Fullscreen Browser Mode' },
                { key: 'D', action: 'Run Bypass Node Latency Diagnostics' },
                { key: 'ESC or `', action: 'Instant Panic Camouflage Screen' }
              ].map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800"
                >
                  <span className="text-zinc-300 font-medium">{sc.action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px] border border-zinc-700">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. User Profile & Mode Switcher Modal */}
      {showProfileManagerModal && (
        <UserProfileManagerModal
          isOpen={showProfileManagerModal}
          onClose={() => setShowProfileManagerModal(false)}
        />
      )}

      {/* 6. Video Profile & Tags Editor Modal */}
      {videoProfileModalTarget && (
        <VideoProfileModal
          isOpen={Boolean(videoProfileModalTarget)}
          video={videoProfileModalTarget}
          onClose={() => setVideoProfileModalTarget(null)}
          onUpdate={() => {
            setOfflineVideosCount(loadOfflineVideos().length);
            setProfilesCount(Object.keys(loadAllVideoProfiles()).length);
          }}
        />
      )}
    </div>
  );
};
