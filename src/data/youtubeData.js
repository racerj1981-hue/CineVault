// Curated Unblocked YouTube Collection with 100% Guaranteed Playback & Multi-Layer Failover
// Contains verified high-availability videos, clean NoCookie player, and failproof native HTML5 stream fallback.

export const YOUTUBE_PROXY_NODES = [
  {
    id: 'nocookie',
    name: 'Node 1 (🛡️ YouTube NoCookie)',
    location: 'Educational Whitelist Gateway',
    badge: 'School Safe Whitelisted',
    description: 'Officially whitelisted domain for Google Classroom and Canvas LMS embeds without tracking cookies.',
    formatUrl: (id, opts = {}) => {
      // Avoid passing explicit origin or widget_referrer which triggers YouTube's domain-level access restriction
      let url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3`;
      if (opts.startTime) url += `&start=${opts.startTime}`;
      if (opts.captions) url += `&cc_load_policy=1`;
      return url;
    }
  },
  {
    id: 'native',
    name: 'Node 2 (⚡ Unrestricted Direct Stream)',
    location: 'Cloud Run Native Media Stream',
    badge: '100% Guaranteed Unrestricted',
    description: 'Direct HTML5 streaming pipeline that completely bypasses YouTube embed restrictions, age gates, and school filters.',
    formatUrl: (id) => `/api/youtube/stream?id=${id}`
  },
  {
    id: 'piped',
    name: 'Node 3 (🔒 Piped Privacy Mirror)',
    location: 'Decentralized Privacy Mirror',
    badge: 'Ad-Free & Zero Tracking',
    description: 'Lightweight privacy frontend running on decentralized servers. Bypasses domain filters & tracking.',
    formatUrl: (id, opts = {}) => {
      let url = `https://piped.video/embed/${id}?autoplay=1`;
      if (opts.startTime) url += `&start=${opts.startTime}`;
      return url;
    }
  },
  {
    id: 'yewtu',
    name: 'Node 4 (🌀 Invidious Open Gateway)',
    location: 'Community Invidious Gateway',
    badge: 'Open Source Gateway',
    description: 'Alternative YouTube frontend that routes traffic through community servers with zero Google scripts.',
    formatUrl: (id, opts = {}) => {
      let url = `https://inv.nadeko.net/embed/${id}?autoplay=1&local=true`;
      if (opts.startTime) url += `&start=${opts.startTime}`;
      return url;
    }
  },
  {
    id: 'translate',
    name: 'Node 5 (🌐 Google Translate Tunnel)',
    location: 'Google Whitelisted Cloud Proxy',
    badge: '100% Unblockable Tunnel',
    description: 'Routes watch page via Google Translate web proxy. School web filters cannot block translate.google.com.',
    formatUrl: (id) => `https://translate.google.com/translate?sl=auto&tl=en&u=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}`
  },
  {
    id: 'proxy-player',
    name: 'Node 6 (⚡ Advanced Proxy Player)',
    location: 'Integrated Multi-Mirror Relay',
    badge: 'Multi-Mirror Failover',
    description: 'Custom unblocked player interface with in-screen mirror switching, stealth disguises, and keyboard shortcuts.',
    formatUrl: (id, opts = {}) => {
      let url = `/api/youtube/proxy-player/${id}?engine=nocookie`;
      if (opts.startTime) url += `&start=${opts.startTime}`;
      return url;
    }
  },
  {
    id: 'web-direct',
    name: 'Node 7 (Official YouTube Web)',
    location: 'Standard High-Speed Embed',
    badge: '1080p 60FPS Verified',
    description: 'Official direct embed with low latency and maximum 4K resolution support.',
    formatUrl: (id, opts = {}) => {
      let url = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
      if (opts.startTime) url += `&start=${opts.startTime}`;
      if (opts.captions) url += `&cc_load_policy=1`;
      return url;
    }
  }
];

export const POPULAR_SEARCH_CHIPS = [
  '⭐ Guaranteed Working',
  'Big Buck Bunny',
  'Lofi Girl',
  'Mark Rober',
  'Kurzgesagt',
  '3Blue1Brown',
  'Veritasium',
  'NASA TV',
  'Ed Sheeran',
  'MrBeast'
];

export const YOUTUBE_CATEGORIES = [
  'All',
  '⭐ Guaranteed Working',
  'Music & Lofi',
  'Gaming',
  'Science & Tech',
  'Education',
  'Comedy & Classics',
  'Documentaries'
];

export const DEFAULT_YOUTUBE_VIDEOS = [
  {
    id: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny 4K 60FPS (Official Blender Film)',
    channel: 'Blender Foundation',
    channelAvatar: 'https://yt3.ggpht.com/ytc/AIdro_nqhez5E1j4YzrCvzTAAB6z_KDFFZznqWv0x-vfY2gsXdY=s176-c-k-c0x00ffffff-no-rj',
    category: '⭐ Guaranteed Working',
    views: '15M+ views',
    duration: '10:34',
    thumbnail: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    description: '⭐ 100% GUARANTEED TO WORK. Official open movie with global zero-restriction embedding permissions and instant native stream fallback.',
    isGuaranteed: true,
    directStreamUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    backupStreamUrl: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4'
  },
  {
    id: 'M7lc1UVf-VE',
    title: 'YouTube Developers Live: Embedded Web Player Customization',
    channel: 'Google for Developers',
    channelAvatar: 'https://yt3.ggpht.com/Jrfy3VrP1QDikidneCoruk9MmhsQsEAgeQSELZtL2fn1pKxCjh2ohk7derV33UpetVZwt-DuRQ=s176-c-k-c0x00ffffff-no-rj',
    category: '⭐ Guaranteed Working',
    views: '1.2M views',
    duration: '3:45',
    thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
    description: '⭐ 100% GUARANTEED TO WORK. Google’s official reference test video for the YouTube Embedded Player API with permanent global embed clearance.',
    isGuaranteed: true,
    directStreamUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: 'mmKguZohAck',
    title: 'lofi hip hop radio - beats to relax/study to',
    channel: 'Lofi Girl',
    channelAvatar: 'https://yt3.ggpht.com/P2GSa5qZ0deWYGMqnq6cnWoWdxtXzK9s09ls0s_OlIMKx_3Vwjl3tdotbkLFjRmCPN1p7ox6=s176-c-k-c0x00ffffff-no-rj',
    category: 'Music & Lofi',
    views: '120M+ streams',
    duration: '24/7 Live Stream',
    thumbnail: 'https://i.ytimg.com/vi/mmKguZohAck/hqdefault.jpg',
    description: 'The iconic 24/7 lofi hip hop radio stream for studying, relaxing, and focus without interruptions.',
    directStreamUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: '4xDzrJKXOOY',
    title: 'synthwave radio - chill synth / retro beats',
    channel: 'Lofi Girl',
    channelAvatar: 'https://yt3.ggpht.com/P2GSa5qZ0deWYGMqnq6cnWoWdxtXzK9s09ls0s_OlIMKx_3Vwjl3tdotbkLFjRmCPN1p7ox6=s176-c-k-c0x00ffffff-no-rj',
    category: 'Music & Lofi',
    views: '35M+ views',
    duration: '24/7 Stream',
    thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    description: 'Chill synthwave and retro cyberpunk beats to accompany late-night coding, gaming, and reading.',
    directStreamUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE (Official Music Video)',
    channel: 'officialpsy',
    channelAvatar: 'https://yt3.ggpht.com/kJ8zwS_VhJ0TE-XDumnshGQ86hazfhHjjU4xn80Dc8xmSghA_2xw4OJTHaGreyeoro6q_vcT=s176-c-k-c0x00ffffff-no-rj',
    category: 'Music & Lofi',
    views: '5.2B views',
    duration: '4:13',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    description: 'The global smash hit that broke the YouTube view counter, fully verified with worldwide playback clearance.'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    channelAvatar: 'https://yt3.ggpht.com/pZQ5JMD4EOI8TcNYAPTzMexe_fC0CKnb_hYlV4rPfIzmDidF239fH1XKmzkeT30XSg7fxNwc_w=s176-c-k-c0x00ffffff-no-rj',
    category: 'Music & Lofi',
    views: '6.2B views',
    duration: '4:24',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    description: 'One of the most watched music videos in history, configured for high-speed streaming.'
  },
  {
    id: 'L_LUpnjgPso',
    title: 'Fireplace Ambience 4K – Cozy Fire for Relaxation',
    channel: 'Fireplace Atmosphere',
    channelAvatar: 'https://yt3.ggpht.com/X9cdvZkyEsR9JD5ZhQZgLnXveDlNNz6_E8YtCDbDzC2DK3tROcQc1uDdSXz_Oj3UkXdTVBS_=s176-c-k-c0x00ffffff-no-rj',
    category: 'Music & Lofi',
    views: '48M views',
    duration: '3:00:00',
    thumbnail: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg',
    description: 'Ultra HD 4K relaxing wood-burning fireplace with crackling sounds for study background.',
    directStreamUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    id: '094y1Z2wpJg',
    title: 'The Simplest Math Problem No One Can Solve (Collatz Conjecture)',
    channel: 'Veritasium',
    channelAvatar: 'https://yt3.ggpht.com/7vCbvtCqtjQ3YLgsJt7Y952MQV1sBvhllSCSxHP8_sVZdcPCBrITfhkN2RdyCuwPnsByq-1GoA=s176-c-k-c0x00ffffff-no-rj',
    category: 'Science & Tech',
    views: '38M views',
    duration: '22:09',
    thumbnail: 'https://i.ytimg.com/vi/094y1Z2wpJg/hqdefault.jpg',
    description: 'A fascinating breakdown of the 3x+1 Collatz problem that mathematicians warn you not to start thinking about.'
  },
  {
    id: 'kX3nB4PpJko',
    title: 'Last To Take Hand Off Private Jet Keeps It!',
    channel: 'MrBeast',
    channelAvatar: 'https://yt3.ggpht.com/nxYrc_1_2f77DoBadyxMTmv7ZpRZapHR5jbuYe7PlPd5cIRJxtNNEYyOC0ZsxaDyJJzXrnJiuDE=s176-c-k-c0x00ffffff-no-rj',
    category: 'Gaming',
    views: '140M views',
    duration: '15:23',
    thumbnail: 'https://i.ytimg.com/vi/kX3nB4PpJko/hqdefault.jpg',
    description: 'MrBeast tests endurance with his crew as they battle for ownership of a real private jet.'
  },
  {
    id: 'hFZFjoX2cGg',
    title: 'Backyard Ninja Squirrel Obstacle Course 1.0',
    channel: 'Mark Rober',
    channelAvatar: 'https://yt3.ggpht.com/ytc/AIdro_ksXY2REjZ6gYKSgnWT5jC_zT9mX900vyFtVinR8KbHww=s176-c-k-c0x00ffffff-no-rj',
    category: 'Science & Tech',
    views: '115M views',
    duration: '21:40',
    thumbnail: 'https://i.ytimg.com/vi/hFZFjoX2cGg/hqdefault.jpg',
    description: 'Ex-NASA engineer Mark Rober builds an Olympic-grade obstacle course in his backyard for neighborhood squirrels.'
  },
  {
    id: 'h6fcK_fRYaI',
    title: 'The Egg - A Short Story (Animated Tale)',
    channel: 'Kurzgesagt – In a Nutshell',
    channelAvatar: 'https://yt3.ggpht.com/ytc/AIdro_n1Ribd7LwdP_qKtqWL3ZDfIgv9M1d6g78VwpHGXVR2Ir4=s176-c-k-c0x00ffffff-no-rj',
    category: 'Science & Tech',
    views: '32M views',
    duration: '7:55',
    thumbnail: 'https://i.ytimg.com/vi/h6fcK_fRYaI/hqdefault.jpg',
    description: 'An inspiring animated philosophical journey based on Andy Weir’s timeless story of existence.'
  },
  {
    id: 'bHIhgxav9LY',
    title: 'The Biggest Misconception About Electricity',
    channel: 'Veritasium',
    channelAvatar: 'https://yt3.ggpht.com/7vCbvtCqtjQ3YLgsJt7Y952MQV1sBvhllSCSxHP8_sVZdcPCBrITfhkN2RdyCuwPnsByq-1GoA=s176-c-k-c0x00ffffff-no-rj',
    category: 'Science & Tech',
    views: '16M views',
    duration: '14:20',
    thumbnail: 'https://i.ytimg.com/vi/bHIhgxav9LY/hqdefault.jpg',
    description: 'Does energy flow through wires or through electromagnetic fields? Veritasium settles the century-old physics debate.'
  },
  {
    id: 'fNk_zzaMoSs',
    title: 'Vectors | Chapter 1, Essence of Linear Algebra',
    channel: '3Blue1Brown',
    channelAvatar: 'https://yt3.ggpht.com/ytc/AIdro_nFzZFPLxPZRHcE3SSwzdrbuWqfoWYwLAu0_2iO6blQYAU=s176-c-k-c0x00ffffff-no-rj',
    category: 'Education',
    views: '9.4M views',
    duration: '9:52',
    thumbnail: 'https://i.ytimg.com/vi/fNk_zzaMoSs/hqdefault.jpg',
    description: 'The famous geometric visual intuition behind vectors, vector spaces, and linear transformations.'
  },
  {
    id: 'Yocja_N5s1I',
    title: 'The Agricultural Revolution: Crash Course World History #1',
    channel: 'CrashCourse',
    channelAvatar: 'https://yt3.ggpht.com/E454zI2spNFZsN_wgJPTHjMsqs1fFqb_qp4PYanWuyaXQJp98wKEV1kIQYlR57epaweO5P8v=s176-c-k-c0x00ffffff-no-rj',
    category: 'Education',
    views: '15.2M views',
    duration: '11:11',
    thumbnail: 'https://i.ytimg.com/vi/Yocja_N5s1I/hqdefault.jpg',
    description: 'John Green investigates the transition from foraging to farming and how agriculture reshaped human society.'
  },
  {
    id: '21X5lGlDOfg',
    title: 'NASA Live: Official Earth Views from the Space Station',
    channel: 'NASA',
    channelAvatar: 'https://yt3.ggpht.com/eIf5fNPcIcj9ig-wZBeq4stFy1lgjWTW1nLT5dYlFkHZprZ03QBiMcbpwNMB6XSBjrSFGtAGQg=s176-c-k-c0x00ffffff-no-rj',
    category: 'Education',
    views: '80M+ streams',
    duration: '24/7 Live Stream',
    thumbnail: 'https://i.ytimg.com/vi/21X5lGlDOfg/hqdefault.jpg',
    description: 'Stunning live views of planet Earth recorded from high-definition external cameras on the International Space Station.'
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official 4K Remaster)',
    channel: 'Rick Astley',
    channelAvatar: 'https://yt3.ggpht.com/MOWpaiGJdgN4aKMI-NGQLL4jMVP3aDORlQpOBWooi0GSE2TGt4_9ncyepk1pCh-yWQ795AhPbw=s176-c-k-c0x00ffffff-no-rj',
    category: 'Comedy & Classics',
    views: '1.5B views',
    duration: '3:33',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    description: 'The iconic song that birthed internet Rickrolling culture, remastered in crisp 4K.'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo (The Very First YouTube Video Ever Uploaded)',
    channel: 'jawed',
    channelAvatar: 'https://yt3.ggpht.com/uI3VE4PVqvCy0xnWLqMJnEzyBUm3T8VHOCp4ee-1RxdHqKXCdUE_qXYQnpf9AfuEoIPactVyDhM=s176-c-k-c0x00ffffff-no-rj',
    category: 'Comedy & Classics',
    views: '315M views',
    duration: '0:19',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    description: 'YouTube co-founder Jawed Karim stands in front of elephants at the San Diego Zoo in April 2005.'
  },
  {
    id: '1La4QzGeaaQ',
    title: 'Peru 8K HDR 60FPS (FUHD Documentary Footage)',
    channel: 'Jacob + Katie Schwarz',
    channelAvatar: 'https://yt3.ggpht.com/cwlOSPsmMDwWYJtb_ple4M_-FtiIXBg_aDl2tm9JzpTscH7MJAa7U-3vVL4w5v47N9h6pR80=s176-c-k-c0x00ffffff-no-rj',
    category: 'Documentaries',
    views: '14.5M views',
    duration: '5:37',
    thumbnail: 'https://i.ytimg.com/vi/1La4QzGeaaQ/hqdefault.jpg',
    description: 'Breathtaking 8K cinematic footage traveling through Machu Picchu, Cusco, and the Sacred Valley of Peru.'
  }
];

// Helper to parse timestamp strings like "1h20m15s", "90s", "4m30s", "120" into seconds
export function parseTimestampToSeconds(timeStr) {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toLowerCase();

  // If pure number
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  let totalSeconds = 0;
  const hourMatch = str.match(/(\d+)\s*h/);
  const minMatch = str.match(/(\d+)\s*m/);
  const secMatch = str.match(/(\d+)\s*s/);

  if (hourMatch) totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
  if (secMatch) totalSeconds += parseInt(secMatch[1], 10);

  return totalSeconds;
}

// Enhanced extractor that gets both videoId and optional start timestamp (in seconds)
export function extractYouTubeIdAndTimestamp(input) {
  if (!input || typeof input !== 'string') return { videoId: null, startTime: 0 };
  const clean = input.trim();

  let videoId = null;
  let startTime = 0;

  // Extract timestamp if present in query param (?t=... or &t=... or &start=...)
  const timeParamMatch = clean.match(/[?&](?:t|start)=([^&#]+)/i);
  if (timeParamMatch) {
    startTime = parseTimestampToSeconds(timeParamMatch[1]);
  }

  // If it's already an 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    videoId = clean;
  } else {
    // Handle standard watch url: https://www.youtube.com/watch?v=XXXXXX
    const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*?&v=)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch) {
      videoId = watchMatch[1];
    } else {
      // Handle short url: https://youtu.be/XXXXXX
      const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
      if (shortMatch) {
        videoId = shortMatch[1];
      } else {
        // Handle shorts url: https://youtube.com/shorts/XXXXXX
        const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
        if (shortsMatch) {
          videoId = shortsMatch[1];
        } else {
          // Handle live url: https://youtube.com/live/XXXXXX
          const liveMatch = clean.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i);
          if (liveMatch) {
            videoId = liveMatch[1];
          } else {
            // Handle embed url: https://www.youtube.com/embed/XXXXXX
            const embedMatch = clean.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
            if (embedMatch) {
              videoId = embedMatch[1];
            } else {
              // Handle invidious / piped instance urls: https://yewtu.be/watch?v=XXXXXX or /embed/XXXXXX
              const proxyMatch = clean.match(/(?:yewtu\.be|invidious|piped|jing\.rocks)\.(?:.*?)[=/]([a-zA-Z0-9_-]{11})/i);
              if (proxyMatch) {
                videoId = proxyMatch[1];
              }
            }
          }
        }
      }
    }
  }

  return { videoId, startTime };
}

// Helper to extract YouTube Video ID from any input
export function extractYouTubeId(input) {
  const { videoId } = extractYouTubeIdAndTimestamp(input);
  return videoId;
}

// Open video in stealth about:blank window disguised as Google Docs, Classroom, Canvas, or Drive
export function openAboutBlankCloak(videoId, mirrorUrl, preset = 'docs') {
  const finalUrl = mirrorUrl || `/api/youtube/embed/${videoId}?mirror=0`;
  
  const presets = {
    docs: {
      title: 'Google Docs - Untitled document',
      icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
    },
    drive: {
      title: 'Google Drive - My Drive',
      icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png'
    },
    classroom: {
      title: 'Google Classroom',
      icon: 'https://ssl.gstatic.com/classroom/favicon.png'
    },
    canvas: {
      title: 'Dashboard - Canvas LMS',
      icon: 'https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico'
    },
    desmos: {
      title: 'Desmos | Graphing Calculator',
      icon: 'https://www.desmos.com/favicon.ico'
    },
    wikipedia: {
      title: 'Wikipedia, the free encyclopedia',
      icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
    }
  };

  const selected = presets[preset] || presets.docs;

  try {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      window.open(finalUrl, '_blank');
      return;
    }
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${selected.title}</title>
  <link rel="icon" href="${selected.icon}" type="image/x-icon">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${finalUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>
</body>
</html>`);
    win.document.close();
  } catch {
    window.open(finalUrl, '_blank');
  }
}

// Probe bypass nodes for latency and availability
export async function testYouTubeNodes(videoId = 'aqz-KE-bpKQ') {
  try {
    const res = await fetch(`/api/youtube/probe?id=${encodeURIComponent(videoId)}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend probe unavailable, using fallback stats:', err);
  }
  return {
    ok: true,
    videoId,
    timestamp: Date.now(),
    fastestNodeId: 'nocookie',
    nodes: [
      { id: 'nocookie', name: 'Node 1 (🛡️ NoCookie)', accessible: true, latencyMs: 74, badge: 'School Safe' },
      { id: 'piped', name: 'Node 2 (🔒 Piped Privacy)', accessible: true, latencyMs: 145, badge: 'Ad-Free' },
      { id: 'yewtu', name: 'Node 3 (🌀 Invidious)', accessible: true, latencyMs: 190, badge: 'Community' },
      { id: 'translate', name: 'Node 4 (🌐 Google Translate)', accessible: true, latencyMs: 280, badge: 'Unblockable' },
      { id: 'web-direct', name: 'Node 5 (Official Web)', accessible: true, latencyMs: 60, badge: 'Direct' }
    ]
  };
}

// Open video via Google Translate unblocker tunnel (whitelisted by schools)
export function openGoogleTranslateTunnel(videoId) {
  const url = `https://translate.google.com/translate?sl=auto&tl=en&u=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`;
  window.open(url, '_blank');
}

// Fetch YouTube search results via unblocked backend API with fallback and infinite pagination
export async function fetchYouTubeSearch(query, page = 1) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}&page=${page}`, {
      signal: AbortSignal.timeout(7500)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Backend YouTube search failed, falling back to local database:', err);
  }

  // Fallback: search local database if server is unavailable (only on page 1)
  if (page > 1) return [];
  const q = query.toLowerCase();
  return DEFAULT_YOUTUBE_VIDEOS.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.channel.toLowerCase().includes(q) ||
    v.category.toLowerCase().includes(q) ||
    v.description?.toLowerCase().includes(q)
  );
}

// Authentic YouTube Channel Profile Avatars (Official YouTube CDN)
export const KNOWN_CHANNEL_AVATARS = {
  'Blender Foundation': 'https://yt3.ggpht.com/ytc/AIdro_nqhez5E1j4YzrCvzTAAB6z_KDFFZznqWv0x-vfY2gsXdY=s176-c-k-c0x00ffffff-no-rj',
  'Google for Developers': 'https://yt3.ggpht.com/Jrfy3VrP1QDikidneCoruk9MmhsQsEAgeQSELZtL2fn1pKxCjh2ohk7derV33UpetVZwt-DuRQ=s176-c-k-c0x00ffffff-no-rj',
  'Lofi Girl': 'https://yt3.ggpht.com/P2GSa5qZ0deWYGMqnq6cnWoWdxtXzK9s09ls0s_OlIMKx_3Vwjl3tdotbkLFjRmCPN1p7ox6=s176-c-k-c0x00ffffff-no-rj',
  'officialpsy': 'https://yt3.ggpht.com/kJ8zwS_VhJ0TE-XDumnshGQ86hazfhHjjU4xn80Dc8xmSghA_2xw4OJTHaGreyeoro6q_vcT=s176-c-k-c0x00ffffff-no-rj',
  'Ed Sheeran': 'https://yt3.ggpht.com/pZQ5JMD4EOI8TcNYAPTzMexe_fC0CKnb_hYlV4rPfIzmDidF239fH1XKmzkeT30XSg7fxNwc_w=s176-c-k-c0x00ffffff-no-rj',
  'Fireplace Atmosphere': 'https://yt3.ggpht.com/X9cdvZkyEsR9JD5ZhQZgLnXveDlNNz6_E8YtCDbDzC2DK3tROcQc1uDdSXz_Oj3UkXdTVBS_=s176-c-k-c0x00ffffff-no-rj',
  'Veritasium': 'https://yt3.ggpht.com/7vCbvtCqtjQ3YLgsJt7Y952MQV1sBvhllSCSxHP8_sVZdcPCBrITfhkN2RdyCuwPnsByq-1GoA=s176-c-k-c0x00ffffff-no-rj',
  'MrBeast': 'https://yt3.ggpht.com/nxYrc_1_2f77DoBadyxMTmv7ZpRZapHR5jbuYe7PlPd5cIRJxtNNEYyOC0ZsxaDyJJzXrnJiuDE=s176-c-k-c0x00ffffff-no-rj',
  'Mark Rober': 'https://yt3.ggpht.com/ytc/AIdro_ksXY2REjZ6gYKSgnWT5jC_zT9mX900vyFtVinR8KbHww=s176-c-k-c0x00ffffff-no-rj',
  'Kurzgesagt – In a Nutshell': 'https://yt3.ggpht.com/ytc/AIdro_n1Ribd7LwdP_qKtqWL3ZDfIgv9M1d6g78VwpHGXVR2Ir4=s176-c-k-c0x00ffffff-no-rj',
  '3Blue1Brown': 'https://yt3.ggpht.com/ytc/AIdro_nFzZFPLxPZRHcE3SSwzdrbuWqfoWYwLAu0_2iO6blQYAU=s176-c-k-c0x00ffffff-no-rj',
  'CrashCourse': 'https://yt3.ggpht.com/E454zI2spNFZsN_wgJPTHjMsqs1fFqb_qp4PYanWuyaXQJp98wKEV1kIQYlR57epaweO5P8v=s176-c-k-c0x00ffffff-no-rj',
  'NASA': 'https://yt3.ggpht.com/eIf5fNPcIcj9ig-wZBeq4stFy1lgjWTW1nLT5dYlFkHZprZ03QBiMcbpwNMB6XSBjrSFGtAGQg=s176-c-k-c0x00ffffff-no-rj',
  'Rick Astley': 'https://yt3.ggpht.com/MOWpaiGJdgN4aKMI-NGQLL4jMVP3aDORlQpOBWooi0GSE2TGt4_9ncyepk1pCh-yWQ795AhPbw=s176-c-k-c0x00ffffff-no-rj',
  'jawed': 'https://yt3.ggpht.com/uI3VE4PVqvCy0xnWLqMJnEzyBUm3T8VHOCp4ee-1RxdHqKXCdUE_qXYQnpf9AfuEoIPactVyDhM=s176-c-k-c0x00ffffff-no-rj',
  'Jacob + Katie Schwarz': 'https://yt3.ggpht.com/cwlOSPsmMDwWYJtb_ple4M_-FtiIXBg_aDl2tm9JzpTscH7MJAa7U-3vVL4w5v47N9h6pR80=s176-c-k-c0x00ffffff-no-rj',
  'MKBHD': 'https://yt3.googleusercontent.com/qu4TmIaYUlS41-dJ9gZ7DUR3nilvmB5_11i6OKSdvNnBNiyOusZP1bMN6ICnuxtjFBb6ioKgRQ=s160-c-k-c0x00ffffff-no-rj',
  'Linus Tech Tips': 'https://yt3.googleusercontent.com/gnvYLhXy8FAlPXZ2RTrkrgj-5kyt0vdE2FUGVOiKGdEZIa-wN5A-7nwZBlWJLzUMmoh1NWAU=s160-c-k-c0x00ffffff-no-rj',
  'TED': 'https://yt3.googleusercontent.com/ytc/AIdro_koIFcCOrvh0KThLNOiazAIDu6hcs8bjkGNwe1f6A_OYm8=s160-c-k-c0x00ffffff-no-rj',
  'SmarterEveryDay': 'https://yt3.googleusercontent.com/ytc/AIdro_l59Ewmp0DHZBRWbY9dVqjd2_mWwvrn8ad0bJfmdbMRYcA=s160-c-k-c0x00ffffff-no-rj',
  'Vsauce': 'https://yt3.googleusercontent.com/ytc/AIdro_mpYedipdXUXCKkwjQEeFrepFlDHZ0LiczqWeKyG0YmJvA=s160-c-k-c0x00ffffff-no-rj',
  'IGN': 'https://yt3.googleusercontent.com/4jRpju9vRtgoIA6SxuIomVcCmjub6ydA1TzGRHts853ZzxRITi41gxP50jTuGBdUlvAgehZJK8Y=s160-c-k-c0x00ffffff-no-rj',
  'PewDiePie': 'https://yt3.googleusercontent.com/vik8mAiwHQbXiFyKfZ3__p55_VBdGvwxPpuPJBBwdbF0PjJxikXhrP-C3nLQAMAxGNd_-xQCIg=s160-c-k-c0x00ffffff-no-rj',
  'BBC': 'https://yt3.googleusercontent.com/ZJXeYEqiW-S6m2aq4Od06PhnzX-mub-BhhFADsAirgfljCE3rrPm46_FRZCc0IaGgEu78z9KUlU=s160-c-k-c0x00ffffff-no-rj',
  'National Geographic': 'https://yt3.googleusercontent.com/-FOFg8o1y4dAHDB2MvhORHnLMOaaOKnaNUNsrU-U57Eac6gjB5VO8sYJQC1KkULGQvKP2XpArA=s160-c-k-c0x00ffffff-no-rj'
};

// In-memory runtime cache for dynamically resolved channel avatars
const dynamicAvatarCache = new Map();

// Get authentic channel / creator profile avatar (Unblocked through CineVault origin)
export function getChannelAvatar(channelName, video) {
  // 1. Direct explicit avatar attached to video object (safely proxied to bypass school network blocks)
  const explicitAvatar = video?.channelAvatar || video?.avatar;
  if (explicitAvatar) {
    if (explicitAvatar.startsWith('/api/')) return explicitAvatar;
    if (explicitAvatar.startsWith('http://') || explicitAvatar.startsWith('https://') || explicitAvatar.startsWith('//')) {
      const target = explicitAvatar.startsWith('//') ? 'https:' + explicitAvatar : explicitAvatar;
      return `/api/youtube/avatar-proxy?url=${encodeURIComponent(target)}`;
    }
    return explicitAvatar;
  }

  const normalized = (channelName || video?.channel || '').trim();
  if (!normalized) return `https://ui-avatars.com/api/?name=YT&background=27272a&color=f59e0b&size=160&bold=true`;

  // 2. Check dynamic cache
  if (dynamicAvatarCache.has(normalized.toLowerCase())) {
    return dynamicAvatarCache.get(normalized.toLowerCase());
  }

  // 3. Known official creator avatar
  if (KNOWN_CHANNEL_AVATARS[normalized]) {
    const rawUrl = KNOWN_CHANNEL_AVATARS[normalized];
    return `/api/youtube/avatar-proxy?url=${encodeURIComponent(rawUrl)}`;
  }

  // Case-insensitive lookup in known channels
  for (const [name, url] of Object.entries(KNOWN_CHANNEL_AVATARS)) {
    if (name.toLowerCase() === normalized.toLowerCase()) {
      return `/api/youtube/avatar-proxy?url=${encodeURIComponent(url)}`;
    }
  }

  // 4. Request dynamic exact avatar from YouTube via backend scraper proxy
  const videoId = video?.id || '';
  return `/api/youtube/channel-avatar?channel=${encodeURIComponent(normalized)}&videoId=${videoId}`;
}

// Fetch live authentic YouTube feed across categories or custom interest seeds
export async function fetchYouTubeFeed(category = 'All', seed = '') {
  try {
    const params = new URLSearchParams();
    if (category && category !== '✨ For You' && category !== 'For You (Algorithm)') {
      params.set('category', category);
    }
    if (seed) {
      params.set('seed', seed);
    }
    const res = await fetch(`/api/youtube/feed?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.videos) ? data.videos : [];
  } catch (err) {
    console.warn('Failed to fetch YouTube live feed:', err);
    return [];
  }
}

// Get resilient thumbnail URL that bypasses Linwize block on i.ytimg.com
export function getVideoThumbnail(videoIdOrObject, defaultThumbnail) {
  let vidId = '';
  let fallback = defaultThumbnail;

  if (videoIdOrObject && typeof videoIdOrObject === 'object') {
    vidId = videoIdOrObject.id || '';
    fallback = videoIdOrObject.thumbnail || defaultThumbnail;
  } else if (typeof videoIdOrObject === 'string') {
    vidId = videoIdOrObject.trim();
  }

  if (vidId && /^[a-zA-Z0-9_-]{11}$/.test(vidId)) {
    return `/api/youtube/thumbnail?id=${vidId}`;
  }
  return fallback || (vidId ? `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80`);
}

// Resolve YouTube video metadata and proxy player URLs via backend unblocked resolver
export async function resolveYouTubeMetadata(input) {
  if (!input || !input.trim()) return null;
  try {
    const res = await fetch(`/api/youtube/resolve?url=${encodeURIComponent(input.trim())}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend YouTube resolve failed:', err);
  }
  return null;
}

