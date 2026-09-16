// Linwize Cloaking & Tab Camouflage Utility
// Disguises browser tab title and favicon to avoid detection by school filters / teachers
// In-page disguising without opening a new tab or window

export const CLOAK_PRESETS = [
  {
    id: 'default',
    name: 'Default (Cinema)',
    title: 'CineVault',
    icon: '/favicon.svg'
  },
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard - Canvas',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
  },
  {
    id: 'desmos',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    icon: 'https://www.desmos.com/favicon.ico'
  },
  {
    id: 'khan',
    name: 'Khan Academy',
    title: 'Dashboard | Khan Academy',
    icon: 'https://www.khanacademy.org/favicon.ico'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    title: 'Wikipedia, the free encyclopedia',
    icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  }
];

export const DEFAULT_SETTINGS = {
  cloakPreset: 'classroom',
  panicUrl: 'https://classroom.google.com',
  panicHotkey: '`',
  autoCloakOnBlur: true,
  enableInPageOverlay: true,
  defaultPlaybackMode: 'embed',
  cinemaLightsDefault: false,
};

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem('unblocked_movies_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(newSettings) {
  try {
    localStorage.setItem('unblocked_movies_settings', JSON.stringify(newSettings));
  } catch {
    // ignore
  }
}

export function applyTabCloak(presetId) {
  const preset = CLOAK_PRESETS.find((p) => p.id === presetId) || CLOAK_PRESETS[0];
  document.title = preset.title;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = preset.icon;

  try {
    localStorage.setItem('unblocked_tab_cloak_preset', presetId);
  } catch {
    // ignore
  }
}

export function resetTabCloak() {
  applyTabCloak('default');
}

export function triggerPanicButton() {
  const settings = getStoredSettings();
  const dest = settings.panicUrl || 'https://classroom.google.com';
  window.location.replace(dest);
}
