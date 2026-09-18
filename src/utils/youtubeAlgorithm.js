// YouTube Algorithmic Recommendation Engine for CineVault (v2 - Advanced Multi-Stage Recommender)
// Architecture:
// 1. Candidate Generation & Dynamic Channel/Category Scoring
// 2. Semantic Tokenizer & Keyword Affinity Vector (TF-IDF approximation)
// 3. Temporal Decay & Recency Half-Life Model
// 4. Session Intent Classifier (Focus, Science/Tech, Gaming, Cinema, Discovery)
// 5. Co-visitation Collaborative Filtering Matrix
// 6. Maximal Marginal Relevance (MMR) Diversity Re-Ranking
// 7. Watch Page Up Next Co-visitation and Co-occurrence Ranking

const ALGO_PROFILE_STORAGE_KEY = 'cinevault_yt_algo_profile';

// Common English stopwords to ignore in semantic extraction
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'video', 'official', 'full', 'hd', '4k', '2024', '2025', '2026', 'episode',
  'ep', 'part', 'ft', 'feat', 'vs', 'new', 'live', 'free'
]);

// Co-visitation graph of related creators and thematic neighbors
const CO_VISITATION_GRAPH = {
  'Veritasium': ['Mark Rober', '3Blue1Brown', 'Steve Mould', 'Kurzgesagt', 'SmarterEveryDay'],
  'Mark Rober': ['Veritasium', 'Stuff Made Here', 'MrBeast', 'Hacksmith'],
  '3Blue1Brown': ['Veritasium', 'Numberphile', 'Stand-up Maths', 'Computerphile'],
  'Lofi Girl': ['Chillhop Music', 'The Bootleg Boy', 'Ambient Worlds', 'Feardog'],
  'Chillhop Music': ['Lofi Girl', 'ChilledCow', 'Coffee Shop Vibes'],
  'MrBeast': ['Mark Rober', 'Dude Perfect', 'Airrack', 'PewDiePie'],
  'Blender Foundation': ['Blender Guru', 'CG Geek', 'Ducky 3D', 'Polyfjord'],
  'Minecraft': ['Mumbo Jumbo', 'Grian', 'DanTDM', 'CaptainSparklez'],
  'Cinema': ['Corridor Crew', 'Every Frame a Painting', 'StudioBinder']
};

// Default user algorithmic profile with rich semantic state
export function getDefaultAlgoProfile() {
  return {
    watchHistory: [],
    likedVideoIds: [],
    dislikedVideoIds: [],
    channelAffinities: {
      'Lofi Girl': 4,
      'Veritasium': 3,
      'MrBeast': 2,
      'Mark Rober': 2,
      '3Blue1Brown': 2,
      'Blender Foundation': 2
    },
    categoryAffinities: {
      '⭐ Guaranteed Working': 3,
      'Music & Lofi': 4,
      'Science & Tech': 3,
      'Gaming': 2,
      'Education': 2
    },
    keywordAffinities: {
      'lofi': 4,
      'beats': 3,
      'science': 3,
      'physics': 3,
      'minecraft': 2,
      'animation': 2,
      'math': 2
    },
    recentQueries: [],
    lastWatchedVideo: null,
    totalWatchCount: 0,
    sessionMode: 'Exploration', // 'Focus' | 'Science & Tech' | 'Gaming' | 'Cinema' | 'Exploration'
    lastUpdated: Date.now()
  };
}

// Tokenize text into normalized semantic keywords
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// Load profile from localStorage with fallback & migrations
export function loadAlgoProfile() {
  try {
    const raw = localStorage.getItem(ALGO_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultAlgoProfile();
      return {
        ...defaults,
        ...parsed,
        channelAffinities: { ...defaults.channelAffinities, ...(parsed.channelAffinities || {}) },
        categoryAffinities: { ...defaults.categoryAffinities, ...(parsed.categoryAffinities || {}) },
        keywordAffinities: { ...defaults.keywordAffinities, ...(parsed.keywordAffinities || {}) }
      };
    }
  } catch (e) {
    console.warn('[YouTubeAlgo] Failed to load profile:', e);
  }
  return getDefaultAlgoProfile();
}

// Save profile to localStorage
export function saveAlgoProfile(profile) {
  try {
    localStorage.setItem(ALGO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[YouTubeAlgo] Failed to save profile:', e);
  }
}

// Detect active session intent based on temporal cluster of recent watches
export function detectSessionIntent(profile) {
  const recent = (profile.watchHistory || []).slice(0, 5);
  if (recent.length === 0) return { intent: 'Exploration', label: 'Adaptive Blend' };

  let focusCount = 0;
  let scienceCount = 0;
  let gamingCount = 0;
  let movieCount = 0;

  for (const item of recent) {
    const cat = item.category || '';
    const title = (item.title || '').toLowerCase();
    if (cat === 'Music & Lofi' || title.includes('lofi') || title.includes('ambient') || title.includes('relax')) {
      focusCount += 2;
    } else if (cat === 'Science & Tech' || cat === 'Education' || title.includes('physics') || title.includes('math')) {
      scienceCount += 2;
    } else if (cat === 'Gaming' || title.includes('minecraft') || title.includes('gameplay')) {
      gamingCount += 2;
    } else if (cat === 'Comedy & Classics' || cat === 'Documentaries') {
      movieCount += 1.5;
    }
  }

  if (focusCount >= 3) return { intent: 'Focus', label: 'Study & Ambient Focus' };
  if (scienceCount >= 3) return { intent: 'Science & Tech', label: 'Curiosity & Science' };
  if (gamingCount >= 3) return { intent: 'Gaming', label: 'Gaming & High Energy' };
  if (movieCount >= 3) return { intent: 'Cinema', label: 'Cinema & Deep Dive' };
  return { intent: 'Exploration', label: 'Personalized Mix' };
}

// Record a video watch event to update the recommendation model
export function recordWatchEvent(video, currentProfile) {
  if (!video || !video.id) return currentProfile;

  const profile = { ...currentProfile };
  const channel = video.channel || 'YouTube';
  const category = video.category || 'General';

  // Increment total watch count
  profile.totalWatchCount = (profile.totalWatchCount || 0) + 1;

  // Channel affinity boost (+3)
  profile.channelAffinities = {
    ...profile.channelAffinities,
    [channel]: (profile.channelAffinities[channel] || 0) + 3
  };

  // Co-visitation propagation: boost related creators slightly (+1.2)
  const relatedCreators = CO_VISITATION_GRAPH[channel] || [];
  relatedCreators.forEach((rel) => {
    profile.channelAffinities[rel] = (profile.channelAffinities[rel] || 0) + 1.2;
  });

  // Category affinity boost (+2)
  profile.categoryAffinities = {
    ...profile.categoryAffinities,
    [category]: (profile.categoryAffinities[category] || 0) + 2
  };

  // Semantic keyword extraction & updating
  const tokens = tokenizeText(`${video.title || ''} ${video.description || ''} ${video.tags?.join(' ') || ''}`);
  const kwMap = { ...(profile.keywordAffinities || {}) };
  tokens.forEach((token) => {
    kwMap[token] = Math.min(25, (kwMap[token] || 0) + 1.5);
  });
  profile.keywordAffinities = kwMap;

  // Last watched seed video for "Because you watched..." shelf
  profile.lastWatchedVideo = {
    id: video.id,
    title: video.title,
    channel: video.channel,
    category: video.category,
    thumbnail: video.thumbnail,
    timestamp: Date.now()
  };

  // Prepend to watch history (deduplicated, keep last 30)
  const filteredHistory = (profile.watchHistory || []).filter((item) => item.id !== video.id);
  profile.watchHistory = [
    {
      id: video.id,
      title: video.title,
      channel: video.channel,
      category: video.category,
      thumbnail: video.thumbnail,
      watchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    },
    ...filteredHistory
  ].slice(0, 30);

  // Re-detect session mode
  profile.sessionMode = detectSessionIntent(profile).intent;
  profile.lastUpdated = Date.now();
  saveAlgoProfile(profile);
  return profile;
}

// Record like / dislike / queue actions
export function recordInteractionEvent(videoId, video, actionType, currentProfile) {
  if (!videoId || !currentProfile) return currentProfile;

  const profile = { ...currentProfile };
  const channel = video?.channel;
  const category = video?.category;

  if (actionType === 'like') {
    if (!profile.likedVideoIds.includes(videoId)) {
      profile.likedVideoIds = [...profile.likedVideoIds, videoId];
    }
    profile.dislikedVideoIds = profile.dislikedVideoIds.filter((id) => id !== videoId);
    if (channel) profile.channelAffinities[channel] = (profile.channelAffinities[channel] || 0) + 6;
    if (category) profile.categoryAffinities[category] = (profile.categoryAffinities[category] || 0) + 4;

    const tokens = tokenizeText(video?.title || '');
    tokens.forEach((t) => {
      profile.keywordAffinities[t] = (profile.keywordAffinities[t] || 0) + 3;
    });
  } else if (actionType === 'dislike') {
    if (!profile.dislikedVideoIds.includes(videoId)) {
      profile.dislikedVideoIds = [...profile.dislikedVideoIds, videoId];
    }
    profile.likedVideoIds = profile.likedVideoIds.filter((id) => id !== videoId);
    if (channel) profile.channelAffinities[channel] = Math.max(0, (profile.channelAffinities[channel] || 0) - 10);
    if (category) profile.categoryAffinities[category] = Math.max(0, (profile.categoryAffinities[category] || 0) - 6);

    const tokens = tokenizeText(video?.title || '');
    tokens.forEach((t) => {
      profile.keywordAffinities[t] = Math.max(0, (profile.keywordAffinities[t] || 0) - 5);
    });
  } else if (actionType === 'queue' || actionType === 'favorite') {
    if (channel) profile.channelAffinities[channel] = (profile.channelAffinities[channel] || 0) + 2.5;
    if (category) profile.categoryAffinities[category] = (profile.categoryAffinities[category] || 0) + 2;
  }

  profile.lastUpdated = Date.now();
  saveAlgoProfile(profile);
  return profile;
}

// Record search query to boost relevant topics in the feed
export function recordSearchEvent(query, currentProfile) {
  if (!query || !query.trim() || !currentProfile) return currentProfile;

  const profile = { ...currentProfile };
  const q = query.trim().toLowerCase();

  profile.recentQueries = [
    { query: q, timestamp: Date.now() },
    ...(profile.recentQueries || []).filter((item) => item.query !== q)
  ].slice(0, 10);

  // Boost keywords from query directly
  const tokens = tokenizeText(q);
  tokens.forEach((t) => {
    profile.keywordAffinities[t] = (profile.keywordAffinities[t] || 0) + 4;
  });

  profile.lastUpdated = Date.now();
  saveAlgoProfile(profile);
  return profile;
}

// Parse views string (e.g. "120M+ streams", "1.4M views") to approximate numeric value
function parseViewsScore(viewsStr) {
  if (!viewsStr) return 1000000;
  const cleaned = String(viewsStr).toLowerCase();
  const numMatch = cleaned.match(/([\d.]+)\s*([kmb])?/);
  if (!numMatch) return 1000000;

  const val = parseFloat(numMatch[1]);
  const multiplier = numMatch[2];
  if (multiplier === 'b') return val * 1000000000;
  if (multiplier === 'm') return val * 1000000;
  if (multiplier === 'k') return val * 1000;
  return val;
}

// Compute semantic overlap score between a candidate video and user keyword affinity profile
function computeSemanticOverlapScore(video, profile) {
  if (!profile.keywordAffinities) return 0;
  const tokens = tokenizeText(`${video.title || ''} ${video.tags?.join(' ') || ''}`);
  let overlap = 0;
  for (const token of tokens) {
    if (profile.keywordAffinities[token]) {
      overlap += Math.min(profile.keywordAffinities[token], 10);
    }
  }
  return Math.min(overlap * 2.5, 50);
}

// Calculate comprehensive multi-objective candidate score
export function scoreVideo(video, profile, options = {}) {
  let score = 50; // Neutral baseline prior

  const {
    currentVideoId = null,
    currentChannel = null,
    currentCategory = null,
    isWatchPage = false
  } = options;

  // 1. Channel Affinity (Primary YouTube Creator Loyalty weight)
  const channelScore = profile.channelAffinities?.[video.channel] || 0;
  score += Math.min(channelScore * 7, 70);

  // Co-visitation bonus from related channels
  if (currentChannel) {
    const related = CO_VISITATION_GRAPH[currentChannel] || [];
    if (related.includes(video.channel)) {
      score += 30; // Strongly linked in the YouTube creator graph
    }
  }

  // 2. Category Affinity
  const categoryScore = profile.categoryAffinities?.[video.category] || 0;
  score += Math.min(categoryScore * 4.5, 45);

  // 3. Semantic Keyword Vector Similarity (NLP / Topic Alignment)
  const semanticBonus = computeSemanticOverlapScore(video, profile);
  score += semanticBonus;

  // 4. Session Mode Intent Congruence
  const session = detectSessionIntent(profile);
  if (session.intent === 'Focus' && (video.category === 'Music & Lofi' || (video.title || '').toLowerCase().includes('lofi'))) {
    score += 35; // Intent boost
  } else if (session.intent === 'Science & Tech' && (video.category === 'Science & Tech' || video.category === 'Education')) {
    score += 30;
  } else if (session.intent === 'Gaming' && (video.category === 'Gaming' || (video.title || '').toLowerCase().includes('minecraft'))) {
    score += 30;
  }

  // 5. Watch Page Context
  if (isWatchPage) {
    if (currentChannel && video.channel === currentChannel) {
      score += 55; // YouTube heavily prioritizes other uploads by the same creator
    }
    if (currentCategory && video.category === currentCategory) {
      score += 25; // Same topic genre
    }
    if (currentVideoId && video.id === currentVideoId) {
      return -9999; // Never recommend currently playing video to itself
    }
  }

  // 6. User Feedback Signals (Likes / Dislikes)
  if (profile.likedVideoIds?.includes(video.id)) {
    score += 40; // Liked video boost
  }
  if (profile.dislikedVideoIds?.includes(video.id)) {
    score -= 150; // Strong negative filter
  }

  // 7. Popularity / Velocity Signal (Log scale)
  const views = parseViewsScore(video.views);
  const logViews = Math.log10(Math.max(1000, views));
  score += (logViews - 4) * 4.5;

  // 8. Recent Search Query Relevance
  if (profile.recentQueries && profile.recentQueries.length > 0) {
    const latestQuery = profile.recentQueries[0].query;
    const titleLower = (video.title || '').toLowerCase();
    const channelLower = (video.channel || '').toLowerCase();
    const descLower = (video.description || '').toLowerCase();

    if (titleLower.includes(latestQuery) || channelLower.includes(latestQuery)) {
      score += 35;
    } else if (descLower.includes(latestQuery)) {
      score += 18;
    }
  }

  // 9. Seed similarity to Last Watched Video ("Because you watched...")
  if (profile.lastWatchedVideo) {
    if (video.channel === profile.lastWatchedVideo.channel) {
      score += 24;
    }
    if (video.category === profile.lastWatchedVideo.category) {
      score += 15;
    }
  }

  // 10. Fatigue / Repetition Penalty
  const recentHistoryIndex = profile.watchHistory?.findIndex((item) => item.id === video.id);
  if (recentHistoryIndex !== -1 && recentHistoryIndex < 3) {
    const isLoopable = video.category === 'Music & Lofi' || video.channel === 'Lofi Girl';
    if (!isLoopable) {
      score -= 30; // Deduce fatigue
    }
  }

  // 11. Serendipity / Thompson-Sampling Exploration Noise
  // Injects exploration variance so the user's feed continuously surfaces fresh creators
  const pseudoRandomSeed = (
    video.id.charCodeAt(0) * 19 +
    (video.id.charCodeAt(1) || 0) * 37 +
    (Date.now() / (1000 * 60 * 30))
  ) % 15;
  score += pseudoRandomSeed * 1.2;

  return score;
}

// Maximal Marginal Relevance (MMR) Diversity Ranker
// Balances top relevance with diversity of creators & topics to prevent monotonic feeds
function rankWithMMR(candidates, profile, targetCount = 20, lambda = 0.7) {
  if (candidates.length <= targetCount) return candidates;

  const scoredCandidates = candidates.map((v) => ({
    video: v,
    score: scoreVideo(v, profile)
  })).sort((a, b) => b.score - a.score);

  const selected = [];
  const remaining = [...scoredCandidates];

  // Pick top candidate first
  if (remaining.length > 0) {
    selected.push(remaining.shift().video);
  }

  // Iteratively pick next candidate maximizing MMR
  while (selected.length < targetCount && remaining.length > 0) {
    let bestIndex = 0;
    let bestMmrScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i].video;
      const relScore = remaining[i].score;

      // Compute max similarity to already selected items (same channel = 1.0, same category = 0.5)
      let maxSim = 0;
      for (const sel of selected) {
        if (sel.channel === candidate.channel) {
          maxSim = Math.max(maxSim, 0.85);
        } else if (sel.category === candidate.category) {
          maxSim = Math.max(maxSim, 0.4);
        }
      }

      const mmr = lambda * relScore - (1 - lambda) * (maxSim * 100);
      if (mmr > bestMmrScore) {
        bestMmrScore = mmr;
        bestIndex = i;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0].video);
  }

  return selected;
}

// Generate the personalized Algorithmic Home Feed with YouTube-like Shelves & Ranking
export function getAlgorithmicFeed(allVideos, profile, selectedCategory = 'All') {
  if (!allVideos || allVideos.length === 0) return [];

  let candidatePool = [...allVideos];
  if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'For You (Algorithm)') {
    if (selectedCategory === '⭐ Guaranteed Working') {
      candidatePool = candidatePool.filter((v) => v.isGuaranteed);
    } else {
      candidatePool = candidatePool.filter(
        (v) => v.category === selectedCategory || (v.tags && v.tags.includes(selectedCategory))
      );
    }
  }

  return rankWithMMR(candidatePool, profile, 40, 0.75);
}

// Generate YouTube-style Algorithmic Sections/Shelves for the Home Feed
export function getAlgorithmicSections(allVideos, profile) {
  if (!allVideos || allVideos.length === 0) return [];

  const sections = [];
  const usedVideoIds = new Set();

  const takeVideos = (candidates, count, allowReuseIfShort = false) => {
    const picked = [];
    for (const v of candidates) {
      if (!usedVideoIds.has(v.id)) {
        picked.push(v);
        usedVideoIds.add(v.id);
        if (picked.length >= count) break;
      }
    }
    if (picked.length < count && allowReuseIfShort) {
      for (const v of candidates) {
        if (!picked.some((p) => p.id === v.id)) {
          picked.push(v);
          if (picked.length >= count) break;
        }
      }
    }
    return picked;
  };

  // 1. "Recommended For You" Shelf (Multi-factor MMR diversified ranking)
  const ranked = rankWithMMR(allVideos, profile, 20, 0.72);
  const topRecommended = takeVideos(ranked, 8);
  if (topRecommended.length > 0) {
    const session = detectSessionIntent(profile);
    sections.push({
      id: 'recommended',
      title: 'Recommended For You',
      subtitle: `Personalized algorithmic mix • Mode: ${session.label}`,
      badge: 'Algorithm Mix',
      iconType: 'sparkles',
      videos: topRecommended
    });
  }

  // 2. "Because you watched / Seed Recommendation" Shelf
  const seed = profile.lastWatchedVideo ||
    profile.watchHistory?.[0] ||
    (allVideos.length > 0 ? allVideos[0] : null);

  if (seed) {
    const seedCandidates = allVideos.filter(
      (v) => (v.channel === seed.channel || v.category === seed.category) && v.id !== seed.id
    );
    const becauseYouWatched = takeVideos(seedCandidates, 4, true);
    if (becauseYouWatched.length > 0) {
      sections.push({
        id: 'because-you-watched',
        title: profile.lastWatchedVideo
          ? `Because you watched "${profile.lastWatchedVideo.title}"`
          : `Up Next: ${seed.category || seed.channel}`,
        subtitle: `Co-visitation from ${seed.channel} & ${seed.category}`,
        badge: 'Up Next Seed',
        iconType: 'history',
        videos: becauseYouWatched
      });
    }
  }

  // 3. "Trending & Viral Hits" Shelf (Highest view count velocity)
  const trendingCandidates = [...allVideos].sort((a, b) => {
    return parseViewsScore(b.views) - parseViewsScore(a.views);
  });
  const trendingVideos = takeVideos(trendingCandidates, 4, true);
  if (trendingVideos.length > 0) {
    sections.push({
      id: 'trending',
      title: 'Trending on YouTube',
      subtitle: 'Viral videos with millions of views & global velocity',
      badge: 'Trending Now',
      iconType: 'trending',
      videos: trendingVideos
    });
  }

  // 4. "From Your Top Channels & Creators" Shelf
  const topChannels = Object.entries(profile.channelAffinities || {})
    .sort((a, b) => b[1] - a[1])
    .filter(([_, pts]) => pts >= 2);

  if (topChannels.length > 0) {
    const favoriteChannel = topChannels[0][0];
    const channelVideos = allVideos.filter((v) => v.channel === favoriteChannel);
    const channelPicks = takeVideos(channelVideos, 4, true);
    if (channelPicks.length > 0) {
      sections.push({
        id: 'favorite-creator',
        title: `More from ${favoriteChannel}`,
        subtitle: 'From one of your most watched creators',
        badge: 'Creator Affinity',
        iconType: 'channel',
        videos: channelPicks
      });
    }
  } else {
    const spotlightChannel = allVideos.find((v) => v.channel === 'Veritasium' || v.channel === 'Mark Rober');
    if (spotlightChannel) {
      const channelVideos = allVideos.filter((v) => v.channel === spotlightChannel.channel);
      const channelPicks = takeVideos(channelVideos, 4, true);
      if (channelPicks.length > 0) {
        sections.push({
          id: 'favorite-creator',
          title: `Featured Creator: ${spotlightChannel.channel}`,
          subtitle: 'Popular channel spotlight',
          badge: 'Creator Spotlight',
          iconType: 'channel',
          videos: channelPicks
        });
      }
    }
  }

  // 5. "Explore & Discover (New To You)" Shelf
  const remainingCandidates = allVideos.filter((v) => !usedVideoIds.has(v.id));
  const explorePicks = remainingCandidates.length >= 2
    ? remainingCandidates
    : takeVideos(allVideos, 6, true);

  if (explorePicks.length > 0) {
    sections.push({
      id: 'explore-more',
      title: 'Explore & Discover',
      subtitle: 'Serendipitous discovery across new topics and creators',
      badge: 'New To You',
      iconType: 'compass',
      videos: explorePicks
    });
  }

  return sections;
}

// Generate Watch Page Up Next Algorithmic Queue
export function getUpNextRecommendations(currentVideo, allVideos, profile, filter = 'all') {
  if (!allVideos || allVideos.length === 0) return [];

  const otherVideos = allVideos.filter((v) => v.id !== currentVideo?.id);

  let pool = otherVideos;
  if (filter === 'channel' && currentVideo?.channel) {
    pool = otherVideos.filter((v) => v.channel === currentVideo.channel);
    if (pool.length === 0) pool = otherVideos;
  } else if (filter === 'related' && currentVideo?.category) {
    pool = otherVideos.filter((v) => v.category === currentVideo.category);
    if (pool.length === 0) pool = otherVideos;
  }

  const scored = pool.map((v) => ({
    video: v,
    score: scoreVideo(v, profile, {
      currentVideoId: currentVideo?.id,
      currentChannel: currentVideo?.channel,
      currentCategory: currentVideo?.category,
      isWatchPage: true
    })
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.video);
}
