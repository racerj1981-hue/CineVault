// Stream Fetch & Secondary Worker / Public CORS-Proxy Utility
// Designed to bypass school network filters (e.g. Linwize, Securly, GoGuardian, Lightspeed)
// for direct video and audio streaming requests (.mp4, .webm, .m3u8, byte-range chunks)

export const PROXY_WORKERS = [
  {
    id: 'direct',
    name: 'Direct Stream',
    type: 'direct',
    badge: 'Direct Stream',
    location: 'Origin CDN',
    supportsRange: true,
    description: 'Connect directly to the media source with zero proxy lag and full byte-range seeking.',
    buildUrl: (target) => target
  },
  {
    id: 'relay',
    name: 'Cloud Stream Relay',
    type: 'cloud-relay',
    badge: 'Edge Filter Bypass',
    location: 'Cloud Run Edge',
    supportsRange: true,
    description: 'Internal server-side video proxy routing directly through this origin, bypassing school domain filters.',
    buildUrl: (target) => `/api/proxy/stream?url=${encodeURIComponent(target)}`
  },
  {
    id: 'corsproxy',
    name: 'CorsProxy.io Worker',
    type: 'public-cors-proxy',
    badge: 'Fast Public Worker',
    location: 'Global CDN Relay',
    supportsRange: true,
    description: 'High-speed public CORS worker network bypassing regional content filtering.',
    buildUrl: (target) => `https://corsproxy.io/?url=${encodeURIComponent(target)}`
  },
  {
    id: 'allorigins',
    name: 'AllOrigins Public Proxy',
    type: 'public-cors-proxy',
    badge: 'Encrypted Fallback',
    location: 'Global Cloud Proxy',
    supportsRange: false,
    description: 'Public open-source CORS proxy for direct media segments and manifest files.',
    buildUrl: (target) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`
  },
  {
    id: 'codetabs',
    name: 'CodeTabs CORS Worker',
    type: 'public-cors-proxy',
    badge: 'Secondary Worker',
    location: 'High-Throughput Gateway',
    supportsRange: true,
    description: 'Dedicated public CORS proxy gateway for direct streaming assets and playlists.',
    buildUrl: (target) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`
  },
  {
    id: 'thingproxy',
    name: 'Thingproxy Relay',
    type: 'public-cors-proxy',
    badge: 'Lightweight Relay',
    location: 'Multi-Region Node',
    supportsRange: true,
    description: 'Alternative public worker forwarding raw HTTP streaming packets.',
    buildUrl: (target) => `https://thingproxy.freeboard.io/fetch/${target}`
  },
  {
    id: 'custom',
    name: 'Custom Cloudflare Worker',
    type: 'custom-worker',
    badge: 'User Defined',
    location: 'Custom Edge Server',
    supportsRange: true,
    description: 'User-specified secondary worker or Cloudflare Worker instance.',
    buildUrl: (target) => {
      const customBase = getCustomWorkerUrl();
      if (!customBase) return target;
      return customBase.includes('?') 
        ? `${customBase}&url=${encodeURIComponent(target)}` 
        : `${customBase}?url=${encodeURIComponent(target)}`;
    }
  }
];

const DEFAULT_WORKER_ORDER = ['direct', 'relay', 'corsproxy', 'codetabs', 'allorigins', 'thingproxy'];

// Retrieve configured custom worker URL
export function getCustomWorkerUrl() {
  try {
    return localStorage.getItem('custom_proxy_worker_url') || '';
  } catch {
    return '';
  }
}

// Persist custom worker URL (e.g., Cloudflare Worker endpoint)
export function setCustomWorkerUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('custom_proxy_worker_url');
    } else {
      localStorage.setItem('custom_proxy_worker_url', url.trim());
    }
  } catch {
    // Ignore localStorage write failures
  }
}

// Retrieve user preferred proxy worker
export function getPreferredWorkerId() {
  try {
    const saved = localStorage.getItem('preferred_stream_worker_id');
    if (saved && saved !== 'internal') {
      return saved;
    }
    return 'direct';
  } catch {
    return 'direct';
  }
}

// Persist user preferred proxy worker
export function setPreferredWorkerId(id) {
  try {
    localStorage.setItem('preferred_stream_worker_id', id);
  } catch {
    // Ignore localStorage failures
  }
}

// Check if a URL points to direct media or video stream
export function isDirectMediaUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  
  const videoExtensions = ['.mp4', '.webm', '.m3u8', '.mpd', '.mkv', '.mov', '.ogv', '.ogg', '.mp3', '.wav', '.m4a', '.flv'];
  if (videoExtensions.some((ext) => cleanUrl.endsWith(ext))) {
    return true;
  }
  
  // Also check common streaming CDN url patterns
  const streamingPatterns = [
    'videoplayback',
    'googlevideo.com',
    '/stream/',
    '/manifest',
    '/playlist.m3u8',
    'archive.org/download/',
    'commondatastorage.googleapis.com'
  ];
  return streamingPatterns.some((pattern) => url.toLowerCase().includes(pattern));
}

// Transform a direct media stream URL into a proxied URL for <video> or <audio> elements
export function getProxiedStreamUrl(targetUrl, workerId = 'auto') {
  if (!targetUrl || typeof targetUrl !== 'string') return '';
  
  // If targetUrl is already a relative API route, don't re-proxy
  if (targetUrl.startsWith('/api/')) return targetUrl;

  const targetWorkerId = workerId === 'auto' ? getPreferredWorkerId() : workerId;
  const worker = PROXY_WORKERS.find((w) => w.id === targetWorkerId) || PROXY_WORKERS[0];
  
  return worker.buildUrl(targetUrl);
}

/**
 * Enhanced Fetch utility that routes streaming requests through secondary workers
 * or public CORS-proxies with automated fallback on 403, 429, 502, or network failures.
 *
 * @param {string} targetUrl - Target video stream or media chunk URL
 * @param {object} options - Fetch options
 * @param {string} [options.preferredWorker] - Primary worker ID to attempt first ('internal', 'corsproxy', etc.)
 * @param {string[]} [options.fallbackOrder] - Array of worker IDs to try in order
 * @param {number} [options.timeoutMs=10000] - Request timeout per worker
 * @param {string|object} [options.range] - Byte range e.g. "bytes=0-1048575" or { start: 0, end: 1048575 }
 * @param {HeadersInit} [options.headers] - Additional request headers
 * @param {function} [options.onWorkerAttempt] - Callback when a worker is attempted
 * @param {function} [options.onWorkerFail] - Callback when a worker fails
 * @returns {Promise<{ ok: boolean, response: Response, workerId: string, worker: object, attempts: Array }>}
 */
export async function streamFetch(targetUrl, options = {}) {
  if (!targetUrl) throw new Error('Missing target URL for streamFetch');

  const preferredId = options.preferredWorker || getPreferredWorkerId();
  
  // Build fallback cascade starting with preferred worker, then the rest
  const order = options.fallbackOrder || [
    preferredId,
    ...DEFAULT_WORKER_ORDER.filter((id) => id !== preferredId)
  ];

  // If custom worker is configured, add it to the cascade
  if (getCustomWorkerUrl() && !order.includes('custom')) {
    order.splice(1, 0, 'custom');
  }

  const timeoutMs = options.timeoutMs || 10000;
  const attempts = [];
  let lastError = null;

  // Format Range header if specified
  let rangeHeader = null;
  if (typeof options.range === 'string') {
    rangeHeader = options.range;
  } else if (options.range && typeof options.range === 'object') {
    const { start = 0, end } = options.range;
    rangeHeader = `bytes=${start}-${end !== undefined ? end : ''}`;
  }

  for (let i = 0; i < order.length; i++) {
    const workerId = order[i];
    const worker = PROXY_WORKERS.find((w) => w.id === workerId);
    if (!worker) continue;

    const proxiedUrl = worker.buildUrl(targetUrl);
    const headers = new Headers(options.headers || {});
    
    if (rangeHeader && worker.supportsRange) {
      headers.set('Range', rangeHeader);
    }

    if (options.onWorkerAttempt) {
      options.onWorkerAttempt(workerId, i + 1);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const startTime = Date.now();
    try {
      const response = await fetch(proxiedUrl, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timer);

      const durationMs = Date.now() - startTime;
      attempts.push({
        workerId,
        url: proxiedUrl,
        status: response.status,
        durationMs,
        success: response.ok || response.status === 206
      });

      // Status 200 (OK) or 206 (Partial Content) are standard media stream successes
      if (response.ok || response.status === 206) {
        return {
          ok: true,
          response,
          workerId,
          worker,
          durationMs,
          attempts
        };
      }

      // If response is 403, 429, 500, 502, 503, 504, try next worker
      lastError = new Error(`Worker ${worker.name} returned HTTP status ${response.status}`);
      if (options.onWorkerFail) {
        options.onWorkerFail(workerId, lastError, order[i + 1] || null);
      }
    } catch (err) {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      lastError = err;
      attempts.push({
        workerId,
        url: proxiedUrl,
        status: 'error',
        error: err.message,
        durationMs,
        success: false
      });

      if (options.onWorkerFail) {
        options.onWorkerFail(workerId, err, order[i + 1] || null);
      }
    }
  }

  // All workers in cascade failed
  throw new Error(
    `All secondary workers failed to stream media: ${lastError?.message || 'Unknown error'}. Attempts: ${JSON.stringify(
      attempts.map((a) => `${a.workerId}: ${a.status}`)
    )}`
  );
}

/**
 * Fetch a specific byte chunk of a video stream (ideal for HLS/MP4 chunk buffering)
 */
export async function fetchStreamChunk(targetUrl, startByte, endByte, options = {}) {
  const range = `bytes=${startByte}-${endByte !== undefined && endByte !== null ? endByte : ''}`;
  const result = await streamFetch(targetUrl, {
    ...options,
    range
  });

  const arrayBuffer = await result.response.arrayBuffer();
  return {
    ...result,
    data: arrayBuffer,
    byteLength: arrayBuffer.byteLength,
    contentRange: result.response.headers.get('content-range'),
    contentType: result.response.headers.get('content-type')
  };
}

/**
 * Diagnose a specific worker against a media URL
 */
export async function testWorkerLatency(workerId, testUrl = 'https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_720p.mp4') {
  const worker = PROXY_WORKERS.find((w) => w.id === workerId) || PROXY_WORKERS[0];
  const startTime = Date.now();

  try {
    const customParam = workerId === 'custom' && getCustomWorkerUrl() 
      ? `&customWorkerUrl=${encodeURIComponent(getCustomWorkerUrl())}` 
      : '';
    const probeRes = await fetch(
      `/api/proxy/probe?url=${encodeURIComponent(testUrl)}&worker=${encodeURIComponent(workerId)}${customParam}`
    );
    const data = await probeRes.json();
    const latency = data.latencyMs ?? (Date.now() - startTime);

    return {
      workerId,
      workerName: worker.name,
      name: worker.name,
      accessible: !!data.ok,
      status: data.status || 200,
      latencyMs: latency,
      rangeSupported: !!data.rangeSupported,
      contentType: data.contentType,
      note: data.note
    };
  } catch (err) {
    return {
      workerId,
      workerName: worker.name,
      name: worker.name,
      accessible: false,
      status: 'error',
      latencyMs: Date.now() - startTime,
      error: err.message
    };
  }
}

/**
 * Diagnose all proxy workers concurrently
 */
export async function diagnoseAllWorkers(testUrl = 'https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_720p.mp4') {
  const results = await Promise.allSettled(
    PROXY_WORKERS.map((w) => testWorkerLatency(w.id, testUrl))
  );

  return results.map((r, idx) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      workerId: PROXY_WORKERS[idx].id,
      workerName: PROXY_WORKERS[idx].name,
      name: PROXY_WORKERS[idx].name,
      accessible: false,
      latencyMs: null,
      rangeSupported: false,
      error: r.reason?.message || 'Check failed'
    };
  });
}

/**
 * Fetches an entire media file through the secondary worker and returns a local Blob URL.
 * Once loaded into a Blob, playback is 100% local and cannot be interrupted by Linwize.
 */
export async function createStreamBlobUrl(targetUrl, options = {}) {
  const result = await streamFetch(targetUrl, options);
  const blob = await result.response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return {
    blobUrl,
    size: blob.size,
    type: blob.type,
    workerUsed: result.workerId
  };
}
